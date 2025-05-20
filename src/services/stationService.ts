import api from './api';

export function createStation({ name, identifier, voltageLevel, display }:{ name: any, identifier: any, voltageLevel: any, display: any }) {
  return api.post('/stations', {
    name,
    identifier,
    voltageLevel,
    display,
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