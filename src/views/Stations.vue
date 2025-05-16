<template>
  <div class="px-6 py-8">
    <h1 class="text-2xl font-bold mb-6">Stations Management</h1>

    <!-- Search Field -->
    <section class="mb-6 w-full flex items-center justify-between">
      <div class="w-full md:w-6/12">
        <input v-model="searchQuery" type="text" placeholder="Search stations..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="filterStations" />
      </div>
      <button @click="setModal()" class="bg-[#1e293b] hover:bg-[#00293b] text-white p-2 rounded-md flex gap-2">
        <Plus class="w-6 h-6" /> Add Station
      </button>
    </section>

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
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Voltage Level</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.
              of Lines</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action</th>
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.lines.length }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button @click="setView(station)" class="text-blue-600 hover:text-blue-900">
                  View
                </button>
                <button @click="setModal(station)" class="text-indigo-600 hover:text-indigo-900">
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

    <section v-if="view"
      class="fixed inset-0 flex items-center justify-center w-full h-screen bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <el-card class="w-full max-w-4xl mx-4">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">
              {{ selectedStation.name }}
            </h2>
          </div>
        </template>

        <form class="space-y-4">
          <div class="grid gap-3">
            <label class="text-sm font-medium text-gray-600">Connected Lines</label>
            <div class="grid grid-cols-4 flex-wrap gap-3">
              <div v-for="(line, index) in dummyStations[0].lines" :key="index"
                class="flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 shadow-sm w-[150px] hover:shadow-md"
                :class="{
                  'border-blue-500': line.voltageLevel < 100,
                  'border-green-500': line.voltageLevel >= 100 && line.voltageLevel < 200,
                  'border-orange-500': line.voltageLevel >= 200
                }">
                <div class="space-y-1">
                  <span class="block text-sm font-medium text-gray-800">{{ line.name }}</span>
                  <div class="flex items-center gap-1">
                    <span class="text-xs font-medium text-gray-500">Voltage:</span>
                    <span class="px-2 py-1 text-xs font-bold rounded-full" :class="{
                      'bg-blue-100 text-blue-800': line.voltageLevel < 100,
                      'bg-green-100 text-green-800': line.voltageLevel >= 100 && line.voltageLevel < 200,
                      'bg-orange-100 text-orange-800': line.voltageLevel >= 200
                    }">
                      {{ line.voltageLevel }}kV
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <template #footer>
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">{{ message }}</p>
            <el-button type="primary" @click="onAction" class="px-6 py-2 font-medium">
              Close Panel
            </el-button>
          </div>
        </template>
      </el-card>
    </section>

    <section v-if="modal"
      class="fixed w-full h-screen bg-gray-200 bg-opacity-20 inset-0 flex items-center justify-center ">
      <el-card class="max-w-sm mx-auto w-[30rem]">
        <template #header>
          <h2 class="text-lg font-semibold">
            {{ isEditMode ? 'Edit Station' : 'Add Station' }}
          </h2>
        </template>

        <form class="space-y-2">
          <div class="grid">
            <label for="name">Name:</label>
            <input id="name" v-model="name" type="text" class="border rounded-lg p-2 w-full" />
          </div>
          <div class="grid">
            <label for="identifier">Identifier:</label>
            <input id="identifier" v-model="identifier" type="text" class="border rounded-lg p-2 w-full" />
          </div>
          <div class="grid">
            <label for="voltageLevel">Voltage Level:</label>
            <input id="voltageLevel" v-model.number="voltageLevel" type="number" class="border rounded-lg p-2 w-full" />
          </div>
          <div class="grid">
            <label for="display">Display:</label>
            <select id="display" v-model="display" class="border rounded-lg p-2 w-full">
              <option :value="true">True</option>
              <option :value="false">False</option>
            </select>
          </div>
        </form>

        <template #footer>
          <el-button type="danger" @click="onAction">Cancel</el-button>
          <el-button type="primary" @click="submit">
            {{ isEditMode ? 'Save' : 'Add' }}
          </el-button>
          <p>{{ message }}</p>
        </template>
      </el-card>
    </section>

  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import { fetchAllStations } from '@/apiUtils';
import { Plus } from 'lucide-vue-next';
import { ElCard, ElButton } from 'element-plus';
import 'element-plus/dist/index.css';
import { createStation, getStations, updateStation, deleteStation } from '@/services/stationService';

const name = ref('');
const identifier = ref('');
const voltageLevel = ref('');
const display = ref(true);
const message = ref('');

const handleSubmit = async () => {
  try {
    const { data } = await createStation({
      name: name.value,
      identifier: identifier.value,
      voltageLevel: voltageLevel.value,
      display: display.value,
    });
    message.value = `Station created with ID ${data.id}`;
  } catch (err) {
    console.error(err);
    message.value = 'Failed to create station';
  }
};


export default {
  name: 'StationsView',
  components: { Plus, ElCard, ElButton },
  computed: {
    selectedStation() {
      return this.stations.find(station => station.id === this.currentStationId) || {
        lines: [],
        x: 0,
        y: 0,
        display: false,
        voltageLevel: 0
      };
    }
  },
  data() {
    return {
      name: '',
      identifier: '',
      voltageLevel: null,
      display: true,
      message: '',
      stations: [],
      filteredStations: [],
      searchQuery: '',
      loading: true,
      error: null,
      modal: false,
      isEditMode: false,
      currentStationId: null,
      view: false,

      dummyStations: [
        {
          tableId: 1,
          id: "main-sub",
          name: "Main Substation",
          voltageLevel: 330,
          display: true,
          x: 100,
          y: 150,
          width: 300,
          height: 200,
          lines: [
            {
              id: "line-001",
              name: "Primary Feed",
              voltageLevel: 330,
              length: "15km",
              status: "active"
            },
            {
              id: "line-001",
              name: "Primary Feed",
              voltageLevel: 330,
              length: "15km",
              status: "active"
            },
            {
              id: "line-001",
              name: "Primary Feed",
              voltageLevel: 330,
              length: "15km",
              status: "active"
            },
            {
              id: "line-001",
              name: "Primary Feed",
              voltageLevel: 330,
              length: "15km",
              status: "active"
            },
            {
              id: "line-002",
              name: "Secondary Feed",
              voltageLevel: 132,
              length: "8km",
              status: "active"
            }
          ]
        },
        {
          tableId: 2,
          id: "west-plant",
          name: "West Plant",
          voltageLevel: 132,
          display: false,
          x: 400,
          y: 250,
          width: 250,
          height: 180,
          lines: [
            {
              id: "line-003",
              name: "Western Circuit",
              voltageLevel: 33,
              length: "5km",
              status: "maintenance"
            }
          ]
        },
        {
          tableId: 3,
          id: "north-node",
          name: "North Node",
          voltageLevel: 33,
          display: true,
          x: 200,
          y: 400,
          width: 280,
          height: 220,
          lines: []
        }
      ]

    }
  },
  mounted() {
    this.fetchStations();
  },

  methods: {
    async submit() {
      try {
        let response;
        if (this.isEditMode) {
          response = await updateStation(this.currentStationId, {
            name: this.name,
            identifier: this.identifier,
            voltageLevel: this.voltageLevel,
            display: this.display,
          });
          this.message = `Station #${this.currentStationId} updated`;
        } else {
          response = await createStation({
            name: this.name,
            identifier: this.identifier,
            voltageLevel: this.voltageLevel,
            display: this.display,
          });
          this.message = `Station created with ID ${response.data.id}`;
        }
        this.modal = false;
        this.fetchStations();
      } catch (err) {
        console.error(err);
        this.message = this.isEditMode
          ? 'Failed to update station'
          : 'Failed to create station';
      }
    },

    setModal(station = null) {
      if (station) {
        this.isEditMode = true;
        this.currentStationId = station.id;
        this.name = station.name;
        this.identifier = station.identifier;
        this.voltageLevel = station.voltageLevel;
        this.display = station.display;
      } else {
        this.isEditMode = false;
        this.currentStationId = null;
        this.name = '';
        this.identifier = '';
        this.voltageLevel = null;
        this.display = true;
      }
      this.message = '';
      this.modal = true;
    },

    setView(station) {
      this.currentStationId = station.id;
      this.view = true;
    },

    onAction() {
      this.modal = false;
      this.view = false;
    },

    async fetchStations() {
      this.loading = true;
      this.error = null;
      try {
        const stations = await getStations();
        this.stations = stations;
        this.filteredStations = [...stations];
      } catch (err) {
        console.error(err);
        this.error = 'Unable to load stations.';
      } finally {
        this.loading = false;
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