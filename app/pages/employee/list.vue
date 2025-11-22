<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Employee<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openOrganizationModal" color="#4aff7a" text="Add Department"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchDepartments" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'auth',
    key: route => route.fullPath,
});
</script>