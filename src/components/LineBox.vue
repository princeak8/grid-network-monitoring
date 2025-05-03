<template>
    <g class="line-group">
          <g 
            :transform="`translate(${line.x},${line.y})`"
            @mousedown="(e) => startDrag(e, line, station)"
            class="draggable-line"
          >
            <rect :width="lineWidth" :height="lineHeight" fill="#e0f0ff" stroke="#000" stroke-width="2" />
            <text x="10" y="10" class="component-label line-name">{{ line.name || line.id }}</text>
            <text x="5" y="25" class="component-label line-value" v-if="line.mw !== null && line.mw !== undefined">{{ line.mw }} 
                <tspan class="unit-label">MW</tspan>
            </text>
            <text x="5" y="40" class="component-label" v-if="line.v !== null && line.v !== undefined">{{ line.v }} 
                <tspan class="unit-label">kV</tspan>
            </text>
            
            <!-- Connection points (visible in connection mode) -->
            <g v-if="connectionMode" class="connection-points">
              <!-- Left connection point -->
              <circle cx="0" cy="25" r="6" class="connection-point" :data-station-id="station.id" :data-line-id="line.id" :data-side="'left'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'left')"
              />
              
              <!-- Right connection point -->
              <circle :cx="lineWidth" cy="25" r="6" class="connection-point" :data-station-id="station.id" :data-line-id="line.id" :data-side="'right'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'right')"
              />
              
              <!-- Top connection point -->
              <circle :cx="lineWidth / 2" cy="0" r="6" class="connection-point" :data-station-id="station.id" :data-line-id="line.id" :data-side="'top'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'top')"
              />
              
              <!-- Bottom connection point -->
              <circle :cx="lineWidth / 2" :cy="lineHeight" r="6" class="connection-point" :data-station-id="station.id" :data-line-id="line.id" :data-side="'bottom'"
                @mousedown="(e) => startConnectionCreation(e, station, line, 'bottom')"
              />
            </g>
          </g>
    </g>
        
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { Station, Line, Connection } from "../types"
import { lineWidth, lineHeight } from "../constants";

const props = defineProps<{
  line: any,
  startDrag(event: MouseEvent, line: Line, station: Station),
  startConnectionCreation(event: MouseEvent, station: Station, line: Line, side: string),
  connectionMode: boolean
}>();

</script>

<style scoped>
.component-label {
  font-size: 12px;
  /* fill: #333; */
  pointer-events: none; /* Makes text non-interactive for mouse events */
}

.line-name {
    font-size: 10px;
}

.unit-label {
  font-size: 8px;
}

.draggable-line {
  cursor: move;
}

.draggable-line:hover rect {
  fill: #c0e0ff;
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


</style>