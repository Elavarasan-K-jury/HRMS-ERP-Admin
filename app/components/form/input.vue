<template>
    <div class="relative select-none" :class="fullWidth ? 'w-full' : widthClass">
        <!-- Input Field -->
        <div class="group flex items-center gap-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,.25)] transition-all duration-200 focus-within:shadow-[0_12px_34px_rgba(0,0,0,.32)] border"
            :class="[roundedClass, sizeClass, { 'opacity-60 pointer-events-none': disabled }]" :style="fieldStyle">
            <!-- Prepend slot/icon -->
            <slot name="prepend">
                <Icon v-if="prependIcon" :name="prependIcon" class="opacity-90" />
            </slot>

            <!-- Input -->
            <input ref="inputRef" class="w-full bg-transparent outline-none placeholder:opacity-90"
                :class="inputTextClass" :value="modelValue" :placeholder="placeholder"
                :style="[placeholderStyle, { color: textColorFull }]" :disabled="disabled" :readonly="readonly"
                :aria-invalid="invalid ? 'true' : undefined" :aria-label="ariaLabel" v-bind="$attrs" @input="onInput"
                @focus="$emit('focus', $event)" @blur="$emit('blur', $event)"
                @keydown.enter="$emit('enter', modelValue)" @keydown.esc="onEscape" />

            <!-- Clear / Append slot/icon -->
            <button v-if="clearable && modelValue && !readonly && !disabled"
                class="rounded-lg flex items-center hover:bg-white/10 transition-colors"
                :style="{ color: textColorFull }" aria-label="Clear" type="button" @click="clear">
                <Icon name="ion:close-outline" class="text-lg" />
            </button>

            <slot name="append" v-else>
                <Icon v-if="appendIcon" :name="appendIcon" class="opacity-90" />
            </slot>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, useAttrs, defineExpose } from 'vue'

const props = defineProps({
    modelValue: { type: [String, Number], default: '' },
    placeholder: { type: String, default: 'Type here…' },

    /** Icons */
    prependIcon: { type: String, default: '' },
    appendIcon: { type: String, default: '' },
    clearable: { type: Boolean, default: true },

    /** Style (glass + accent) */
    color: { type: String, default: '#1b6594' },
    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    borderOpacity: { type: Number, default: 0.8 },
    blur: { type: Number, default: 16 },

    /** Shape & sizing */
    size: { type: String, default: 'md' }, // sm | md | lg
    rounded: { type: String, default: '2xl' }, // md | lg | xl | 2xl | full
    fullWidth: { type: Boolean, default: true },
    /** Accepts px/rem/%/ch etc.; use inline style to avoid Tailwind purge issues */
    width: { type: String, default: '320px' },

    /** State & a11y */
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    ariaLabel: { type: String, default: '' },
})
const widthClass = computed(() => `w-[${props.width}]`)

const emit = defineEmits([
    'update:modelValue',
    'focus',
    'blur',
    'clear',
    'enter',
])

const attrs = useAttrs()
const inputRef = ref(null)

/** Color utilities */
function toRGB(color) {
    const c = (color || '').trim().toLowerCase()
    if (c.startsWith('#')) {
        const full = c.slice(1).replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3')
        const n = Number.parseInt(full, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) return { r: +m[1], g: +m[2], b: +m[3] }
    return { r: 27, g: 101, b: 148 }
}

const rgb = computed(() => toRGB(props.color))
const textColor = computed(() => `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, .92)`)
const textColorFull = computed(() => `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 1)`)

const placeholderStyle = computed(() => ({
    '--ph-color': `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 0.55)`,
}))

/** Layout */
const containerStyle = computed(() => ({
    width: props.fullWidth ? '100%' : props.width,
}))

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

/** Glass style */
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

/** Behavior */
function onInput(e) {
    emit('update:modelValue', e.target.value)
}

function clear() {
    emit('update:modelValue', '')
    emit('clear')
    inputRef.value?.focus()
}

function onEscape(e) {
    if (props.clearable && String(props.modelValue).length && !props.readonly && !props.disabled) {
        e.preventDefault()
        clear()
    }
}

/** Expose methods */
function focus() {
    inputRef.value?.focus()
}
function blur() {
    inputRef.value?.blur()
}
defineExpose({ focus, blur, el: inputRef });
</script>

<style scoped>
input::placeholder {
    color: var(--ph-color);
    opacity: 0.9;
    transition: color 0.2s ease;
}

/* Style native date picker icons */
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) brightness(1.6);
    opacity: 0.85;
    cursor: pointer;
}

input[type="date"]::-webkit-clear-button,
input[type="date"]::-webkit-inner-spin-button {
    display: none;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
    filter: invert(1) brightness(2);
}


/* Hide arrows in number input (Chrome, Safari, Edge) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Hide arrows in Firefox */
input[type="number"] {
    -moz-appearance: textfield;
}
</style>
