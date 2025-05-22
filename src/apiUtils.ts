import type { Station, ApiStation, Line, Connection } from "./types"
import axios from 'axios'
import apiService from "./ApiService";
import api from "./services/api";

export async function fetchStations(): Promise<Station[] | null> {
    console.log('fetch stations');
    try {
        const res = await api.get('/stations/displayed');
        // console.log("res:", res);
        return res.data;
    } catch (e) {
        console.log("error: ", e);
        return null; // Return null on error instead of undefined
    }
}

export async function fetchAllStations(): Promise<Station[] | null> {
  try {
      const res = await apiService.get('/stations');
      // console.log("res:", res);
      return res.data;
  } catch (e) {
      console.log("error: ", e);
      return null; // Return null on error instead of undefined
  }
}

export async function fetchConnections(): Promise<Connection[] | null> {
    console.log('fetch connections');
    try {
        const res = await apiService.get('/connections/displayed');
        console.log("connections res:", res);
        return res.data;
    } catch (e) {
        console.log("error: ", e);
        return null; // Return null on error instead of undefined
    }
}

export async function updateStation(id:string, stationData:ApiStation)
{
    stationData.display = true;
    apiService.put('/stations/'+id, stationData)
    .then((res) => {
        console.log('Successful');
    })
    .catch((e) => console.log("error: ",e));
}

export async function fetchFromApi(): Promise<Station[] | null> {
    try {
      const res = await fetch('https://your-api-url.com/stations');
      const data: Station[] = await res.json();
      return data.length ? data : null;
    } catch (error) {
      console.error('API fetch failed:', error);
      return null;
    }
}

// Fetch connections from API
export async function fetchConnectionsFromApi(): Promise<any[] | null> {
  try {
    const res = await fetch('https://your-api-url.com/connections');
    const data = await res.json();
    return data.length ? data : null;
  } catch (error) {
    console.error('API fetch failed:', error);
    return null;
  }
}


  
  