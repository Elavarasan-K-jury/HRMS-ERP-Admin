# Feed Post Component

## Purpose

Displays a single feed post with user avatar (initials), user name, role, timestamp, content, type badge, and social interaction buttons (likes, comments).

## Props/State

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `post` | `Object` | Yes | Post object with `user`, `role`, `time`, `content`, `type`, `likes`, `comments` |

## Template

```vue
<article class="rounded-lg bg-white/3 border border-white/10 backdrop-blur-2xl px-4 py-4 md:px-5 md:py-4">
    <header class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 text-xs font-semibold">
                {{ initials }}
            </div>
            <div>
                <p class="text-sm font-medium">{{ post.user }}</p>
                <p class="text-[11px] text-white/55">{{ post.role }} · {{ post.time }}</p>
            </div>
        </div>
        <span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/50">
            {{ post.type || 'Post' }}
        </span>
    </header>
    <p class="mt-3 text-sm text-white/85 whitespace-pre-line">{{ post.content }}</p>
    <footer class="mt-3 flex items-center gap-4 text-xs text-white/55">
        <button type="button" class="flex items-center gap-1 hover:text-white/80">
            <Icon name="ion:heart-outline" class="text-sm" />
            <span>{{ post.likes }} Likes</span>
        </button>
        <button type="button" class="flex items-center gap-1 hover:text-white/80">
            <Icon name="ion:chatbubble-ellipses-outline" class="text-sm" />
            <span>{{ post.comments }} Comments</span>
        </button>
    </footer>
</article>
```

## Script Logic

```vue
const props = defineProps({
    post: { type: Object, required: true }
})

const initials = computed(() => {
    if (!props.post.user) return '?'
    return props.post.user
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
});
```

The `initials` computed extracts the first two uppercase letters from the user's name for the avatar circle.

## API Integration

None. Pure presentational component. Post data is passed via the `post` prop.

## Usage

Used in the feed page to render individual posts. Typically iterated inside a parent component that fetches the feed data and renders one `feedPost` per item.
