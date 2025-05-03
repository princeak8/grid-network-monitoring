<template>
    <!-- Connection paths -->
    <g class="connections-layer">
        <path 
          v-for="connection in connections" 
          :key="connection.id"
          :d="generateConnectionPath(connection)"
          :stroke="connectionColor"
          :stroke-width="connectionStrokeWidth"
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
</template>

<script setup lang="ts">
    import { ref, reactive, computed, onMounted, watch } from 'vue';
    import { loadConnections } from "../utils"
    import type { Connection } from "../types";
    import { lineWidth, lineHeight, stationPadding, connectionColor, connectionStrokeWidth } from "../constants";

    const props = defineProps<{
    newConnection: any,
    connections: Connection[],
    }>();

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
  if (!props.newConnection.isCreating || !props.newConnection.fromStation || !props.newConnection.fromLine || !props.newConnection.fromSide) {
    return '';
  }
  
  const from = getConnectionPoint(
    props.newConnection.fromStation,
    props.newConnection.fromLine,
    props.newConnection.fromSide
  );
  
  // Calculate control points for a curved path
  const dx = props.newConnection.tempEndX - from.x;
  const dy = props.newConnection.tempEndY - from.y;
  const midX = from.x + dx / 2;
  
  // Create an S-curve path
  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${props.newConnection.tempEndY}, ${props.newConnection.tempEndX} ${props.newConnection.tempEndY}`;
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

// Function to get absolute position of a line
const getLineAbsolutePosition = (station: Station, line: Line) => {
  return {
    x: station.x + line.x,
    y: station.y + line.y,
    width: lineWidth,
    height: lineHeight
  };
};

// Delete a connection
const deleteConnection = (connectionId: string) => {
//   const index = connections.value.findIndex(c => c.id === connectionId);
//   if (index !== -1) {
//     connections.value.splice(index, 1);
//   }
};

</script>