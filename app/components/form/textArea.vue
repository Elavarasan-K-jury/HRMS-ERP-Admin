<template>
    <div class="relative select-none" :class="fullWidth ? 'w-full' : widthClass">
        <div class="rounded-lg overflow-hidden border shadow-[0_8px_30px_rgba(0,0,0,.25)] transition-all duration-200"
            :class="[roundedClass, { 'opacity-60 pointer-events-none': disabled }]" :style="editorWrapperStyle">
            <!-- Quill mounts its toolbar automatically here -->
            <div ref="editorRef" class="quill-editor"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";

/* Theme props */
const props = defineProps({
    modelValue: String,
    color: { type: String, default: "#ffffff" },

    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    borderOpacity: { type: Number, default: 0.2 },
    blur: { type: Number, default: 16 },

    rounded: { type: String, default: "lg" },
    fullWidth: { type: Boolean, default: false },
    width: { type: String, default: "100%" },

    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const editorRef = ref(null);
let quill = null;

/* Convert hex → rgb */
function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const rgb = computed(() => hexToRgb(props.color));

const roundedClass = computed(() => ({
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
}[props.rounded] || "rounded-2xl"));

const widthClass = computed(() => `w-[${props.width}]`);

const editorWrapperStyle = computed(() => {
    const { r, g, b } = rgb.value;
    return {
        background: `linear-gradient(
      to bottom right,
      rgba(255,255,255,${props.frostOpacity}),
      transparent
    ),
    rgba(${r},${g},${b},${props.fillOpacity})`,
        backdropFilter: `blur(${props.blur}px)`,
        borderColor: `rgba(${r},${g},${b},${props.borderOpacity})`,
    };
});

onMounted(() => {
    const { $quill } = useNuxtApp();

    quill = new $quill(editorRef.value, {
        theme: "snow", // 👉 KEEP DEFAULT TOOLBAR
        modules: {
            toolbar: true,
        },
    });

    quill.root.innerHTML = props.modelValue ?? "";

    quill.on("text-change", () =>
        emit("update:modelValue", quill.root.innerHTML)
    );
});

watch(
    () => props.modelValue,
    (v) => {
        if (quill && quill.root.innerHTML !== v) {
            quill.root.innerHTML = v;
        }
    }
);
</script>

<style scoped>
/* White Text */
.quill-editor :deep(.ql-editor) {
    color: white !important;
    height: 150px;
}

/* Placeholder */
.quill-editor :deep(.ql-editor.ql-blank::before) {
    color: transparent !important;
}

/* Default toolbar background but themed */
.quill-editor :deep(.ql-toolbar) {
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(10px);
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25) !important;
}

/* Buttons & Icons white */
.quill-editor :deep(.ql-stroke),
.quill-editor :deep(.ql-fill),
.quill-editor :deep(.ql-picker-label),
.quill-editor :deep(.ql-picker-item) {
    stroke: white !important;
    fill: white !important;
    color: white !important;
}

/* Dropdown caret */
.quill-editor :deep(.ql-picker:not(.ql-color-picker) svg) {
    stroke: white !important;
}

/* Hover */
.quill-editor :deep(.ql-toolbar button:hover),
.quill-editor :deep(.ql-toolbar .ql-picker:hover) {
    filter: brightness(1.4);
}
</style>
