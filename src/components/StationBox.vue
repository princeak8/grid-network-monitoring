<template>
    <g  
        class="station-group station-card"
        :transform="`translate(${station.x},${station.y})`"
        stroke="#e0e7ef" 
        fill="none"
        stroke-width="1.5"
      >
        <!-- Card background with shadow and rounded corners -->
        <rect 
          :width="station.width" 
          :height="station.height" 
          rx="18" ry="18"
          class="station-rect card-bg"
          @mousedown="(e) => startStationDrag(e, station)"
        />
        <!-- Header bar with icon, name, and status -->
        <rect :width="station.width" height="32" rx="18" ry="18" class="station-header-bar" />
        <g class="station-header-content">
          <!-- Icon (power bolt) -->
          <svg x="8" y="8" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14H12L11 22L21 10H13L13 2Z" fill="#3b82f6"/>
          </svg>
          <!-- Station name -->
          <text x="32" y="24" class="station-title" fill="#000">{{ station.name }}</text>
          <!-- Status dot (green for now) -->
          <circle :cx="station.width - 18" cy="18" r="7" :fill="'#22c55e'" class="status-dot" />
        </g>
        <!-- Inner lines group -->
        <LineBox v-for="line in station.lines" :key="line.id" :line="line" :startDrag="startDrag" :startConnectionCreation="startConnectionCreation"  
            :connectionMode="connectionMode" :live-data="liveData.data[station.id]?.[line.id] || {}"
        />
        <!-- Resize handles -->
        <rect :x="station.width - 6" :y="station.height / 2 - 15" width="12" height="30" fill="rgba(0,0,0,0.08)" class="resize-handle" @mousedown="(e) => startResize(e, station, 'width')" />
        <rect :x="station.width / 2 - 15" :y="station.height - 6" width="30" height="12" fill="rgba(0,0,0,0.08)" class="resize-handle" @mousedown="(e) => startResize(e, station, 'height')" />
        <rect :x="station.width - 12" :y="station.height - 12" width="12" height="12" fill="rgba(0,0,0,0.15)" class="resize-handle" @mousedown="(e) => startResize(e, station, 'corner')" />
      </g>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { Station, Line, Connection } from "./types"
import LineBox from "./LineBox.vue"
import { lineWidth, lineHeight, stationPadding } from "../constants";
import {
  updateLinePosition,
  getFromLocalStorage,
  updateStationSize
} from '../utils';
import { useLiveDataStore } from '@/stores/liveData';
const liveData = useLiveDataStore();

const props = defineProps<{
  id: string;
  stations: Station[];
  station: Station;
  startStationDrag: (event: MouseEvent, station: Station) => void;
  dragOffsetX: number;
  dragOffsetY: number;
  startResize: (event: MouseEvent, station: Station, type: string) => void;
  newConnection: any; // Replace 'any' with proper type
  connections: Connection[];
  connectionMode: boolean;
  draggedElement: { line: Line; station: Station } | null;
}>();

const emit = defineEmits(['updateDraggedElement', 'updateConnectionMode', 'updateDragOffsetX', 'updateDragOffsetY']);

// Start dragging a line
const startDrag = (event: MouseEvent, line: Line, station: Station) => {
  // Only proceed if we're not in connection mode
  if (props.connectionMode.value) return;
  
  // Prevent default behavior
  event.preventDefault();
  event.stopPropagation(); // Prevent event from bubbling up to station
  
  // Store the element being dragged and its parent station
  emit('updateDraggedElement', { line, station });
  
  // Calculate the offset within the element where the drag started (SVG coordinates)
  if (event.target instanceof Element) {
    const svgRect = (event.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
    // Mouse position relative to SVG
    const mouseSvgX = event.clientX - svgRect.left;
    const mouseSvgY = event.clientY - svgRect.top;
    // Offset from mouse to line's top-left in SVG coordinates
    emit('updateDragOffsetX', mouseSvgX - (props.station.x + line.x));
    emit('updateDragOffsetY', mouseSvgY - (props.station.y + line.y));
  }
  
  // Add event listeners for dragging and dropping
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
};

// Handle dragging movement
const drag = (event: MouseEvent) => {
  if (props.draggedElement) {
    const { line, station } = props.draggedElement;
    // Get mouse position in SVG coordinates
    const svgRect = (event.target as SVGElement)?.ownerSVGElement?.getBoundingClientRect() || document.querySelector('svg')?.getBoundingClientRect();
    const mouseSvgX = event.clientX - svgRect.left;
    const mouseSvgY = event.clientY - svgRect.top;
    // Calculate new position in station coordinates
    const newX = mouseSvgX - props.station.x - props.dragOffsetX;
    const newY = mouseSvgY - props.station.y - props.dragOffsetY;
    // Enforce boundaries within the station
    const boundedX = Math.max(stationPadding, Math.min(newX, props.station.width - lineWidth - stationPadding));
    const boundedY = Math.max(stationPadding, Math.min(newY, props.station.height - lineHeight - stationPadding));
    // Update line position
    line.x = boundedX;
    line.y = boundedY;
  }
};

// End dragging
const endDrag = () => {
  if (props.draggedElement) {
    const { line, station } = props.draggedElement;
    
    // Save line position to localStorage when dragging ends
    updateLinePosition(props.stations, props.station.id, line.id, line.x, line.y);
  }
//   props.draggedElement.value = null;
  emit('updateDraggedElement', null);
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', endDrag);
};


// Start connection creation
const startConnectionCreation = (event: MouseEvent, station: Station, line: Line, side: string) => {
  if (!prop.connectionMode.value) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  props.newConnection.isCreating = true;
  props.newConnection.fromStation = station;
  props.newConnection.fromLine = line;
  props.newConnection.fromSide = side;
  props.newConnection.tempEndX = event.clientX;
  props.newConnection.tempEndY = event.clientY;
  
  document.addEventListener('mousemove', updateConnectionPath);
  document.addEventListener('mouseup', endConnectionCreation);
};

// Update temporary connection path during mouse movement
const updateConnectionPath = (event: MouseEvent) => {
  if (!newConnection.isCreating) return;
  
  props.newConnection.tempEndX = event.clientX;
  props.newConnection.tempEndY = event.clientY;
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
      
      if (toStation && toLine && props.newConnection.fromStation && props.newConnection.fromLine) {
        // Don't allow connecting to the same line
        if (props.newConnection.fromStation.id === toStation.id && 
            props.newConnection.fromLine.id === toLine.id) {
            props.newConnection.isCreating = false;
            return;
        }
        
        // Create new connection with direct references
        const newConnectionObj: Connection = {
          id: `conn-${Date.now()}`,
          fromStation: props.newConnection.fromStation,
          fromLine: props.newConnection.fromLine,
          fromSide: props.newConnection.fromSide as string,
          toStation: toStation,
          toLine: toLine,
          toSide: toSide,
          color: '#2ecc71', // Default color for new connections
          strokeWidth: 3
        };
        
        props.connections.value.push(newConnectionObj);
      }
    }
  }
  
  // Reset connection creation state
  props.newConnection.isCreating = false;
}

</script>

<style scoped>
.station-card {
  /* Remove filter and transform from the group to prevent hover glitches */
}
.card-bg {
  fill: url(#stationCardGradient);
  stroke: #e0e7ef;
  filter: drop-shadow(0 4px 16px rgba(56, 189, 248, 0.10)) drop-shadow(0 1.5px 6px rgba(30, 41, 59, 0.10));
  transition: filter 0.2s, fill 0.2s;
}
.card-bg:hover {
  filter: drop-shadow(0 8px 24px rgba(56, 189, 248, 0.18)) drop-shadow(0 3px 12px rgba(30, 41, 59, 0.18));
  fill: url(#stationCardGradient);
}
.station-header-bar {
  fill: url(#stationHeaderGradient);
  stroke: none;
}
.station-header-content {
  pointer-events: none;
}
.station-title {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  fill: #000;
  letter-spacing: 0.01em;
  dominant-baseline: middle;
}
.status-dot {
  stroke: #fff;
  stroke-width: 2;
}
.component-label {
  font-size: 14px;
  fill: #333;
  pointer-events: none; /* Makes text non-interactive for mouse events */
}

.station-name {
  font-weight: normal;
  font-size: 14px;
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