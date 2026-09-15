# Holiday Component

## Purpose

Displays the next upcoming holiday in a compact card with a gradient avatar (first two letters of holiday name), the holiday name, formatted date, and a "VIEW" button.

## Props/State

No props. State is fetched from the holiday store:

```vue
const store = useHolidayStore()
const holiday = computed(() => store.upcomingHoliday)
const holidayInitial = computed(() => {
    if (!holiday.value) return '?'
    return (holiday.value.name || 'H').substring(0, 2).toUpperCase()
})
const formattedDate = computed(() => {
    if (!holiday.value?.date) return ''
    return new Date(holiday.value.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long',
    })
})
```

## Template

```vue
<div class="rounded-lg border border-white/10 bg-white/4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.3)] p-5 flex flex-col gap-4 w-full">
    <h2 class="text-lg font-semibold text-white tracking-wide">Upcoming Holiday</h2>
    <div v-if="!holiday" class="text-white/50 text-sm py-6 text-center">No upcoming holiday</div>
    <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                        flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {{ holidayInitial }}
            </div>
            <div class="flex flex-col">
                <span class="text-white font-medium">{{ holiday.name }}</span>
                <span class="text-xs text-white/60">{{ formattedDate }}</span>
            </div>
        </div>
        <button class="px-4 py-1.5 text-sm rounded-full border border-white/20 text-white/70 
                     hover:text-white hover:border-white/40 transition-all bg-white/5">
            VIEW
        </button>
    </div>
</div>
```

## Script Logic

- Fetches holidays on mount via `store.fetchAllHolidays()`
- Computes the upcoming holiday with `store.computeUpcomingHoliday()`
- `holidayInitial` extracts the first two characters of the holiday name
- `formattedDate` renders the date in "28 November" format

```vue
onMounted(async () => {
    await store.fetchAllHolidays()
    await store.computeUpcomingHoliday()
});
```

## API Integration

- **Store**: `useHolidayStore.fetchAllHolidays()` — fetches all holidays
- **Store**: `useHolidayStore.computeUpcomingHoliday()` — determines the next upcoming holiday

## Usage

Displayed on the organization feed page sidebar or dashboard to show employees the next upcoming holiday.
