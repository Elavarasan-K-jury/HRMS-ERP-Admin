<template>
    <div class="relative select-none" :class="fullWidth ? 'w-full' : widthClass">
        <!-- Field (glass) -->
        <div class="group flex items-center gap-2 rounded-2xl
             shadow-[0_8px_30px_rgba(0,0,0,.25)]
             transition-all duration-200
             focus-within:shadow-[0_12px_34px_rgba(0,0,0,.32)]
             border" :class="[roundedClass, sizeClass]" :style="fieldStyle" @click="focusInput">
            <!-- Prepend slot/icon -->
            <slot name="prepend">
                <Icon v-if="prependIcon" :name="prependIcon" class="opacity-90" />
            </slot>

            <!-- Input -->
            <input ref="inputRef" class="w-full bg-transparent outline-none placeholder:opacity-90"
                :class="inputTextClass" :value="modelValue" :placeholder="placeholder"
                :aria-expanded="open && innerSuggestions.length > 0 ? 'true' : 'false'" aria-haspopup="listbox"
                :aria-activedescendant="activeId" @input="onInput" @focus="open = true" @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)" @keydown.enter.prevent="enter" @keydown.esc="hide"
                :style="[placeholderStyle, { color: textColorFull }]" />

            <!-- Loading / Clear / Append slot/icon -->
            <Icon v-if="loading" name="ion:sync-outline" class="animate-spin opacity-90" />
            <button v-else-if="clearable && modelValue"
                class="p-1 flex items-center rounded-lg hover:bg-white/10 transition-colors"
                :style="{ color: textColorFull }" aria-label="Clear" @click="clear">
                <Icon name="ion:close-outline" class="text-lg" />
            </button>

            <slot name="append" v-else>
                <Icon v-if="appendIcon" :name="appendIcon" class="opacity-90" />
            </slot>
        </div>

        <!-- Suggestions -->
        <transition name="fade-scale">
            <ul v-if="open && innerSuggestions.length" ref="listRef" role="listbox"
                class="absolute mt-2 left-0 right-0 z-[60] rounded-2xl overflow-hidden border shadow-2xl"
                :style="menuStyle">
                <li v-for="(s, i) in innerSuggestions" :key="keyOf(s, i)" :id="idOf(i)" role="option"
                    :aria-selected="i === active" @mousedown.prevent="choose(s)" @mouseenter="active = i"
                    class="px-3.5 py-2.5 cursor-pointer flex items-center gap-2 transition-colors"
                    :class="i === active ? 'bg-white/10' : ''" :style="{ color: textColorFull }">
                    <Icon :name="s.icon || 'ion:search-outline'" class="opacity-90" />
                    <div class="min-w-0">
                        <p class="text-sm opacity-95 truncate">
                            <slot name="option-label" :option="s">{{ labelOf(s) }}</slot>
                        </p>
                        <p v-if="descOf(s)" class="text-xs opacity-70 truncate">
                            <slot name="option-desc" :option="s">{{ descOf(s) }}</slot>
                        </p>
                    </div>
                </li>
            </ul>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/** Props */
const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search…' },

    // Icons / slots
    prependIcon: { type: String, default: 'ion:search-outline' },
    appendIcon: { type: String, default: '' },

    // Suggestions list
    suggestions: { type: Array, default: () => [] }, // string or {label, value, icon, desc}
    debounce: { type: Number, default: 200 },
    loading: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },

    // Style (glass + accent)
    color: { type: String, default: '#1b6594' }, // accent
    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    borderOpacity: { type: Number, default: 0.8 },
    blur: { type: Number, default: 16 },

    // Shape
    size: { type: String, default: 'md' }, // sm | md | lg
    rounded: { type: String, default: '2xl' }, // md | lg | xl | 2xl | full
    fullWidth: { type: Boolean, default: true },
    width: { type: String, default: '320px' }, // used when fullWidth=false
})

/** Emits */
const emit = defineEmits(['update:modelValue', 'search', 'select', 'focus', 'blur'])

/** State */
const open = ref(false)
const active = ref(-1)
const inputRef = ref(null)
const listRef = ref(null)
let t = null

/** Suggestions helpers */
const innerSuggestions = computed(() => props.suggestions ?? [])
const labelOf = (s) => (typeof s === 'string' ? s : s.label ?? s.value ?? '')
const valueOf = (s) => (typeof s === 'string' ? s : s.value ?? s.label ?? '')
const descOf = (s) => (typeof s === 'string' ? '' : s.desc ?? '')
const keyOf = (s, i) => (typeof s === 'string' ? s : s.key ?? s.value ?? s.label) ?? i
const idOf = (i) => `gs-opt-${i}`
const activeId = computed(() => (active.value >= 0 ? idOf(active.value) : undefined))

/** Color utils */
function toRGB(color) {
    const c = (color || '').trim().toLowerCase()
    if (c.startsWith('#')) {
        const full = c.slice(1).replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3')
        const n = Number.parseInt(full, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) return { r: +m[1], g: +m[2], b: +m[3] }
    return { r: 27, g: 101, b: 148 } // fallback brand-500
}

const rgb = computed(() => toRGB(props.color))
const textColor = computed(() => `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, .92)`)
const textColorFull = computed(() => `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 1)`)

/** Placeholder dynamic color */
const placeholderStyle = computed(() => ({
    '--ph-color': `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 0.55)`,
}))

/** Layout + sizing */
const widthClass = computed(() => `w-[${props.width}]`)
const roundedClass = computed(
    () =>
    ({
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
    }[props.rounded] || 'rounded-2xl')
)
const sizeClass = computed(
    () =>
    ({
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    }[props.size] || 'px-4 py-2 text-sm')
)
const inputTextClass = computed(
    () =>
    ({
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    }[props.size] || 'text-sm')
)

/** Glass styles */
const fieldStyle = computed(() => {
    const { r, g, b } = rgb.value
    const fill = `rgba(${r},${g},${b},${props.fillOpacity})`
    const frost = `rgba(255,255,255,${props.frostOpacity})`
    const border = `rgba(${r},${g},${b},${props.borderOpacity})`
    return {
        color: textColor.value,
        background: `linear-gradient(to bottom right, ${frost}, transparent), ${fill}`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        borderColor: border,
    }
})
const menuStyle = computed(() => {
    const { r, g, b } = rgb.value
    return {
        color: textColor.value,
        background: `linear-gradient(to bottom right, rgba(255,255,255,.06), transparent), rgba(${r},${g},${b},${props.fillOpacity})`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        borderColor: `rgba(${r},${g},${b},${props.borderOpacity})`,
    }
})

/** Behavior */
function onInput(e) {
    const v = e.target.value
    emit('update:modelValue', v)
    open.value = true
    clearTimeout(t)
    t = setTimeout(() => emit('search', v), props.debounce)
}
function move(dir) {
    if (!innerSuggestions.value.length) {
        active.value = -1
        return
    }
    open.value = true
    const n = innerSuggestions.value.length
    active.value = (active.value + dir + n) % n
    const el = listRef.value?.children?.[active.value]
    el && el.scrollIntoView({ block: 'nearest' })
}
function enter() {
    if (active.value >= 0 && innerSuggestions.value[active.value] != null) {
        choose(innerSuggestions.value[active.value])
    } else {
        emit('search', String(props.modelValue || ''))
        open.value = false
    }
}
function hide() {
    open.value = false
    active.value = -1
}
function clear() {
    emit('update:modelValue', '')
    emit('search', '')
    active.value = -1
    open.value = false
}
function choose(s) {
    emit('update:modelValue', labelOf(s))
    emit('select', s)
    open.value = false
}
function focusInput() {
    inputRef.value?.focus()
}

/** Global shortcut: Cmd/Ctrl + K */
function onKey(e) {
    const k = e.key.toLowerCase()
    if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault()
        focusInput()
        open.value = true
    }
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

/** Close on outside click */
function onClickOutside(e) {
    if (!open.value) return
    const root = listRef.value?.parentElement
    if (root && !root.contains(e.target)) hide()
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
    transform-origin: top left;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.98) translateY(-4px);
}

/* Placeholder inherits dynamic accent color */
input::placeholder {
    color: var(--ph-color);
    opacity: 0.9;
    transition: color 0.2s ease;
}
</style>
