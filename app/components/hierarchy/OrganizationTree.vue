<template>
    <div class="w-full rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
        <OrganizationTreeNode v-for="level in levels" :key="level.level" :node="level" :depth="0" />
    </div>
</template>

<script setup>
import OrganizationTreeNode from './OrganizationTreeNode.vue'

const props = defineProps({
    levels: Array
});
</script>
