<template>
  <!-- <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" /> -->

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

        <!-- Inner components group -->
        <g v-for="component in station.components" :key="component.id" class="component-group">
          <g 
            :transform="`translate(${component.x},${component.y})`"
            @mousedown="(e) => startDrag(e, component, station)"
            class="draggable-component"
          >
            <rect 
              :width="component.width" 
              :height="component.height"
              fill="#e0f0ff" 
              stroke="#000"
              stroke-width="2" 
            />
            <text x="10" y="20" class="component-label">{{ component.label }}</text>
            
            <!-- Connection points (visible in connection mode) -->
            <g v-if="connectionMode" class="connection-points">
              <!-- Left connection point -->
              <circle 
                cx="0" 
                cy="25" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-component-id="component.id"
                :data-side="'left'"
                @mousedown="(e) => startConnectionCreation(e, station, component, 'left')"
              />
              
              <!-- Right connection point -->
              <circle 
                :cx="component.width" 
                cy="25" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-component-id="component.id"
                :data-side="'right'"
                @mousedown="(e) => startConnectionCreation(e, station, component, 'right')"
              />
              
              <!-- Top connection point -->
              <circle 
                :cx="component.width / 2" 
                cy="0" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-component-id="component.id"
                :data-side="'top'"
                @mousedown="(e) => startConnectionCreation(e, station, component, 'top')"
              />
              
              <!-- Bottom connection point -->
              <circle 
                :cx="component.width / 2" 
                :cy="component.height" 
                r="6" 
                class="connection-point"
                :data-station-id="station.id"
                :data-component-id="component.id"
                :data-side="'bottom'"
                @mousedown="(e) => startConnectionCreation(e, station, component, 'bottom')"
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
    import HelloWorld from './components/HelloWorld.vue'

    // SVG canvas dimensions (dynamic now)
    const svgCanvas = reactive({
      width: 800,
      height: 600,
      padding: 50 // Padding to ensure room for elements
    });

    // Array of stations
    const stations = ref([
      {
        id: 'station-1',
        name: 'Station #1',
        x: 20,
        y: 20,
        width: 300,
        height: 200,
        minWidth: 250,
        minHeight: 150,
        components: [
          { id: 'line-1-1', x: 20, y: 50, width: 100, height: 50, label: 'Line #1' },
          { id: 'line-1-2', x: 140, y: 50, width: 100, height: 50, label: 'Line #2' },
          // { id: 'transformer-1', x: 20, y: 120, width: 220, height: 50, label: 'Main Transformer' }
        ]
      },
      {
        id: 'station-2',
        name: 'Station #2',
        x: 360,
        y: 20,
        width: 300,
        height: 200,
        minWidth: 250,
        minHeight: 150,
        components: [
          { id: 'line-2-1', x: 20, y: 50, width: 100, height: 50, label: 'Line A' },
          { id: 'line-2-2', x: 140, y: 50, width: 100, height: 50, label: 'Line B' },
          // { id: 'transformer-2', x: 20, y: 120, width: 220, height: 50, label: 'Backup Transformer' }
        ]
      }
    ]);

    // Array of connections between components
    const connections = ref([
      { 
        id: 'conn-1', 
        fromStationId: 'station-1', 
        fromComponentId: 'line-1-1', 
        fromSide: 'right',
        toStationId: 'station-2', 
        toComponentId: 'line-2-1', 
        toSide: 'left',
        color: '#3498db',
        strokeWidth: 3
      },
      { 
        id: 'conn-2', 
        fromStationId: 'station-1', 
        fromComponentId: 'line-1-2', 
        fromSide: 'right',
        toStationId: 'station-2', 
        toComponentId: 'line-2-2', 
        toSide: 'left',
        color: '#e74c3c',
        strokeWidth: 3
      }
    ]);

    // Connection being created (if any)
    const newConnection = reactive({
      isCreating: false,
      fromStation: null,
      fromComponent: null,
      fromSide: null,
      tempEndX: 0,
      tempEndY: 0
    });

    // Define current dragging and resizing state
    const draggedElement = ref(null);
    const draggedStation = ref(null);
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

    // Function to get absolute position of a component
    const getComponentAbsolutePosition = (stationId, componentId) => {
      const station = stations.value.find(s => s.id === stationId);
      if (!station) return null;
      
      const component = station.components.find(c => c.id === componentId);
      if (!component) return null;
      
      return {
        x: station.x + component.x,
        y: station.y + component.y,
        width: component.width,
        height: component.height
      };
    };

    // Function to get connection point coordinates based on side
    const getConnectionPoint = (stationId, componentId, side) => {
      const pos = getComponentAbsolutePosition(stationId, componentId);
      if (!pos) return null;
      
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
    const generateConnectionPath = (connection) => {
      const from = getConnectionPoint(connection.fromStationId, connection.fromComponentId, connection.fromSide);
      const to = getConnectionPoint(connection.toStationId, connection.toComponentId, connection.toSide);
      
      if (!from || !to) return '';
      
      // Calculate control points for a curved path
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const midX = from.x + dx / 2;
      
      // Create an S-curve path
      return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
    };
    // Generate temporary connection path during creation
    const generateTempConnectionPath = () => {
      if (!newConnection.isCreating || !newConnection.fromStation || !newConnection.fromComponent || !newConnection.fromSide) {
        return '';
      }
      
      const from = getConnectionPoint(
        newConnection.fromStation.id,
        newConnection.fromComponent.id,
        newConnection.fromSide
      );
      
      if (!from) return '';
      
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
    const startStationDrag = (event, station) => {
      // Only proceed if we're not in connection mode
      if (connectionMode.value) return;
      
      // Only drag if clicking directly on the station itself (not components or handles)
      if (event.target.tagName === 'rect' && event.target.classList.contains('station-rect')) {
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
    const dragStation = (event) => {
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

    // Start dragging a component
    const startDrag = (event, component, station) => {
      // Only proceed if we're not in connection mode
      if (connectionMode.value) return;
      
      // Prevent default behavior
      event.preventDefault();
      event.stopPropagation(); // Prevent event from bubbling up to station
      
      // Store the element being dragged and its parent station
      draggedElement.value = { component, station };
      
      // Calculate the offset within the element where the drag started
      const svgRect = event.target.ownerSVGElement.getBoundingClientRect();
      const elementRect = event.target.getBoundingClientRect();
      
      dragOffsetX.value = event.clientX - elementRect.left;
      dragOffsetY.value = event.clientY - elementRect.top;
      
      // Add event listeners for dragging and dropping
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', endDrag);
    };

    // Handle dragging movement
    const drag = (event) => {
      if (draggedElement.value) {
        const { component, station } = draggedElement.value;
        
        // Calculate new position (accounting for station position)
        const newX = event.clientX - dragOffsetX.value - station.x;
        const newY = event.clientY - dragOffsetY.value - station.y;
        
        // Enforce boundaries within the station
        const boundedX = Math.max(stationPadding, Math.min(newX, station.width - component.width - stationPadding));
        const boundedY = Math.max(stationPadding, Math.min(newY, station.height - component.height - stationPadding));
        
        // Update component position
        component.x = boundedX;
        component.y = boundedY;
      }
    };

    // End dragging
    const endDrag = () => {
      draggedElement.value = null;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', endDrag);
    };

    // Start resizing a station
    const startResize = (event, station, type) => {
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
    const resize = (event) => {
      if (!resizing.value || !draggedStation.value) return;
      
      const station = draggedStation.value;
      const deltaX = event.clientX - initialResize.x;
      const deltaY = event.clientY - initialResize.y;
      
      if (resizeType.value === 'width' || resizeType.value === 'corner') {
        const newWidth = Math.max(station.minWidth, initialResize.width + deltaX);
        station.width = newWidth;
      }
      
      if (resizeType.value === 'height' || resizeType.value === 'corner') {
        const newHeight = Math.max(station.minHeight, initialResize.height + deltaY);
        station.height = newHeight;
      }
      
      // Ensure components stay within the station boundaries after resize
      station.components.forEach(component => {
        if (component.x + component.width > station.width - stationPadding) {
          component.x = Math.max(stationPadding, station.width - component.width - stationPadding);
        }
        if (component.y + component.height > station.height - stationPadding) {
          component.y = Math.max(stationPadding, station.height - component.height - stationPadding);
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
      const newStation = {
        id: newId,
        name: `Station #${stations.value.length + 1}`,
        x: 20,
        y: Math.max(...stations.value.map(s => s.y + s.height)) + 40, // Position below last station
        width: 300,
        height: 200,
        minWidth: 250,
        minHeight: 150,
        components: [
          { id: `${newId}-line-1`, x: 20, y: 50, width: 100, height: 50, label: 'New Line' },
          { id: `${newId}-transformer`, x: 20, y: 120, width: 220, height: 50, label: 'New Transformer' }
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
        newConnection.fromComponent = null;
        newConnection.fromSide = null;
      }
    };

    // Start connection creation
    const startConnectionCreation = (event, station, component, side) => {
      if (!connectionMode.value) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      newConnection.isCreating = true;
      newConnection.fromStation = station;
      newConnection.fromComponent = component;
      newConnection.fromSide = side;
      newConnection.tempEndX = event.clientX;
      newConnection.tempEndY = event.clientY;
      
      document.addEventListener('mousemove', updateConnectionPath);
      document.addEventListener('mouseup', endConnectionCreation);
    };

    // Update temporary connection path during mouse movement
    const updateConnectionPath = (event) => {
      if (!newConnection.isCreating) return;
      
      newConnection.tempEndX = event.clientX;
      newConnection.tempEndY = event.clientY;
    };

    // End connection creation
    const endConnectionCreation = (event) => {
      if (!newConnection.isCreating) return;
      
      document.removeEventListener('mousemove', updateConnectionPath);
      document.removeEventListener('mouseup', endConnectionCreation);
      
      // Check if ending on a connection point
      const targetElement = event.target;
      if (targetElement.classList.contains('connection-point')) {
        const toStation = stations.value.find(s => s.id === targetElement.dataset.stationId);
        const toComponent = toStation?.components.find(c => c.id === targetElement.dataset.componentId);
        const toSide = targetElement.dataset.side;
        
        if (toStation && toComponent) {
          // Don't allow connecting to the same component
          if (newConnection.fromStation.id === toStation.id && 
              newConnection.fromComponent.id === toComponent.id) {
            newConnection.isCreating = false;
            return;
          }
          
          // Create new connection
          const newConnectionObj = {
            id: `conn-${Date.now()}`,
            fromStationId: newConnection.fromStation.id,
            fromComponentId: newConnection.fromComponent.id,
            fromSide: newConnection.fromSide,
            toStationId: toStation.id,
            toComponentId: toComponent.id,
            toSide: toSide,
            color: '#2ecc71', // Default color for new connections
            strokeWidth: 3
          };
          
          connections.value.push(newConnectionObj);
        }
      }
      
      // Reset connection creation state
      newConnection.isCreating = false;
    };

    // Delete a connection
    const deleteConnection = (connectionId) => {
      const index = connections.value.findIndex(c => c.id === connectionId);
      if (index !== -1) {
        connections.value.splice(index, 1);
      }
    };

    // Initial canvas size setup
    onMounted(() => {
      updateCanvasSize();
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

.draggable-component {
  cursor: move;
}

.draggable-component:hover rect {
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
