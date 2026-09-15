<template>
    <div>
        <nav class="about-sub-tabs">
            <button v-for="t in subTabs" :key="t.value" type="button" @click="activeSubTab = t.value"
                class="about-sub-tab"
                :class="t.value === activeSubTab ? 'about-sub-tab-active' : ''">
                {{ t.label }}
            </button>
        </nav>

        <div v-if="activeSubTab === 'summary'" class="about-summary">
            <div v-if="aboutLoading" class="about-loading">
                <Icon name="lucide:loader-2" class="animate-spin" style="width:18px;height:18px;opacity:0.5" />
            </div>
            <template v-else>
                <div class="about-field-card">
                    <div class="about-field-header">
                        <span class="about-field-label">About</span>
                        <button class="about-field-action" @click="openAboutModal">
                            <Icon name="lucide:pencil" class="about-field-action-icon" />
                            {{ aboutData.about ? 'Edit' : 'Add your response' }}
                        </button>
                    </div>
                    <p v-if="aboutData.about" class="about-field-value">{{ aboutData.about }}</p>
                </div>
                <div class="about-field-card">
                    <div class="about-field-header">
                        <span class="about-field-label">What I love about my job?</span>
                        <button class="about-field-action" @click="openAboutModal">
                            <Icon name="lucide:pencil" class="about-field-action-icon" />
                            {{ aboutData.what_i_love_about_job ? 'Edit' : 'Add your response' }}
                        </button>
                    </div>
                    <p v-if="aboutData.what_i_love_about_job" class="about-field-value">{{ aboutData.what_i_love_about_job }}</p>
                </div>
                <div class="about-field-card">
                    <div class="about-field-header">
                        <span class="about-field-label">My interests and hobbies</span>
                        <button class="about-field-action" @click="openAboutModal">
                            <Icon name="lucide:pencil" class="about-field-action-icon" />
                            {{ aboutData.interests_and_hobbies ? 'Edit' : 'Add your response' }}
                        </button>
                    </div>
                    <p v-if="aboutData.interests_and_hobbies" class="about-field-value">{{ aboutData.interests_and_hobbies }}</p>
                </div>
            </template>
        </div>

        <div v-else-if="activeSubTab === 'timeline'" class="about-timeline">
            <div class="about-timeline-placeholder">
                <Icon name="lucide:clock" style="width:32px;height:32px;opacity:0.2" />
                <p>Timeline coming soon.</p>
            </div>
        </div>

        <UiSidebarModal v-model="aboutModalOpen" title="Edit About" width="520px">
            <template #default>
                <div class="about-edit-form">
                    <div class="about-edit-field">
                        <p class="about-edit-label">About</p>
                        <textarea v-model="aboutForm.about" class="about-edit-textarea" placeholder="Tell us about yourself..." rows="4"></textarea>
                    </div>
                    <div class="about-edit-field">
                        <p class="about-edit-label">What I love about my job?</p>
                        <textarea v-model="aboutForm.what_i_love_about_job" class="about-edit-textarea" placeholder="What do you love about your job?" rows="4"></textarea>
                    </div>
                    <div class="about-edit-field">
                        <p class="about-edit-label">My interests and hobbies</p>
                        <textarea v-model="aboutForm.interests_and_hobbies" class="about-edit-textarea" placeholder="Share your interests and hobbies..." rows="4"></textarea>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="w-full flex justify-end gap-3">
                    <UiButton :disabled="aboutSaving" @click="aboutModalOpen = false" color="#fff" text="Cancel" />
                    <UiButton :disabled="aboutSaving" @click="saveAbout" color="#4aff7a" text="Save" prepend-icon="ion:checkmark-circle" />
                </div>
            </template>
        </UiSidebarModal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    employee: { type: Object, required: true },
})

const subTabs = [
    { label: 'Summary', value: 'summary' },
    { label: 'Timeline', value: 'timeline' },
]
const activeSubTab = ref('summary')

const aboutLoading = ref(true)
const aboutData = ref({ about: '', what_i_love_about_job: '', interests_and_hobbies: '' })

const aboutModalOpen = ref(false)
const aboutSaving = ref(false)
const aboutForm = ref({ about: '', what_i_love_about_job: '', interests_and_hobbies: '' })

async function loadAbout() {
    aboutLoading.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get('/employee-profile/my/about')
        if (data?.about) {
            aboutData.value = {
                about: data.about.about || '',
                what_i_love_about_job: data.about.what_i_love_about_job || '',
                interests_and_hobbies: data.about.interests_and_hobbies || '',
            }
        }
    } catch (err) {
        console.error('[AboutTab] Failed to load about:', err)
    } finally {
        aboutLoading.value = false
    }
}

function openAboutModal() {
    aboutForm.value = { ...aboutData.value }
    aboutModalOpen.value = true
}

async function saveAbout() {
    if (aboutSaving.value) return
    aboutSaving.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.put('/employee-profile/my/about', {
            about: aboutForm.value.about?.trim() || null,
            what_i_love_about_job: aboutForm.value.what_i_love_about_job?.trim() || null,
            interests_and_hobbies: aboutForm.value.interests_and_hobbies?.trim() || null,
        })
        if (data?.about) {
            aboutData.value = { ...data.about }
        }
        aboutModalOpen.value = false
        useToast().success({ title: 'Saved', message: 'About information updated.', timeout: 1500 })
    } catch (err) {
        const msg = err?.response?.data?.error || err.message || 'Failed to save'
        useToast().error({ title: 'Error', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
    } finally {
        aboutSaving.value = false
    }
}

onMounted(loadAbout)
</script>

<style scoped>
.about-sub-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0;
}

.about-sub-tab {
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.45);
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    margin-bottom: -1px;
}

.about-sub-tab:hover {
    color: rgba(255, 255, 255, 0.7);
}

.about-sub-tab-active {
    color: #4aff7a;
    border-bottom-color: #4aff7a;
}

/* Summary */
.about-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.about-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
    color: rgba(255, 255, 255, 0.4);
}

.about-field-card {
    padding: 16px 18px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
}

.about-field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
}

.about-field-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.55);
}

.about-field-action {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #4aff7a;
    background: rgba(74, 255, 122, 0.1);
    border: 1px solid rgba(74, 255, 122, 0.2);
    cursor: pointer;
    transition: all 0.15s ease;
}

.about-field-action:hover {
    background: rgba(74, 255, 122, 0.18);
    border-color: rgba(74, 255, 122, 0.35);
}

.about-field-action-icon {
    width: 13px;
    height: 13px;
}

.about-field-value {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.88);
    line-height: 1.6;
    white-space: pre-wrap;
    margin: 4px 0 0;
}

/* Timeline placeholder */
.about-timeline {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
}

.about-timeline-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.35);
    font-size: 14px;
}

/* Edit form */
.about-edit-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.about-edit-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.about-edit-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
}

.about-edit-textarea {
    width: 100%;
    min-height: 100px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
    font-family: inherit;
}

.about-edit-textarea::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

.about-edit-textarea:focus {
    border-color: rgba(74, 255, 122, 0.4);
    background: rgba(255, 255, 255, 0.08);
}

.about-edit-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
