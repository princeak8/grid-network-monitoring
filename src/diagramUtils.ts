import type { Station } from "./types";

// Start dragging a station
export const startStationDrag = (event: MouseEvent, station: Station, connectionMode:boolean) => {
  // Only proceed if we're not in connection mode
  if (connectionMode) return;
  
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