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
    <svg class="grid-canvas" :width="svgCanvas.width" :height="svgCanvas.height">
      <!-- Grid background (optional) -->
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eee" stroke-width="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- Main station group -->
      <g 
        id="power-component-1"
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
          @mousedown="startStationDrag"
        />
        <text x="10" y="30" class="component-label">Station #1</text>

        <!-- Inner components group - now using our components array -->
        <g v-for="component in components" :key="component.id">
          <g 
            :transform="`translate(${component.x},${component.y})`"
            @mousedown="(e) => startDrag(e, component)"
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
          @mousedown="(e) => startResize(e, 'width')"
        />
        
        <!-- Bottom edge resize handle -->
        <rect 
          :x="station.width / 2 - 15" 
          :y="station.height - 6" 
          width="30" 
          height="12" 
          fill="rgba(0,0,0,0.2)" 
          class="resize-handle"
          @mousedown="(e) => startResize(e, 'height')"
        />
        
        <!-- Corner resize handle -->
        <rect 
          :x="station.width - 12" 
          :y="station.height - 12" 
          width="12" 
          height="12" 
          fill="rgba(0,0,0,0.3)" 
          class="resize-handle"
          @mousedown="(e) => startResize(e, 'corner')"
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

    // Parent station dimensions and position
    const station = reactive({
      x: 20,
      y: 20,
      width: 300,
      height: 200,
      minWidth: 250,
      minHeight: 150
    });

    // Define current dragging and resizing state
    const draggedElement = ref(null);
    const dragOffsetX = ref(0);
    const dragOffsetY = ref(0);
    const draggingStation = ref(false);
    const resizing = ref(false);
    const resizeType = ref(''); // 'width', 'height', or 'corner'
    const initialResize = reactive({ x: 0, y: 0, width: 0, height: 0 });
    const initialStationDrag = reactive({ x: 0, y: 0, stationX: 0, stationY: 0 });

    // Components to be dragged
    const components = ref([
      { id: 'line-1', x: 20, y: 50, width: 100, height: 50, label: 'Line #1' },
      { id: 'line-2', x: 140, y: 50, width: 100, height: 50, label: 'Line #2' },
      { id: 'transformer', x: 20, y: 120, width: 220, height: 50, label: 'Main Transformer' }
    ]);

    // Station boundaries
    const stationPadding = 20;

    // Calculate the required SVG size based on station position and dimensions
    const updateCanvasSize = () => {
      // Ensure canvas is big enough to fit station plus padding
      const requiredWidth = station.x + station.width + svgCanvas.padding;
      const requiredHeight = station.y + station.height + svgCanvas.padding;
      
      svgCanvas.width = Math.max(svgCanvas.width, requiredWidth);
      svgCanvas.height = Math.max(svgCanvas.height, requiredHeight);
    };

    // Watch for changes that would affect canvas size
    watch([() => station.x, () => station.y, () => station.width, () => station.height], () => {
      updateCanvasSize();
    });

    // Start dragging the station
    const startStationDrag = (event) => {
      // Only drag if clicking directly on the station itself (not components or handles)
      if (event.target.tagName === 'rect' && event.target.classList.contains('station-rect')) {
        event.preventDefault();
        draggingStation.value = true;
        
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
      if (!draggingStation.value) return;
      
      const deltaX = event.clientX - initialStationDrag.x;
      const deltaY = event.clientY - initialStationDrag.y;
      
      // Calculate new position (prevent negative coordinates)
      station.x = Math.max(0, initialStationDrag.stationX + deltaX);
      station.y = Math.max(0, initialStationDrag.stationY + deltaY);
      
      // Update canvas size if needed
      updateCanvasSize();
    };

    // End station dragging
    const endStationDrag = () => {
      draggingStation.value = false;
      document.removeEventListener('mousemove', dragStation);
      document.removeEventListener('mouseup', endStationDrag);
    };

    // Start dragging a component
    const startDrag = (event, component) => {
      // Prevent default behavior
      event.preventDefault();
      event.stopPropagation(); // Prevent event from bubbling up to station
      
      // Store the element being dragged
      draggedElement.value = component;
      
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
        // Calculate new position (accounting for station position)
        const newX = event.clientX - dragOffsetX.value - station.x;
        const newY = event.clientY - dragOffsetY.value - station.y;
        
        // Enforce boundaries within the station
        const boundedX = Math.max(stationPadding, Math.min(newX, station.width - draggedElement.value.width - stationPadding));
        const boundedY = Math.max(stationPadding, Math.min(newY, station.height - draggedElement.value.height - stationPadding));
        
        // Update component position
        draggedElement.value.x = boundedX;
        draggedElement.value.y = boundedY;
      }
    };

    // End dragging
    const endDrag = () => {
      draggedElement.value = null;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', endDrag);
    };

    // Start resizing the parent station
    const startResize = (event, type) => {
      event.preventDefault();
      event.stopPropagation();
      
      resizing.value = true;
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
      if (!resizing.value) return;
      
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
      components.value.forEach(component => {
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
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', endResize);
    };

    // Initial canvas size setup
    onMounted(() => {
      updateCanvasSize();
    });

</script>

<style scoped>

component-label {
  font-size: 14px;
  fill: #333;
  pointer-events: none; /* Makes text non-interactive for mouse events */
}

.grid-canvas {
  border: #333 solid thin;
}

.station-group {
  border: rgb(168, 106, 25) solid thin;
}

.component-label {
  font-size: 14px;
  fill: #333;
  pointer-events: none; /* Makes text non-interactive for mouse events */
}

.grid-canvas {
  border: #333 solid thin;
}

.station-group {
  cursor: default;
}

.draggable-component {
  cursor: move;
}

.draggable-component:hover rect {
  fill: #c0e0ff;
}
/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */
</style>
