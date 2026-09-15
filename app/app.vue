<template>
  <NuxtLayout>
    <NuxtPage :key="route.path" />
  </NuxtLayout>
</template>


<script setup>
import { computed } from 'vue';
import { useHeadStore } from './stores/shared/head.store'
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