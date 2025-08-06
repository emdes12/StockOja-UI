import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSalesHistory = defineStore('salesHistory', () => {
  const sales_history = ref([])

  function loadHistory() {
    const stored = JSON.parse(localStorage.getItem('Sales History'))
    if (stored) {
      sales_history.value = stored
    }
  }

  // optional: if you want to add products later
  function addCart(prod) {
    sales_history.value.push(prod)
    localStorage.setItem('Sales History', JSON.stringify(sales_history.value))
  }

  return {
    sales_history,
    loadHistory,
    addCart,
  }
})
