<script
    setup
    lang="ts"
>
import { useFallingShapes } from '~/composables/simulations/useFallingShapes';
import { useSpringSystem } from '~/composables/simulations/useSpringSystem';

// --- State ---
const isSidebarOpen = ref(true);
const currentKey = ref('spring'); // Default active simulation


const simulations = {
    falling: useFallingShapes(),
    spring: useSpringSystem()
};

const activeSketch = computed(() => {
    return simulations[currentKey.value as keyof typeof simulations].sketch;
});


const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const selectSimulation = (key: string) => {
    currentKey.value = key;
};
</script>

<template>
    <div class="app-layout">

        <!-- Sidebar -->
        <aside :class="['sidebar', { collapsed: !isSidebarOpen }]">
            <div class="sidebar-header">
                <h2 v-if="isSidebarOpen">OSP Lab</h2>
                <button @click="toggleSidebar" class="toggle-btn">
                    {{ isSidebarOpen ? '←' : '→' }}
                </button>
            </div>

            <nav v-if="isSidebarOpen" class="nav-menu">
                <button @click="selectSimulation('falling')" :class="{ active: currentKey === 'falling' }">
                    📦 Falling Bodies
                </button>
                <button @click="selectSimulation('spring')" :class="{ active: currentKey === 'spring' }">
                    🌀 Spring System
                </button>
            </nav>
        </aside>

        <!-- Main Content (Canvas) -->
        <main class="content">
            <ClientOnly>
                <SketchCanvas :sketch="activeSketch" />
                <template #fallback>
                    <div class="loading">Loading Physics Engine...</div>
                </template>
            </ClientOnly>
        </main>

    </div>
</template>

<style scoped>
.app-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
}

/* Sidebar Styling */
.sidebar {
    width: 280px;
    background: #252525;
    border-right: 1px solid #333;
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
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
    /* Nuxt Green */
}

.toggle-btn {
    background: none;
    border: 1px solid #444;
    color: #fff;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
}

.toggle-btn:hover {
    background: #333;
}

.nav-menu {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
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

/* Content Area */
.content {
    flex: 1;
    position: relative;
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