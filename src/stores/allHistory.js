import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAllHistory = defineStore('allHistory', () => {
  const all_histories = ref([])

  function loadHistories() {
    const histories = JSON.parse(localStorage.getItem('All History'))
    console.log(histories)

    if (histories) {
      all_histories.value = histories
    }
  }

  // optional: if you want to add products later
  function addHistory(update) {
    all_histories.value.push(update)
    localStorage.setItem('All History', JSON.stringify(all_histories.value))
  }

  return {
    loadHistories,
    all_histories,
    addHistory,
  }
})
