<template>
    <div class="relative select-none" :class="fullWidth ? 'w-full' : widthClass">
        <!-- Field -->
        <div ref="fieldRef"
            class="group flex items-center gap-2 rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,.25)] transition-all duration-200 focus-within:shadow-[0_12px_34px_rgba(0,0,0,.32)]"
            :class="[roundedClass, sizeClass]" :style="fieldStyle" @click="toggle">
            <!-- Prepend icon / slot -->
            <slot name="prepend">
                <Icon v-if="prependIcon" :name="prependIcon" class="opacity-90" />
            </slot>

            <!-- Selected items -->
            <div class="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                <template v-if="multiple && innerValue.length">
                    <span v-for="(val, i) in innerValue" :key="i"
                        class="px-2 py-0.5 bg-white/10 rounded-lg text-xs flex items-center gap-1">
                        {{ labelOf(val) }}
                        <button type="button" class="text-white/70 hover:text-white" @click.stop="remove(val)">
                            <Icon name="lucide:x" class="w-3 h-3" />
                        </button>
                    </span>
                </template>

                <span v-else-if="!multiple && innerValue" class="truncate opacity-95">
                    {{ labelOf(innerValue) }}
                </span>

                <span v-else class="opacity-60" :style="placeholderStyle">
                    {{ placeholder }}
                </span>
            </div>

            <!-- Clear / caret -->
            <button v-if="clearable && hasValue"
                class="flex items-center rounded-lg hover:bg-white/10 transition-colors" @click.stop="clear">
                <Icon name="ion:close-outline" class="text-lg" />
            </button>
            <Icon v-else :name="open ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                class="opacity-80 transition-transform" />
        </div>

        <!-- Dropdown -->
        <transition name="fade-scale">
            <Teleport to="body" v-if="open">
                <div ref="menuRef" class="ui-select-menu fixed z-[99999] rounded-lg border shadow-2xl overflow-hidden"
                    :style="portalMenuStyle" @mousedown.stop>
                    <div v-if="searchable" class="px-3 py-2 border-b border-white/10 bg-white/5 sticky top-0 z-10">
                        <input v-model="query" placeholder="Search..."
                            class="w-full bg-transparent outline-none placeholder-white/50 text-sm text-white" />
                    </div>

                    <ul class="overflow-y-auto glass-scroll space-y-0.5 px-1"
                        :style="{ maxHeight: `${dynamicHeight}px` }">
                        <li v-for="(opt, i) in filteredOptions" :key="keyOf(opt, i)"
                            class="px-3.5 py-2.5 rounded-lg flex items-start gap-2 transition-colors" :class="[
                                isOptionDisabled(opt)
                                    ? 'opacity-40 cursor-not-allowed'
                                    : isSelected(opt)
                                        ? 'bg-white/10 cursor-pointer'
                                        : 'hover:bg-white/5 cursor-pointer',
                            ]" @click="!isOptionDisabled(opt) && choose(opt)">
                            <Icon v-if="opt.icon" :name="opt.icon" class="opacity-90 w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span class="text-sm flex-1 leading-snug text-white option-label">
                                {{ labelOf(opt) }}
                            </span>
                            <Icon v-if="isSelected(opt)" name="lucide:check" class="w-4 h-4 opacity-90" />
                        </li>

                        <li v-if="!filteredOptions.length" class="px-4 py-3 text-sm text-white/60 text-center">
                            No results found
                        </li>
                    </ul>
                </div>
            </Teleport>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
    modelValue: [String, Array, Object, Number, null],
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Select an option' },
    multiple: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    clearable: { type: Boolean, default: true },
    prependIcon: { type: String, default: '' },
    color: { type: String, default: '#1b6594' },
    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    borderOpacity: { type: Number, default: 0.8 },
    blur: { type: Number, default: 16 },
    size: { type: String, default: 'md' },
    rounded: { type: String, default: '2xl' },
    fullWidth: { type: Boolean, default: true },
    width: { type: String, default: '320px' },
    hideSelected: { type: Boolean, default: false }, // NEW: Hide already selected options
})

const emit = defineEmits(['update:modelValue', 'select', 'clear'])
const open = ref(false)
const query = ref('')
const menuRef = ref(null)
const fieldRef = ref(null)
const dropUp = ref(false)
const menuRect = ref({ top: 0, left: 0, width: 0 })
const dynamicHeight = ref(200)

/* Internal model */
const innerValue = computed({
    get: () => (props.multiple ? props.modelValue || [] : props.modelValue),
    set: (v) => emit('update:modelValue', v),
})

/* Helpers */
const labelOf = (o) => (o == null ? '' : typeof o === 'string' ? o : o.label ?? o.value ?? '')
const valueOf = (o) => (o == null ? '' : typeof o === 'string' ? o : o.value ?? o.label ?? '')
const keyOf = (o, i) => (o == null ? i : valueOf(o) ?? i)

/* Colors + Styles */
function toRGB(c) {
    const clr = c.trim().toLowerCase()
    if (clr.startsWith('#')) {
        const full = clr.slice(1).replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3')
        const n = Number.parseInt(full, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    return { r: 27, g: 101, b: 148 }
}
const rgb = computed(() => toRGB(props.color))
const textColorFull = computed(() => `rgba(${rgb.value.r},${rgb.value.g},${rgb.value.b},1)`)
const placeholderStyle = computed(() => ({
    color: `rgba(${rgb.value.r},${rgb.value.g},${rgb.value.b},0.6)`,
}))
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
const fieldStyle = computed(() => {
    const { r, g, b } = rgb.value
    return {
        background: `linear-gradient(to bottom right, rgba(255,255,255,${props.frostOpacity}), transparent),
             rgba(${r},${g},${b},${props.fillOpacity})`,
        borderColor: `rgba(${r},${g},${b},${props.borderOpacity})`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        color: textColorFull.value,
    }
})
const menuStyle = computed(() => ({
    background: `rgba(20,20,30,0.9)`,
    borderColor: `rgba(${rgb.value.r},${rgb.value.g},${rgb.value.b},${props.borderOpacity})`,
    backdropFilter: `blur(${props.blur}px)`,
    WebkitBackdropFilter: `blur(${props.blur}px)`,
    boxShadow: '0 4px 40px rgba(0,0,0,0.45)',
}))
const portalMenuStyle = computed(() => ({
    top: `${menuRect.value.top}px`,
    left: `${menuRect.value.left}px`,
    width: `${menuRect.value.width}px`,
    ...menuStyle.value,
}))

/* Logic - ENHANCED */
const isOptionDisabled = (opt) => {
    // Check if option has disabled property set to true
    if (opt && typeof opt === 'object' && opt.disabled === true) {
        return true
    }

    // Check if option has selected property set to true
    if (opt && typeof opt === 'object' && opt.selected === true) {
        return true
    }

    // If hideSelected is enabled and option is already selected, treat as disabled
    if (props.hideSelected && isSelected(opt)) {
        return true
    }

    return false
}

const filteredOptions = computed(() => {
    const q = query.value.toLowerCase()
    let opts = q ? props.options.filter((o) => labelOf(o).toLowerCase().includes(q)) : props.options

    // If hideSelected is true, filter out already selected options
    if (props.hideSelected) {
        opts = opts.filter(opt => !isSelected(opt))
    }

    return opts
})

const hasValue = computed(() => (props.multiple ? innerValue.value.length > 0 : !!innerValue.value))

async function toggle() {
    if (open.value) {
        open.value = false
        removeGlobalListeners()
        return
    }
    open.value = true
    await nextTick()
    positionMenu()
    addGlobalListeners()
}

function positionMenu() {
    const el = fieldRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    const spaceBelow = vh - rect.bottom
    const spaceAbove = rect.top
    const maxH = Math.min(200, vh * 0.4)
    dropUp.value = spaceBelow < maxH && spaceAbove > spaceBelow
    dynamicHeight.value = dropUp.value ? Math.min(spaceAbove - 16, maxH) : Math.min(spaceBelow - 16, maxH)
    const top = dropUp.value ? rect.top - dynamicHeight.value - 4 : rect.bottom + 4
    menuRect.value = { top, left: rect.left, width: rect.width }
}

function clear() {
    emit('update:modelValue', props.multiple ? [] : null)
    emit('clear')
}

function choose(opt) {
    // Don't allow selection if disabled
    if (isOptionDisabled(opt)) return

    if (props.multiple) {
        const exists = innerValue.value.some((v) => valueOf(v) === valueOf(opt))
        innerValue.value = exists
            ? innerValue.value.filter((v) => valueOf(v) !== valueOf(opt))
            : [...innerValue.value, opt]
    } else {
        innerValue.value = opt
        open.value = false
        removeGlobalListeners()
    }
    emit('select', opt)
}

function remove(opt) {
    innerValue.value = innerValue.value.filter((v) => valueOf(v) !== valueOf(opt))
}

function isSelected(opt) {
    return props.multiple
        ? innerValue.value.some((v) => valueOf(v) === valueOf(opt))
        : valueOf(innerValue.value) === valueOf(opt)
}

/* Outside + events */
function onClickOutside(e) {
    if (!open.value) return
    const m = menuRef.value
    const f = fieldRef.value
    if (m?.contains(e.target) || f?.contains(e.target)) return
    open.value = false
    removeGlobalListeners()
}
function onScrollOrResize() {
    if (open.value) positionMenu()
}
function addGlobalListeners() {
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
}
function removeGlobalListeners() {
    document.removeEventListener('mousedown', onClickOutside)
    window.removeEventListener('scroll', onScrollOrResize, true)
    window.removeEventListener('resize', onScrollOrResize)
}
onBeforeUnmount(() => removeGlobalListeners());
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.98) translateY(-4px);
}

/* Scroll styling */
.glass-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.glass-scroll::-webkit-scrollbar {
    width: 6px;
}

.glass-scroll::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.15);
}

.glass-scroll::-webkit-scrollbar-track {
    background: transparent;
}

/* Dropdown panel */
.ui-select-menu {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: rgba(20, 20, 30, 0.65) !important;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 40px rgba(0, 0, 0, 0.45);
    color: #fff;
    z-index: 999999 !important;
}

/* Option text */
.option-label {
    white-space: normal;
    word-break: break-word;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* Hover & active */
ul li:hover:not(.opacity-40) {
    background: rgba(255, 255, 255, 0.08);
}

ul li.bg-white\/10 {
    background: rgba(255, 255, 255, 0.14) !important;
}

/* Disabled state enhancement */
ul li.opacity-40 {
    pointer-events: none;
    filter: grayscale(0.5);
}

/* Search input */
.ui-select-menu input {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 6px 10px;
    color: white;
}

.ui-select-menu input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}
</style>