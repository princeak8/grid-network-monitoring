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
    <button @click="addNewStation" class="add-station-btn">Add New Station</button>
    
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
        <g v-for="component in station.components" :key="component.id">
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
          </g>
        </g>
        
        <!-- Resize handles -->
        <!-- Right edge resize handle -->
        <rect 
          :x="station.width - 6" 
          :y="station.height / 2 - 15" 
          width="12" 
          height="30" 
          fill="rgba(0,0,0,0.2)" 
          class="resize-handle"
          @mousedown="(e) => startResize(e, station, 'width')"
        />
        
        <!-- Bottom edge resize handle -->
        <rect 
          :x="station.width / 2 - 15" 
          :y="station.height - 6" 
          width="30" 
          height="12" 
          fill="rgba(0,0,0,0.2)" 
          class="resize-handle"
          @mousedown="(e) => startResize(e, station, 'height')"
        />
        
        <!-- Corner resize handle -->
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
          { id: 'transformer-1', x: 20, y: 120, width: 220, height: 50, label: 'Main Transformer' }
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
          { id: 'transformer-2', x: 20, y: 120, width: 220, height: 50, label: 'Backup Transformer' }
        ]
      }
    ]);

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

    // Watch for changes in any station's position or size
    watch(stations, () => {
      updateCanvasSize();
    }, { deep: true });

    // Start dragging a station
    const startStationDrag = (event, station) => {
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

.add-station-btn {
  margin: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
}

.add-station-btn:hover {
  background-color: #45a049;
}

</style>
