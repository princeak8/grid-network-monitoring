<template>
  <div id="chart-container">
    <h3>RoCoF (Rate of Change of Frequency) – 24h View</h3>

    <div class="slider-container">
      <label>View starting from: <span>{{ formattedStartDate }}</span></label>
      <input 
        type="range" 
        v-model.number="sliderValue" 
        :min="sliderMin" 
        :max="sliderMax" 
        :step="sliderStep"
        @input="updateChart"
        class="time-slider"
      />
    </div>

    <div ref="chartArea" class="chart-area"></div>
    <div v-if="loading" class="loading">Loading data...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as d3 from 'd3';

export default {
  name: 'RocofVisualizer',
  setup() {
    const chartArea = ref(null);
    const formattedStartDate = ref('Loading...');
    const loading = ref(true);
    const error = ref(null);
    
    // Slider controls
    const sliderValue = ref(0);
    const sliderMin = ref(0);
    const sliderMax = ref(0);
    const sliderStep = ref(60000); // 1 minute in milliseconds
    
    // Core variables
    let svg, g, x, y, xAxis, yAxis;
    let fullData = [];
    let minDate, maxDate;
    const viewWindow = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
    
    // Constants
    const MARGIN = { LEFT: 50, RIGHT: 30, TOP: 40, BOTTOM: 80 };
    let WIDTH = 0;
    let HEIGHT = 0;
    
    // Time formatting
    const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%SZ");
    const formatTime = d3.timeFormat("%d/%m/%Y %H:%M");
    const bisectDate = d3.bisector(d => d.datetime).left;

    // Initialize the chart
    const initChart = () => {
      // Clear any existing SVG
      if (chartArea.value) {
        d3.select(chartArea.value).selectAll("svg").remove();
      }

      WIDTH = chartArea.value.clientWidth - MARGIN.LEFT - MARGIN.RIGHT - 20;
      HEIGHT = 400; // Fixed height for better control

      svg = d3.select(chartArea.value).append("svg")
        .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
        .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

      g = svg.append("g")
        .attr("transform", `translate(${MARGIN.LEFT},${MARGIN.TOP})`);

      x = d3.scaleTime().range([0, WIDTH]);
      y = d3.scaleLinear().range([HEIGHT, 0]);

      xAxis = g.append("g")
        .attr("transform", `translate(0,${HEIGHT})`)
        .attr("class", "x axis");

      yAxis = g.append("g").attr("class", "y axis");

      // Add axis labels
      g.append("text")
        .attr("y", HEIGHT + 50)
        .attr("x", WIDTH / 2)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Time");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -HEIGHT / 2)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("RoCoF Value");

      // Add line path
      g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", "2.5px");
    };

    // Update chart based on slider value
    const updateChart = () => {
      if (fullData.length === 0) return;
      
      // Make sure the slider value is treated as a number
      const currentValue = parseInt(sliderValue.value);
      formattedStartDate.value = formatTime(new Date(currentValue));
      update(fullData, currentValue);
    };

    // Generate mock data if needed
    const generateMockData = () => {
      const now = new Date();
      const data = [];
      // Generate 24 hours of data at 1 minute intervals
      for (let i = 0; i < 24 * 60; i++) {
        const time = new Date(now.getTime() - (24 * 60 * 60 * 1000) + (i * 60 * 1000));
        // Create a realistic RoCoF value with some randomness
        // RoCoF typically ranges from -0.3 to 0.3 Hz/s
        const baseValue = Math.sin(i/60 * Math.PI) * 0.15; // Oscillating base
        const randomness = (Math.random() - 0.5) * 0.1; // Random element
        const value = baseValue + randomness;
        
        data.push({
          datetime: time,
          value: value
        });
      }
      return data;
    };

    // Load data and update
    const loadData = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // In a real application, use the following:
        // const response = await fetch('/data/rocof.json');
        // const data = await response.json();
        
        // For this example, we'll use generated data
        const data = generateMockData();
        
        fullData = data.map(d => ({
          datetime: d.datetime instanceof Date ? d.datetime : parseTime(d.datetime),
          value: typeof d.value === 'number' ? d.value : +d.value
        })).filter(d => d.datetime && !isNaN(d.value));

        // Sort data by time
        fullData.sort((a, b) => a.datetime - b.datetime);

        minDate = d3.min(fullData, d => d.datetime).getTime();
        maxDate = d3.max(fullData, d => d.datetime).getTime();
        
        // Update slider values
        sliderMin.value = minDate;
        sliderMax.value = maxDate - viewWindow;
        sliderValue.value = minDate;
        
        formattedStartDate.value = formatTime(new Date(minDate));

        // Initial update
        update(fullData, minDate);
        loading.value = false;
      } catch (err) {
        console.error('Error loading data:', err);
        error.value = 'Failed to load data. Please try again.';
        loading.value = false;
      }
    };

    // Update chart with selected time window
    const update = (data, windowStart) => {
      if (!g || !data || data.length === 0) return;
      
      const t = d3.transition().duration(750);
      const windowEnd = windowStart + viewWindow;

      const filtered = data.filter(d => 
        d.datetime.getTime() >= windowStart &&
        d.datetime.getTime() <= windowEnd
      );

      if (filtered.length === 0) {
        console.warn('No data in selected time window');
        return;
      }

      // Set domains based on filtered data
      x.domain(d3.extent(filtered, d => d.datetime));
      
      const yMin = d3.min(filtered, d => d.value);
      const yMax = d3.max(filtered, d => d.value);
      // Add padding to y domain
      const yPadding = (yMax - yMin) * 0.1;
      y.domain([yMin - yPadding, yMax + yPadding]);

      // Update axes
      xAxis.transition(t).call(
        d3.axisBottom(x)
          .ticks(6)
          .tickFormat(d3.timeFormat("%H:%M"))
      );
      
      yAxis.transition(t).call(
        d3.axisLeft(y)
          .ticks(5)
          .tickFormat(d => d.toFixed(3))
      );

      // Create a line generator
      const line = d3.line()
        .x(d => x(d.datetime))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX); // Smoother curve

      // Update the line path
      g.select(".line")
        .datum(filtered)
        .transition(t)
        .attr("d", line);

      // Remove any existing focus elements
      d3.select(".focus").remove();
      d3.select(".overlay").remove();

      // Add interactive hover elements
      const focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

      focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", HEIGHT);
        
      focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", WIDTH);
        
      focus.append("circle")
        .attr("r", 5);
        
      focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

      g.append("rect")
        .attr("class", "overlay")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => focus.style("display", "none"))
        .on("mousemove", function() {
          const mouse = d3.pointer ? d3.pointer(event, this) : d3.mouse(this);
          const x0 = x.invert(mouse[0]);
          const i = bisectDate(filtered, x0, 1);
          
          if (i >= filtered.length || i <= 0) return;
          
          const d0 = filtered[i - 1];
          const d1 = filtered[i];
          
          if (!d0 || !d1) return;
          
          const d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;
          
          focus.attr("transform", `translate(${x(d.datetime)},${y(d.value)})`);
          focus.select("text").text(`${formatTime(d.datetime)}: ${d.value.toFixed(3)}`);
          focus.select(".x-hover-line").attr("y2", HEIGHT - y(d.value));
          focus.select(".y-hover-line").attr("x2", -x(d.datetime));
        });
    };

    // Watch for slider value changes
    watch(sliderValue, (newValue) => {
      if (fullData.length > 0) {
        formattedStartDate.value = formatTime(new Date(parseInt(newValue)));
        update(fullData, parseInt(newValue));
      }
    });

    // Resize handler for responsiveness
    const handleResize = () => {
      if (chartArea.value) {
        initChart();
        if (fullData.length > 0 && sliderValue.value) {
          update(fullData, parseInt(sliderValue.value));
        }
      }
    };

    onMounted(() => {
      // Wait for DOM to be ready
      setTimeout(() => {
        initChart();
        loadData();
      }, 200);
      
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    return {
      chartArea,
      formattedStartDate,
      sliderValue,
      sliderMin,
      sliderMax,
      sliderStep,
      updateChart,
      loading,
      error
    };
  }
}
</script>

<style scoped>
#chart-container {
  padding: 20px;
  width: 100%;
  height: 100%;
}

.chart-area {
  width: 100%;
  margin-top: 20px;
  min-height: 500px;
}

.slider-container {
  margin-bottom: 20px;
}

.time-slider {
  width: calc(100% - 20px);
  margin-top: 10px;
  -webkit-appearance: none;
  height: 10px;
  border-radius: 5px;
  background: #d3d3d3;
  outline: none;
}

.time-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: steelblue;
  cursor: pointer;
}

.time-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: steelblue;
  cursor: pointer;
}

:deep(.overlay) {
  fill: none;
  pointer-events: all;
}

:deep(.focus circle) {
  fill: none;
  stroke: steelblue;
}

:deep(.hover-line) {
  stroke: #aaa;
  stroke-width: 1px;
  stroke-dasharray: 3,3;
}

:deep(.line) {
  fill: none;
  stroke: steelblue;
  stroke-width: 2.5px;
}

.loading, .error {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
}

.error {
  color: red;
}
</style>