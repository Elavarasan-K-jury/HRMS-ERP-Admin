// app/stores/head.store.js
import { defineStore } from 'pinia'

export const useHeadStore = defineStore('Head', {
    state: () => ({
        title: 'Jury-HRMS | ADMIN',
        desciption: 'Jury-HRMS | ADMIN',
    }),
    getters: {
        getHead: (state) => {
            return {
                title: state.title,
                desciption: state.desciption,
            }
        },
    },
})
