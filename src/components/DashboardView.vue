<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useUserManagement } from '@/stores/userManagement'
// import BtnDbPry from './BtnDbPry.vue'
// import CustomersIcon from '../assets/icons/CustomersIcon.svg'
// import ServicesIcon from '../assets/icons/ServicesIcon.svg'
// import FormsIcon from '../assets/icons/FormsIcon.svg'
// import CalendarIcon from '../assets/icons/CalendarIcon.svg'
// import StaffsIcon from '../assets/icons/StaffsIcon.svg'
// import SearchIcon from '../assets/icons/SearchIcon.svg'
// import NotificationIcon from '../assets/icons/NotificationIcon.svg'
defineProps({
  pageTitle: {
    type: String,
    required: true,
    default: 'Dashboard',
  },
  user: {
    type: Object,
    required: false,
  },
})

const stored_user = useUserManagement()

let isProfileOption = ref(false)

const logOutHandler = () => {
  stored_user.logOut()

  window.location.href = '/dashboard'
}

const isSidebarCollapsed = ref(false)
const windowWidth = ref(window.innerWidth)

const navItems = [
  {
    permission: 'admin manager',
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'CustomersIcon',
  },
  {
    permission: 'admin manager staff',
    path: '/sales',
    name: 'Sales',
    icon: 'CalendarIcon',
  },
  {
    permission: 'admin manager staff',
    path: '/products',
    name: 'Product',
    icon: 'ServicesIcon',
  },
  {
    permission: 'admin manager staff',
    path: '/records',
    name: 'History',
    icon: 'FormsIcon',
  },
  {
    permission: 'admin manager',
    path: '/reports',
    name: 'Reports',
    icon: 'StaffsIcon',
  },
  {
    permission: 'admin manager',
    path: '/staffs',
    name: 'Users & Roles',
    icon: 'Staffs',
  },
]

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const checkScreenSize = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value <= 768) {
    isSidebarCollapsed.value = true
  } else {
    isSidebarCollapsed.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', checkScreenSize)
  checkScreenSize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div>
    <div class="dashboard-container">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <!-- <h1 class="logo">SoPeluApp</h1> -->
          <!-- <div class="logo">
            <img src="@/assets/logo.svg" alt="Company Logo" />
          </div> -->
          <h2>{{ pageTitle }}</h2>
        </div>

        <div class="header-right" @click="logOutHandler" title="logout">
          <div
            class="avatar"
            style="background-color: black; color: greenyellow; text-transform: uppercase"
          >
            {{ user.initial || 'LT' }}
          </div>
          <div class="user-profile-details nav-text">
            <b class="username">{{ user.user_name }}</b>
          </div>
          <!-- add the notification/search icon and btn later -->
          <!-- <BtnDbPry
            :onClickToAct="toggleDialogueBtn"
            v-show="hBtnShow && user.user_permission !== 'staff'"
            :msg="hBtnMsg"
            wdt="max-content"
          /> -->
          <!-- <img :src="SearchIcon" alt="search" />
          <img :src="NotificationIcon" alt="notification" /> -->
        </div>
      </header>

      <!-- Sidebar -->
      <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <button class="menu-toggle" @click="toggleSidebar">
          <!-- <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg> -->
          >
        </button>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            active-class="active"
            :style="`${
              item.permission.includes(user.user_permission) ? 'display: flex;' : 'display: none;'
            }`"
          >
            <!-- :style="'" -->
            <img :src="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <router-link
            active-class="active"
            class="nav-item"
            to="/settings"
            :style="`${user.user_permission !== 'staff' ? 'display: flex;' : 'display: none;'}`"
          >
            <!-- :style="'" -->
            <img :src="CustomerIcon" class="nav-icon" />
            <span class="nav-text">Setting</span>
          </router-link>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content" :class="{ expanded: isSidebarCollapsed }">
        <div class="content-container">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: grid;
  background-color: var(--color-background);
  grid-template-areas:
    'header header'
    'sidebar main';
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--color-background);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  z-index: 100;
  position: sticky;
  top: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  cursor: pointer;
  /* padding-right: 2rem; */
  gap: 1rem;
}

.header-right img {
  width: 1.5rem;
  cursor: pointer;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  /* padding: 0.5rem; */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  font: 700;
  font-size: large;
  border-radius: 50%;
  background: var(--vt-c-black);
  color: var(--vt-c-white);
  position: absolute;
  top: 10px;
  right: -20px;
  z-index: 100000;
  display: grid;
  place-items: center;
}

.logo img {
  height: 2.5rem;
}

.sidebar {
  grid-area: sidebar;
  width: 250px;
  height: calc(100vh - 64px);
  background-color: var(--color-background);
  color: white;
  border-right: 2px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  display: flex;
  color: var(--vt-c-text-dark-2) !important;
  flex-direction: column;
  align-items: center;
}

.nav-item {
  width: 80%;
  min-width: 60px;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--vt-c-black);
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  border-radius: 10px;
}

.nav-item:hover {
  background-color: var(--vt-c-text-dark-2);
}

.nav-item.active {
  background-color: var(--color-primary);
  color: #ffffff !important;
}

.nav-item.nav-item.active span {
  color: #ffffff !important;
}

.nav-icon {
  margin-right: 1rem;
  width: 1rem;
  flex-shrink: 0;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar.collapsed .nav-icon {
  margin-right: 0;
}

.username {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 1rem;
  color: var(--vt-c-black);
}

.sidebar-footer {
  padding: 1rem;
  position: relative;
  cursor: pointer;
  border-top: 1px solid #34495e;
}

.profile-options {
  position: absolute;
  bottom: 100%;
  right: 30px;
  padding: 10px;
  border-radius: 10px;
  background-color: var(--vt-c-text-dark-2);
  color: var(--vt-c-divider-dark-2) !important;
  list-style-type: none;
}

li {
  /* color: #1d3448; */
  color: var(--vt-c-text-dark-1);
  padding: 6px 12px;
  width: 100px;
}

li:not(:nth-last-child()) {
  margin-bottom: 100px;
}

router-link,
a {
  text-decoration: none;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
}

.sidebar.collapsed .sidebar-footer {
  padding: 1rem 0;
}

.avatar {
  min-width: 2rem;
  height: 2rem;
  font-size: 0.7rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.user-profile-details {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.user-profile:hover {
  background-color: #ffffff2a;
}

.main-content {
  grid-area: main;
  padding: 1rem;
  padding-right: 0;
  background-color: var(--color-background);
  height: calc(100vh - 64px);
  transition: margin-left 0.3s ease;
  overflow: hidden;
}

.content-container {
  background-color: var(--vt-c-white);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow: auto;
}

/* Responsive styles */
@media (max-width: 768px) {
  .dashboard-container {
    grid-template-areas:
      'header'
      'main';
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 64px);
    z-index: 90;
    transform: translateX(-100%);
  }

  /* .sidebar.collapsed {
    transform: translateX(0);
    width: 250px;
  } */

  .main-content {
    margin-left: 0 !important;
  }
}

.email {
  width: 130px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
