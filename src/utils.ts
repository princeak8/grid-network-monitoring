import type { Station, Line, Connection } from "./types"
import stationsData from "./data/stations"
import connectionsData from "./data/connections";
import axios from 'axios'
import apiService from "./ApiService";

import { fetchStations, fetchFromApi, fetchConnections, updateStation } from "./apiUtils";

export function getFromLocalStorage(): Station[] | null {
    const raw = localStorage.getItem('stations')
    return raw ? JSON.parse(raw) : null
}

export function saveToLocalStorage(stations: Station[]) {
    localStorage.setItem('stations', JSON.stringify(stations))
}

function mergeStations(base: Station[], updates: Station[]): Station[] {
  const baseMap = new Map(base.map(s => [s.id, s]))

  updates.forEach(station => {
    const existing = baseMap.get(station.id)
    if (existing) {
      // Preserve user-modified x/y but update other details
      baseMap.set(station.id, {
        ...station,
        x: existing.x,
        y: existing.y,
        width: existing.width,
        height: existing.height,
        lines: station.lines.map((line) => {
          const oldLine = existing.lines?.find((l) => l.id === line.id)
          return oldLine ? { ...line, x: oldLine.x, y: oldLine.y } : line
        }),
      })
    } else {
      // New station, add it in
      baseMap.set(station.id, station)
    }
  })

  return Array.from(baseMap.values())
}

function getSource(local: Station[] | null, api: Station[] | null) {
    if(local && api) return mergeStations(local, api);
    return local || api || [];
}

export async function loadStations(): Promise<Station[]> {
    // return (getFromLocalStorage() || (await fetchFromApi()) || stationsData
    // )
    const local = getFromLocalStorage()
    const api = await fetchStations();

    // const source = local || api || []
    const source = getSource(local, api);

    // Merge new stations into source
    const merged = mergeStations(source, stationsData)

    // Save merged result for future loads
    saveToLocalStorage(merged)
    console.log("merged", merged);

    return merged
}

export function getConnectionsFromLocalStorage(): any[] | null {
  const raw = localStorage.getItem('connections')
  return raw ? JSON.parse(raw) : null
}

// Save serialized connections to localStorage
export function saveConnectionsToLocalStorage(connections: Connection[]) {
  // We need to stringify connections but remove circular references
  const serializableConnections = connections.map(conn => ({
    id: conn.id,
    fromStationId: conn.fromStation?.id,
    fromLineId: conn.fromLine?.id,
    fromSide: conn.fromSide,
    toStationId: conn.toStation?.id,
    toLineId: conn.toLine?.id,
    toSide: conn.toSide,
    color: conn.color,
    strokeWidth: conn.strokeWidth
  }));
  
  localStorage.setItem('connections', JSON.stringify(serializableConnections));
}

// Helper function to restore full Connection objects from serialized format
function deserializeConnections(serializedConnections: any[], stations: Station[]): Connection[] {
  // console.log('deserialize connections', serializedConnections);
  // console.log('deserialize stations', stations);
  return serializedConnections.map(conn => {
    // Find referenced stations and lines
    const fromStation = stations.find(s => s.id === conn.fromStation?.id) || null;
    const fromLine = fromStation?.lines.find(l => l.id === conn.fromLine?.id) || null;
    const toStation = stations.find(s => s.id === conn.toStation?.id) || null;
    const toLine = toStation?.lines.find(l => l.id === conn.toLine?.id) || null;
    
    return {
      id: conn.id,
      fromStation,
      fromLine,
      fromSide: conn.fromSide,
      toStation,
      toLine,
      toSide: conn.toSide,
      color: conn.color || '#2ecc71', // Use default if missing
      strokeWidth: conn.strokeWidth || 3 // Use default if missing
    };
  }).filter(conn => 
    // Filter out invalid connections where references couldn't be resolved
    conn.fromStation && conn.fromLine && conn.toStation && conn.toLine
  );
}

// Main function to merge connections, preserving layout data
function mergeConnections(base: Connection[], updates: Connection[]): Connection[] {
  // Create map of existing connections by a unique compound key
  const baseMap = new Map();
  
  base.forEach(conn => {
    // Create a unique key based on connection endpoints
    const key = `${conn.fromStation?.id}-${conn.fromLine?.id}-${conn.toStation?.id}-${conn.toLine?.id}`;
    baseMap.set(key, conn);
  });
  
  // Process updates, preserving existing connection properties when possible
  updates.forEach(conn => {
    const key = `${conn.fromStation?.id}-${conn.fromLine?.id}-${conn.toStation?.id}-${conn.toLine?.id}`;
    const existing = baseMap.get(key);
    
    if (existing) {
      // Preserve ID and visual properties from existing connection
      baseMap.set(key, {
        ...conn,
        id: existing.id, // Keep existing ID
        color: existing.color, // Keep existing color
        strokeWidth: existing.strokeWidth // Keep existing stroke width
      });
    } else {
      // New connection, add it
      baseMap.set(key, conn);
    }
  });
  
  return Array.from(baseMap.values());
}

function getConnectionSource(localData: Connection[] | null, apiData: Connection[] | null) {
  // console.log('localConnections', localData);
  if(localData && apiData) return mergeConnections(localData, apiData);
  return localData || apiData || [];
}

// Main function to load connections
export async function loadConnections(stations: Station[]): Promise<Connection[]> {
  // console.log('connection stations', stations);
  // Try API first
  const apiData = await fetchConnections();
  
  // Try localStorage next
  const localData = getConnectionsFromLocalStorage();
  
  // Use the first available source, or empty array if both fail
  // const serializedSource = apiData || localData || [];
  const serializedSource = getConnectionSource(apiData, localData);
  
  // Convert serialized data to Connection objects
  const source = deserializeConnections(serializedSource, stations);
  
  // Create Connection objects from default data
  const defaultConnections = deserializeConnections(connectionsData, stations);
  // console.log('default COnnections', defaultConnections);
  
  // Merge sources
  const merged = mergeConnections(source, defaultConnections);
  
  // Save merged result for future loads
  saveConnectionsToLocalStorage(merged);
  // console.log("merged connections:", merged);
  
  return merged;
}

export function updateStationPosition(stations:Station[], id: string, x: number, y: number) {
    const station = stations.find(s => s.id === id)
    if (station) {
        station.x = x
        station.y = y
        saveToLocalStorage(stations)

        console.log('update station:', {...station, identifier: station.id});

        updateStation(station.id, {...station, identifier: station.id});
    }
}

export function updateStationSize(
    stations: Station[],
    id: string,
    width: number,
    height: number
  ) {
    console.log("update size", width, height);
    const station = stations.find((s) => s.id === id)
    if (station) {
      station.width = width
      station.height = height
      saveToLocalStorage(stations)
    }
}

  export function updateLinePosition(
    stations: Station[],
    stationId: string,
    lineId: string,
    x: number,
    y: number
  ) {
    const station = stations.find((s) => s.id === stationId)
    const line = station?.lines.find((l) => l.id === lineId)
    if (line) {
      line.x = x
      line.y = y
      saveToLocalStorage(stations)
    }
  }

  
  