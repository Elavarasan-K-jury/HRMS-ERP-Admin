// plugins/error-handler.client.ts
export default defineNuxtPlugin((nuxtApp) => {
    // Global error handler for unhandled promise rejections
    if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);

            // Prevent Nuxt from crashing
            event.preventDefault();

            // Check if it's a socket-related error
            if (event.reason?.message?.includes('ECONNRESET') ||
                event.reason?.message?.includes('socket')) {
                console.warn('Socket connection error caught and suppressed');
            }
        });

        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error || event.message);

            // Prevent dev server restart for socket errors
            if (event.message?.includes('ECONNRESET') ||
                event.message?.includes('socket')) {
                event.preventDefault();
                console.warn('Socket error caught and suppressed');
            }
        });
    }

    // Vue error handler
    nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
        console.error('Vue error:', err);
        console.error('Error info:', info);

        // Don't let socket errors crash the app
        if (err?.message?.includes('ECONNRESET') ||
            err?.message?.includes('socket')) {
            console.warn('Socket error in Vue caught and suppressed');
            return;
        }

        // Let other errors through for debugging
        throw err;
    };

    // Hook into Nuxt's error handling
    nuxtApp.hook('vue:error', (err, instance, info) => {
        console.error('Nuxt vue:error hook:', err);

        // Suppress socket errors
        if (err?.message?.includes('ECONNRESET') ||
            err?.message?.includes('socket')) {
            return;
        }
    });
});