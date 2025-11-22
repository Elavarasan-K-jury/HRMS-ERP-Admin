<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll grid grid-cols-12 gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between col-span-12">
            <h2 class="text-lg font-semibold text-white/90">Holidays</h2>
            <div class="flex items-center gap-2">
                <UiSearch color="#4aff7a" v-model="q" :suggestions="results" :loading="loading" @search="fetchResults"
                    @select="goTo" />
                <UiButton color="#4aff7a" text="Add Holidays" prepend-icon="ion:add-circle" />
            </div>
        </div>
    </div>
</template>
