# Feed Metrics Component

## Purpose

Displays team update metrics in a card with tabbed content for birthdays, anniversaries, and new joiners. The active tab is controlled via v-model.

## Props/State

| Prop | Type | Description |
|------|------|-------------|
| `tabs` | `Array` | Array of tab objects `{ value, label }` |
| `modelValue` | `String` | Currently active tab value |
| `birthdayText` | `String` | Content for birthdays tab |
| `anniversaryText` | `String` | Content for anniversaries tab |
| `joinerText` | `String` | Content for new joiners tab |

Emits: `update:modelValue`

## Template

```vue
<div class="p-5 rounded-lg bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg">
    <h2 class="text-white font-semibold mb-4">Team Updates</h2>
    <div class="flex gap-6 border-b border-white/10 pb-2">
        <button v-for="t in tabs" :key="t.value" @click="$emit('update:modelValue', t.value)"
            class="pb-1 text-sm transition"
            :class="modelValue === t.value
                ? 'text-white border-b border-white'
                : 'text-white/50 hover:text-white'">
            {{ t.label }}
        </button>
    </div>
    <div class="mt-4 text-white/70 min-h-[80px]">
        <p v-if="modelValue === 'birthday'">{{ birthdayText }}</p>
        <p v-if="modelValue === 'anniversary'">{{ anniversaryText }}</p>
        <p v-if="modelValue === 'joiner'">{{ joinerText }}</p>
    </div>
</div>
```

## Script Logic

```vue
defineProps({
    tabs: Array,
    modelValue: String,
    birthdayText: String,
    anniversaryText: String,
    joinerText: String
})
defineEmits(['update:modelValue']);
```

## API Integration

No direct API calls. Receives text content via props. The parent is responsible for fetching metrics data and passing it as formatted text strings.

## Usage

Used in the feed page to show team updates. The parent manages the data fetching and passes tab configuration and content strings as props.
