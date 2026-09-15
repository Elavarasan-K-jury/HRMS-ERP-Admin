import { defineStore } from 'pinia'
import { useToast } from '#imports'
import { useRuntimeConfig, useNuxtApp } from '#app'

export const useTrafficReportsStore = defineStore('trafficReports', {
    state: () => ({
        loading: false,
        error: null,

        // Controls hourly (1) vs daily (>1)
        days: 1,

        overview: {
            totals: {
                requests: 0,
                errors: 0,
                errorRate: 0
            },
            trend: []
        },

        services: [],
        routes: [],
        errors: [],

        latency: {
            avgLatencyMs: 0,
            minLatencyMs: 0,
            maxLatencyMs: 0
        },

        alerts: []
    }),

    /* =========================================================
       GETTERS
    ========================================================= */
    getters: {
        /* ---------- KPI ---------- */
        totalRequests: (s) => s.overview.totals?.requests ?? 0,
        totalErrors: (s) => s.overview.totals?.errors ?? 0,
        errorRate: (s) => Number(s.overview.totals?.errorRate ?? 0).toFixed(2),
        avgLatency: (s) => Math.round(s.latency?.avgLatencyMs ?? 0),

        /* ---------- SERVICE HEALTH ---------- */
        serviceHealth: (s) =>
            (s.services || []).map((svc) => {
                const req = svc.requests ?? 0
                const err = svc.errors ?? 0
                const rate = req > 0 ? (err / req) * 100 : 0

                return {
                    name: svc.service,
                    uptime: (100 - rate).toFixed(2),
                    status:
                        rate > 5
                            ? 'unhealthy'
                            : rate > 1
                                ? 'degraded'
                                : 'healthy'
                }
            }),

        /* ---------- TOP ROUTES ---------- */
        topRoutes: (s) =>
            (s.routes || []).slice(0, 5).map((r) => ({
                path: r.route,
                method: r.method,
                requests: r.requests ?? 0,
                errors: r.errors ?? 0
            })),

        /* ---------- ERROR DONUT ---------- */
        errorBreakdown: (s) => {
            const map = { '2xx': 0, '4xx': 0, '5xx': 0 }

                ; (s.errors || []).forEach((e) => {
                    if (map[e.statusClass] !== undefined) {
                        map[e.statusClass] = e.count
                    }
                })

            // order matters for donut
            return [map['5xx'], map['4xx'], map['2xx']]
        }
    },

    /* =========================================================
       ACTIONS
    ========================================================= */
    actions: {
        async fetchAll() {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const [
                    overviewRes,
                    servicesRes,
                    routesRes,
                    errorsRes,
                    latencyRes,
                    alertsRes
                ] = await Promise.all([
                    $api.get(
                        `${config.public.apiTrafficBase}/superadmin/traffic/overview`,
                        { params: { days: this.days } }
                    ),

                    // 🔴 IMPORTANT FIX: pass days
                    $api.get(
                        `${config.public.apiTrafficBase}/superadmin/traffic/services`,
                        { params: { days: this.days } }
                    ),

                    $api.get(`${config.public.apiTrafficBase}/superadmin/traffic/routes`),
                    $api.get(`${config.public.apiTrafficBase}/superadmin/traffic/errors`),
                    $api.get(`${config.public.apiTrafficBase}/superadmin/traffic/latency`),
                    $api.get(`${config.public.apiTrafficBase}/superadmin/traffic/alerts`)
                ])

                /* ---------- ASSIGN DATA ---------- */
                this.overview = overviewRes?.data?.data ?? {
                    totals: { requests: 0, errors: 0, errorRate: 0 },
                    trend: []
                }

                this.services = servicesRes?.data?.data ?? []
                this.routes = routesRes?.data?.data ?? []
                this.errors = errorsRes?.data?.data ?? []

                this.latency = latencyRes?.data?.data ?? {
                    avgLatencyMs: 0,
                    minLatencyMs: 0,
                    maxLatencyMs: 0
                }

                this.alerts = alertsRes?.data?.data ?? []
            } catch (err) {
                console.error('[traffic-reports] fetchAll error:', err)
                this.error = err
                toast.error({
                    title: 'Error',
                    message: 'Failed to load traffic dashboard',
                    timeout: 1500
                })
            } finally {
                this.loading = false
            }
        }
    }
})
