<template>
    <div class="grid gap-4 md:grid-cols-2">
        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:user-round" class="ic" /> Personal</h2>
                <button class="edit-btn" title="Edit Personal" @click="openSection('personal')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <div class="grid2">
                <div><span class="label">First Name</span>{{ employee.first_name || '—' }}</div>
                <div><span class="label">Last Name</span>{{ employee.last_name || '—' }}</div>
                <div><span class="label">Display Name</span>{{ employee.display_name || '—' }}</div>
                <div><span class="label">Date of Birth</span>{{ employee.date_of_birth || '—' }}</div>
                <div><span class="label">Gender</span>{{ formatGender(employee.gender) }}</div>
                <div><span class="label">Marital Status</span>{{ formatLabel(employee.marital_status) }}</div>
                <div><span class="label">Blood Group</span>{{ formatLabel(employee.blood_group) }}</div>
                <div><span class="label">Nationality</span>{{ formatLabel(employee.nationality) }}</div>
                <div><span class="label">Physically Handicapped</span>{{ employee.physically_handicapped ? 'Yes' : 'No' }}</div>
            </div>
        </section>

        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:contact" class="ic" /> Contact</h2>
                <button class="edit-btn" title="Edit Contact" @click="openSection('contact')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <div class="grid2">
                <div><span class="label">Work Email</span>{{ employee.email || '—' }}</div>
                <div><span class="label">Personal Email</span>{{ employee.personal_email || '—' }}</div>
                <div><span class="label">Personal Number</span>{{ employee.phone || '—' }}</div>
                <div><span class="label">Work Number</span>{{ employee.alt_phone || '—' }}</div>
            </div>
        </section>

        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:map-pin" class="ic" /> Address Information</h2>
                <button class="edit-btn" title="Edit Address" @click="openSection('address')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <div class="addr-block">
                <div>
                    <span class="label">Current Address</span>
                    <p v-if="currentAddress" class="address">{{ currentAddress }}</p>
                    <p v-else class="empty">No current address available.</p>
                </div>
                <div>
                    <span class="label">Permanent Address</span>
                    <p v-if="permanentAddress" class="address">{{ permanentAddress }}</p>
                    <p v-else class="empty">No permanent address available.</p>
                </div>
            </div>
        </section>

        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:align-left" class="ic" /> Professional Summary</h2>
                <button class="edit-btn" title="Edit Summary" @click="openSection('summary')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <p v-if="employee.professional_summary" class="summary">{{ employee.professional_summary }}</p>
            <p v-else class="empty">No professional summary available.</p>
        </section>

        <section class="card">
            <h2 class="hdr"><Icon name="lucide:shield" class="ic" /> Identity Information</h2>
            <div class="grid2">
                <div><span class="label">PAN</span>—</div>
                <div><span class="label">Aadhaar</span>—</div>
                <div><span class="label">Passport Number</span>—</div>
            </div>
        </section>

        <section class="card">
            <h2 class="hdr"><Icon name="lucide:graduation-cap" class="ic" /> Education</h2>
            <p class="empty">No education information available.</p>
        </section>
    </div>

    <UiSidebarModal v-model="modalOpen" :title="modalTitle" width="620px">
        <template #default>
            <div v-if="activeSection === 'personal'" class="form-grid">
                <div class="field">
                    <p class="lbl">First Name</p>
                    <FormInput v-model="personal.first_name" class="w-full" color="#fff" prepend-icon="bx:bx-user" size="md" rounded="lg" placeholder="First Name" />
                </div>
                <div class="field">
                    <p class="lbl">Last Name</p>
                    <FormInput v-model="personal.last_name" class="w-full" color="#fff" prepend-icon="bx:bx-user" size="md" rounded="lg" placeholder="Last Name" />
                </div>
                <div class="field">
                    <p class="lbl">Display Name</p>
                    <FormInput v-model="personal.display_name" class="w-full" color="#fff" prepend-icon="bx:bx-user" size="md" rounded="lg" placeholder="Display Name" />
                </div>
                <div class="field">
                    <p class="lbl">Date of Birth</p>
                    <FormInput v-model="personal.date_of_birth" type="date" class="w-full" color="#fff" prepend-icon="bx:bx-calendar" size="md" rounded="lg" placeholder="Date of Birth" />
                </div>
                <div class="field">
                    <p class="lbl">Gender</p>
                    <FormSelect v-model="personal.gender" class="w-full" color="#fff" prepend-icon="bx:bx-user" :options="genderOptions" searchable size="md" rounded="lg" placeholder="Gender" clearable />
                </div>
                <div class="field">
                    <p class="lbl">Marital Status</p>
                    <FormSelect v-model="personal.marital_status" class="w-full" color="#fff" prepend-icon="lucide:rings" :options="maritalOptions" searchable size="md" rounded="lg" placeholder="Marital Status" clearable />
                </div>
                <div class="field">
                    <p class="lbl">Blood Group</p>
                    <FormSelect v-model="personal.blood_group" class="w-full" color="#fff" prepend-icon="lucide:droplets" :options="bloodOptions" searchable size="md" rounded="lg" placeholder="Blood Group" clearable />
                </div>
                <div class="field">
                    <p class="lbl">Nationality</p>
                    <FormInput v-model="personal.nationality" class="w-full" color="#fff" prepend-icon="lucide:globe" size="md" rounded="lg" placeholder="Nationality" />
                </div>
                <div class="field col-span-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div>
                        <p class="text-sm text-white/80">Physically Handicapped</p>
                        <p class="text-xs text-white/45">Has a physical disability</p>
                    </div>
                    <UiSwitch v-model="personal.physically_handicapped" color="#4aff7a" size="md" />
                </div>
            </div>

            <div v-else-if="activeSection === 'contact'" class="form-grid">
                <div class="field">
                    <p class="lbl">Work Email</p>
                    <FormInput v-model="contact.email" type="email" class="w-full" color="#fff" prepend-icon="bx:bx-envelope" size="md" rounded="lg" placeholder="Work Email" />
                </div>
                <div class="field">
                    <p class="lbl">Personal Email</p>
                    <FormInput v-model="contact.personal_email" type="email" class="w-full" color="#fff" prepend-icon="bx:bx-envelope" size="md" rounded="lg" placeholder="Personal Email" />
                </div>
                <div class="field">
                    <p class="lbl">Personal Number</p>
                    <FormInput v-model="contact.phone" type="tel" class="w-full" color="#fff" prepend-icon="bx:bx-phone" size="md" rounded="lg" placeholder="Personal Number" />
                </div>
                <div class="field">
                    <p class="lbl">Work Number</p>
                    <FormInput v-model="contact.alt_phone" type="tel" class="w-full" color="#fff" prepend-icon="bx:bx-phone" size="md" rounded="lg" placeholder="Work Number" />
                </div>
            </div>

            <div v-else-if="activeSection === 'address'" class="form-grid">
                <p class="addr-title col-span-2">Current Address</p>
                <div class="field">
                    <p class="lbl">Address Line 1</p>
                    <FormInput v-model="address.current.address_line1" class="w-full" color="#fff" size="md" rounded="lg" placeholder="House / Street" />
                </div>
                <div class="field">
                    <p class="lbl">Address Line 2</p>
                    <FormInput v-model="address.current.address_line2" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Area / Landmark" />
                </div>
                <div class="field">
                    <p class="lbl">City</p>
                    <FormInput v-model="address.current.city" class="w-full" color="#fff" size="md" rounded="lg" placeholder="City" />
                </div>
                <div class="field">
                    <p class="lbl">State</p>
                    <FormInput v-model="address.current.state" class="w-full" color="#fff" size="md" rounded="lg" placeholder="State" />
                </div>
                <div class="field">
                    <p class="lbl">Country</p>
                    <FormInput v-model="address.current.country" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Country" />
                </div>
                <div class="field">
                    <p class="lbl">Postal Code</p>
                    <FormInput v-model="address.current.postal_code" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Postal Code" />
                </div>
                <div class="field col-span-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div>
                        <p class="text-sm text-white/80">Same as Current Address</p>
                        <p class="text-xs text-white/45">Copy current address to permanent address</p>
                    </div>
                    <UiSwitch v-model="address.same_as_current" color="#4aff7a" size="md" />
                </div>
                <p class="addr-title col-span-2">Permanent Address</p>
                <div class="field">
                    <p class="lbl">Address Line 1</p>
                    <FormInput v-model="address.permanent.address_line1" class="w-full" color="#fff" size="md" rounded="lg" placeholder="House / Street" />
                </div>
                <div class="field">
                    <p class="lbl">Address Line 2</p>
                    <FormInput v-model="address.permanent.address_line2" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Area / Landmark" />
                </div>
                <div class="field">
                    <p class="lbl">City</p>
                    <FormInput v-model="address.permanent.city" class="w-full" color="#fff" size="md" rounded="lg" placeholder="City" />
                </div>
                <div class="field">
                    <p class="lbl">State</p>
                    <FormInput v-model="address.permanent.state" class="w-full" color="#fff" size="md" rounded="lg" placeholder="State" />
                </div>
                <div class="field">
                    <p class="lbl">Country</p>
                    <FormInput v-model="address.permanent.country" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Country" />
                </div>
                <div class="field">
                    <p class="lbl">Postal Code</p>
                    <FormInput v-model="address.permanent.postal_code" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Postal Code" />
                </div>
            </div>

            <div v-else-if="activeSection === 'summary'" class="form-grid">
                <div class="field col-span-2">
                    <p class="lbl">Professional Summary</p>
                    <InputArea v-model="summary" color="#fff" size="md" minHeight="120px" placeholder="Brief summary of the employee's professional background..." />
                </div>
            </div>
        </template>
        <template #footer>
            <div class="w-full flex justify-end gap-3">
                <UiButton :disabled="saving" @click="closeSection" color="#fff" text="Cancel" />
                <UiButton :disabled="saving" @click="saveSection" color="#4aff7a" text="Save Changes" prepend-icon="ion:checkmark-circle" />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEmployeesStore } from '../../../stores/employee.store'
import { apiAddressToStore, formatAddress } from '../../../utils/employeeProfile'

const props = defineProps({
    employee: { type: Object, required: true },
})

const emit = defineEmits(['updated'])

const employeesStore = useEmployeesStore()

const currentAddress = computed(() => formatAddress(props.employee.current_address))
const permanentAddress = computed(() => formatAddress(props.employee.permanent_address))

function formatGender(g) {
    if (!g) return '—'
    return g.charAt(0) + g.slice(1).toLowerCase()
}

function formatLabel(v) {
    if (!v) return '—'
    const s = String(v).toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

// ---------- Section editing state ----------
const modalOpen = ref(false)
const activeSection = ref(null)
const saving = ref(false)

const genderOptions = ['MALE', 'FEMALE', 'OTHER']
const maritalOptions = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
const bloodOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const personal = ref({ first_name: '', last_name: '', display_name: '', date_of_birth: '', gender: '', marital_status: '', blood_group: '', nationality: '', physically_handicapped: false })
const contact = ref({ email: '', personal_email: '', phone: '', alt_phone: '' })
const address = ref({ current: {}, permanent: {}, same_as_current: false })
const summary = ref('')

const modalTitle = computed(() => ({
    personal: 'Edit Personal Information',
    contact: 'Edit Contact Information',
    address: 'Edit Address Information',
    summary: 'Edit Professional Summary',
}[activeSection.value] || 'Edit Section'))

function toInputDate(dateString) {
    if (!dateString) return ''
    if (dateString instanceof Date) return dateString.toISOString().slice(0, 10)
    if (typeof dateString === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) return dateString.slice(0, 10)
        const parsed = new Date(dateString)
        if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    }
    return ''
}

function openSection(section) {
    const e = props.employee
    if (section === 'personal') {
        personal.value = {
            first_name: e.first_name || '',
            last_name: e.last_name || '',
            display_name: e.display_name || '',
            date_of_birth: toInputDate(e.date_of_birth),
            gender: e.gender || '',
            marital_status: e.marital_status || '',
            blood_group: e.blood_group || '',
            nationality: e.nationality || '',
            physically_handicapped: !!e.physically_handicapped,
        }
    } else if (section === 'contact') {
        contact.value = {
            email: e.email || '',
            personal_email: e.personal_email || '',
            phone: e.phone || '',
            alt_phone: e.alt_phone || '',
        }
    } else if (section === 'address') {
        address.value = {
            current: apiAddressToStore(e.current_address),
            permanent: apiAddressToStore(e.permanent_address),
            same_as_current: false,
        }
    } else if (section === 'summary') {
        summary.value = e.professional_summary || ''
    }
    activeSection.value = section
    modalOpen.value = true
}

function closeSection() {
    modalOpen.value = false
    activeSection.value = null
    saving.value = false
}

// ---------- Change detection (only changed fields are sent) ----------
const norm = (v) => (v == null ? '' : String(v).trim())
const normDate = (v) => (v ? String(v).slice(0, 10) : '')

function sameAddr(a, b) {
    const keys = ['address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code']
    return keys.every(k => norm(a[k]) === norm(b[k]))
}

function buildChanges() {
    const e = props.employee
    const changes = {}

    if (activeSection.value === 'personal') {
        const p = personal.value
        if (norm(p.first_name) !== norm(e.first_name)) changes.firstName = norm(p.first_name) || null
        if (norm(p.last_name) !== norm(e.last_name)) changes.lastName = norm(p.last_name) || null
        if (norm(p.display_name) !== norm(e.display_name)) changes.displayName = norm(p.display_name) || null
        const dob = normDate(p.date_of_birth)
        if (dob !== normDate(e.date_of_birth)) changes.dateOfBirth = dob || null
        if (norm(p.gender) !== norm(e.gender)) changes.gender = norm(p.gender) || null
        if (norm(p.marital_status) !== norm(e.marital_status)) changes.maritalStatus = norm(p.marital_status) || null
        if (norm(p.blood_group) !== norm(e.blood_group)) changes.bloodGroup = norm(p.blood_group) || null
        if (norm(p.nationality) !== norm(e.nationality)) changes.nationality = norm(p.nationality) || null
        if (Boolean(p.physically_handicapped) !== Boolean(e.physically_handicapped)) changes.physicallyHandicapped = Boolean(p.physically_handicapped)
    } else if (activeSection.value === 'contact') {
        const c = contact.value
        if (norm(c.email) !== norm(e.email)) changes.email = norm(c.email) || null
        if (norm(c.personal_email) !== norm(e.personal_email)) changes.personalEmail = norm(c.personal_email) || null
        if (norm(c.phone) !== norm(e.phone)) changes.phone = norm(c.phone)
        if (norm(c.alt_phone) !== norm(e.alt_phone)) changes.altPhone = norm(c.alt_phone) || null
    } else if (activeSection.value === 'address') {
        const a = address.value
        const current = a.same_as_current ? { ...a.current } : a.current
        const permanent = a.same_as_current ? { ...a.current } : a.permanent
        const curOrig = apiAddressToStore(e.current_address)
        const permOrig = apiAddressToStore(e.permanent_address)
        if (!sameAddr(current, curOrig)) changes.currentAddress = employeesStore.addressPayload(current) || null
        if (!sameAddr(permanent, permOrig)) changes.permanentAddress = employeesStore.addressPayload(permanent) || null
    } else if (activeSection.value === 'summary') {
        if (norm(summary.value) !== norm(e.professional_summary)) changes.professionalSummary = norm(summary.value) || null
    }

    return changes
}

function validateChanges(changes) {
    if (changes.phone !== undefined && !/^[0-9]{10}$/.test(changes.phone)) {
        useToast().error({ title: 'Invalid number', message: 'Personal number must be exactly 10 digits.', timeout: 2500 })
        return false
    }
    if (changes.email !== undefined && changes.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(changes.email)) {
        useToast().error({ title: 'Invalid email', message: 'Work email format is invalid.', timeout: 2500 })
        return false
    }
    if (changes.personalEmail !== undefined && changes.personalEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(changes.personalEmail)) {
        useToast().error({ title: 'Invalid email', message: 'Personal email format is invalid.', timeout: 2500 })
        return false
    }
    if (changes.altPhone !== undefined && changes.altPhone && !/^[0-9]{6,15}$/.test(changes.altPhone)) {
        useToast().error({ title: 'Invalid number', message: 'Work number must be 6-15 digits.', timeout: 2500 })
        return false
    }
    return true
}

async function saveSection() {
    if (saving.value) return
    const changes = buildChanges()
    if (Object.keys(changes).length === 0) {
        useToast().info({ title: 'No changes', message: 'No changes were made.', timeout: 1500 })
        closeSection()
        return
    }
    if (!validateChanges(changes)) return
    saving.value = true
    try {
        await employeesStore.updateEmployeeFields(props.employee.id, changes)
        closeSection()
        emit('updated')
    } catch (err) {
        saving.value = false
    }
}
</script>

<style scoped>
.card {
    padding: 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    min-width: 0;
}

.hdr-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin-bottom: 10px;
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
}

.edit-btn {
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.55);
    transition: all 0.2s ease;
}

.edit-btn:hover {
    color: #4aff7a;
    background: rgba(74, 255, 122, 0.12);
}

.ic { width: 16px; height: 16px; opacity: 0.85; }

.grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
    font-size: 13.5px;
    line-height: 1.35;
}

.label {
    display: block;
    font-size: 10.5px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 2px;
}

.empty {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
}

.address {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.5;
}

.addr-block {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
}

.addr-block .label {
    margin-bottom: 4px;
}

.summary {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    white-space: pre-wrap;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-width: 0;
}

.field.col-span-2 {
    grid-column: span 2;
}

.lbl {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
}

.addr-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.5);
    margin: 4px 0 0;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 640px) {
    .grid2 { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .field.col-span-2 { grid-column: span 1; }
}
</style>