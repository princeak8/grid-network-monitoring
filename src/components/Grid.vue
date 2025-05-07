<template>
    <div class="container">
      
      <svg class="grid-canvas" :width="svgCanvas.width" :height="svgCanvas.height">
        <!-- Grid background (optional) -->
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eee" stroke-width="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <!-- Iterate through all stations -->
        
        <StationBox v-for="station in stations" :id="station.id" :stations="stations" :station="station" :startStationDrag="startStationDrag" :dragOffsetX="dragOffsetX" :dragOffsetY="dragOffsetY"
            :startResize="startResize" :newConnection="newConnection" :connections="connections" :connectionMode="connectionMode" :draggedElement="draggedElement" 
            @updateDraggedElement="updateDraggedElement" @updateConnectionMode="updateConnectionMode" @updateDragOffsetX="updateDragOffsetX" @updateDragOffsetY="updateDragOffsetY"   
        />
  
        <!-- Connection paths -->
        <ConnectionComponent :connections="connections" :newConnection="newConnection" />
  
      </svg>
    </div>
  </template>
  
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  // import stationData from './data/stations';
  // import connectionsData from './data/connections';
  import {
    loadStations,
    updateStationPosition,
    updateStationSize,
    updateLinePosition,
    getFromLocalStorage,
    loadConnections,
    saveConnectionsToLocalStorage
  } from '../utils';
  
  import { fetchStations } from '../apiUtils';
  
  
  // Define interfaces as requested
  import type { Station, Line, Connection } from "../types";
  import StationBox from "../components/StationBox.vue"
  import ConnectionComponent from "../components/Connection.vue"
  import { lineWidth, lineHeight, stationPadding, connectionColor, connectionStrokeWidth, canvasWidth, canvasHeight, canvasPadding } from "../constants";

//   console.log("this is the Grid");

  // Static dimensions for stations and lines
  const stationMinWidth = 20;
  const stationMinHeight = 20;
  
  // SVG canvas dimensions (dynamic now)
  const svgCanvas = reactive({
    width: canvasWidth,
    height: canvasHeight,
    padding: canvasPadding // Padding to ensure room for elements
  });
  
  // Array of stations
  const stations = ref<Station[]>([])
  
  // Array of connections between lines
  const connections = ref<Connection[]>([]);
  
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
  
  
  const updateDraggedElement = (val) => draggedElement.value = val;
  const updateConnectionMode = (val) => connectionMode.value = val;
  const updateDragOffsetX = (val) => dragOffsetX.value = val;
  const updateDragOffsetY = (val) => dragOffsetY.value = val;
  
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
    if (draggedStation.value) {
      // Save position to localStorage when station dragging ends
      updateStationPosition(stations.value, draggedStation.value.id, draggedStation.value.x, draggedStation.value.y);
    }
  
    draggingStation.value = false;
    draggedStation.value = null;
    document.removeEventListener('mousemove', dragStation);
    document.removeEventListener('mouseup', endStationDrag);
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
    if (resizing.value && draggedStation.value) {
      // Save station size to localStorage when resizing ends
      updateStationSize(stations.value, draggedStation.value.id, draggedStation.value.width, draggedStation.value.height);
      
      // Also update line positions if they were affected by the resize
      draggedStation.value.lines.forEach(line => {
        updateLinePosition(stations.value, draggedStation.value.id, line.id, line.x, line.y);
      });
    }
  
    resizing.value = false;
    draggedStation.value = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', endResize);
  };
  
  // Function to update connection references after stations are loaded
  const updateConnectionReferences = () => {
    connections.value.forEach(connection => {
      // Update fromStation and fromLine references
      if (connection.fromStation) {
        const newFromStation = stations.value.find(s => s.id === connection.fromStation.id);
        if (newFromStation) {
          connection.fromStation = newFromStation;
          
          // Update fromLine reference
          if (connection.fromLine) {
            const newFromLine = newFromStation.lines.find(l => l.id === connection.fromLine.id);
            if (newFromLine) {
              connection.fromLine = newFromLine;
            }
          }
        }
      }
      
      // Update toStation and toLine references
      if (connection.toStation) {
        const newToStation = stations.value.find(s => s.id === connection.toStation.id);
        if (newToStation) {
          connection.toStation = newToStation;
          
          // Update toLine reference
          if (connection.toLine) {
            const newToLine = newToStation.lines.find(l => l.id === connection.toLine.id);
            if (newToLine) {
              connection.toLine = newToLine;
            }
          }
        }
      }
    });
  };
  
  // Initialize on component mounted
  onMounted(async () => {
    console.log("Grid component mounted");
    try {
        await fetchStations();
        stations.value = await loadStations();
        connections.value = await loadConnections(stations.value);
        // console.log("connections:", connections.value);
        // Load connections from localStorage or use default
        // const storedConnections = getConnectionsFromLocalStorage(stations.value);
        // connections.value = storedConnections.length > 0 ? storedConnections : connectionsData;
        updateConnectionReferences();
        updateCanvasSize();
    } catch (error) {
        console.error("Error initializing grid:", error);
    }
  
  });
  </script>
  
  <style scoped>
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