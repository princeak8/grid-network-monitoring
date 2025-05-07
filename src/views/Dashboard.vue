<template>
    <div class="dashboard-container">
        <!-- <h1>Power Grid Dashboard</h1> -->
        <Grid />
    </div>
</template>

<script setup lang="ts">
    import Grid from '@/components/Grid.vue';
    import { onMounted } from 'vue';
    
    onMounted(() => {
        console.log("Dashboard component mounted");
    });
</script>

<style scoped>
.dashboard-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

h1 {
    margin: 1rem;
}
</style>