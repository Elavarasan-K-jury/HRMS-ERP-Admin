<template>
    <!-- <div
        class="bg-[radial-gradient(circle_at_30%_20%,theme(colors.brand.300),theme(colors.plum.700))] w-screen h-screen"> -->
    <div
        class="flex bg-[conic-gradient(at_50%_50%,theme(colors.brand.500),theme(colors.plum.500),theme(colors.rust.500),theme(colors.brand.500))] w-screen h-screen">
        <!-- <div class="bg-gradient-to-br from-brand-500 via-brand-300 to-rust-400 w-screen h-screen"> -->
        <main class="flex-1">
            <slot />
        </main>
    </div>
</template>