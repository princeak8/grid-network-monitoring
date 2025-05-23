import { defineStore } from 'pinia';

export const useLiveDataStore = defineStore('liveData', {
  state: () => ({
    data: {} as Record<string, Record<string, { mw: number, a: number, v: number, mvar: number, pf?: number }>>
    // Structure: { [stationName]: { [lineId]: { mw, v } } }
  }),
  actions: {
    updateLineData(stationId: string, lineId: string, mw: number, a: number, v: number, mvar: number, pf?: number ) {
      if (!this.data[stationId]) this.data[stationId] = {};
      this.data[stationId][lineId] = { mw, v, a, mvar };
    }
  }
});
