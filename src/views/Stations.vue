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

    <!-- Tabs Section -->
    <section class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
            <span
              :class="[
                'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-900'
              ]"
            >
              {{ getTabCount(tab.id) }}
            </span>
          </button>
        </nav>
      </div>
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
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.
              of {{ (activeTab == 'generation') ? 'Units' : 'Lines'}}</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="displayedStations.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">
              No stations found
            </td>
          </tr>
          <tr v-for="(station, index) in displayedStations" :key="station.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ station.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.voltageLevel }} kV</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.location }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                station.type === 'transmission' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              ]">
                {{ station.type }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ (activeTab == 'generation') ? station.units?.length : station.lines?.length || 0 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button @click="viewStation(station.id)" class="text-blue-600 hover:text-blue-900">
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

    <!-- Modal Section -->
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
            <input id="name" v-model="formData.name" type="text" class="border rounded-lg p-2 w-full" />
          </div>
          <div class="grid">
            <label for="identifier">Identifier:</label>
            <input id="identifier" v-model="formData.identifier" type="text" class="border rounded-lg p-2 w-full" />
          </div>
          <div class="grid">
            <label for="voltageLevel">Voltage Level:</label>
            <input id="voltageLevel" v-model.number="formData.voltageLevel" type="number" class="border rounded-lg p-2 w-full" />
          </div>
          <div class="grid">
            <label for="type">Type:</label>
            <select id="type" v-model="formData.type" class="border rounded-lg p-2 w-full">
              <option value="transmission">Transmission</option>
              <option value="generation">Generation</option>
            </select>
          </div>
          <div class="grid">
            <label for="display">Display:</label>
            <select id="display" v-model="formData.display" class="border rounded-lg p-2 w-full">
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

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from 'lucide-vue-next';
import { ElCard, ElButton } from 'element-plus';
import 'element-plus/dist/index.css';
import { createStation, getStations, updateStation, deleteStation } from '@/services/stationService';

// Router
const router = useRouter();

// Reactive data
const stations = ref([]);
const searchQuery = ref('');
const loading = ref(true);
const error = ref(null);
const modal = ref(false);
const isEditMode = ref(false);
const currentStationId = ref(null);
const message = ref('');
const activeTab = ref('all');

// Form data
const formData = ref({
  name: '',
  identifier: '',
  voltageLevel: null,
  display: true,
  type: 'transmission'
});

// Tab configuration
const tabs = ref([
  { id: 'all', name: 'All' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'generation', name: 'Generation' }
]);

// Computed properties
const filteredStations = computed(() => {
  if (!searchQuery.value) {
    return stations.value;
  }

  const query = searchQuery.value.toLowerCase();
  return stations.value.filter(station =>
    station.name.toLowerCase().includes(query) ||
    station.location?.toLowerCase().includes(query) ||
    station.voltageLevel.toString().includes(query)
  );
});

const displayedStations = computed(() => {
  const filtered = filteredStations.value;
  
  if (activeTab.value === 'all') {
    return filtered;
  }
  
  return filtered.filter(station => station.type === activeTab.value);
});

const selectedStation = computed(() => {
  return stations.value.find(station => station.id === currentStationId.value) || {
    lines: [],
    x: 0,
    y: 0,
    display: false,
    voltageLevel: 0,
    type: 'transmission'
  };
});

// Methods
const getTabCount = (tabId: string) => {
  if (tabId === 'all') {
    return filteredStations.value.length;
  }
  return filteredStations.value.filter(station => station.type === tabId).length;
};

const fetchStations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const stationsData = await getStations();
    stations.value = stationsData;
  } catch (err) {
    console.error(err);
    error.value = 'Unable to load stations.';
  } finally {
    loading.value = false;
  }
};

const filterStations = () => {
  // This function is called on input, but the actual filtering
  // is handled by the filteredStations computed property
};

const setModal = (station = null) => {
  if (station) {
    isEditMode.value = true;
    currentStationId.value = station.id;
    formData.value = {
      name: station.name,
      identifier: station.identifier,
      voltageLevel: station.voltageLevel,
      display: station.display,
      type: station.type
    };
  } else {
    isEditMode.value = false;
    currentStationId.value = null;
    formData.value = {
      name: '',
      identifier: '',
      voltageLevel: null,
      display: true,
      type: 'transmission'
    };
  }
  message.value = '';
  modal.value = true;
};

const submit = async () => {
  try {
    let response;
    if (isEditMode.value) {
      response = await updateStation(currentStationId.value, formData.value);
      message.value = `Station #${currentStationId.value} updated`;
    } else {
      console.log("type:", formData.value.type);
      response = await createStation(formData.value);
      message.value = `Station created`;
    }
    modal.value = false;
    await fetchStations();
  } catch (err) {
    console.error(err);
    message.value = isEditMode.value
      ? 'Failed to update station'
      : 'Failed to create station';
  }
};

const onAction = () => {
  modal.value = false;
};

const viewStation = (id: number | string) => {
  router.push(`/station/${id}`);
};

const editStation = (id: number | string) => {
  router.push(`/stations/${id}/edit`);
};

const deleteStationHandler = (id: number | string) => {
  if (confirm('Are you sure you want to delete this station?')) {
    console.log(`Deleting station with ID: ${id}`);
    // Implement your delete logic here
    // After successful deletion, refresh the list
    // fetchStations();
  }
};

// Lifecycle
onMounted(() => {
  fetchStations();
});

// Watch for search query changes to reset to 'All' tab when searching
watch(searchQuery, (newQuery) => {
  if (newQuery && activeTab.value !== 'all') {
    activeTab.value = 'all';
  }
});
</script>

<style scoped>
/* Add any additional custom styles here if needed */
</style>