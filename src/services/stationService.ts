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