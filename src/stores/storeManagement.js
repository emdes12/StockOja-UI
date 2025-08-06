import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoreManagement = defineStore('storeManagement', () => {
  const productList = ref([])

  function loadProducts() {
    const stored = JSON.parse(localStorage.getItem('stockStorage'))
    if (stored) {
      productList.value = stored
    }
  }

  // optional: if you want to add products later
  function addProduct(product) {
    productList.value.push(product)
    localStorage.setItem('stockStorage', JSON.stringify(productList.value))
  }

  function getSingleProduct(product_id) {
    return productList.value.find((prod) => prod.id === product_id)
  }

  function editProduct(product_edit) {
    console.log(product_edit)

    const newProds = productList.value.map((prod) => {
      if (prod.id === product_edit.id) {
        // actualData = prod
        prod = product_edit
        return prod
      }
      return prod
    })

    localStorage.setItem('stockStorage', JSON.stringify(newProds))
  }

  return {
    productList,
    loadProducts,
    addProduct,
    getSingleProduct,
    editProduct,
  }
})
