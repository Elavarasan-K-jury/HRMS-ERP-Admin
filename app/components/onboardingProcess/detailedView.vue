<template>
    <UiSidebarModal v-model="open" :title="process?.name" size="xl">
        <template #default>
            <div v-if="process" class="scroll-area cv-auto text-white/90">
                <!-- 🧩 Process Info -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:list" class="ic" /> Onboarding Info
                    </h2>
                    <div class="grid2">
                        <div><span class="label">Name</span>{{ process.name || '—' }}</div>
                        <div><span class="label">Estimated Days</span>{{ process.estimated_days || '—' }}</div>
                        <div class="col2">
                            <span class="label">Description</span>{{ process.description || '—' }}
                        </div>
                    </div>
                </section>

                <!-- 🏢 Organization -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:building" class="ic" /> Organization
                    </h2>
                    <div class="grid2">
                        <div><span class="label">Organization ID</span>{{ process.organization_id || '—' }}</div>
                        <div><span class="label">Organization Name</span>{{ process.organization?.name || '—' }}</div>
                    </div>
                </section>

                <!-- 🪜 Steps -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:workflow" class="ic" /> Steps
                    </h2>

                    <div v-if="process.steps_list?.length" class="list">
                        <div v-for="(step, sIdx) in process.steps_list" :key="step.id" class="row-step">
                            <div class="step-head" @click="toggleStep(sIdx)">
                                <div class="step-title">
                                    <Icon :name="expandedSteps[sIdx] ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                                        class="w-4 h-4 opacity-80" />
                                    <span class="nm">{{ step.name }}</span>
                                    <span class="meta ml-2">Features: {{ step.features?.length || 0 }}</span>
                                </div>
                                <span class="meta">{{ step.created_at }}</span>
                            </div>

                            <!-- Features -->
                            <transition name="fade">
                                <div v-if="expandedSteps[sIdx]" class="features-grid">
                                    <div v-for="feat in step.features" :key="feat.id" class="feature-item">
                                        <div class="ft-head">
                                            <span class="ft-name">{{ feat.feature_name }}</span>
                                            <span class="ft-type">{{ feat.feature_type }}</span>
                                        </div>
                                        <div class="ft-meta">
                                            <span>Has Options:
                                                <strong>{{ feat.has_options ? 'Yes' : 'No' }}</strong></span>
                                            <div v-if="feat.has_options" class="ft-options">
                                                <span v-for="opt in parseOptions(feat.options)" :key="opt" class="opt">
                                                    {{ opt }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>
                    <div v-else class="muted">No steps found.</div>
                </section>

                <!-- 🕒 Meta -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:calendar-clock" class="ic" /> Metadata
                    </h2>
                    <div class="grid2">
                        <div><span class="label">Created</span>{{ process.created_at }}</div>
                        <div><span class="label">Updated</span>{{ process.updated_at }}</div>
                        <div><span class="label">Process ID</span>{{ process.id }}</div>
                    </div>
                </section>
            </div>

            <div v-else class="center">
                <Icon name="lucide:loader-2" class="spin ic" /> Loading onboarding details...
            </div>
        </template>

        <template #footer>
            <div class="footer">
                <UiButton text="Close" color="#4aff7a" @click="open = false" />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    process: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

const expandedSteps = ref({})

function toggleStep(i) {
    expandedSteps.value[i] = !expandedSteps.value[i]
}

function parseOptions(optString) {
    try {
        const arr = JSON.parse(optString)
        return Array.isArray(arr) ? arr : []
    } catch {
        return []
    }
}

function formatDate(date) {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    } catch {
        return date
    }
}
</script>

<style scoped>
.scroll-area {
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable;
}

.cv-auto>section {
    content-visibility: auto;
    contain-intrinsic-size: 1px 600px;
}

.blk {
    padding: 6px 0;
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 4px;
    margin-bottom: 6px;
}

.ic {
    width: 16px;
    height: 16px;
    opacity: 0.85;
}

.grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
    font-size: 13.5px;
    line-height: 1.35;
}

.grid2 .col2 {
    grid-column: 1 / -1;
}

.label {
    display: block;
    font-size: 10.5px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 2px;
}

/* Step List */
.list {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.row-step {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.row-step:last-child {
    border-bottom: none;
}

.step-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
}

.step-head:hover {
    background: rgba(255, 255, 255, 0.05);
}

.step-title {
    display: flex;
    align-items: center;
    gap: 6px;
}

.nm {
    font-weight: 600;
    color: #fff;
    font-size: 13.5px;
}

.meta {
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.65);
}

/* Features grid */
.features-grid {
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
    padding: 8px 10px;
}

.feature-item {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 8px;
}

.ft-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
}

.ft-name {
    font-weight: 600;
    font-size: 13px;
}

.ft-type {
    font-size: 11px;
    opacity: 0.7;
}

.ft-meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
}

.ft-options {
    margin-top: 3px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.opt {
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 11.5px;
}

.muted {
    color: rgba(255, 255, 255, 0.6);
}

.footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 8px;
}

.center {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: rgba(255, 255, 255, 0.7);
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

@media (max-width: 640px) {

    .grid2,
    .features-grid {
        grid-template-columns: 1fr;
    }
}
</style>
