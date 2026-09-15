// app/stores/shared/head.store.js
import { defineStore } from 'pinia'

export const useHeadStore = defineStore('Head', {
    state: () => ({
        title: 'Jury-HRMS',
        desciption: 'Jury-HRMS',
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
