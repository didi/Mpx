<template>
  <div class="my-8">
    <div v-for="color in colors" :key="color">
      <div class="relative mb-3 mt-6">
        <span>{{ color }}</span>
      </div>
      <div class="flex gap-2 mb-2 overflow-y-auto">
        <SingleColor v-for="level in levels" :key="level" :color="`bg-${color}-${level}`" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      levels: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      colors: [
        'pink', 'rose', 'red', 'orange', 'yellow', 'amber', 'lime', 'green', 'emerald', 'teal',
        'cyan', 'sky', 'blue', 'indigo', 'purple', 'violet', 'fuchsia', 'gray', 'slate', 'stone',
        'neutral', 'zinc', 'light', 'dark',
      ]
    };
  }
};
</script>
