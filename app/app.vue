<script
    setup
    lang="ts"
>
import { useFallingShapes } from '~/composables/simulations/useFallingShapes';
import { useSpringSystem } from '~/composables/simulations/useSpringSystem';
import BaseCanvas from '~/components/sketch/BaseCanvas.vue';

const isSidebarOpen = ref(true);
const currentKey = ref('spring');

// Initialize simulations once
const simulations = {
    falling: useFallingShapes(),
    spring: useSpringSystem()
};

// Computed property to get current simulation data
const currentSimulation = computed(() => {
    return simulations[currentKey.value as keyof typeof simulations];
});

// Helper to access config easily in template
const activeConfig = computed(() => currentSimulation.value.config);

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

            <!-- Navigation -->
            <nav v-if="isSidebarOpen" class="nav-menu">
                <button @click="selectSimulation('falling')" :class="{ active: currentKey === 'falling' }">
                    📦 Falling Bodies
                </button>
                <button @click="selectSimulation('spring')" :class="{ active: currentKey === 'spring' }">
                    🌀 Spring System
                </button>
            </nav>

            <!-- WIDGETS: Dynamic Controls based on selected simulation -->
            <div v-if="isSidebarOpen" class="controls-panel">
                <div class="controls-header">Parameters</div>

                <!-- Controls for Spring Simulation -->
                <div v-if="currentKey === 'spring'" class="control-group">
                    <label>
                        <span>দৃড়তা: {{ activeConfig.stiffness }}</span>
                        <input type="range" min="0.001" max="0.2" step="0.001" v-model.number="activeConfig.stiffness">
                    </label>

                    <label>
                        <span>শক্তি হ্রাস: {{ activeConfig.damping }}</span>
                        <input type="range" min="0" max="0.5" step="0.01" v-model.number="activeConfig.damping">
                    </label>

                    <label>
                        <span>দৈর্ঘ: {{ activeConfig.length }}</span>
                        <input type="range" min="50" max="400" step="10" v-model.number="activeConfig.length">
                    </label>

                    <label>
                        <span>ভর: {{ activeConfig.mass }}</span>
                        <input type="range" min="1" max="50" step="1" v-model.number="activeConfig.mass">
                    </label>
                </div>

                <!-- Controls for Falling Shapes -->
                <div v-if="currentKey === 'falling'" class="control-group">
                    <label>
                        <span>অভিকর্ষ বল: {{ activeConfig.gravityScale }}</span>
                        <input type="range" min="0" max="5" step="0.1" v-model.number="activeConfig.gravityScale">
                    </label>
                    <label>
                        <span>সময়ের গতি: {{ activeConfig.timeScale }}</span>
                        <input type="range" min="0.1" max="3" step="0.1" v-model.number="activeConfig.timeScale">
                    </label>
                </div>

            </div>
        </aside>

        <main class="content">
            <ClientOnly>
                <BaseCanvas :sketch="currentSimulation.sketch" />
                <template #fallback>
                    <div class="loading">Loading...</div>
                </template>
            </ClientOnly>
        </main>

    </div>
</template>

<style scoped>
/* Previous Sidebar styles preserved */
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
    overflow-y: auto;
}

.sidebar.collapsed {
    width: 60px;
}

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

.nav-menu {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-bottom: 1px solid #333;
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

/* New Control Styles */
.controls-panel {
    padding: 20px;
    color: #ddd;
}

.controls-header {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #666;
    margin-bottom: 15px;
    font-weight: bold;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.control-group label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.9rem;
}

.control-group label span {
    display: flex;
    justify-content: space-between;
    font-family: monospace;
}

.control-group input[type="range"] {
    width: 100%;
    cursor: pointer;
    accent-color: #42b883;
}
</style>