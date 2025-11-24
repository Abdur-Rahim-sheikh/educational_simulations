<script
    setup
    lang="ts"
>
import { useFallingshapes } from '~/composables/simulations/useFallingShapes';
const { sketch } = useFallingshapes();
</script>

<template>
    <div class="lab-container">
        <h1>OSP Lab: Rigid Body Dynamics</h1>
        <p>Click and hold to spawn bodies.</p>

        <div class="viewport">
            <ClientOnly>
                <SketchBaseCanvas :sketch="sketch" />
                <template #fallback>
                    <div class="loading">Loading Physics Engine...</div>
                </template>
            </ClientOnly>
        </div>
    </div>
</template>

<style>
.lab-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: sans-serif;
    background: #111;
    color: white;
    min-height: 100vh;
}

.viewport {
    border: 2px solid #333;
    margin-top: 20px;
}
</style>