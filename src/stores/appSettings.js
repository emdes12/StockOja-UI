import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppSettings = defineStore('appSettings', () => {
  const settings = ref([])

  function loadSetting() {
    console.log('setting load hit')

    const stored = JSON.parse(localStorage.getItem('App Settings'))
    settings.value = stored
  }

  // optional: if you want to add products later
  function setSettings(set) {
    if (set.business.name === '' || set.business.address === '' || set.business.telephone === '') {
      return 'No Business Details'
    }
    if (
      set.payment.accept_bank === false &&
      set.payment.accept_pos === false &&
      set.payment.accept_cash === false
    ) {
      return 'No Payment Selected'
    }
    settings.value = []
    settings.value.push(set)
    localStorage.setItem('App Settings', JSON.stringify(settings.value))
  }

  return {
    loadSetting,
    settings,
    setSettings,
  }
})
