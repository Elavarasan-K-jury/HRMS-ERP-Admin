<template>
    <section
        class="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden">
        <!-- Banner gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent pointer-events-none" />

        <div class="relative flex flex-col sm:flex-row sm:items-center gap-5 p-6">
            <!-- Avatar with photo upload -->
            <div class="shrink-0 relative group">
                <img v-if="avatarSrc" :src="avatarSrc" :alt="employee.full_name"
                    class="h-24 w-24 rounded-full object-cover border-2 border-white/30 shadow-lg" />
                <div v-else class="avatar">{{ initials }}</div>
                <label
                    class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    :title="uploading ? 'Uploading…' : 'Upload profile photo'">
                    <Icon v-if="uploading" name="ion:sync" class="h-7 w-7 text-white animate-spin" />
                    <Icon v-else name="ion:camera" class="h-7 w-7 text-white" />
                    <input type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
                </label>
            </div>

            <!-- Identity -->
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                    <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight">{{ displayName }}</h1>
                </div>

                <div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/70">
                    <span v-if="employee.designation?.name" class="inline-flex items-center gap-1.5">
                        <Icon name="lucide:briefcase" class="h-4 w-4 text-white/50" />
                        {{ employee.designation.name }}
                    </span>
                    <span v-if="employee.band?.name || employee.band_name"
                        class="inline-flex items-center gap-1.5">
                        <Icon name="ion:git-branch-outline" class="h-4 w-4 text-white/50" />
                        {{ employee.band?.name || employee.band_name }}
                    </span>
                </div>
            </div>

            <!-- Three-dot action menu -->
            <!-- <div class="shrink-0 relative" ref="menuWrap">
                <button @click.stop="open = !open"
                    class="p-2.5 rounded-xl hover:bg-white/10 transition-all text-white/80"
                    aria-label="Employee actions">
                    <Icon name="lucide:more-horizontal" class="h-5 w-5" />
                </button>

                <transition name="fade-scale">
                    <div v-if="open"
                        class="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#111827]/95 border border-white/15 shadow-2xl overflow-hidden z-50">
                        <button @click="$emit('edit')"
                            class="w-full px-4 py-2.5 flex items-center gap-2.5 text-sm text-white/85 hover:bg-white/10 transition-all">
                            <Icon name="lucide:pencil" class="h-4 w-4" />
                            Edit Employee
                        </button>
                        <NuxtLink :to="hrmsLink" @click="open = false"
                            class="w-full px-4 py-2.5 flex items-center gap-2.5 text-sm text-white/85 hover:bg-white/10 transition-all">
                            <Icon name="lucide:external-link" class="h-4 w-4" />
                            View in HRMS
                        </NuxtLink>
                    </div>
                </transition>
            </div> -->
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { resolveMediaUrl, uploadMediaFile } from '~/utils/media'
import { useAuthStore } from '~/stores/auth.store'

const props = defineProps({
    employee: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'updated'])

const open = ref(false)
const uploading = ref(false)
const menuWrap = ref(null)

const initials = computed(() => {
    const name = props.employee?.display_name || props.employee?.full_name || ''
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '?'
    return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('')
})

const displayName = computed(() => props.employee?.display_name || props.employee?.full_name || '—')

const avatarSrc = computed(() => {
    const e = props.employee
    if (e?.profile_image_file_id) return resolveMediaUrl(`/file/${e.profile_image_file_id}`)
    if (e?.profile_image) return resolveMediaUrl(e.profile_image)
    return ''
})

const hrmsLink = computed(() => {
    const org = props.employee?.organization_id
    return org ? `/organization/${org}/employee/list` : '/'
})

const onPhotoChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!/^image\//.test(file.type)) {
        useToast().error({ title: 'Invalid file', message: 'Please upload an image file.', timeout: 2000 })
        return
    }
    uploading.value = true
    try {
        const auth = useAuthStore()
        const fileId = await uploadMediaFile(file, {
            organizationId: props.employee.organization_id || auth.organization,
            storePath: `organizations/${props.employee.organization_id || auth.organization}/employees`,
        })
        if (!fileId) throw new Error('Upload failed')

        const { $api } = useNuxtApp()
        await $api.put(`/employees/${props.employee.id}`, { profileImageFileId: fileId })

        props.employee.profile_image_file_id = fileId
        useToast().success({ title: 'Success!', message: 'Profile photo updated.', timeout: 1500 })
        emit('updated')
    } catch (err) {
        console.error('[profile] photo upload error:', err)
        useToast().error({ title: 'Failed', message: 'Could not upload photo.', timeout: 3000 })
    } finally {
        uploading.value = false
    }
}

function onClickOutside(e) {
    if (open.value && menuWrap.value && !menuWrap.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.avatar {
    height: 6rem;
    width: 6rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30% 20%, #4aff7a, #22c55e, #0ea5e9);
    color: #020617;
    font-weight: 800;
    font-size: 28px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity .15s ease, transform .15s ease;
    transform-origin: top right;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(.96) translateY(-4px);
}
</style>