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
    <svg class="grid-canvas" width="800" height="600">
        <!-- Main station group -->
        <g 
        id="power-component-1"
        class="station-group"
        transform="translate(20,20)"
        stroke="#000" 
        fill="#e0f0ff"
        stroke-width="2"
      >
        <!-- Outer station rectangle -->
        <rect width="300" height="200" />
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
      </g>


  
</svg>
  </div>
</template>


<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import HelloWorld from './components/HelloWorld.vue'

    const draggedElement = ref(null);
    const dragOffsetX = ref(0);
    const dragOffsetY = ref(0);
    const components = ref([
      { id: 'line-1', x: 20, y: 50, width: 100, height: 50, label: 'Line #1' },
      { id: 'line-2', x: 140, y: 50, width: 100, height: 50, label: 'Line #2' },
      { id: 'transformer', x: 20, y: 120, width: 220, height: 50, label: 'Main Transformer' }
    ]);

    // Station boundaries
    const stationPadding = 10;
    const stationWidth = 300;
    const stationHeight = 200;

    const startDrag = (event, component) => {
        // Prevent default behavior
        event.preventDefault();
        
        // Store the element being dragged
        draggedElement.value = component;
        
        // Calculate the offset within the element where the drag started
        // Need to adjust for the station's translation (20,20)
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
        // Calculate new position (accounting for station translation of 20,20)
        const newX = event.clientX - dragOffsetX.value - 20;
        const newY = event.clientY - dragOffsetY.value - 20;
        
        // Enforce boundaries within the station
        const boundedX = Math.max(stationPadding, Math.min(newX, stationWidth - draggedElement.value.width - stationPadding));
        const boundedY = Math.max(stationPadding, Math.min(newY, stationHeight - draggedElement.value.height - stationPadding));
        
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
