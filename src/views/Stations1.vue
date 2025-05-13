<template>
    <div class="px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">Stations Management</h1>
      
      <!-- Search Field -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search stations..."
          class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="filterStations"
        />
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{{ error }}</p>
      </div>
      
      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voltage Level</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Lines</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredStations.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                No stations found
              </td>
            </tr>
            <tr v-for="(station, index) in filteredStations" :key="station.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ station.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.voltageLevel }} kV</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.location }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.numberOfLines }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewStation(station.id)" class="text-blue-600 hover:text-blue-900">
                    View
                  </button>
                  <button @click="editStation(station.id)" class="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </button>
                  <button @click="deleteStation(station.id)" class="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { fetchAllStations } from '@/apiUtils';
  
  export default {
    name: 'StationsView',
    data() {
      return {
        stations: [],
        filteredStations: [],
        searchQuery: '',
        loading: true,
        error: null
      };
    },
    mounted() {
      this.fetchStations();
    },
    methods: {
      async fetchStations() {
        try {
          this.loading = true;
          // Replace with your actual API endpoint
          const response = await fetchAllStations();
          console.log("response", response);
          this.stations = response;
          this.filteredStations = [...this.stations];
          this.loading = false;
        } catch (err) {
          this.error = 'Failed to load stations. Please try again later.';
          this.loading = false;
          console.error('Error fetching stations:', err);
        }
      },
      filterStations() {
        if (!this.searchQuery) {
          this.filteredStations = [...this.stations];
          return;
        }
        
        const query = this.searchQuery.toLowerCase();
        this.filteredStations = this.stations.filter(station => 
          station.name.toLowerCase().includes(query) ||
          station.location.toLowerCase().includes(query) ||
          station.voltageLevel.toString().includes(query)
        );
      },
      viewStation(id) {
        this.$router.push(`/stations/${id}`);
      },
      editStation(id) {
        this.$router.push(`/stations/${id}/edit`);
      },
      deleteStation(id) {
        if (confirm('Are you sure you want to delete this station?')) {
          // Implement your delete logic here
          console.log(`Deleting station with ID: ${id}`);
          // After successful deletion, refresh the list
          // this.fetchStations();
        }
      }
    }
  };
  </script>