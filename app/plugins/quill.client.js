import { defineNuxtPlugin } from '#app';
import Quill from 'quill';

// Styles (optional)
import 'quill/dist/quill.snow.css';

export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            quill: Quill,
        },
    };
});
