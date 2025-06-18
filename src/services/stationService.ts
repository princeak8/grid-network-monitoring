import api from './api';
// import { Unit } from '@/types';

export function createStation({ name, identifier, voltageLevel, display, type }:{ name: any, identifier: any, voltageLevel: any, display: any, type: string }) {
  return api.post('/stations', {
    name,
    identifier,
    voltageLevel,
    display,
    type
  });
}

export function authLogin({username, password}: {username: string, password: string}){
  return api.post(`/auth/login`, {username, password});
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

export function addUnit({stationId, name, identifier, inertia, active, voltageLevel }: {stationId: number, name: string, identifier: string, voltageLevel: number, inertia: number, active: boolean }){
  return api.post(`/units`, {stationId, name, identifier, inertia, active, voltageLevel });
}

export function updateUnit(stationId:number, data:{name?: string, identifier?: string, voltageLevel?: number, inertia?: number, active?: boolean}){
  return api.put(`/units/${stationId}`, data);
}

export function addConnection({identifier , fromStationId , fromLineId , toStationId ,toLineId, fromSide, toSide}: {identifier: number, fromStationId: number, fromLineId: number , toStationId: number ,toLineId: number, fromSide: string, toSide: string}){
  return api.post(`/connections`, {identifier , fromStationId , fromLineId , toStationId ,toLineId, fromSide, toSide});
}

export function addTransformer({stationId, name, manufacturerId,  serialNo, powerRating, powerRatingUnit, typeOfCooling , voltageRating, manufactureYear, installationYear,  }: {stationId: number, name: string, manufacturerId: number,  serialNo: number, powerRating: string, powerRatingUnit: number, typeOfCooling: string , voltageRating: string, manufactureYear: string, installationYear: number }){
  return api.post(`/transformers`, {stationId, name, manufacturerId,  serialNo, powerRating, powerRatingUnit, typeOfCooling , voltageRating, manufactureYear, installationYear });
}
