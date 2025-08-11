import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProdHistory = defineStore('productHistory', () => {
  const prod_history = ref([])

  function loadHistory() {
    const stored = JSON.parse(localStorage.getItem('Product History'))
    if (stored) {
      prod_history.value = stored
    }
  }

  // optional: if you want to add products later
  function addprodHistory(prod) {
    prod_history.value.push(prod)
    localStorage.setItem('Product History', JSON.stringify(prod_history.value))
  }

  return {
    prod_history,
    loadHistory,
    addprodHistory,
  }
})
