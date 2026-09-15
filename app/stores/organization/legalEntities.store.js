import { defineStore } from 'pinia'
import { uploadMediaFile } from '~/utils/media'

const mapSignatoryFromApi = (s) => ({
    id: s?.id,
    full_name: s?.full_name || '',
    email: s?.email || '',
    designation: s?.designation || '',
    father_name: s?.father_name || '',
    address1: s?.address1 || '',
    address2: s?.address2 || '',
    city: s?.city || '',
    state: s?.state || '',
    zip: s?.zip || '',
    country: s?.country || '',
})

const mapBankFromApi = (b) => ({
    id: b?.id,
    bank_name: b?.bank_name || '',
    account_number: b?.account_number || '',
    ifsc_code: b?.ifsc_code || '',
    branch: b?.branch || '',
    establishment_id: b?.establishment_id || '',
})

const mapEntityFromApi = (e) => ({
    id: e?.id,
    is_main: !!e?.is_main,
    name: e?.name || '',
    legal_name: e?.legal_name || '',
    country: e?.country || '',
    cin: e?.cin || '',
    incorporation_date: e?.incorporation_date || '',
    business_type: e?.business_type || '',
    sector: e?.sector || '',
    nature_of_business: e?.nature_of_business || '',
    address1: e?.address1 || '',
    address2: e?.address2 || '',
    city: e?.city || '',
    state: e?.state || '',
    zip: e?.zip || '',
    currency: e?.currency || '',
    financial_year: e?.financial_year || '',
    logo: e?.logo || null,
    logo_file_id: e?.logo_file_id || '',
    employee_count: 0,
    signatories: Array.isArray(e?.signatories) ? e.signatories.map(mapSignatoryFromApi) : [],
    banks: Array.isArray(e?.banks) ? e.banks.map(mapBankFromApi) : [],
})

export const useLegalEntitiesStore = defineStore('legalEntities', {
    state: () => ({
        loading: false,
        organizationId: null,
        mainOrganization: null,
        legalEntities: [],
        selectedId: null,
    }),

    getters: {
        selectedEntity(state) {
            return state.legalEntities.find(e => String(e.id) === String(state.selectedId)) || state.legalEntities[0] || null
        },
    },

    actions: {
        async fetchMainOrganization(orgId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/organizations/${orgId}`)
                this.mainOrganization = data?.organization || data || null
                this.organizationId = orgId
                return this.mainOrganization
            } catch (err) {
                console.error('[legal-entities] fetch main org error:', err)
                return null
            }
        },

        async fetchEmployeeCount(orgId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/employees/all', {
                    params: { organization_id: orgId },
                })
                return Array.isArray(data?.employees) ? data.employees.length : 0
            } catch (err) {
                console.error('[legal-entities] fetch employee count error:', err)
                return 0
            }
        },

        async fetchLegalEntities(orgId) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                this.organizationId = orgId

                const org = await this.fetchMainOrganization(orgId)
                const count = await this.fetchEmployeeCount(orgId)

                const { data } = await $api.get('/legal-entities', {
                    params: { organization_id: orgId, limit: 100 },
                })
                let entities = (data?.legal_entities || []).map(mapEntityFromApi)

                // Seed the main organization as the initial legal entity when none exist yet.
                if (!entities.length && org) {
                    const created = await $api.post('/legal-entities', {
                        organization_id: orgId,
                        name: org?.name || 'Main Organization',
                        legal_name: org?.name || 'Main Organization',
                        country: org?.address?.country || 'India',
                        address1: org?.address?.streetName || '',
                        city: org?.address?.city || '',
                        state: org?.address?.state || '',
                        zip: org?.address?.postalCode || '',
                    })
                    const seeded = created?.data?.legal_entity
                    if (seeded) entities = [mapEntityFromApi(seeded)]
                }

                entities.forEach(e => { e.employee_count = count })
                this.legalEntities = entities

                if (!this.selectedId || !entities.find(e => String(e.id) === String(this.selectedId))) {
                    this.selectedId = entities[0]?.id || null
                }
                return this.legalEntities
            } catch (err) {
                console.error('[legal-entities] fetch legal entities error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async selectLegalEntity(id) {
            this.selectedId = id
        },

        async updateLegalEntityRegistration(payload) {
            const entity = this.selectedEntity
            if (!entity) return null

            const { $api } = useNuxtApp()
            const body = { ...payload }
            if (body.logo instanceof File) {
                const fileId = await uploadMediaFile(body.logo, {
                    organizationId: this.organizationId,
                    storePath: `organizations/${this.organizationId}/legal-entities`,
                })
                if (fileId) body.logo_file_id = fileId
                delete body.logo
            }

            let saved
            if (entity.id && String(entity.id).length === 24) {
                const { data } = await $api.put(`/legal-entities/${entity.id}`, body)
                saved = data?.legal_entity
            } else {
                const { data } = await $api.post('/legal-entities', {
                    organization_id: this.organizationId,
                    ...body,
                })
                saved = data?.legal_entity
            }

            if (saved) Object.assign(entity, mapEntityFromApi(saved))
            return entity
        },

        async addSignatory(entityId, payload) {
            const entity = this.legalEntities.find(e => String(e.id) === String(entityId))
            if (!entity) return null

            const { $api } = useNuxtApp()
            const { data } = await $api.post(`/legal-entities/${entity.id}/signatories`, payload)
            const created = data?.signatory
            if (created) entity.signatories.push(mapSignatoryFromApi(created))
            return created
        },

        async updateSignatory(entityId, signatoryId, payload) {
            const entity = this.legalEntities.find(e => String(e.id) === String(entityId))
            if (!entity) return null

            const { $api } = useNuxtApp()
            const { data } = await $api.put(`/legal-entities/${entity.id}/signatories/${signatoryId}`, payload)
            const updated = data?.signatory
            if (updated) {
                const idx = entity.signatories.findIndex(s => String(s.id) === String(signatoryId))
                if (idx >= 0) entity.signatories[idx] = mapSignatoryFromApi(updated)
            }
            return updated
        },

        async removeSignatory(entityId, signatoryId) {
            const entity = this.legalEntities.find(e => String(e.id) === String(entityId))
            if (!entity) return

            const { $api } = useNuxtApp()
            await $api.delete(`/legal-entities/${entity.id}/signatories/${signatoryId}`)
            entity.signatories = entity.signatories.filter(s => String(s.id) !== String(signatoryId))
        },

        async addBank(entityId, payload) {
            const entity = this.legalEntities.find(e => String(e.id) === String(entityId))
            if (!entity) return null

            const { $api } = useNuxtApp()
            const { data } = await $api.post(`/legal-entities/${entity.id}/banks`, payload)
            const created = data?.bank_detail
            if (created) entity.banks.push(mapBankFromApi(created))
            return created
        },

        async updateBankDetail(entityId, bankId, payload) {
            const entity = this.legalEntities.find(e => String(e.id) === String(entityId))
            if (!entity) return null

            const { $api } = useNuxtApp()
            const { data } = await $api.put(`/legal-entities/${entity.id}/banks/${bankId}`, payload)
            const updated = data?.bank_detail
            if (updated) {
                const idx = entity.banks.findIndex(b => String(b.id) === String(bankId))
                if (idx >= 0) entity.banks[idx] = mapBankFromApi(updated)
            }
            return updated
        },

        async removeBank(entityId, bankId) {
            const entity = this.legalEntities.find(e => String(e.id) === String(entityId))
            if (!entity) return

            const { $api } = useNuxtApp()
            await $api.delete(`/legal-entities/${entity.id}/banks/${bankId}`)
            entity.banks = entity.banks.filter(b => String(b.id) !== String(bankId))
        },
    },
})