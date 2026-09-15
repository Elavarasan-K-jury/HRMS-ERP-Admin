# Feed Card Component

## Purpose

A generic card wrapper for the feed page. Provides a consistent container with optional header (eyebrow, title, subtitle), icon slot, and actions slot. The main content is rendered via the default slot.

## Props/State

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | `''` | Card title (26px bold) |
| `subtitle` | `String` | `''` | Subtitle text below title |
| `eyebrow` | `String` | `''` | Small uppercase label above title |

## Template

```vue
<section class="rounded-lg bg-white/4 border border-white/10 backdrop-blur-2xl px-4 py-4 md:px-5 md:py-5">
    <header v-if="title || subtitle || eyebrow || $slots.icon || $slots.actions"
        class="mb-3 flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
            <slot name="icon" />
            <div>
                <p v-if="eyebrow" class="text-[14px] uppercase tracking-[0.3em] text-white/40 font-medium">
                    {{ eyebrow }}
                </p>
                <h2 v-if="title" class="text-[26px] font-semibold">{{ title }}</h2>
                <p v-if="subtitle" class="text-md text-white/55">{{ subtitle }}</p>
            </div>
        </div>
        <div class="flex items-center gap-1">
            <slot name="actions" />
        </div>
    </header>
    <div><slot /></div>
</section>
```

## Script Logic

```vue
defineProps({
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    eyebrow: { type: String, default: '' }
});
```

## API Integration

None. Pure presentational component.

## Usage

Used in the feed page to wrap content sections like metrics, posts, and composer. Provides a consistent glass-morphism card style with optional header elements.
