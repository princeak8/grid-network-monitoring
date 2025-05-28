import api from './api';

export function createStation({ name, identifier, voltageLevel, display, type }:{ name: any, identifier: any, voltageLevel: any, display: any, type: string }) {
  return api.post('/stations', {
    name,
    identifier,
    voltageLevel,
    display,
    type
  });
}


export function getStations() {
    return api.get('/stations').then(res => res.data);
  }

  export function getStation(id: any) {
    return api.get(`/stations/${id}`).then(res => res.data);
  }

  export function updateStation(id: number, { name, identifier, voltageLevel, display }: { name: any, identifier: any, voltageLevel: any, display: any }) {
  return api.put(`/stations/${id}`, { name, identifier, voltageLevel, display });
}

export function deleteStation(id: number) {
  return api.delete(`/stations/${id}`);
}

export function addLine({stationId, name, identifier, voltageLevel }: {stationId: number, name: string, identifier: string, voltageLevel: number }){
  return api.post(`/lines`, {stationId, name, identifier, voltageLevel });
}

export function addConnection({identifier , fromStationId , fromLineId , toStationId ,toLineId}: {identifier: number, fromStationId: number, fromLineId: number , toStationId: number ,toLineId: number}){
  return api.post(`/connections`, {identifier , fromStationId , fromLineId , toStationId ,toLineId});
}