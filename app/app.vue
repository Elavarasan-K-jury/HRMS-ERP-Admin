<template>
  <NuxtLayout>
    <NuxtPage :key="route.fullPath" />
  </NuxtLayout>
</template>


<script setup>
import { computed } from 'vue';
import { useHeadStore } from './stores/head.store'
import { useHead } from 'nuxt/app';
import '../assets/css/transitions.css'
import '../assets/css/main.css'
import { useRoute } from 'vue-router'
const route = useRoute()

const headStore = useHeadStore()

const headData = computed(() => {
  return headStore.getHead
})

useHead(headData);
</script>