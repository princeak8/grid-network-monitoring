<template>
    <div class="grid gap-3">
        <section class="flex items-center justify-between text-xs border-b pb-2">
            <label class="text-sm font-medium text-gray-600 ">Units</label>
            <button @click="openAddModal()"
                class="bg-[#1e293b] hover:bg-[#00293b] text-white p-1 rounded-md flex gap-1">
                <Plus class="w-4 h-4" /> Add Unit
            </button>
        </section>
        <div v-if="units.length" class="grid grid-cols-4 flex-wrap gap-3 w-full">
            <div v-for="(unit, index) in units" :key="index"
                class="w-full flex items-center justify-between flex-1 p-4 transition-all duration-200 bg-white border-l-4 border rounded-md shadow-sm min-w-[150px] hover:shadow-md cursor-pointer">
                <div class="w-full space-y-2" @click="prepareEdit(unit)">
                    <div class="flex items-center justify-between gap-2">
                        <span class="block text-sm font-medium text-gray-800">{{ unit.name }}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1">
                            <span class="text-xs font-medium text-gray-500">Voltage:</span>
                            <span class="px-2 py-1 text-xs font-bold rounded-full" :class="{
                                'bg-blue-100 text-blue-800': unit.voltageLevel < 100,
                                'bg-green-100 text-green-800': unit.voltageLevel >= 100 && unit.voltageLevel < 200,
                                'bg-orange-100 text-orange-800': unit.voltageLevel >= 200
                            }">
                                {{ unit.voltageLevel | 0 }}kV
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-sm text-gray-500 italic">
            No Unit Added.
        </div>

    </div>


    <section v-if="addModal" class="fixed w-full h-screen bg-gray-200 bg-opacity-20 inset-0 flex items-center justify-center ">
        <el-card class="max-w-sm mx-auto w-[30rem]">
            <template #header>
                <h2>Add Unit</h2>
            </template>

            <form class="space-y-2">
                <div class="grid">
                    <label for="name">Name:</label>
                    <input id="name" v-model="unitName" type="text" class="border rounded-lg p-2 w-full" />
                </div>
                <div class="grid">
                    <label for="identifier">Identifier:</label>
                    <input id="identifier" v-model="unitIdentifier" type="text" class="border rounded-lg p-2 w-full" />
                </div>
                <div class="grid">
                    <label for="inertia">Inertia:</label>
                    <input id="inertia" v-model.number="unitInertia" type="number" class="border rounded-lg p-2 w-full" />
                </div>
                <div class="grid">
                    <label for="active">Active:</label>
                    <select id="active" v-model="unitActive">
                        <option value=true>TRUE</option>
                        <option value=false>FALSE</option>
                    </select>
                </div>
            </form>

            <template #footer>
                <el-button type="danger" @click="closeAddModal">Cancel</el-button>
                <el-button type="primary" @click="submit">
                {{ editMode ? 'Save' : 'Add' }}
                </el-button>
                <p>{{ modalMessage }}</p>
            </template>

        </el-card>
    </section>

    <section v-if="editModal" class="fixed w-full h-screen bg-gray-200 bg-opacity-20 inset-0 flex items-center justify-center ">
        <el-card class="max-w-sm mx-auto w-[30rem]">
            <template #header>
                <h2>Edit Unit</h2>
            </template>

            <form class="space-y-2">
                <div class="grid">
                    <label for="name">Name:</label>
                    <input id="name" v-model="unitName" type="text" class="border rounded-lg p-2 w-full" />
                </div>
                <div class="grid">
                    <label for="identifier">Identifier:</label>
                    <input id="identifier" v-model="unitIdentifier" type="text" class="border rounded-lg p-2 w-full" />
                </div>
                <div class="grid">
                    <label for="inertia">Inertia:</label>
                    <input id="inertia" v-model.number="unitInertia" type="number" class="border rounded-lg p-2 w-full" />
                </div>
                <div class="grid">
                    <label for="active">Active:</label>
                    <select id="active" v-model="unitActive">
                        <option value=true>TRUE</option>
                        <option value=false>FALSE</option>
                    </select>
                </div>
                <div class="grid">
                    <label for="voltage">Voltage Level:</label>
                    <input id="voltage" v-model.number="unitVoltageLevel" type="number" class="border rounded-lg p-2 w-full" />
                </div>
            </form>

            <template #footer>
                <el-button type="danger" @click="closeEditModal">Cancel</el-button>
                <el-button type="primary" @click="update">
                Update
                </el-button>
                <p>{{ modalMessage }}</p>
            </template>

        </el-card>
    </section>
        
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { Station, Line, Unit, Connection } from "../types"
import { lineWidth, lineHeight } from "../constants";
import { addUnit, updateUnit } from '@/services/stationService';

    const props = defineProps<{
    units: Unit[],
    station: Station
    }>();

    const emit = defineEmits(['fetchStation']); // Add this line to define the emit

    let addModal = ref(false);
    let editModal = ref(false);
    let modalMessage = ref("");

    let editMode = ref(false)

    let unitName = ref("");
    let unitIdentifier = ref("");
    let unitInertia = ref<number | null>(null);
    let unitActive = ref(true);
    let unitVoltageLevel = ref<number | null>(null);
    let unitId = ref<number | null>(null);

    const openAddModal = () => {
      addModal.value = true;
    }

    const closeAddModal = () => {
        console.log("close add modal");
      addModal.value = false;
      modalMessage.value = "";
    }

    const closeEditModal = () => {
      editModal.value = false;
      modalMessage.value = "";
    }

    const submit = async () => {
        // console.log("submit unit");
        try{
            if(unitInertia.value && unitName.value != "" && unitIdentifier.value != "") {
                await addUnit({
                    stationId: props.station.tableId,
                    name: unitName.value,
                    identifier: unitIdentifier.value,
                    inertia: unitInertia.value,
                    active: unitActive.value,
                    voltageLevel: props.station.voltageLevel
                });
                emit('fetchStation');
                closeAddModal()
            }else{
                if(!unitInertia.value) modalMessage.value = "Inertia is required";
                if(unitName.value == "") modalMessage.value = "Name is required";
                if(unitIdentifier.value == "") modalMessage.value = "Identifier is required";
            }
        } catch(error) {
            modalMessage.value = 'Save failed';
            console.log("Saving Unit failed: ", error);
        }
    }

    const prepareEdit = (unit: Unit) => {
        unitName.value = unit.name;
        unitIdentifier.value = unit.id;
        unitInertia.value = unit.inertia;
        unitActive.value = unit.active;
        unitVoltageLevel.value = unit.voltageLevel
        unitId.value = unit.tableId;

        editModal.value = true;
    }

    const update = async () => {
        console.log("update unit");
        try{
            if(unitInertia.value && unitName.value != "" && unitIdentifier.value != "") {
                await updateUnit(unitId.value, {
                    name: unitName.value,
                    identifier: unitIdentifier.value,
                    inertia: unitInertia.value,
                    active: unitActive.value,
                    voltageLevel: props.station.voltageLevel
                });
                emit('fetchStation');
                closeEditModal()
            }else{
                if(!unitInertia.value) modalMessage.value = "Inertia is required";
                if(unitName.value == "") modalMessage.value = "Name is required";
                if(unitIdentifier.value == "") modalMessage.value = "Identifier is required";
            }
        } catch(error) {
            modalMessage.value = 'Update failed';
            console.log("Updating Unit failed: ", error);
        }
    }

</script>

<style scoped>

</style>