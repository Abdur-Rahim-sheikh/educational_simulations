<script
  setup
  lang="ts"
>
// This component takes ANY configuration object and ANY control schema
defineProps<{
  config: Record<string, any>;
  controls: Array<{
    label: string;
    key: string;
    type: string;
    min?: number;
    max?: number;
    step?: number;
  }>;
}>();
</script>

<template>
  <div class="controls-panel">
    <div class="controls-header">Parameters</div>

    <div class="control-group">
      <div v-for="control in controls" :key="control.key" class="control-item">
        <label>
          <span>{{ control.label }}: {{ config[control.key] }}</span>

          <!-- Range Slider -->
          <input v-if="control.type === 'range'" type="range" :min="control.min" :max="control.max" :step="control.step"
            v-model.number="config[control.key]">

          <!-- You can add other types here later (checkbox, color, etc) -->
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls-panel {
  padding: 20px;
  color: #ddd;
  border-top: 1px solid #333;
  margin-top: auto;
}

.controls-header {
  font-size: 0.8rem;
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

.control-item label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
}

.control-item span {
  display: flex;
  justify-content: space-between;
  font-family: monospace;
  font-size: 0.8rem;
  color: #aaa;
}

.control-item input[type="range"] {
  width: 100%;
  cursor: pointer;
  accent-color: #42b883;
}
</style>