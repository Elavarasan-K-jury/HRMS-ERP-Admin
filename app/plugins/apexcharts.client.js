import VueApexCharts from 'vue3-apexcharts'
export default defineNuxtPlugin((nuxtApp) => {
    // Register as a component named <apexchart />
    nuxtApp.vueApp.component('apexchart', VueApexCharts)
})
