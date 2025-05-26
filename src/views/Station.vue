<template>
  <div class="px-6 py-8">
    <h1 v-if="selectedStation" class="text-2xl font-bold mb-6">{{ selectedStation.name }}</h1>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p>{{ error }}</p>
    </div>
    <div v-else>

      <section class="mb-6 w-full flex items-center justify-between">
        <div class="w-full md:w-6/12">
          <input v-model="searchQuery" type="text" placeholder="Search stations..."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="filterStations" />
        </div>
        <button v-if="selectedStation" @click="setModal()"
          class="bg-[#1e293b] hover:bg-[#00293b] text-white p-2 rounded-md flex gap-2">
          <Plus class="w-6 h-6" /> Add Line
        </button>
      </section>

      <div v-if="selectedStation?.lines.length">

        <section v-if="selectedStation" class="space-y-4">
          <div class="grid gap-3">
            <label class="text-sm font-medium text-gray-600 border-b">Connected Lines</label>
            <div class="grid grid-cols-4 flex-wrap gap-3 w-full">
              <div v-for="(line, index) in selectedStation?.lines" :key="index"
                class="w-full flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md"
                :class="{
                  'border-l-blue-500': line.voltageLevel < 100,
                  'border-l-green-500': line.voltageLevel >= 100 && line.voltageLevel < 200,
                  'border-l-orange-500': line.voltageLevel >= 200
                }">
                <div class="w-full space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <span class="block text-sm font-medium text-gray-800">{{ line.name }}</span>
                    <div class="flex items-center gap-2">
                      <div class="flex gap-1 flex-wrap justify-end">
                        <p v-for="connect in line?.outgoingConnections" :key="connect.id"
                          class="bg-green-200 px-2 rounded-md text-xs">
                          {{ connect?.id }}
                        </p>
                      </div>
                      <SplinePointer @click="openModal(line)" title="+ add connection"
                        class="w-4 h-4 cursor-pointer hover:text-blue-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1">
                      <span class="text-xs font-medium text-gray-500">Voltage:</span>
                      <span class="px-2 py-1 text-xs font-bold rounded-full" :class="{
                        'bg-blue-100 text-blue-800': line.voltageLevel < 100,
                        'bg-green-100 text-green-800': line.voltageLevel >= 100 && line.voltageLevel < 200,
                        'bg-orange-100 text-orange-800': line.voltageLevel >= 200
                      }">
                        {{ line.voltageLevel | 0 }}kV
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="grid gap-3">
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
          </div> -->

        </section>
      </div>


      <div v-else class="text-sm text-gray-500 italic">
        No connection found.
      </div>

      <section v-if="modal"
        class="fixed w-full h-screen bg-gray-200 bg-opacity-20 inset-0 flex items-center justify-center ">
        <el-card class="max-w-sm mx-auto w-[30rem]">
          <template #header>
            <h2>Add Line</h2>
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
              <input id="voltageLevel" v-model.number="voltageLevel" type="number"
                class="border rounded-lg p-2 w-full" />
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

    <section v-if="showConnectionModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-20 z-50">
      <el-card class="w-full max-w-2xl p-6">
        <template #header>
          <h2 class="text-xl font-semibold">Create Connection</h2>
        </template>
        <form class="space-y-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label for="fromStation" class="block text-sm font-medium text-gray-700 mb-1">
                From Station
              </label>
              <select id="fromStation" v-model="fromStationId"
                class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option disabled value="">Select station</option>
                <option v-for="st in stations" :key="st.id" :value="st.tableId">{{ st.name }}</option>
              </select>
            </div>

            <ArrowRight class="w-6 h-6 text-gray-500 self-center md:mt-6" />

            <div class="flex-1">
              <label for="toStation" class="block text-sm font-medium text-gray-700 mb-1">
                To Station
              </label>
              <select id="toStation" v-model="toStationId"
                class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option disabled value="">Select station</option>
                <option v-for="st in stations" :key="st.id" :value="st.tableId">{{ st.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label for="fromLine" class="block text-sm font-medium text-gray-700 mb-1">
                From Line
              </label>
              <select id="fromLine" v-model="fromLineId"
                class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option disabled value="">Select line</option>
                <option v-for="line in linesForStation(fromStationId)" :key="line.id" :value="line.tableId">{{ line.name
                }}
                </option>
              </select>
            </div>

            <ArrowRight class="w-6 h-6 text-gray-500 self-center md:mt-6" />

            <div class="flex-1">
              <label for="toLine" class="block text-sm font-medium text-gray-700 mb-1">
                To Line
              </label>
              <select id="toLine" v-model="toLineId"
                class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option disabled value="">Select line</option>
                <option v-for="line in linesToStation(toStationId)" :key="line.id" :value="line.tableId">{{ line.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-4 pt-4 border-t">
            <el-button type="danger" @click="showConnectionModal = false">Cancel</el-button>
            <el-button type="primary" @click="createConnection">Save</el-button>
          </div>
        </form>
      </el-card>
    </section>


  </div>
</template>

<script>
import { getStation, addLine, addConnection, deleteStation, getStations } from '@/services/stationService'
import { Plus, SplinePointer, ArrowRight } from 'lucide-vue-next'
import { ElCard, ElButton } from 'element-plus'

export default {
  name: 'StationView',
  components: { Plus, SplinePointer, ArrowRight, ElCard, ElButton },
  data() {
    return {
      selectedStation: null,
      stations: [],
      filteredStations: [],
      searchQuery: '',
      loading: true,
      error: null,
      isEditMode: false,
      name: '',
      identifier: '',
      voltageLevel: null,
      display: true,
      message: '',
      modal: false,
      fromStationId: '',
      fromLineId: '',
      toStationId: '',
      toLineId: '',
      showConnectionModal: false,
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
        this.fetchStations()
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
        resp = await addLine({
          name: this.name,
          identifier: this.identifier,
          voltageLevel: this.voltageLevel,
          stationId: this.selectedStation.tableId,
        })
      } catch {
        this.message = 'Save failed'
        return;
      }
      this.selectedStation.lines.push({ name: this.name, voltageLevel: this.voltageLevel })
      this.modal = false
      this.message = `Created station #${resp.data.id}`
    },

    setModal() {
      this.modal = true;
      this.message = '';
    },

    onAction() {
      this.modal = false
    },
    viewStation(id) {
      this.$router.push({ name: 'Station', params: { id } })
    },

    openModal(line) {
      this.fromStationId = this.selectedStation.tableId
      this.fromLineId = line.tableId
      this.showConnectionModal = true
    },

    linesForStation(id) {
      const station = this.stations.find(s => s.tableId === id)
      return station ? station.lines : []
    },

    linesToStation(id) {
      const station = this.stations.find(s => s.tableId === id)
      return station ? station.lines : []
    },

    filterStations() {
      const q = this.searchQuery.toLowerCase()
      this.filteredStations = this.stations.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q) ||
        s.voltageLevel.toString().includes(q)
      )
    },

    async createConnection() {
      try {
        let resp
        resp = await addConnection({

          identifier: this.selectedStation.id,
          fromStationId: this.fromStationId,
          fromLineId: this.fromLineId,
          toStationId: this.toStationId,
          toLineId: this.toLineId,

        })
      } catch {
        this.message = 'Save failed'
        return;
      }
      this.selectedStation.lines.push({ name: this.name, voltageLevel: this.voltageLevel })
      this.message = `Saved Connection #${resp.data.id}`
      this.modal = false
      this.showConnectionModal = false
    },

    async fetchStations() {
      try {
        const stations = await getStations();
        this.stations = stations;
        console.log("stations:", stations)
      } catch (err) {
        console.log(err)
      }
    }

  }
}
</script>
