<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Roles & Permissions<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <FormSelect color="#fff" prepend-icon="heroicons:adjustments-vertical" v-model="selectedCategory"
                    :options="empCategories" searchable size="md" rounded="full" placeholder="Category" />
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openAddModal" color="#4aff7a" text="Add Employee" prepend-icon="ion:add-circle" />
                <UiButton @click="fetchEmployees" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <DataTable :items="employees" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @refresh="fetchDepartments" @view="view" @edit="editEmpCategory" @delete="deleteEmployee" />
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'organization',
});
</script>