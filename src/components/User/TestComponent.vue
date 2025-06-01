<template>
  <div class="p-4 bg-blue-100 rounded-lg">
    <h2 class="text-xl font-bold mb-2">Test Component</h2>
    <p>This is a simple test component to verify Vue is working.</p>
    <button 
      @click="incrementCount" 
      class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Clicked {{ count }} times
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const count = ref(0);

const incrementCount = () => {
  count.value++;
  console.log('Count incremented to:', count.value);
};

onMounted(() => {
  console.log('TestComponent mounted successfully');
});
</script>
