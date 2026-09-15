<template>
    <div class="grid grid-cols-12 gap-2">
        <template v-if="!loaded && !flow_id">
            <span class="col-span-12 text-xl font-semibold text-white/80">
                Load Template
            </span>
            <div class="col-span-12 w-full flex gap-1 flex-col items-start">
                <input type="file" accept=".jhrmsenc" @change="handleFileUpload" />
                <div v-if="error" class="text-red-500 mt-2">
                    {{ error }}
                </div>
            </div>
        </template>
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Process Details
        </span>
        <div class="col-span-10 w-full flex gap-1 flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Process Name:
            </p>
            <FormInput class="w-full" v-model="name" prepend-icon="heroicons:chat-bubble-bottom-center-text"
                color="#fff" size="md" rounded="lg" placeholder="Process Name" />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Estimated Days:
            </p>
            <FormInput class="w-full" v-model="estimated_days" prepend-icon="heroicons:chat-bubble-bottom-center-text"
                color="#fff" size="md" rounded="lg" placeholder="Estimated Days" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Process Description:
            </p>
            <FormTextArea v-model="description" placeholder="Write a description..." color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Process Steps ({{ process_steps.length }})
        </span>
        <div v-for="(step, step_index) in process_steps"
            class="grid grid-cols-12 rounded-lg col-span-12 gap-2 p-4 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
            <div class="col-span-12 w-full flex gap-1 flex-col items-start">
                <p class="text-md text-white/80" for="Department Name">
                    Step Name:
                </p>
                <FormInput class="w-full" v-model="step.name" prepend-icon="heroicons:chat-bubble-bottom-center-text"
                    color="#fff" size="md" rounded="lg" placeholder="Step Name" />
            </div>
            <div class="col-span-12 w-full grid grid-cols-12 gap-1 items-start">
                <div v-for="(feature, feature_index) in step.features"
                    class="grid grid-cols-12 rounded-lg col-span-12 gap-2 p-4 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
                    <div :class="['select', 'radio'].includes(feature.type?.value) ? 'col-span-5' : 'col-span-6'"
                        class="w-full flex gap-1 flex-col items-start">
                        <p class="text-md text-white/80" for="Department Name">
                            Form Feature ({{ feature_index + 1 }}):
                        </p>
                        <FormInput class="w-full" v-model="feature.name"
                            prepend-icon="heroicons:chat-bubble-bottom-center-text" color="#fff" size="md" rounded="lg"
                            placeholder="Form Feature" />
                    </div>
                    <div :class="['select', 'radio'].includes(feature.type?.value) ? 'col-span-5' : 'col-span-6'"
                        class="w-full flex gap-1 flex-col items-start">
                        <p class="text-md text-white/80" for="Department Name">
                            Form Feature Type ({{ feature_index + 1 }}):
                        </p>
                        <FormSelect class="w-full" color="#fff" prepend-icon="heroicons:adjustments-vertical"
                            v-model="feature.type" :options="InputTypes" searchable size="md" rounded="lg"
                            placeholder="Feature Type" />
                    </div>
                    <div v-if="['select', 'radio'].includes(feature.type?.value)"
                        class="col-span-2 w-full flex gap-1 flex-col items-end justify-evenly">
                        <p class="text-md text-white/80" for="Department Name">
                            Has Options ({{ feature_index + 1 }}):
                        </p>
                        <UiSwitch v-model="feature.hasOptions" />
                    </div>
                    <div v-if="feature.hasOptions" class="col-span-12 gap-2 flex flex-col justify-end items-start">
                        <p class="text-md text-white/80" for="Department Name">
                            Form Feature Opitons ({{ feature_index + 1 }}):
                        </p>
                        <div class="flex gap-2">
                            <span class="bg-white/10 flex gap-1 items-center pl-4 pr-2 py-1 rounded-full"
                                v-for="(option, optInd) in feature.options">
                                <span>{{ option }}</span>
                                <Icon name="heroicons:x-circle" @click="feature.options.splice(optInd, 1)"
                                    class="text-red-500 w-5 h-5 cursor-pointer hover:text-red-600" />
                            </span>
                        </div>
                        <FormInput @keydown.enter.prevent="updateOptions(step_index, feature_index)" class="w-full"
                            v-model="feature.optionText" prepend-icon="heroicons:chat-bubble-bottom-center-text"
                            color="#fff" size="md" rounded="lg" placeholder="Form Feature Options" />
                    </div>
                    <div class="col-span-12 gap-2 flex justify-end items-center">
                        <span v-if="step.features.length > 1"
                            @click="onboardingStore.removeFeature(step_index, feature_index)"
                            class="text-white cursor-pointer rounded-lg font-bold hover:underline">Remove
                            Feature</span>
                        <span @click="onboardingStore.addFeature(step_index, feature_index)"
                            class="text-green-500 cursor-pointer rounded-lg font-bold hover:underline">Add
                            Feature</span>
                    </div>
                </div>
            </div>
            <div class="col-span-12 gap-2 flex justify-end items-center">
                <span v-if="process_steps.length > 1" @click="onboardingStore.removeProcessStep(step_index)"
                    class="text-white cursor-pointer rounded-lg font-bold hover:underline">Remove
                    Step</span>
                <span @click="onboardingStore.addProcessStep(step_index)"
                    class="text-green-500 cursor-pointer rounded-lg font-bold hover:underline">Add
                    Step</span>
            </div>
        </div>
    </div>
</template>


<script setup>
import { storeToRefs } from 'pinia';
import InputTypes from '../../constants/inputTypes';
import { useOnboardingStore } from '../../stores/organization/onBoarding.store';

const onboardingStore = useOnboardingStore();
const config = useRuntimeConfig()
const loaded = ref(false);
const {
    name,
    estimated_days,
    description,
    process_steps,
    flow_id
} = storeToRefs(onboardingStore);

const error = ref('');

async function handleFileUpload(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        // Validate extension
        if (!file.name.endsWith(".jhrmsenc")) {
            throw new Error("Invalid file type. Only .jhrmsenc allowed");
        }

        const text = await file.text();

        // Decrypt
        const data = decryptEncryptedFile(text, config.public.encSecret);
        console.log('form.vue @ Line 142:', data);
        error.value = "";
        name.value = data.name
        description.value = data.description
        estimated_days.value = data.estimated_days
        process_steps.value = data.steps_list.map(step => {
            return {
                id: step.id,
                name: step.name,
                features: step.features.map(feature => {
                    return {
                        id: feature.id,
                        name: feature.feature_name,
                        type: feature.feature_type ? InputTypes.find(type => type.value == feature.feature_type) : null,
                        hasOptions: feature.has_options,
                        optionText: null,
                        options: JSON.parse(feature.options)
                    }
                })
            }
        })
        loaded.value = true;
    } catch (e) {
        error.value = e.message;
        loaded.value = false;
    }
}

const updateOptions = (step_index, feature_index) => {
    const feature = process_steps.value[step_index].features[feature_index];
    const value = feature.optionText.trim();

    if (value) {
        feature.options.push(value);
    }

    // clear only after adding non-empty value
    feature.optionText = '';
};

</script>