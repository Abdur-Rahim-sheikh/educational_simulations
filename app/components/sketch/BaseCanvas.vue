<script
    setup
    lang="ts"
>
import type p5 from 'p5';

const props = defineProps<{ sketch: (p: p5) => void; }>();

const canvasContainer = ref<HTMLElement | null>(null);

let myP5: p5 | null = null;

const initP5 = async () => {
    if (myP5) {
        myP5.remove();
        myP5 = null;
    }

    const { default: p5 } = await import('p5');
    if (canvasContainer.value) {
        myP5 = new p5(props.sketch, canvasContainer.value);
    }
}
onMounted(async () => {
    initP5();
})

watch(() => props.sketch, () => {
    initP5();

})

onUnmounted(() => {
    if (myP5) {
        myP5.remove();
        myP5 = null;
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