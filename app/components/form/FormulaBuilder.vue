<template>
    <div :class="[{ 'opacity-60 pointer-events-none': disabled }]"
        class="space-y-2 border border-white/20 p-2 rounded-lg">
        <!-- INPUT FIELD -->
        <FormInputArea rows="2" color="#fff" placeholder="e.g. gross * 0.5 or if(basic > 10000, 5000, 2000)"
            v-model="localFormula" @input="emitUpdate" />

        <!-- COMPONENT PICKER -->
        <div class="rounded-lg bg-white/10 border border-white/20 p-2">
            <div class="text-xs font-semibold text-white/60 mb-2">Insert Component</div>

            <div class="flex flex-wrap gap-2">

                <!-- Always Include GROSS -->
                <UiButton size="xs" color="#4aff7a" @click="insert('gross')">
                    Gross (Annual CTC)
                </UiButton>

                <!-- Dynamic Component List -->
                <UiButton size="xs" v-for="comp in components" :key="comp.key" small color="#4aff7a"
                    @click="insert(comp.key)">
                    {{ comp.name }}
                </UiButton>
            </div>
        </div>

        <!-- FUNCTION SHORTCUTS -->
        <div class="rounded-lg bg-white/10 border border-white/20 p-2">
            <div class="text-xs font-semibold text-white/60 mb-2">Formula Functions</div>

            <div class="flex flex-wrap gap-2">
                <UiButton class="grow" color="#fff" size="xs"
                    @click="insertFunction('(condition ? value_if_true : value_if_false)')">
                    IF()
                </UiButton>

                <UiButton class="grow" color="#fff" size="xs" @click="insertFunction('min(x, y)')">
                    MIN()
                </UiButton>

                <UiButton class="grow" color="#fff" size="xs" @click="insertFunction('max(x, y)')">
                    MAX()
                </UiButton>

                <UiButton class="grow" color="#fff" size="xs" @click="insertFunction('round(x)')">
                    ROUND()
                </UiButton>

                <UiButton class="grow" color="#fff" size="xs" @click="insertFunction('floor(x)')">
                    FLOOR()
                </UiButton>

                <UiButton class="grow" color="#fff" size="xs" @click="insertFunction('ceil(x)')">
                    CEIL()
                </UiButton>
            </div>
        </div>

        <!-- PREVIEW -->
        <!-- <div class="rounded-lg bg-white/5 border border-white/10 p-4">
            <div class="text-xs text-white/50 mb-1">Preview:</div>
            <pre class="text-white text-sm whitespace-pre-wrap">{{ prettyFormula }}</pre>
        </div> -->
    </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
    modelValue: { type: String, default: "" },
    components: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const localFormula = ref(props.modelValue);

/* -----------------------------------------------------
   Sync with external v-model
----------------------------------------------------- */
watch(
    () => props.modelValue,
    (v) => {
        localFormula.value = v;
    }
);

/* -----------------------------------------------------
   Emit updated formula to parent
----------------------------------------------------- */
const emitUpdate = () => {
    emit("update:modelValue", localFormula.value);
};

/* -----------------------------------------------------
   Smart Insert Logic
   - Adds operator if needed
   - Prevents collisions (grossmax → gross * max)
----------------------------------------------------- */
const insert = (text) => {
    let f = localFormula.value?.trim() || "";

    if (f.length > 0) {
        const last = f.slice(-1);

        // If last character is alphanumeric or ) then add " * "
        if (/[a-zA-Z0-9)]/.test(last)) {
            f += " * ";
        }
        // If it's not an operator, put a space
        else if (!["+", "-", "*", "/", "("].includes(last)) {
            f += " ";
        }
    }

    localFormula.value = f + text;
    emitUpdate();
};

/* -----------------------------------------------------
   Insert full function template (keep * logic)
----------------------------------------------------- */
const insertFunction = (fn) => {
    insert(fn);
};

/* -----------------------------------------------------
   Preview Formatter — adds readable spacing
----------------------------------------------------- */
const prettyFormula = computed(() => {
    if (!localFormula.value) return "";

    return localFormula.value
        .replace(/\*/g, " * ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " - ")
        .replace(/\//g, " / ")
        .replace(/\s+/g, " ")
        .trim();
});
</script>

<style scoped>
pre {
    font-family: "JetBrains Mono", monospace;
}
</style>
