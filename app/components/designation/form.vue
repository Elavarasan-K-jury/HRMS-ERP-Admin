<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>
    <div v-if="!loading" class="grid grid-cols-12 gap-2">
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Designation Details
        </span>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Name">
                Designation Name:
            </label>
            <FormInput class="w-full" v-model="name" prepend-icon="lucide:git-fork" color="#fff" size="lg" rounded="lg"
                placeholder="Designation Name" />
        </div>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Band">
                Band:
            </label>
            <FormSelect id="band" class="w-full" color="#fff" prepend-icon="ion:git-branch-outline"
                v-model="band_id" :options="bands" searchable size="lg" rounded="lg"
                placeholder="Select Band" clearable />
            <div v-if="selectedBand"
                class="mt-1.5 w-full rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200/90 leading-relaxed">
                <div class="flex items-start gap-1.5">
                    <Icon name="ion:git-branch-outline" class="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div class="min-w-0 flex-1">
                        <span class="font-semibold text-emerald-100">{{ selectedBand.name }}</span>
                        <p v-if="selectedBand.description" class="mt-1" :class="bandDescExpanded ? '' : 'line-clamp-2'">
                            {{ selectedBand.description }}
                        </p>
                        <button v-if="descriptionTruncates" type="button" @click="bandDescExpanded = !bandDescExpanded"
                            class="mt-1 text-emerald-300 hover:text-emerald-100 underline underline-offset-2">
                            {{ bandDescExpanded ? 'Show less' : 'Show more' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Designation Level">
                Designation Level:
            </label>
            <FormSelect id="designation_level" class="w-full" color="#fff" prepend-icon="ion:git-branch-outline"
                v-model="designation_level" :options="designations" searchable size="lg" rounded="lg"
                placeholder="Designation Level" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">
                Department: (Optional)
            </label>
            <FormSelect id="departent_head" class="w-full" color="#fff" prepend-icon="lucide:user"
                v-model="department_id" :options="departments" searchable size="lg" rounded="lg"
                placeholder="Department" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">Description: (Optional)</label>
            <FormTextArea v-model="description" placeholder="Write a description..." color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import designations from '../../constants/designations';
import { useDepartmentStore } from '../../stores/department.store'
import { useDesignationStore } from '../../stores/designation.store'
import { useBandStore } from '../../stores/band.store'
import { useAuthStore } from '../../stores/auth.store'
import { storeToRefs } from 'pinia';
const departmentStore = useDepartmentStore();
const designationStore = useDesignationStore();
const bandStore = useBandStore();
const authStore = useAuthStore();

const {
    name,
    designation_level,
    description,
    department_id,
    band_id,
} = storeToRefs(designationStore);

const loading = ref(false);


const departments = computed(() => departmentStore.department_select);
const bands = computed(() => bandStore.bandListSelect);

const bandDescExpanded = ref(false);
const selectedBand = computed(() => {
    const id = band_id.value && typeof band_id.value === 'object'
        ? band_id.value.value
        : band_id.value
    if (!id) return null
    return (bandStore.band_list || []).find(b => String(b.id) === String(id)) || null
});
const descriptionTruncates = computed(() => (selectedBand.value?.description?.length || 0) > 140);

watch(band_id, () => { bandDescExpanded.value = false })

onMounted(async () => {
    loading.value = true
    departmentStore.organization_id = authStore.organization
    await Promise.all([
        departmentStore.fetchAllDepartments(),
        bandStore.fetchBandList(authStore.organization).catch(() => {}),
    ]);
    setTimeout(() => {
        loading.value = false
    }, 1000);
});
</script>