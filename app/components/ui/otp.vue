<template>
    <div class="flex justify-evenly" :class="gapClass" role="group" aria-label="One-time password">
        <input v-for="(d, i) in length" :key="i" ref="cells" :value="digits[i]" :aria-label="`Digit ${i + 1}`"
            :inputmode="numeric ? 'numeric' : 'text'" :pattern="numeric ? '[0-9]*' : undefined" :maxlength="1"
            :disabled="disabled" :readonly="readonly" autocomplete="one-time-code"
            class="otp-cell text-center font-semibold outline-none transition-all duration-200 ease-in-out" :class="[
                sizeClass,
                roundedClass,
                error ? 'ring-2 ring-red-400/70' : 'border',
                'shadow-lg focus:shadow-xl focus:outline-none',
                'placeholder-opacity-70'
            ]" placeholder="1" :style="cellStyle" @input="onInput($event, i)" @keydown="onKeydown($event, i)"
            @paste="onPaste($event, i)" @focus="onFocus(i)" @click="onClick(i)" />
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
    length: { type: Number, default: 6 },
    modelValue: { type: String, default: '' },
    numeric: { type: Boolean, default: true },
    autofocus: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
    rounded: { type: String, default: 'lg' },
    gap: { type: String, default: 'md' },
    error: { type: Boolean, default: false },
    color: { type: String, default: '#fff' },
    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    borderOpacity: { type: Number, default: 0.8 },
    blur: { type: Number, default: 16 },
})

const emit = defineEmits(['update:modelValue', 'complete', 'input'])

const digits = ref(Array.from({ length: props.length }, (_, i) => props.modelValue[i] || ''))
const cells = ref([])

watch(() => props.modelValue, (v) => {
    const str = String(v || '')
    digits.value = Array.from({ length: props.length }, (_, i) => str[i] || '')
})

watch(() => props.length, (n) => {
    const current = (digits.value.join('') || '')
    digits.value = Array.from({ length: n }, (_, i) => current[i] || '')
})

const sizeClass = computed(() => ({
    sm: 'w-9 h-10 text-base',
    md: 'w-11 h-12 text-lg',
    lg: 'w-14 h-16 text-2xl',
}[props.size] || 'w-11 h-12 text-lg'))

const roundedClass = computed(() => ({
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
}[props.rounded] || 'rounded-2xl'))

const gapClass = computed(() => ({
    xs: 'gap-1.5',
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
}[props.gap] || 'gap-2.5'))

const cellStyle = computed(() => {
    const rgb = toRGB(props.color)
    return {
        background: `linear-gradient(to bottom right, rgba(255,255,255,${props.frostOpacity}), transparent),
                 rgba(${rgb.r},${rgb.g},${rgb.b},${props.fillOpacity})`,
        borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},${props.borderOpacity})`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        color: `rgba(${rgb.r},${rgb.g},${rgb.b},1)`,
    }
})

function toRGB(c) {
    const x = (c || '').trim().toLowerCase()
    if (x.startsWith('#')) {
        const full = x.slice(1).replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3')
        const n = parseInt(full, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    return { r: 27, g: 101, b: 148 }
}

const joinValue = () => digits.value.join('')
function setDigit(i, val) {
    digits.value[i] = val
    const v = joinValue()
    emit('update:modelValue', v)
    emit('input', v)
    if (!v.includes('') && v.length === props.length) {
        emit('complete', v)
    }
}

function onInput(e, i) {
    let val = e.target.value || ''
    if (props.numeric) val = val.replace(/\D/g, '')
    val = val.slice(-1) // keep last typed char
    setDigit(i, val)

    // move next if typed a char
    if (val && i < props.length - 1) focusCell(i + 1)
    // keep caret at end
    nextTick(() => e.target.setSelectionRange(1, 1))
}

function onKeydown(e, i) {
    const k = e.key
    const atStart = e.target.selectionStart === 0
    const atEnd = e.target.selectionStart === 1

    if (k === 'Backspace') {
        if (digits.value[i]) {
            setDigit(i, '')
        } else if (i > 0 && atStart) {
            focusCell(i - 1)
            setTimeout(() => { digits.value[i - 1] = ''; emit('update:modelValue', joinValue()) }, 0)
        }
        e.preventDefault()
    } else if (k === 'ArrowLeft' && i > 0) {
        focusCell(i - 1); e.preventDefault()
    } else if (k === 'ArrowRight' && i < props.length - 1) {
        focusCell(i + 1); e.preventDefault()
    } else if (k === 'Enter') {
        const v = joinValue()
        if (v.length === props.length && !v.includes('')) emit('complete', v)
    } else if (props.numeric && /^[0-9]$/.test(k)) {
        setDigit(i, k)
        if (i < props.length - 1) focusCell(i + 1)
        e.preventDefault()
    }
}

function onPaste(e, i) {
    const text = (e.clipboardData?.getData('text') || '').trim()
    let data = props.numeric ? text.replace(/\D/g, '') : text
    if (!data) return e.preventDefault()

    const arr = data.slice(0, props.length - i).split('')
    arr.forEach((ch, idx) => {
        setDigit(i + idx, ch.slice(0, 1))
    })
    const nextIndex = Math.min(i + arr.length, props.length - 1)
    focusCell(nextIndex)
    e.preventDefault()
}

function onFocus(i) {
    const el = cells.value[i]
    if (el) el.select?.()
}

function onClick(i) {
    focusCell(i)
}

function focusCell(i) {
    const el = cells.value[i]
    if (el) el.focus()
}

onMounted(async () => {
    if (!props.autofocus || props.disabled) return
    await nextTick()
    focusCell(0)
});
</script>

<style scoped>
.otp-cell {
    @apply text-center font-semibold outline-none transition-all duration-200 ease-in-out shadow-lg focus:shadow-xl focus:outline-none placeholder-opacity-70;
}

.otp-cell:disabled {
    @apply opacity-60 cursor-not-allowed;
}

.otp-cell::-webkit-outer-spin-button,
.otp-cell::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
