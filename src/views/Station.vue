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
      </section>

      <div>
        <section v-if="selectedStation" class="space-y-4">
          <div class="grid gap-3">
            <section class="flex items-center justify-between text-xs border-b pb-2">
              <label class="text-sm font-medium text-gray-600 ">Connected Lines</label>
              <button v-if="selectedStation" @click="setModal()"
                class="bg-[#1e293b] hover:bg-[#00293b] text-white p-1 rounded-md flex gap-1">
                <Plus class="w-4 h-4" /> Add Line
              </button>
            </section>
            <div v-if="selectedStation?.lines.length" class="grid grid-cols-4 flex-wrap gap-3 w-full">
              <div v-for="(line, index) in selectedStation?.lines" :key="index" @click="openModal(line)"
                class="w-full flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md cursor-pointer"
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
                        <p v-if="(line.incomingConnections?.length > 0 || line.outgoingConnections?.length > 0)"
                          class="bg-green-200 px-2 py-1 rounded-md text-xs">
                          {{ line.id }}
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

            <div v-else class="text-sm text-gray-500 italic">
              No line found.
            </div>

          </div>


          <!--  Units -->
          <UnitSection v-if="selectedStation.type == StationType.GENERATION" :station="selectedStation" :units="selectedStation.units" @fetchStation="fetchStation(stationId)"  />

          <section class="flex items-center justify-between text-xs border-b pb-2">
            <label class="text-sm font-medium text-gray-600">Connected Transformers</label>
            <button @click="setModal2()" class="bg-[#1e293b] hover:bg-[#00293b] text-white p-1 rounded-md flex gap-1">
              <Plus class="w-4 h-4" /> Add Transformer
            </button>
          </section>

          <div v-if="selectedStation?.transformers.length" class="grid grid-cols-4 flex-wrap gap-3 w-full">
            <div v-for="(xf, idx) in selectedStation.transformers" :key="idx" @click="openModal(xf)"
              class="w-full flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md cursor-pointer"
              :class="{
                'border-l-blue-500': xf.powerRating < 50,
                'border-l-green-500': xf.powerRating >= 50 && xf.powerRating < 150,
                'border-l-orange-500': xf.powerRating >= 150
              }">
              <div class="w-full space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="block text-sm font-medium text-gray-800">{{ xf.name }}</span>
                  <div class="flex items-center gap-2">
                    <p v-if="xf.serialNo" class="bg-green-200 px-2 py-1 rounded-md text-xs">
                      {{ xf.serialNo }}
                    </p>
                    <SplinePointer @click="openModal(xf)" title="+ add connection"
                      class="w-4 h-4 cursor-pointer hover:text-blue-500 flex-shrink-0" />
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1">
                    <span class="text-xs font-medium text-gray-500">Rating:</span>
                    <span class="px-2 py-1 text-xs font-bold rounded-full" :class="{
                      'bg-blue-100 text-blue-800': xf.powerRating < 50,
                      'bg-green-100 text-green-800': xf.powerRating >= 50 && xf.powerRating < 150,
                      'bg-orange-100 text-orange-800': xf.powerRating >= 150
                    }">
                      {{ xf.powerRating }} {{ xf.powerRatingUnit.toUpperCase() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-sm text-gray-500 italic">
            No Transformer found.
          </div>

          <!-- <div class="grid gap-3">
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


      <!-- <div v-else class="text-sm text-gray-500 italic">
        No connection found.
      </div> -->

      <section v-if="modal"
        class="fixed w-full h-screen bg-gray-200 bg-opacity-20 inset-0 flex items-center justify-center z-20">
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

      <section v-if="modal2"
        class="fixed w-full h-screen bg-gray-200 bg-opacity-20 inset-0 flex items-center justify-center ">
        <el-card class="max-w-sm mx-auto w-[30rem]">
          <template #header>
            <h2>Add Transformer</h2>
          </template>

          <form class="space-y-2">
            <div class="grid">
              <label for="transformerName">Name:</label>
              <input id="transformerName" v-model="name" type="text" class="border rounded-lg p-2 w-full" />
            </div>
            <div class="grid">
              <label for="manufacturerId">Manufacturer ID:</label>
              <input id="manufacturerId" v-model.number="manufacturerId" type="number"
                class="border rounded-lg p-2 w-full" />
            </div>
            <div class="grid">
              <label for="serialNo">Serial Number:</label>
              <input id="serialNo" v-model="serialNo" type="text" class="border rounded-lg p-2 w-full" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label for="powerRating">Power Rating:</label>
                <input id="powerRating" v-model.number="powerRating" type="number"
                  class="border rounded-lg p-2 w-full" />
              </div>
              <div>
                <label for="powerRatingUnit">Unit:</label>
                <select id="powerRatingUnit" v-model="powerRatingUnit" class="border rounded-lg p-2 w-full">
                  <option value="mva">MVA</option>
                  <option value="kva">KVA</option>
                </select>
              </div>
            </div>
            <div class="grid">
              <label for="typeOfCooling">Cooling Type:</label>
              <input id="typeOfCooling" v-model="typeOfCooling" type="text" class="border rounded-lg p-2 w-full" />
            </div>
            <div class="grid">
              <label for="voltageRating">Voltage Rating:</label>
              <input id="voltageRating" v-model="voltageRating" type="text" class="border rounded-lg p-2 w-full" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label for="manufactureYear">Manufacture Year:</label>
                <input id="manufactureYear" v-model.number="manufactureYear" type="number"
                  class="border rounded-lg p-2 w-full" />
              </div>
              <div>
                <label for="installationYear">Installation Year:</label>
                <input id="installationYear" v-model.number="installationYear" type="number"
                  class="border rounded-lg p-2 w-full" />
              </div>
            </div>
          </form>

          <template #footer>
            <el-button type="danger" @click="onAction2">Cancel</el-button>
            <el-button type="primary" @click="submit2">
              {{ isEditMode ? 'Save' : 'Add' }}
            </el-button>
            <p>{{ message }}</p>
          </template>

        </el-card>
      </section>

      <el-dialog v-model="showNoIdenticalLineModal" title="No Identical Line" width="400px" :close-on-click-modal="false">
        <span>There is no identical line on the selected station. Would you like to create one for the 'To Station'?</span>
        <template #footer>
          <el-button @click="showNoIdenticalLineModal = false">Cancel</el-button>
          <el-button type="primary" @click="openAddLineForToStation">Create Line</el-button>
        </template>
      </el-dialog>
    </div>

    <section v-if="showConnectionModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-20">
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

          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label for="fromLine" class="block text-sm font-medium text-gray-700 mb-1">
                From Side
              </label>
              <select id="fromLine" v-model="fromSide"
                class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <ArrowRight class="w-6 h-6 text-gray-500 self-center md:mt-6" />

            <div class="flex-1">
              <label for="toLine" class="block text-sm font-medium text-gray-700 mb-1">
                To Side
              </label>
              <select id="toLine" v-model="toSide"
                class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getStation, addLine, addConnection, deleteStation, getStations, addTransformer } from '@/services/stationService'
import { Plus, SplinePointer, ArrowRight } from 'lucide-vue-next'
import { ElCard, ElButton } from 'element-plus'
import UnitSection from '@/components/UnitSection.vue'
import { StationType } from '@/enums'

const route = useRoute()
const stationId = route.params.id

// Reactive state
const selectedStation = ref(null)
const stations = ref([])
const filteredStations = ref([])
const searchQuery = ref('')
const loading = ref(true)
const error = ref(null)
const isEditMode = ref(false)
const name = ref('')
const identifier = ref('')
const voltageLevel = ref(null)
const display = ref(true)
const message = ref('')
const modal = ref(false)
const modal2 = ref(false)
const fromStationId = ref('')
const fromLineId = ref('')
const toStationId = ref('')
const toLineId = ref('')
const fromSide = ref('top')
const toSide = ref('bottom')
const showConnectionModal = ref(false)
const manufacturerId = ref(null)
const serialNo = ref('')
const powerRating = ref(null)
const powerRatingUnit = ref('mva')
const typeOfCooling = ref('')
const voltageRating = ref('')
const manufactureYear = ref(null)
const installationYear = ref(null)
const showNoIdenticalLineModal = ref(false)
const pendingToStationId = ref('')
const pendingFromLineName = ref('')
const currentStationId = ref(null)

// Computed properties
const computedStationId = computed(() => route.params.id)

// Methods
const submit = async () => {
  try {
    const resp = await addLine({
      name: name.value,
      identifier: identifier.value,
      voltageLevel: voltageLevel.value,
      stationId: currentStationId.value || selectedStation.value.tableId,
    })
    // Find the station to add the line to
    const station = stations.value.find(s => s.tableId === (currentStationId.value || selectedStation.value.tableId));
    if (station) {
      const newLine = { name: name.value, voltageLevel: voltageLevel.value, tableId: resp.data.id };
      if (!station.lines) station.lines = [];
      station.lines.push(newLine);
      // If this was for the To Station and matches the pending name, auto-select it
      if (pendingToStationId.value && pendingFromLineName.value && station.tableId === pendingToStationId.value && name.value === pendingFromLineName.value) {
        toLineId.value = newLine.tableId;
      }
    }
    modal.value = false
    message.value = `Created line #${resp.data.id}`
  } catch {
    message.value = 'Save failed'
  }
}

const submit2 = async () => {
  try {
    const resp = await addTransformer({
      name: name.value,
      manufacturerId: manufacturerId.value,
      serialNo: serialNo.value,
      powerRating: powerRating.value,
      powerRatingUnit: powerRatingUnit.value,
      typeOfCooling: typeOfCooling.value,
      voltageRating: voltageRating.value,
      manufactureYear: manufactureYear.value,
      installationYear: installationYear.value,
      stationId: selectedStation.value.tableId,
    })
    selectedStation.value.transformers.push({
      name: name.value,
      manufacturerId: manufacturerId.value,
      serialNo: serialNo.value,
      powerRating: powerRating.value,
      powerRatingUnit: powerRatingUnit.value,
      typeOfCooling: typeOfCooling.value,
      voltageRating: voltageRating.value,
      manufactureYear: manufactureYear.value,
      installationYear: installationYear.value
    })
    modal2.value = false
    message.value = `Created station #${resp.data.id}`
  } catch {
    message.value = 'Save failed'
  }
}

const setModal = () => {
  modal.value = true
  message.value = ''
}

const setModal2 = () => {
  modal2.value = true
  message.value = ''
}

const onAction = () => {
  modal.value = false
}

const onAction2 = () => {
  modal2.value = false
}

const viewStation = (id) => {
  router.push({ name: 'Station', params: { id } })
}

const openModal = async (line) => {
  if (!stations.value.length) {
    await fetchStations();
  }
  fromStationId.value = selectedStation.value.tableId
  fromLineId.value = line.tableId
  showConnectionModal.value = true
}

// Watch for modal open to preselect station if not set
watch(showConnectionModal, (val) => {
  if (val && !fromStationId.value && selectedStation.value) {
    fromStationId.value = selectedStation.value.tableId;
  }
});

const linesForStation = (id) => {
  const station = stations.value.find(s => s.tableId === id)
  return station ? station.lines : []
}

const linesToStation = (id) => {
  const station = stations.value.find(s => s.tableId === id)
  return station ? station.lines : []
}

const filterStations = () => {
  const q = searchQuery.value.toLowerCase()
  filteredStations.value = stations.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.location || '').toLowerCase().includes(q) ||
    s.voltageLevel.toString().includes(q)
  )
}

const createConnection = async () => {
  try {
    console.log(selectedStation.value)
    let lineArr = selectedStation.value.lines.filter((line) => (line.tableId == fromLineId.value) || (line.tableId == toLineId.value))
    if (lineArr) {
      const resp = await addConnection({
        identifier: lineArr[0].id,
        fromStationId: fromStationId.value,
        fromLineId: fromLineId.value,
        toStationId: toStationId.value,
        toLineId: toLineId.value,
        fromSide: fromSide.value,
        toSide: toSide.value,
      })
      selectedStation.value.lines.push({ name: name.value, voltageLevel: voltageLevel.value })
      message.value = `Saved Connection`
      modal.value = false
      showConnectionModal.value = false
    } else {
      message.value = "cannot find the appropriate line"
      console.log("lineArr", lineArr)
    }
  } catch {
    message.value = 'Save failed'
  }
}

const fetchStation = async (identifier) => {
  selectedStation.value = await getStation(identifier)
}

const fetchStations = async () => {
  try {
    const stationsData = await getStations()
    stations.value = stationsData
    console.log("stations:", stationsData)
  } catch (err) {
    console.log(err)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Detail component mounted, stationId =', stationId)
  await fetchStations();
  if (stationId) {
    try {
      await fetchStation(stationId)
      console.log("selected station", selectedStation.value)
    } catch {
      error.value = `Failed to load station #${stationId}`
    }
  }
  loading.value = false
})

// Watch for changes to toStationId
watch(toStationId, (newToStationId) => {
  if (!newToStationId) return;
  // Get the selected from line name
  const fromLine = linesForStation(fromStationId.value).find(line => line.tableId === fromLineId.value);
  if (!fromLine) return;
  // Try to find a line in the to station with the same name
  const toLines = linesToStation(newToStationId);
  const identicalLine = toLines.find(line => line.name === fromLine.name);
  if (identicalLine) {
    toLineId.value = identicalLine.tableId;
  } else {
    toLineId.value = '';
    pendingToStationId.value = newToStationId;
    pendingFromLineName.value = fromLine.name;
    showNoIdenticalLineModal.value = true;
  }
});

// Add Line modal logic for To Station
const openAddLineForToStation = () => {
  // Set up modal for adding a line to the To Station
  isEditMode.value = false;
  currentStationId.value = pendingToStationId.value;
  name.value = pendingFromLineName.value;
  // Find the from line and use its identifier if available
  const fromLine = linesForStation(fromStationId.value).find(line => line.name === pendingFromLineName.value || line.tableId === fromLineId.value);
  identifier.value = fromLine && fromLine.identifier ? fromLine.identifier : '';
  voltageLevel.value = null;
  display.value = true;
  modal.value = true;
  showNoIdenticalLineModal.value = false;
};

// After adding a line, if it matches the pending name, auto-select it in To Line
watch(modal, (val) => {
  if (!val && pendingToStationId.value && pendingFromLineName.value) {
    // Modal just closed, try to select the new line
    const toLines = linesToStation(pendingToStationId.value);
    const newLine = toLines.find(line => line.name === pendingFromLineName.value);
    if (newLine) {
      toLineId.value = newLine.tableId;
    }
    pendingToStationId.value = '';
    pendingFromLineName.value = '';
  }
});
</script>