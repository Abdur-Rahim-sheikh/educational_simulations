<script
    setup
    lang="ts"
>
import type p5 from 'p5';

const props = defineProps < { sketch: (p: p5) => void; } > ();

const canvasContainer = ref < HTMLElement | null > (null);

onMounted(async () => {
    const { default: p5 } = await import('p5');
    if (canvasContainer.value) {
        new p5(props.sketch, canvasContainer.value);
    }
})
</script>

<template>
    <div class="canvas-wrapper" ref="canvasContainer"></div>
</template>

<style scoped>
.canvas-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}
</style>