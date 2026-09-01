<template>
    <div class="relative h-72 w-full overflow-hidden rounded-lg border border-white/15 bg-black/20">
        <div v-if="hasKey" ref="mapEl" class="absolute inset-0"></div>
        <template v-else>
            <div class="flex h-full w-full flex-col items-center justify-center gap-2 text-white/40">
                <Icon name="ion:map-outline" class="text-5xl" />
                <p class="text-sm text-white/60">Map view unavailable</p>
                <p class="px-6 text-center text-xs text-white/40">
                    Add <span class="font-mono text-emerald-300/80">NUXT_PUBLIC_GOOGLE_MAPS_KEY</span> to render the map.
                </p>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
    location: { type: Object, default: null },
})

const runtimeConfig = useRuntimeConfig()
const hasKey = computed(() => !!runtimeConfig.public.googleMapsKey)

const mapEl = ref(null)
let map = null
let marker = null
let apiPromise = null

const loadMaps = () => {
    if (apiPromise) return apiPromise
    const key = runtimeConfig.public.googleMapsKey
    if (!key) return Promise.reject(new Error('Google Maps key not configured'))
    if (window.google?.maps) return Promise.resolve(window.google.maps)
    apiPromise = new Promise((resolve, reject) => {
        const callbackName = '__gmapcb' + Math.random().toString(36).slice(2)
        window[callbackName] = () => resolve(window.google.maps)
        const script = document.createElement('script')
        script.async = true
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=${callbackName}`
        script.onerror = () => { delete window[callbackName]; reject(new Error('Failed to load Google Maps')) }
        document.head.appendChild(script)
    })
    return apiPromise
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }

const initMap = async () => {
    if (!hasKey.value || !mapEl.value || map) return
    try {
        const maps = await loadMaps()
        map = new maps.Map(mapEl.value, {
            center: DEFAULT_CENTER,
            zoom: 5,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            styles: [{ elementType: 'geometry', stylers: [{ color: '#212121' }] }],
        })
        renderMarker()
    } catch {
        // keep placeholder
    }
}

const renderMarker = () => {
    if (!map || !window.google?.maps) return
    const maps = window.google.maps
    if (marker) { marker.setMap(null); marker = null }
    const lat = Number(props.location?.latitude)
    const lng = Number(props.location?.longitude)
    const center = !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : DEFAULT_CENTER
    map.setCenter(center)
    map.setZoom(Number.isNaN(lat) || Number.isNaN(lng) ? 5 : 14)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return
    marker = new maps.Marker({ position: center, map, title: props.location?.name || '' })
    if (props.location?.name) {
        const info = new maps.InfoWindow({ content: props.location.name })
        info.open({ map, anchor: marker })
    }
}

watch(() => props.location, () => renderMarker())
onMounted(initMap)
onBeforeUnmount(() => { if (marker) marker.setMap(null) })
</script>