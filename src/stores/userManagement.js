import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserManagement = defineStore('userManagement', () => {
  const users = ref([])

  function loadUser() {
    const isUser = JSON.parse(localStorage.getItem('User'))
    if (isUser) {
      users.value = isUser
    }
  }

  // optional: if you want to add products later
  function addUser(user) {
    users.value.push(user)
    localStorage.setItem('User', JSON.stringify(users.value))
  }

  function logOut() {
    users.value = []
    localStorage.removeItem('User')
  }

  return {
    users,
    loadUser,
    addUser,
    logOut,
  }
})
