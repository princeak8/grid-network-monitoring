<template>
    <div class="visualizations">
      <h1>Data Visualizations</h1>
      <div class="visualization-container">
        <Rocof />
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import Rocof from '@/components/visualizations/Rocof.vue';
  
  export default defineComponent({
    name: 'VisualizationsView',
    components: {
      Rocof
    }
  });
  </script>
  
  <style scoped>
  .visualizations {
    width: 100%;
    height: 100vh;
    overflow-x: hidden;
  }
  
  .visualization-container {
    width: 100%;
    height: calc(100vh - 100px);
  }
  
  h1 {
    padding: 20px;
    margin: 0;
  }
  </style>