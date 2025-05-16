<template>
    <div id="chart-container">
      <h3>RoCoF (Rate of Change of Frequency) – 24h View</h3>
  
      <label>View starting from: <span id="startDateLabel">{{ formattedStartDate }}</span></label>
      <div ref="timeSlider" class="time-slider"></div>
  
      <div ref="chartArea" class="chart-area"></div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as d3 from 'd3';
  import $ from 'jquery';
  import 'jquery-ui/ui/widgets/slider';
  import 'jquery-ui/themes/base/all.css';
  
  export default {
    name: 'Rocof',
    setup() {
      const chartArea = ref(null);
      const timeSlider = ref(null);
      const startDate = ref(null);
      const formattedStartDate = ref('');
      
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
        WIDTH = window.innerWidth - MARGIN.LEFT - MARGIN.RIGHT - 60;
        HEIGHT = window.innerHeight - MARGIN.TOP - MARGIN.BOTTOM - 150;
  
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
  
      // Load data and update
      const loadData = () => {
        // In a real application, you'd likely use axios or fetch here
        // For demonstration, we'll simulate loading JSON data
        // Replace this with your actual data loading logic
        fetch('/data/rocof.json')
          .then(response => response.json())
          .then(data => {
            fullData = data.map(d => ({
              datetime: parseTime(d.datetime),
              value: +d.value
            })).filter(d => d.datetime && !isNaN(d.value));
  
            minDate = d3.min(fullData, d => d.datetime).getTime();
            maxDate = d3.max(fullData, d => d.datetime).getTime();
            const sliderMax = maxDate - viewWindow;
  
            startDate.value = minDate;
            formattedStartDate.value = formatTime(new Date(minDate));
  
            // Initialize slider
            $(timeSlider.value).slider({
              range: "min",
              min: minDate,
              max: sliderMax,
              step: 60000, // 1 minute
              value: minDate,
              slide: function(event, ui) {
                startDate.value = ui.value;
                formattedStartDate.value = formatTime(new Date(ui.value));
                update(fullData, ui.value);
              }
            });
  
            // Initial update
            update(fullData, minDate);
          })
          .catch(error => console.error('Error loading data:', error));
      };
  
      // Update chart with selected time window
      const update = (data, windowStart) => {
        const t = d3.transition().duration(750);
        const windowEnd = windowStart + viewWindow;
  
        const filtered = data.filter(d => 
          d.datetime.getTime() >= windowStart &&
          d.datetime.getTime() <= windowEnd
        );
  
        x.domain(d3.extent(filtered, d => d.datetime));
        y.domain([
          d3.min(filtered, d => d.value) * 1.05,
          d3.max(filtered, d => d.value) * 1.05
        ]);
  
        xAxis.transition(t).call(d3.axisBottom(x));
        yAxis.transition(t).call(d3.axisLeft(y));
  
        const line = d3.line()
          .x(d => x(d.datetime))
          .y(d => y(d.value));
  
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
  
        focus.append("line").attr("class", "x-hover-line hover-line").attr("y1", 0).attr("y2", HEIGHT);
        focus.append("line").attr("class", "y-hover-line hover-line").attr("x1", 0).attr("x2", WIDTH);
        focus.append("circle").attr("r", 5);
        focus.append("text").attr("x", 15).attr("dy", ".31em");
  
        g.append("rect")
          .attr("class", "overlay")
          .attr("width", WIDTH)
          .attr("height", HEIGHT)
          .on("mouseover", () => focus.style("display", null))
          .on("mouseout", () => focus.style("display", "none"))
          .on("mousemove", function() {
            const x0 = x.invert(d3.mouse(this)[0]);
            const i = bisectDate(filtered, x0, 1);
            if (i >= filtered.length) return;
            
            const d0 = filtered[i - 1];
            const d1 = filtered[i];
            
            if (!d0 || !d1) return;
            
            const d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;
            focus.attr("transform", `translate(${x(d.datetime)},${y(d.value)})`);
            focus.select("text").text(d.value.toFixed(3));
            focus.select(".x-hover-line").attr("y2", HEIGHT - y(d.value));
            focus.select(".y-hover-line").attr("x2", -x(d.datetime));
          });
      };
  
      // Resize handler for responsiveness
      const handleResize = () => {
        if (svg) {
          svg.remove();
          initChart();
          if (fullData.length > 0 && startDate.value) {
            update(fullData, startDate.value);
          }
        }
      };
  
      onMounted(() => {
        initChart();
        loadData();
        window.addEventListener('resize', handleResize);
      });
  
      onBeforeUnmount(() => {
        window.removeEventListener('resize', handleResize);
      });
  
      return {
        chartArea,
        timeSlider,
        formattedStartDate
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
  }
  
  .time-slider {
    margin-right: 50px;
    margin-bottom: 20px;
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
  </style>