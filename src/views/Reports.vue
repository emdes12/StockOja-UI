<script setup>
import DashboardView from '@/components/DashboardView.vue'
import TheWelcome from '../components/TheWelcome.vue'
import { onMounted, ref } from 'vue'
import { useUserManagement } from '@/stores/userManagement'

const stored_user = useUserManagement()
const user = ref({})

onMounted(() => {
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
  <DashboardView page-title="Report" :user="user">
    <h1>This is an Report page</h1>
  </DashboardView>
</template>
