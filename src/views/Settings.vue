<script setup>
import DashboardView from '@/components/DashboardView.vue'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useUserManagement } from '@/stores/userManagement'
import { useAppSettings } from '@/stores/appSettings'
import BtnPry from '@/components/BtnPry.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import UploadIcon from '@/assets/images/upload.png'

// variables
const refTaxRadio = useTemplateRef('taxRadio')
const refDiscountRadio = useTemplateRef('discountRadio')
const refBankRadio = useTemplateRef('bankRadio')
const refCashRadio = useTemplateRef('cashRadio')
const refEmailRadio = useTemplateRef('emailRadio')
const refPOSRadio = useTemplateRef('posRadio')
const stored_user = useUserManagement()
const stored_settings = useAppSettings()
const user = ref({})
const notificationMessage = ref('')
const notificationType = ref('')
const isNotification = ref(false)
const settings = ref({})
const defaultSettings = {
  business: {
    name: '',
    address: '',
    email: '',
    telephone: '',
  },
  preference: {
    currency: '₦',
    date_format: 'date-2',
    tax: {
      is_available: false,
      rate: 7.5,
    },
    discount: {
      is_available: false,
      rate: 0,
    },
  },
  payment: {
    accept_bank: false,
    accept_cash: true,
    accept_pos: false,
  },
  notification: {
    email: true,
  },
}

/* FUNCTIONS BELOW */

// Show Notification Box
const showNotification = (msg, type) => {
  notificationMessage.value = msg
  notificationType.value = type
  isNotification.value = true

  setTimeout(() => {
    isNotification.value = false
  }, 2000)
}
const submitSettings = () => {
  const load = stored_settings.setSettings(settings.value)
  console.log(settings.value.payment.accept_bank)
  console.log(settings.value.payment.accept_pos)
  console.log(settings.value.payment.accept_cash)

  if (load === 'No Payment Selected') {
    return showNotification('Error: One payment method most be selected', 'error')
  }

  if (load === 'No Business Details') {
    return showNotification('Error: Business Name, Address, Telephone is required', 'error')
  }
  showNotification('Settings Saved', 'success')
}

const clickTaxRadio = () => {
  refTaxRadio.value.click()
}
const clickDiscountRadio = () => {
  refDiscountRadio.value.click()
}
const clickBankRadio = () => {
  refBankRadio.value.click()
}
const clickCashRadio = () => {
  refCashRadio.value.click()
}
const clickEmailRadio = () => {
  refEmailRadio.value.click()
}
const clickPOSRadio = () => {
  refPOSRadio.value.click()
}

onMounted(() => {
  stored_settings.loadSetting()

  const existing = stored_settings.settings?.[0]
  settings.value = existing ? { ...existing } : { ...defaultSettings }

  // load user from dblocalstorage
  stored_user.loadUser()
  if (stored_user.users.length) {
    user.value = stored_user.users[0]
  } else {
    user.value['user_name'] = prompt('Your Name')
    user.value['user_permission'] = prompt('Your Role')
    let initial = ''
    user.value.user_name.split(' ').forEach((e) => {
      initial += e[0]
    })
    user.value['initial'] = initial.toUpperCase()
    stored_user.addUser(user.value)
  }
})
</script>

<template>
  <NotificationBar v-if="isNotification" :msg="notificationMessage" :type="notificationType" />
  <div v-if="settings.business">
    <DashboardView v-if="settings.business" :user="user" page-title="App Settings">
      <div v-if="user.user_permission === 'staff'">You don't have access to this page, Go back</div>
      <div v-else>
        <h2>Setting</h2>
        <div class="flex business-details">
          <label for="business-logo">
            <img class="business-logo" :src="UploadIcon" alt="image" />
            <input type="file" id="business-logo" accept=".jpg,.png,.jpeg" style="display: none" />
          </label>
          <div class="business-info">
            <h4>Business Info</h4>
            <input
              autocomplete="off"
              type="text"
              v-model="settings.business.name"
              placeholder="Business Name"
              required
            />
            <input
              autocomplete="off"
              type="text"
              v-model="settings.business.address"
              placeholder="Address"
              required
            />
            <input
              autocomplete="off"
              type="email"
              v-model="settings.business.email"
              placeholder="Business Email"
              required
            />
            <input
              autocomplete="off"
              type="tel"
              v-model="settings.business.telephone"
              placeholder="Phone Number"
              required
            />
          </div>
        </div>

        <!-- preference -->
        <div class="preference">
          <h4>System preference</h4>
          <ul class="panel-box">
            <li>
              <span>Currency</span>
              <select>
                <option value="date-1">YYYY-MM-DD 24hours</option>
                <option value="date-2">DD-MM-YYYY hh:ss</option>
                <option value="date-3">DD MMM, YYYY</option>
              </select>
            </li>
            <li>
              <span>Default VAT/Tax</span>
              <span style="position: relative">
                <p
                  style="
                    width: 23px;
                    height: calc(100% - 6px);
                    background-color: var(--vt-c-white);
                    color: var(--vt-c-black);
                    position: absolute;
                    top: 3px;
                    right: 1px;
                    display: grid;
                    place-items: center;
                  "
                >
                  %
                </p>
                <input type="number" step="0.01" v-model="settings.preference.tax.rate" />
              </span>
              <input
                style="display: none"
                type="checkbox"
                ref="taxRadio"
                v-model="settings.preference.tax.is_available"
              />
              <div
                @click="clickTaxRadio"
                :class="`${settings.preference.tax.is_available ? 'circle-double active' : 'circle-double'}`"
              >
                <div class="circle-single"></div>
              </div>
            </li>
            <li>
              <span>Sales Discount</span>
              <span style="position: relative">
                <p
                  style="
                    width: 23px;
                    height: calc(100% - 6px);
                    background-color: var(--vt-c-white);
                    color: var(--vt-c-black);
                    position: absolute;
                    top: 3px;
                    right: 1px;
                    display: grid;
                    place-items: center;
                  "
                >
                  %
                </p>
                <input type="number" step="0.01" v-model="settings.preference.discount.rate" />
              </span>
              <input
                style="display: none"
                type="checkbox"
                ref="discountRadio"
                v-model="settings.preference.discount.is_available"
              />
              <div
                @click="clickDiscountRadio"
                :class="`${settings.preference.discount.is_available ? 'circle-double active' : 'circle-double'}`"
              >
                <div class="circle-single"></div>
              </div>
            </li>
          </ul>
        </div>

        <!-- payment -->
        <div class="preference">
          <h4>Payment Settings</h4>
          <ul class="panel-box">
            <li>
              <span>Cash Payment</span>
              <input
                style="display: none"
                type="checkbox"
                ref="cashRadio"
                v-model="settings.payment.accept_cash"
              />
              <div
                @click="clickCashRadio"
                :class="`${settings.payment.accept_cash ? 'circle-double active' : 'circle-double'}`"
              >
                <div class="circle-single"></div>
              </div>
            </li>
            <li>
              <span>Bank Transfer</span>
              <input
                style="display: none"
                type="checkbox"
                ref="bankRadio"
                v-model="settings.payment.accept_bank"
              />
              <div
                @click="clickBankRadio"
                :class="`${settings.payment.accept_bank ? 'circle-double active' : 'circle-double'}`"
              >
                <div class="circle-single"></div>
              </div>
            </li>
            <li>
              <span>POS Terminal</span>
              <input
                style="display: none"
                type="checkbox"
                ref="posRadio"
                v-model="settings.payment.accept_pos"
              />
              <div
                @click="clickPOSRadio"
                :class="`${settings.payment.accept_pos ? 'circle-double active' : 'circle-double'}`"
              >
                <div class="circle-single"></div>
              </div>
            </li>
          </ul>
        </div>

        <!-- notification -->
        <div class="preference">
          <h4>Notifications</h4>
          <ul class="panel-box">
            <li>
              <span>Email Notification</span>
              <input
                style="display: none"
                type="checkbox"
                ref="emailRadio"
                v-model="settings.notification.email"
              />
              <div
                @click="clickEmailRadio"
                :class="`${settings.notification.email ? 'circle-double active' : 'circle-double'}`"
              >
                <div class="circle-single"></div>
              </div>
            </li>
          </ul>
        </div>
        <div class="preference">
          <BtnPry txt="Save Settings" :action="submitSettings" />
        </div>
      </div>
    </DashboardView>
  </div>
</template>
<style scoped>
.business-details {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 30px;
  padding: 20px;
}

.business-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.preference {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

ul,
.business-details {
  border: 1px solid #ccc;
  border-radius: 8px;
}

ul.panel-box li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
}

li:not(:last-child) {
  border-bottom: 1px solid #ccc;
}

li input,
li select {
  max-width: max-content;
}

li input {
  max-width: 80px;
}

li span:first-child {
  min-width: 150px;
}

.circle-double {
  width: 30px;
  height: 20px;
  border-radius: 20px;
  border: 1px solid #ccc;
  background-color: white;
  display: flex;
  align-items: start;
  justify-content: center;
  padding: 3px;
  flex-direction: column;
}

.circle-double.active {
  background-color: var(--color-primary);
  align-items: flex-end;
  transition: all 0.1s ease-in-out;
}

.circle-single {
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #ccc;
  transition: all 0.1s ease-in-out;
}
</style>
