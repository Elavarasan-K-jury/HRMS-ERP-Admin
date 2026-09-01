<template>
  <div
    class="group/card relative w-[340px] rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-white/[0.14]"
  >
    <div v-for="dept in node.department_head_of" :key="dept"
      class="absolute -top-2.5 right-4 z-20 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400/90 text-slate-900 shadow-lg border border-amber-500/60 whitespace-nowrap max-w-[70%] truncate"
    >
      {{ dept }} Head
    </div>

    <div class="p-4 rounded-xl bg-[#0F172A]/95 border border-white/[0.06]">
      <div class="flex items-start gap-3.5">
        <div class="relative shrink-0">
          <img v-if="node.profile_image" :src="node.profile_image"
            class="w-14 h-14 rounded-xl object-cover border border-white/[0.12] shadow-md" />
          <div v-else
            class="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-base border border-white/[0.12] shadow-md"
          >
            {{ initials }}
          </div>
          <div v-if="node.reportees?.length"
            class="absolute -bottom-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-emerald-500/90 border-2 border-[#0F172A] flex items-center justify-center"
          >
            <span class="text-[9px] font-bold text-white">{{ node.reportees.length }}</span>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-white text-[15px] font-semibold leading-tight truncate">{{ node.full_name }}</h3>
          <p v-if="node.employee_code" class="text-[10px] text-white/35 font-mono mt-0.5">
            {{ node.employee_code }}
          </p>
          <p v-if="node.designation" class="text-emerald-400 text-[11px] font-semibold mt-1.5 truncate">
            {{ node.designation }}
          </p>
          <div class="flex items-center gap-1.5 mt-2 flex-wrap">
            <span v-if="node.department"
              class="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 max-w-[160px] truncate"
            >
              {{ node.department }}
            </span>
            <span v-if="node.category"
              class="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 shrink-0"
            >
              {{ node.category }}
            </span>
            <span v-if="experienceLabel"
              class="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-white/5 text-white/40 border border-white/[0.06] shrink-0"
            >
              {{ experienceLabel }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button @click.stop="viewProfile"
            class="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-500/90 text-slate-900 hover:bg-emerald-400 transition flex items-center gap-1"
          >
            <Icon name="lucide:eye" class="w-3.5 h-3.5" />
            Profile
          </button>
          <button v-if="node.reportees?.length" @click.stop="emit('toggle')"
            class="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white/90 transition flex items-center gap-1"
          >
            <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ '-rotate-90': !expanded }" />
            Team ({{ node.reportees.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  node: { type: Object, required: true },
  expanded: { type: Boolean, default: true },
})

const emit = defineEmits(['toggle'])

const router = useRouter()

const initials = computed(() => {
  if (!props.node?.full_name) return '?'
  return props.node.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const experienceLabel = computed(() => {
  if (!props.node.date_of_birth) return ''
  const dob = new Date(props.node.date_of_birth)
  if (isNaN(dob.getTime())) return ''
  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--
  if (years < 0) return ''
  return `${years} yr${years !== 1 ? 's' : ''}`
})

function viewProfile() {
  router.push({
    path: `/organization/${props.node.organization_id}/employee/list`,
    query: { employee_id: props.node.id, preview: true },
  })
}
</script>
