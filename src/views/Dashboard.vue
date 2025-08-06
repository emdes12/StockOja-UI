<script setup>
import DashboardView from '@/components/DashboardView.vue'
import { onMounted, ref } from 'vue'
import { useUserManagement } from '@/stores/userManagement'
import { useAppSettings } from '@/stores/appSettings'
import NotificationBar from '@/components/NotificationBar.vue'

const stored_user = useUserManagement()
const stored_settings = useAppSettings()
const user = ref({})
const businessDetails = ref({})
const notificationMessage = ref('')
const notificationType = ref('')
const isNotification = ref(false)

//  FUNCTIONS

// show notification
const showNotification = (msg, type) => {
  notificationMessage.value = msg
  notificationType.value = type
  isNotification.value = true

  setTimeout(() => {
    isNotification.value = false
  }, 2000)
}

onMounted(() => {
  // load user from dblocalstorage
  stored_user.loadUser()
  if (stored_user.users.length) {
    user.value = stored_user.users[0]
  } else {
    user.value['user_name'] = prompt('Your Name').toLowerCase()
    user.value['user_permission'] = prompt('Your Role? (admin, manager, staff)').toLocaleLowerCase()
    let initial = ''
    user.value.user_name.split(' ').forEach((e) => {
      initial += e[0]
    })
    user.value['initial'] = initial.toUpperCase()
    stored_user.addUser(user.value)
  }

  // loading settings
  stored_settings.loadSetting()
  businessDetails.value = stored_settings.settings[0].business
  if (businessDetails.value.name === '') {
    showNotification('Welcome to StockOja, heading to setting to complete your business', 'success')
    window.location.href = '/settings'
  }
})
</script>

<template>
  <NotificationBar v-if="isNotification" :msg="notificationMessage" :type="notificationType" />
  <DashboardView :user="user">
    <h1>This is an Dashboard page</h1>
  </DashboardView>
</template>
