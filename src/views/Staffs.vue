<script setup>
import DashboardView from '@/components/DashboardView.vue'
import { onMounted, ref } from 'vue'
import { useUserManagement } from '@/stores/userManagement'
import { useAppSettings } from '@/stores/appSettings'
import NotificationBar from '@/components/NotificationBar.vue'
import BtnPry from '@/components/BtnPry.vue'

const stored_user = useUserManagement()
const stored_settings = useAppSettings()
const user = ref({})
const businessDetails = ref({})
const notificationMessage = ref('')
const notificationType = ref('')
const isNotification = ref(false)
const staffsList = ref([
  {
    id: 'jd7qw8bja83r89bass',
    name: 'Muhammed Saheed',
    email: 'muhaheed@gmail.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'e2uiwuu923rbuweu9283',
    name: 'Biola Okiki',
    email: 'bokiki@gmail.com',
    role: 'Manager',
    status: 'active',
  },
  {
    id: 'jd7qw8bja83r89bass',
    name: 'Muhammed Saheed',
    email: 'muhaheed@gmail.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'jd7qw8bja83r89bass',
    name: 'Muhammed Saheed',
    email: 'muhaheed@gmail.com',
    role: 'admin',
    status: 'active',
  },
])

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

function editPermission(id) {
  alert(id)
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
  <DashboardView :user="user" page-title="Users & Permission">
    <div class="page-actions">
      <div class="search">
        <input autocomplete="off" type="search" v-model="searchValue" @input="filterProd" />
      </div>
      <BtnPry v-if="user.user_permission !== 'staff'" :action="showForm" txt="Add User" />
    </div>

    <!-- Product List Table -->
    <div class="products-container" v-if="staffsList.length && !isForm && !isEditForm">
      <div class="product-head">
        <div class="product-name">Name</div>
        <div class="product-category">Email</div>
        <div class="product-qty">Role</div>
        <div class="product-status">Status</div>
        <div class="product-action">Actions</div>
      </div>
      <ul class="product-list">
        <li v-for="staff in staffsList">
          <div class="product-name">{{ staff.name }}</div>
          <div class="product-category">{{ staff.email || 'Others' }}</div>
          <div class="product-qty">{{ staff.role }}</div>
          <div class="product-status">
            <span v-if="staff.status = 'active'" class="good">Active</span>

            <span v-else class="danger">Inactive</span>
          </div>
          <div v-if="user.user_permission !== 'staff'" class="product-action">
            <span class="action" @click="editPermission(staff.id)">Edit Permission</span>
          </div>
        </li>
      </ul>
    </div>
  </DashboardView>
</template>

<style scoped>
.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 30px;
}

.search {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 10px 12px;
  border: 1px solid #cfcfcf;
  border-radius: var(--border-radius);
  flex: 1;
}

.search input {
  flex: 1;
  border: none;
  font-size: 0.9rem;
  background-color: inherit;
  color: var(--vt-c-black);
}

.search input:focus-visible {
  outline: none;
}
</style>
