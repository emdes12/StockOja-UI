<script setup>
defineProps({
  txt: {
    type: String,
    required: true,
  },
  action: {
    type: Function,
    required: false,
  },
})
</script>

<template>
  <button class="button" @click="action">{{ txt }}</button>
</template>

<style scoped>
.button {
  border: none;
  padding: 10px 12px;
  font-size: 1rem;
  font-weight: 600;
  background-color: var(--color-secondary);
  color: #fff;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}
</style>
