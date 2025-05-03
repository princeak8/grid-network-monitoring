<template>
  <div class="container">
    <div class="toolbar">
      <button @click="addNewStation" class="toolbar-btn">Add New Station</button>
      <button @click="toggleConnectionMode" class="toolbar-btn" :class="{ 'active': connectionMode }">
        {{ connectionMode ? 'Cancel Connection' : 'Create Connection' }}
      </button>
    </div>
    
    <svg class="grid-canvas" :width="svgCanvas.width" :height="svgCanvas.height">
      <!-- Grid background (optional) -->
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eee" stroke-width="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <!-- Iterate through all stations -->
      <g 
        v-for="station in stations" 
        :key="station.id"
        class="station-group"
        :transform="`translate(${station.x},${station.y})`"
        stroke="#000" 
        fill="#e0f0ff"
        stroke-width="2"
      >
        <!-- Outer station rectangle -->
        <rect 
          :width="station.width" 
          :height="station.height" 
          class="station-rect"
          @mousedown="(e) => startStationDrag(e, station)"
        />
        <text x="10" y="30" class="component-label station-name">{{ station.name }}</text>

        <!-- Inner lines group -->
        <g v-for="line in station.lines" :key="line.id" class="line-group">
          <g 
            :transform="`translate(${line.x},${line.y})`"
            @mousedown="(e) => startDrag(e, line, station)"
            class="draggable-line"
          >
            <rect 
              :width="lineWidth" 
              :height="lineHeight"
              fill="#e0f0ff" 
              stroke="#000"
              stroke-width="2" 
            />
            <text x="10" y="20" class="component-label">{{ line.name || line.id }}</text>
            <text x="10" y="35" class="component-label" v-if="line.mw !== null && line.mw !== undefined">{{ line.mw }} MW</text>
            <text x="10" y="50" class="component-label" v-if="line.v !== null && line.v !== undefined">{{ line.v }} kV</text>
            
            <!-- Connection points (visible in connection mode) -->
            <g v-if="connectionMode" class="connection-points">
              <!-- Left connection point -->
              <circle 
                cx="0" 
                cy="25" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-line-id="line.id"
                :data-side="'left'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'left')"
              />
              
              <!-- Right connection point -->
              <circle 
                :cx="lineWidth" 
                cy="25" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-line-id="line.id"
                :data-side="'right'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'right')"
              />
              
              <!-- Top connection point -->
              <circle 
                :cx="lineWidth / 2" 
                cy="0" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-line-id="line.id"
                :data-side="'top'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'top')"
              />
              
              <!-- Bottom connection point -->
              <circle 
                :cx="lineWidth / 2" 
                :cy="lineHeight" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-line-id="line.id"
                :data-side="'bottom'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'bottom')"
              />
            </g>
          </g>
        </g>
        
        <!-- Resize handles -->
        <rect 
          :x="station.width - 6" 
          :y="station.height / 2 - 15" 
          width="12" 
          height="30" 
          fill="rgba(0,0,0,0.2)" 
          class="resize-handle"
          @mousedown="(e) => startResize(e, station, 'width')"
        />
        
        <rect 
          :x="station.width / 2 - 15" 
          :y="station.height - 6" 
          width="30" 
          height="12" 
          fill="rgba(0,0,0,0.2)" 
          class="resize-handle"
          @mousedown="(e) => startResize(e, station, 'height')"
        />
        
        <rect 
          :x="station.width - 12" 
          :y="station.height - 12" 
          width="12" 
          height="12" 
          fill="rgba(0,0,0,0.3)" 
          class="resize-handle"
          @mousedown="(e) => startResize(e, station, 'corner')"
        />
      </g>

      <!-- Connection paths -->
      <g class="connections-layer">
        <path 
          v-for="connection in connections" 
          :key="connection.id"
          :d="generateConnectionPath(connection)"
          :stroke="connection.color"
          :stroke-width="connection.strokeWidth"
          fill="none"
          class="connection-path"
          @dblclick="deleteConnection(connection.id)"
        />
        
        <!-- Temporary connection path during creation -->
        <path
          v-if="newConnection.isCreating"
          :d="generateTempConnectionPath()"
          stroke="#999"
          stroke-width="3"
          stroke-dasharray="5,5"
          fill="none"
          class="temp-connection-path"
        />
      </g>

    </svg>
  </div>
</template>


<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';

// Define interfaces as requested
import type { Station, Line, Connection } from "./types";

// Static dimensions for stations and lines
const stationMinWidth = 250;
const stationMinHeight = 150;
const lineWidth = 100;
const lineHeight = 50;

// SVG canvas dimensions (dynamic now)
const svgCanvas = reactive({
  width: 800,
  height: 600,
  padding: 50 // Padding to ensure room for elements
});

// Array of stations
const stations = ref<Station[]>([
  {
    id: 'station-1',
    name: 'Station #1',
    x: 20,
    y: 20,
    width: 300,
    height: 200,
    lines: [
      { id: 'line-1-1', name: 'Line #1', x: 20, y: 50, mw: 100, v: 400 },
      { id: 'line-1-2', name: 'Line #2', x: 140, y: 50, mw: 50, v: 220 }
    ]
  },
  {
    id: 'station-2',
    name: 'Station #2',
    x: 360,
    y: 20,
    width: 300,
    height: 200,
    lines: [
      { id: 'line-2-1', name: 'Line A', x: 20, y: 50, mw: 75, v: 400 },
      { id: 'line-2-2', name: 'Line B', x: 140, y: 50, mw: 25, v: 220 }
    ]
  }
]);

// Array of connections between lines
const connections = ref<Connection[]>([]);

// Initialize connections with the proper references
const initializeConnections = () => {
  const initialConnectionsData = [
    { 
      id: 'conn-1', 
      fromStationId: 'station-1', 
      fromLineId: 'line-1-1', 
      fromSide: 'right',
      toStationId: 'station-2', 
      toLineId: 'line-2-1', 
      toSide: 'left',
      color: '#3498db',
      strokeWidth: 3
    },
    { 
      id: 'conn-2', 
      fromStationId: 'station-1', 
      fromLineId: 'line-1-2', 
      fromSide: 'right',
      toStationId: 'station-2', 
      toLineId: 'line-2-2', 
      toSide: 'left',
      color: '#e74c3c',
      strokeWidth: 3
    }
  ];

  // Convert ID references to object references
  connections.value = initialConnectionsData.map(conn => {
    const fromStation = stations.value.find(s => s.id === conn.fromStationId);
    const toStation = stations.value.find(s => s.id === conn.toStationId);
    const fromLine = fromStation?.lines.find(l => l.id === conn.fromLineId);
    const toLine = toStation?.lines.find(l => l.id === conn.toLineId);

    if (fromStation && toStation && fromLine && toLine) {
      return {
        id: conn.id,
        fromStation,
        fromLine,
        fromSide: conn.fromSide,
        toStation,
        toLine,
        toSide: conn.toSide,
        color: conn.color,
        strokeWidth: conn.strokeWidth
      };
    }
    return null;
  }).filter(Boolean) as Connection[];
};

// Connection being created (if any)
const newConnection = reactive({
  isCreating: false,
  fromStation: null as Station | null,
  fromLine: null as Line | null,
  fromSide: null as string | null,
  tempEndX: 0,
  tempEndY: 0
});

// Define current dragging and resizing state
const draggedElement = ref<{ line: Line, station: Station } | null>(null);
const draggedStation = ref<Station | null>(null);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const draggingStation = ref(false);
const resizing = ref(false);
const resizeType = ref(''); // 'width', 'height', or 'corner'
const initialResize = reactive({ x: 0, y: 0, width: 0, height: 0 });
const initialStationDrag = reactive({ x: 0, y: 0, stationX: 0, stationY: 0 });

// Define connection mode
const connectionMode = ref(false);

// Station boundaries
const stationPadding = 20;

// Calculate the required SVG size based on all stations' positions and dimensions
const updateCanvasSize = () => {
  // Find the rightmost and bottommost edges of all stations
  let maxRight = 0;
  let maxBottom = 0;
  
  stations.value.forEach(station => {
    const stationRight = station.x + station.width;
    const stationBottom = station.y + station.height;
    
    maxRight = Math.max(maxRight, stationRight);
    maxBottom = Math.max(maxBottom, stationBottom);
  });
  
  // Ensure canvas is big enough to fit all stations plus padding
  svgCanvas.width = Math.max(svgCanvas.width, maxRight + svgCanvas.padding);
  svgCanvas.height = Math.max(svgCanvas.height, maxBottom + svgCanvas.padding);
};

// Function to get absolute position of a line
const getLineAbsolutePosition = (station: Station, line: Line) => {
  return {
    x: station.x + line.x,
    y: station.y + line.y,
    width: lineWidth,
    height: lineHeight
  };
};

// Function to get connection point coordinates based on side
const getConnectionPoint = (station: Station, line: Line, side: string) => {
  const pos = getLineAbsolutePosition(station, line);
  
  switch (side) {
    case 'left':
      return { x: pos.x, y: pos.y + pos.height / 2 };
    case 'right':
      return { x: pos.x + pos.width, y: pos.y + pos.height / 2 };
    case 'top':
      return { x: pos.x + pos.width / 2, y: pos.y };
    case 'bottom':
      return { x: pos.x + pos.width / 2, y: pos.y + pos.height };
    default:
      return { x: pos.x + pos.width / 2, y: pos.y + pos.height / 2 };
  }
};

// Generate SVG path for a connection
const generateConnectionPath = (connection: Connection) => {
  const from = getConnectionPoint(connection.fromStation, connection.fromLine, connection.fromSide);
  const to = getConnectionPoint(connection.toStation, connection.toLine, connection.toSide);
  
  // Calculate control points for a curved path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const midX = from.x + dx / 2;
  
  // Create an S-curve path
  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
};

// Generate temporary connection path during creation
const generateTempConnectionPath = () => {
  if (!newConnection.isCreating || !newConnection.fromStation || !newConnection.fromLine || !newConnection.fromSide) {
    return '';
  }
  
  const from = getConnectionPoint(
    newConnection.fromStation,
    newConnection.fromLine,
    newConnection.fromSide
  );
  
  // Calculate control points for a curved path
  const dx = newConnection.tempEndX - from.x;
  const dy = newConnection.tempEndY - from.y;
  const midX = from.x + dx / 2;
  
  // Create an S-curve path
  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${newConnection.tempEndY}, ${newConnection.tempEndX} ${newConnection.tempEndY}`;
};

// Watch for changes in any station's position or size
watch(stations, () => {
  updateCanvasSize();
}, { deep: true });

// Start dragging a station
const startStationDrag = (event: MouseEvent, station: Station) => {
  // Only proceed if we're not in connection mode
  if (connectionMode.value) return;
  
  // Only drag if clicking directly on the station itself (not lines or handles)
  if (event.target instanceof Element && event.target.tagName === 'rect' && event.target.classList.contains('station-rect')) {
    event.preventDefault();
    draggingStation.value = true;
    draggedStation.value = station;
    
    initialStationDrag.x = event.clientX;
    initialStationDrag.y = event.clientY;
    initialStationDrag.stationX = station.x;
    initialStationDrag.stationY = station.y;
    
    document.addEventListener('mousemove', dragStation);
    document.addEventListener('mouseup', endStationDrag);
  }
};

// Handle station dragging
const dragStation = (event: MouseEvent) => {
  if (!draggingStation.value || !draggedStation.value) return;
  
  const deltaX = event.clientX - initialStationDrag.x;
  const deltaY = event.clientY - initialStationDrag.y;
  
  // Calculate new position (prevent negative coordinates)
  draggedStation.value.x = Math.max(0, initialStationDrag.stationX + deltaX);
  draggedStation.value.y = Math.max(0, initialStationDrag.stationY + deltaY);
  
  // Update canvas size if needed
  updateCanvasSize();
};

// End station dragging
const endStationDrag = () => {
  draggingStation.value = false;
  draggedStation.value = null;
  document.removeEventListener('mousemove', dragStation);
  document.removeEventListener('mouseup', endStationDrag);
};

// Start dragging a line
const startDrag = (event: MouseEvent, line: Line, station: Station) => {
  // Only proceed if we're not in connection mode
  if (connectionMode.value) return;
  
  // Prevent default behavior
  event.preventDefault();
  event.stopPropagation(); // Prevent event from bubbling up to station
  
  // Store the element being dragged and its parent station
  draggedElement.value = { line, station };
  
  // Calculate the offset within the element where the drag started
  if (event.target instanceof Element) {
    const svgRect = (event.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
    const elementRect = event.target.getBoundingClientRect();
    
    dragOffsetX.value = event.clientX - elementRect.left;
    dragOffsetY.value = event.clientY - elementRect.top;
  }
  
  // Add event listeners for dragging and dropping
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
};

// Handle dragging movement
const drag = (event: MouseEvent) => {
  if (draggedElement.value) {
    const { line, station } = draggedElement.value;
    
    // Calculate new position (accounting for station position)
    const newX = event.clientX - dragOffsetX.value - station.x;
    const newY = event.clientY - dragOffsetY.value - station.y;
    
    // Enforce boundaries within the station
    const boundedX = Math.max(stationPadding, Math.min(newX, station.width - lineWidth - stationPadding));
    const boundedY = Math.max(stationPadding, Math.min(newY, station.height - lineHeight - stationPadding));
    
    // Update line position
    line.x = boundedX;
    line.y = boundedY;
  }
};

// End dragging
const endDrag = () => {
  draggedElement.value = null;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', endDrag);
};

// Start resizing a station
const startResize = (event: MouseEvent, station: Station, type: string) => {
  // Only proceed if we're not in connection mode
  if (connectionMode.value) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  resizing.value = true;
  draggedStation.value = station;
  resizeType.value = type;
  
  // Store initial mouse position and station dimensions
  initialResize.x = event.clientX;
  initialResize.y = event.clientY;
  initialResize.width = station.width;
  initialResize.height = station.height;
  
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', endResize);
};

// Handle resizing movement
const resize = (event: MouseEvent) => {
  if (!resizing.value || !draggedStation.value) return;
  
  const station = draggedStation.value;
  const deltaX = event.clientX - initialResize.x;
  const deltaY = event.clientY - initialResize.y;
  
  if (resizeType.value === 'width' || resizeType.value === 'corner') {
    const newWidth = Math.max(stationMinWidth, initialResize.width + deltaX);
    station.width = newWidth;
  }
  
  if (resizeType.value === 'height' || resizeType.value === 'corner') {
    const newHeight = Math.max(stationMinHeight, initialResize.height + deltaY);
    station.height = newHeight;
  }
  
  // Ensure lines stay within the station boundaries after resize
  station.lines.forEach(line => {
    if (line.x + lineWidth > station.width - stationPadding) {
      line.x = Math.max(stationPadding, station.width - lineWidth - stationPadding);
    }
    if (line.y + lineHeight > station.height - stationPadding) {
      line.y = Math.max(stationPadding, station.height - lineHeight - stationPadding);
    }
  });
  
  // Update canvas size if needed
  updateCanvasSize();
};

// End resizing
const endResize = () => {
  resizing.value = false;
  draggedStation.value = null;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', endResize);
};

// Add a new station
const addNewStation = () => {
  const newId = `station-${stations.value.length + 1}`;
  const newStation: Station = {
    id: newId,
    name: `Station #${stations.value.length + 1}`,
    x: 20,
    y: Math.max(...stations.value.map(s => s.y + s.height)) + 40, // Position below last station
    width: 300,
    height: 200,
    lines: [
      { id: `${newId}-line-1`, name: 'New Line', x: 20, y: 50, mw: 100, v: 220 },
      { id: `${newId}-line-2`, name: 'New Line 2', x: 140, y: 50, mw: 50, v: 110 }
    ]
  };
  
  stations.value.push(newStation);
  updateCanvasSize();
};

// Toggle connection mode
const toggleConnectionMode = () => {
  connectionMode.value = !connectionMode.value;
  
  // Reset connection creation state when toggling off
  if (!connectionMode.value) {
    newConnection.isCreating = false;
    newConnection.fromStation = null;
    newConnection.fromLine = null;
    newConnection.fromSide = null;
  }
};

// Start connection creation
const startConnectionCreation = (event: MouseEvent, station: Station, line: Line, side: string) => {
  if (!connectionMode.value) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  newConnection.isCreating = true;
  newConnection.fromStation = station;
  newConnection.fromLine = line;
  newConnection.fromSide = side;
  newConnection.tempEndX = event.clientX;
  newConnection.tempEndY = event.clientY;
  
  document.addEventListener('mousemove', updateConnectionPath);
  document.addEventListener('mouseup', endConnectionCreation);
};

// Update temporary connection path during mouse movement
const updateConnectionPath = (event: MouseEvent) => {
  if (!newConnection.isCreating) return;
  
  newConnection.tempEndX = event.clientX;
  newConnection.tempEndY = event.clientY;
};

// End connection creation
const endConnectionCreation = (event: MouseEvent) => {
  if (!newConnection.isCreating) return;
  
  document.removeEventListener('mousemove', updateConnectionPath);
  document.removeEventListener('mouseup', endConnectionCreation);
  
  // Check if ending on a connection point
  if (event.target instanceof Element && event.target.classList.contains('connection-point')) {
    const stationId = event.target.getAttribute('data-station-id');
    const lineId = event.target.getAttribute('data-line-id');
    const toSide = event.target.getAttribute('data-side');
    
    if (stationId && lineId && toSide) {
      const toStation = stations.value.find(s => s.id === stationId);
      const toLine = toStation?.lines.find(l => l.id === lineId);
      
      if (toStation && toLine && newConnection.fromStation && newConnection.fromLine) {
        // Don't allow connecting to the same line
        if (newConnection.fromStation.id === toStation.id && 
            newConnection.fromLine.id === toLine.id) {
          newConnection.isCreating = false;
          return;
        }
        
        // Create new connection with direct references
        const newConnectionObj: Connection = {
          id: `conn-${Date.now()}`,
          fromStation: newConnection.fromStation,
          fromLine: newConnection.fromLine,
          fromSide: newConnection.fromSide as string,
          toStation: toStation,
          toLine: toLine,
          toSide: toSide,
          color: '#2ecc71', // Default color for new connections
          strokeWidth: 3
        };
        
        connections.value.push(newConnectionObj);
      }
    }
  }
  
  // Reset connection creation state
  newConnection.isCreating = false;
};

// Delete a connection
const deleteConnection = (connectionId: string) => {
  const index = connections.value.findIndex(c => c.id === connectionId);
  if (index !== -1) {
    connections.value.splice(index, 1);
  }
};

// Initialize on component mounted
onMounted(() => {
  updateCanvasSize();
  initializeConnections();
});
</script>

<style scoped>
.component-label {
  font-size: 14px;
  fill: #333;
  pointer-events: none; /* Makes text non-interactive for mouse events */
}

.station-name {
  font-weight: bold;
  font-size: 16px;
}

.grid-canvas {
  border: #333 solid thin;
  background: #fafafa;
}

.station-group {
  cursor: move;
}

.station-group:not(:hover) .resize-handle {
  opacity: 0;
}

.draggable-line {
  cursor: move;
}

.draggable-line:hover rect {
  fill: #c0e0ff;
}

.resize-handle {
  cursor: nwse-resize;
  opacity: 0;
  transition: opacity 0.2s;
}

.station-group:hover .resize-handle {
  opacity: 1;
}

.container {
  overflow: auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar-btn:hover {
  background-color: #45a049;
}

.toolbar-btn.active {
  background-color: #f39c12;
}

.connection-point {
  fill: #3498db;
  stroke: #2980b9;
  stroke-width: 2;
  cursor: crosshair;
  opacity: 0.8;
}

.connection-point:hover {
  fill: #e74c3c;
  transform: scale(1.2);
}

.connection-path {
  pointer-events: stroke;
  cursor: pointer;
}

.connection-path:hover {
  stroke-width: 5;
}

.connections-layer {
  pointer-events: none;
}

.connections-layer path {
  pointer-events: stroke;
}

.temp-connection-path {
  pointer-events: none;
}
</style>