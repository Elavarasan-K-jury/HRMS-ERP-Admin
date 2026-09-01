<template>
    <section
        class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex flex-wrap items-center gap-x-6 gap-y-4">
        <div class="flex items-center gap-3 min-w-0">
            <div class="icon-tile"><Icon name="lucide:mail" class="icon-ic" /></div>
            <div class="min-w-0">
                <p class="label">Work Email</p>
                <p class="value truncate" :title="employee.email">{{ employee.email || '—' }}</p>
            </div>
        </div>

        <div class="flex items-center gap-3 min-w-0">
            <div class="icon-tile"><Icon name="lucide:phone" class="icon-ic" /></div>
            <div class="min-w-0">
                <p class="label">Personal Number</p>
                <p class="value truncate" :title="employee.phone">{{ employee.phone || '—' }}</p>
            </div>
        </div>

        <div class="flex items-center gap-3 min-w-0">
            <div class="icon-tile"><Icon name="lucide:hash" class="icon-ic" /></div>
            <div class="min-w-0">
                <p class="label">Employee ID</p>
                <p class="value truncate" :title="employee.employee_code">{{ employee.employee_code || '—' }}</p>
            </div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    employee: { type: Object, required: true },
})
</script>

<style scoped>
.icon-tile {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
}

.icon-ic {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}
.label {
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 3px;
    line-height: 1.2;
}
.value {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.92);
    max-width: 260px;
}
@media (max-width: 640px) {
    .value { max-width: 160px; }
}
</style>