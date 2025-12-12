<template>
    <div class="relative select-none" :class="fullWidth ? 'w-full' : widthClass">

        <!-- TEXTAREA WRAPPER -->
        <div class="group flex items-start gap-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,.25)]
                    transition-all duration-200 focus-within:shadow-[0_12px_34px_rgba(0,0,0,.32)]
                    border" :class="[roundedClass, sizeClass, { 'opacity-60 pointer-events-none': disabled }]"
            :style="fieldStyle">

            <!-- Prepend Icon / Slot -->
            <slot name="prepend">
                <Icon v-if="prependIcon" :name="prependIcon" class="mt-1 opacity-90" />
            </slot>

            <!-- TEXTAREA -->
            <textarea ref="textRef" class="w-full bg-transparent resize-none outline-none placeholder:opacity-70"
                :class="textClass" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
                :readonly="readonly" :aria-invalid="invalid ? 'true' : undefined" :aria-label="ariaLabel"
                @input="onInput" @focus="$emit('focus', $event)" @blur="$emit('blur', $event)"
                @keydown.enter="$emit('enter', modelValue)" @keydown.esc="onEscape" v-bind="$attrs"></textarea>

            <!-- CLEAR BUTTON -->
            <button v-if="clearable && modelValue && !readonly && !disabled"
                class="rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors mt-1"
                :style="{ color: textColorFull }" aria-label="Clear" type="button" @click="clear">
                <Icon name="ion:close-outline" class="text-lg" />
            </button>

            <!-- Append Slot -->
            <slot name="append" v-else>
                <Icon v-if="appendIcon" :name="appendIcon" class="mt-1 opacity-90" />
            </slot>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, useAttrs, defineExpose, watch, nextTick } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Type here…' },

    /** Icons */
    prependIcon: { type: String, default: '' },
    appendIcon: { type: String, default: '' },
    clearable: { type: Boolean, default: true },

    /** Style */
    color: { type: String, default: '#1b6594' },
    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    borderOpacity: { type: Number, default: 0.8 },
    blur: { type: Number, default: 16 },

    /** Shape & Sizing */
    size: { type: String, default: 'md' }, // sm | md | lg
    rounded: { type: String, default: 'lg' },
    fullWidth: { type: Boolean, default: true },
    width: { type: String, default: '100%' },

    /** Auto resize */
    autoResize: { type: Boolean, default: true },
    minHeight: { type: String, default: '48px' },

    /** State */
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },

    ariaLabel: { type: String, default: '' },
});

const emit = defineEmits([
    'update:modelValue',
    'focus',
    'blur',
    'enter',
    'clear'
]);

const attrs = useAttrs();
const textRef = ref(null);

/** Width class */
const widthClass = computed(() => `w-[${props.width}]`);

/** Helper: convert color to RGB */
function toRGB(color) {
    const c = (color || '').trim().toLowerCase();
    if (c.startsWith('#')) {
        const full = c.slice(1).replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3');
        const n = parseInt(full, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    return { r: 27, g: 101, b: 148 };
}

const rgb = computed(() => toRGB(props.color));
const textColorFull = computed(() => `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 1)`);

/** Textarea classes */
const sizeClass = computed(() =>
({
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
}[props.size])
);

const textClass = computed(() =>
({
    sm: 'text-xs leading-tight',
    md: 'text-sm leading-snug',
    lg: 'text-base leading-normal',
}[props.size])
);

/** Rounded */
const roundedClass = computed(() =>
({
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
}[props.rounded])
);

/** Glass style */
const fieldStyle = computed(() => {
    const { r, g, b } = rgb.value;
    const fill = `rgba(${r}, ${g}, ${b}, ${props.fillOpacity})`;
    const frost = `rgba(255,255,255,${props.frostOpacity})`;
    const border = `rgba(${r}, ${g}, ${b}, ${props.borderOpacity})`;

    return {
        color: textColorFull.value,
        background: `linear-gradient(to bottom right, ${frost}, transparent), ${fill}`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        borderColor: border,
        minHeight: props.minHeight,
    };
});

/** Input event */
function onInput(e) {
    emit('update:modelValue', e.target.value);
    resizeIfNeeded();
}

function clear() {
    emit('update:modelValue', '');
    emit('clear');
    nextTick(() => textRef.value?.focus());
}

function onEscape(e) {
    if (props.clearable && props.modelValue && !props.readonly && !props.disabled) {
        e.preventDefault();
        clear();
    }
}

/** Auto resize logic */
function resizeIfNeeded() {
    if (!props.autoResize) return;

    nextTick(() => {
        const el = textRef.value;
        if (!el) return;

        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    });
}

/** Auto-resize on load */
watch(() => props.modelValue, () => resizeIfNeeded());
nextTick(() => resizeIfNeeded());

/** Expose methods */
function focus() { textRef.value?.focus(); }
function blur() { textRef.value?.blur(); }
defineExpose({ focus, blur, el: textRef });
</script>

<style scoped>
textarea::placeholder {
    color: rgba(255, 255, 255, 0.45);
    transition: opacity 0.2s ease;
}

textarea:focus::placeholder {
    opacity: 0.25;
}
</style>
