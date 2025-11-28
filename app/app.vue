<script
    setup
    lang="ts"
>
import { useFallingShapes } from '~/composables/useFallingShapes';
import { useSpringSystem } from '~/composables/useSpringSystem';
import SketchCanvas from '~/components/SketchCanvas.vue';
import SimulationControls from '~/components/SimulationControls.vue';

const isSidebarOpen = ref(true);
const currentKey = ref('spring');

const simulations = {
    falling: useFallingShapes(),
    spring: useSpringSystem()
};

// We simply retrieve whatever the simulation gives us
const currentSimulation = computed(() => {
    return simulations[currentKey.value as keyof typeof simulations];
});

const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;
const selectSimulation = (key: string) => currentKey.value = key;
</script>

<template>
    <div class="app-layout">

        <aside :class="['sidebar', { collapsed: !isSidebarOpen }]">
            <div class="sidebar-header">
                <h2 v-if="isSidebarOpen">OSP Lab</h2>
                <button @click="toggleSidebar" class="toggle-btn">
                    {{ isSidebarOpen ? '←' : '→' }}
                </button>
            </div>

            <nav v-if="isSidebarOpen" class="nav-menu">
                <button v-for="(sim, key) in simulations" :key="key" @click="selectSimulation(key)"
                    :class="{ active: currentKey === key }">
                    {{ key === 'falling' ? '📦 Falling Bodies' : '🌀 Spring System' }}
                </button>
            </nav>

            <!-- 
        GENERIC WIDGET AREA 
        This will render ANY controls passed by the current simulation
      -->
            <SimulationControls v-if="isSidebarOpen && currentSimulation.controls" :config="currentSimulation.config"
                :controls="currentSimulation.controls" />
        </aside>

        <main class="content">
            <ClientOnly>
                <SketchCanvas :sketch="currentSimulation.sketch" />
                <template #fallback>
                    <div class="loading">Loading...</div>
                </template>
            </ClientOnly>
        </main>

    </div>
</template>

<style scoped>
/* Layout basics */
.app-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
}

.sidebar {
    width: 300px;
    background: #252525;
    border-right: 1px solid #333;
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
}

.sidebar.collapsed {
    width: 60px;
}

/* Header & Toggle */
.sidebar-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #42b883;
}

.toggle-btn {
    background: none;
    border: 1px solid #444;
    color: #fff;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
}

/* Navigation */
.nav-menu {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
}

.nav-menu button {
    background: none;
    border: none;
    color: #aaa;
    text-align: left;
    padding: 12px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 1rem;
    text-transform: capitalize;
}

.nav-menu button:hover {
    background: #333;
    color: #fff;
}

.nav-menu button.active {
    background: #42b883;
    color: #000;
    font-weight: bold;
}

.content {
    flex: 1;
    background: #111;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
}
</style>