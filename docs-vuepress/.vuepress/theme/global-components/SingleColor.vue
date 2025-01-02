<script>
// import config from 'windicss/defaultConfig'
export default {
  name: 'SingleColor',
  props: {
    color: {
      type: String,
      default: ''
    }
  },
  methods: {
    camelize(str) {
      const arr = str.split('-')
      const capital = arr.map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item.toLowerCase())
      const capitalString = capital.join('')
      return capitalString
    }
  },
  computed: {
    level() {
      return this.color.split(/-/).slice(-1)[0]
    },
    hex() {
      // return config.theme.colors[this.camelize(this.color)]?.[+this.level]
    }
  }
}
</script>
<template>
  <div>
    <div class="w-14 h-14 rounded" :class="color" />
    <div class="font-bold text-sm">
      {{ level }}
    </div>
    <div class="opacity-50 font-mono text-xs -mt-1">
      {{ hex }}
    </div>
  </div>
</template>
