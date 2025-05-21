<template>
  <div class="px-6 py-8">
    <h1 v-if="station" class="text-2xl font-bold mb-6">{{ selectedStation.name }}</h1>
    <!-- <h1 v-else class="text-2xl font-bold mb-6"> Loading… </h1> -->

    <div v-if="selectedStation?.lines.length">

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


      <section v-if="station" class="space-y-4">
        <div class="grid gap-3">
          <label class="text-sm font-medium text-gray-600 border-b">Connected Lines</label>
          <div class="grid grid-cols-4 flex-wrap gap-3">
            <div v-for="(line, index) in selectedStation?.lines" :key="index"
              class="flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md"
              :class="{
                'border-l-blue-500': line.voltageLevel < 100,
                'border-l-green-500': line.voltageLevel >= 100 && line.voltageLevel < 200,
                'border-l-orange-500': line.voltageLevel >= 200
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

        <div class="grid gap-3">
          <label class="text-sm font-medium text-gray-600 border-b">Connected Transformers</label>
          <div class="grid grid-cols-4 flex-wrap gap-3">
            <div v-for="(line, index) in selectedStation?.lines" :key="index"
              class="flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md"
              :class="{
                'border-l-blue-500': line.voltageLevel < 100,
                'border-l-green-500': line.voltageLevel >= 100 && line.voltageLevel < 200,
                'border-l-orange-500': line.voltageLevel >= 200
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

        <div class="grid gap-3">
          <label class="text-sm font-medium text-gray-600 border-b">Connected Breakers</label>
          <div class="grid grid-cols-4 flex-wrap gap-3">
            <div v-for="(line, index) in selectedStation?.lines" :key="index"
              class="flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md"
              :class="{
                'border-l-blue-500': line.voltageLevel < 100,
                'border-l-green-500': line.voltageLevel >= 100 && line.voltageLevel < 200,
                'border-l-orange-500': line.voltageLevel >= 200
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

        <div class="grid gap-3">
          <label class="text-sm font-medium text-gray-600 border-b">Battery Banks</label>
          <div class="grid grid-cols-4 flex-wrap gap-3">
            <div v-for="(line, index) in selectedStation?.lines" :key="index"
              class="flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md"
              :class="{
                'border-l-blue-500': line.voltageLevel < 100,
                'border-l-green-500': line.voltageLevel >= 100 && line.voltageLevel < 200,
                'border-l-orange-500': line.voltageLevel >= 200
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

      </section>
    </div>
    <div v-else class="text-sm text-gray-500 italic">
      No connection found.
    </div>

  </div>
</template>

<script>
import { getStation, createStation, updateStation, deleteStation } from '@/services/stationService'
import { Plus } from 'lucide-vue-next'
import { ElCard, ElButton } from 'element-plus'

export default {
  name: 'StationView',
  components: { Plus, ElCard, ElButton },
  data() {
    return {
      selectedStation: null,
      stations: [],
      filteredStations: [],
      searchQuery: '',
      loading: true,
      error: null,
      // form state for create/edit
      isEditMode: false,
      name: '',
      identifier: '',
      voltageLevel: null,
      display: true,
      message: '',
    }
  },
  computed: {
    stationId() {
      return this.$route.params.id
    }
  },
  async mounted() {
    console.log('Detail component mounted, stationId =', this.stationId)
    if (this.stationId) {
      try {
        this.selectedStation = await getStation(this.stationId)
      } catch {
        this.error = `Failed to load station #${this.stationId}`
      }
    }

    this.loading = false
  },
  methods: {
    async submit() {
      try {
        let resp
        if (this.isEditMode) {
          resp = await updateStation(this.stationId, {
            name: this.name,
            identifier: this.identifier,
            voltageLevel: this.voltageLevel,
            display: this.display,
          })
          this.message = `Station #${this.stationId} updated`
        } else {
          resp = await createStation({
            name: this.name,
            identifier: this.identifier,
            voltageLevel: this.voltageLevel,
            display: this.display,
          })
          this.message = `Created station #${resp.data.id}`
        }
        this.modal = false
        // re-fetch as needed
        this.stations = await getStation(this.stationId)
      } catch {
        this.message = 'Save failed'
      }
    },
    viewStation(id) {
      // match your route path exactly
      this.$router.push({ name: 'Station', params: { id } })
    },
    // ...editStation, deleteStation, etc
    filterStations() {
      const q = this.searchQuery.toLowerCase()
      this.filteredStations = this.stations.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q) ||
        s.voltageLevel.toString().includes(q)
      )
    }
  }
}
</script>
