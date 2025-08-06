<script setup>
import { ref, computed, useTemplateRef, onMounted, onBeforeMount } from 'vue'
import DashboardView from '@/components/DashboardView.vue'
import BtnPry from '@/components/BtnPry.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useStoreManagement } from '@/stores/storeManagement'
import { useAppSettings } from '@/stores/appSettings'
import { useSalesHistory } from '@/stores/saleHistory'
import { useAllHistory } from '@/stores/allHistory'
import { useUserManagement } from '@/stores/userManagement'

// DATA BELOW
const store = useStoreManagement()
const salesHistory = useSalesHistory()
const stored_user = useUserManagement()
const all_history = useAllHistory()
const stored_settings = useAppSettings()
const user = ref({})
const isLoaded = ref(false)
const isForm = ref(false)
const isEditForm = ref(false)
const productList = ref([])
const productCopy = ref([])
const searchValue = ref('')
const notificationMessage = ref('')
const notificationType = ref('')
const isNotification = ref(false)
const purchasedCart = ref({
  cartLists: [],
  sub_total: 0,
  tax: 0,
  discount: 0,
  total: 0,
})

const businessData = ref({})

// product data (to be sent to backend)
const productData = ref({
  productName: '',
  description: '',
  mainCategory: '',
  subCategory: '',
  selling_price: null,
  purchase_price: null,
  stock: null,
  selectedFile: null,
})

// const fileInputClick = useTemplateRef('prodInpField')

/* FUNCTIONS BELOW */

// Show Notification Box
const showNotification = (msg, type) => {
  notificationMessage.value = msg
  notificationType.value = type
  isNotification.value = true

  setTimeout(() => {
    isNotification.value = false
  }, 2000)
}

// search and filter
const filterProd = () => {
  if (searchValue.value === '') {
    productList.value = productCopy.value
    return
  }

  const search = productCopy.value.filter((prod) =>
    prod.prod_name.toLowerCase().includes(searchValue.value.toLowerCase()),
  )

  productList.value = search
}

// create ID
const createID = () => {
  const idVars = '1234567890abcdefghijklmnopqrstuvwxyz'
  let ids = ''
  for (let i = 0; i < 20; i++) {
    const element = Math.floor(Math.random() * idVars.length)
    ids += idVars[element]
  }
  return ids
}

// Function to handle form submission
const handleCheckout = (e) => {
  e.preventDefault()
  salesHistory.loadHistory()

  // check each product in productcopy
  purchasedCart.value.cartLists.forEach((cart) => {
    const soldProd = productCopy.value.filter((prod) => {
      if (prod.id === cart.id) {
        return prod
      }
    })
    soldProd[0].quantity_in_stock -= cart.units

    store.editProduct(soldProd[0])
  })

  const basket = { id: createID, ...purchasedCart.value }

  salesHistory.addCart(basket)

  all_history.addHistory({
    id: createID(),
    title: `A sales of ${purchasedCart.value.total} was made by ${user.value.user_name}`,
    update_type: 'Purchase price updated',
    data: { ...basket },
    made_by: user.value.user_name,
    date: new Date(),
  })

  showNotification('Sales Sucessfully made', 'success')
  store.loadProducts()
  purchasedCart.value = {
    cartLists: [],
    sub_total: 0,
    tax: 0,
    total: 0,
  }
  // showForm()

  // Reset form after submission (optional)
}

// Format Number to Currency
function formatCurrency(dig) {
  //   if (isNaN(dig)) return console.log('invalid number')

  //   // seperate decimals from integer
  //   const [integer, decimal] = dig.toString().split('.')

  //   let result = ''
  //   for (let j = 0; j < integer.length; j++) {
  //     if (j > 0 && j % 3 === 0) {
  //       result = ',' + result
  //     }
  //     result = integer[integer.length - 1 - j] + result
  //   }
  return Number(dig)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const addToCart = (id) => {
  const prod = store.getSingleProduct(id)
  if (prod.quantity_in_stock <= 0) {
    showNotification('Out of stock', 'error')
    return
  }
  const cart_prod = {
    id,
    prod_name: prod.prod_name,
    present_quantity: prod.quantity_in_stock,
    selling_price: prod.selling_price,
    units: 1,
    cart_price: prod.selling_price,
  }

  const findCartProd = purchasedCart.value.cartLists.find((prod) => prod.id === id)

  //   check if product is already on this list
  if (findCartProd) {
    purchasedCart.value.cartLists.map((prod) => {
      if (prod.id === id) {
        increaseQuantity(id)
        return
      }

      prod
    })
    showNotification('Already in Cart, unit increased', 'success')
    return
  } else {
    purchasedCart.value.cartLists.push(cart_prod)
  }

  updateCartPrices()
}

const increaseQuantity = (id) => {
  purchasedCart.value.cartLists.map((prod) => {
    if (prod.id === id) {
      if (prod.present_quantity === prod.units) {
        return showNotification(`Quantity is not more than ${prod.present_quantity}`, 'error')
      }
      prod.units++
      prod.cart_price = prod.units * prod.selling_price
      return
    }

    prod
  })

  updateCartPrices()
}

const decreaseQuantity = (id) => {
  purchasedCart.value.cartLists.forEach((prod) => {
    if (prod.id === id) {
      if (prod.units === 1) {
        showNotification('cart removed', 'error')
        purchasedCart.value.cartLists = purchasedCart.value.cartLists.filter(
          (prod) => prod.id != id,
        )
      } else {
        prod.units -= 1
        prod.cart_price = prod.units * prod.selling_price
      }
      return prod
    }

    prod
  })

  updateCartPrices()
}

function updateCartPrices() {
  let subtotal = 0
  purchasedCart.value.cartLists.forEach((item) => {
    item.cart_price = item.units * item.selling_price
    subtotal += item.cart_price
  })

  purchasedCart.value.sub_total = subtotal //SUB TOTAL
  purchasedCart.value.discount = subtotal * businessData.value.discount_rate // DISCOUNT
  purchasedCart.value.tax = (subtotal - purchasedCart.value.discount) * businessData.value.tax_rate // TAX
  purchasedCart.value.total = subtotal - purchasedCart.value.discount + purchasedCart.value.tax // TOTAL PAYMENT
}

function clearCartList() {
  purchasedCart.value.cartLists = []
  updateCartPrices()
  showNotification('cart cleared', 'error')
}

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
  store.loadProducts()
  productList.value = [...store.productList]
  productCopy.value = [...store.productList]

  stored_settings.loadSetting()
  businessData.value = {
    ...stored_settings.settings[0],
  }
  console.table(businessData.value)
  businessData.value['tax_rate'] = businessData.value.preference.tax.is_available
    ? businessData.value.preference.tax.rate / 100
    : 0
  businessData.value['discount_rate'] = businessData.value.preference.discount.is_available
    ? businessData.value.preference.discount.rate / 100
    : 0

  console.log(businessData.value)

  isLoaded.value = true

  if (businessData.value.business.name === '') {
    showNotification('Welcome to StockOja, heading to setting to complete your business', 'success')
    window.location.href = '/settings'
  }
})
</script>

<template>
  <NotificationBar v-if="isNotification" :msg="notificationMessage" :type="notificationType" />
  <DashboardView pageTitle="Sales" :user v-if="isLoaded">
    <div class="container" v-if="!isForm && !isEditForm">
      <div class="product-side">
        <div class="search">
          <input
            autocomplete="off"
            placeholder="Search for product..."
            type="search"
            v-model="searchValue"
            @input="filterProd"
          />
        </div>
        <ul class="product-list" v-if="productList.length">
          <li v-for="prod in productList" @click="addToCart(prod.id)" :title="prod.prod_name">
            <div class="product-status">
              <span v-if="prod.quantity_in_stock > 5" class="good"></span>
              <span
                v-else-if="prod.quantity_in_stock < 6 && prod.quantity_in_stock > 0"
                class="warning"
              ></span>
              <span v-else class="danger"></span>
            </div>
            <div>{{ prod.prod_name }}</div>
            <div>{{ '₦' + formatCurrency(prod.selling_price) }}</div>
          </li>
        </ul>
        <div class="empty-prod" v-if="!productList.length">No Product in stock</div>
      </div>
      <div class="cart-side">
        <div class="carts">
          <div class="cart-head">
            <h2>Order</h2>
            <span
              @click="clearCartList"
              v-if="purchasedCart.cartLists.length > 0"
              style="color: red; cursor: pointer"
              >clear</span
            >
          </div>
          <ul class="cart-lists">
            <li class="summary-list" v-for="prod in purchasedCart.cartLists">
              <div>
                <span class="bold">{{ prod.prod_name }}</span>
                <p>{{ prod.selling_price }}</p>
              </div>
              <div class="unit-set">
                <div class="quantity-set">
                  <div class="sec-btn" @click="decreaseQuantity(prod.id)">-</div>
                  <div class="quantity-unit">{{ prod.units }}</div>
                  <div class="sec-btn" @click="increaseQuantity(prod.id)">+</div>
                </div>
                <div class="final-price">{{ '₦' + formatCurrency(prod.cart_price) }}</div>
              </div>
            </li>
          </ul>
        </div>
        <div class="cart-bottom">
          <div class="summary">
            <div class="summary-list">
              <span>Subtotal</span><span>{{ '₦' + formatCurrency(purchasedCart.sub_total) }}</span>
            </div>
            <div class="summary-list" v-if="businessData.preference.discount.is_available">
              <span>Discount ({{ businessData.preference.discount.rate }}%)</span
              ><span>{{ '₦' + formatCurrency(purchasedCart.discount) }}</span>
            </div>
            <div class="summary-list" v-if="businessData.preference.tax.is_available">
              <span>Tax/VAT ({{ businessData.preference.tax.rate }}%)</span
              ><span>{{ '₦' + formatCurrency(purchasedCart.tax) }}</span>
            </div>
            <div class="summary-list bold">
              <span>Total</span><span>{{ '₦' + formatCurrency(purchasedCart.total) }}</span>
            </div>
          </div>
          <BtnPry
            v-if="purchasedCart.cartLists.length"
            style="width: 100%"
            :action="handleCheckout"
            txt="Checkout"
          />
        </div>
      </div>
    </div>

    <!-- No Product in List -->
  </DashboardView>
</template>

<style scoped>
.container {
  display: flex;
  gap: 20px;
}

.container > div {
  flex: 1;
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

.product-side {
  /* gap: 20px;
  display: flex;
  flex-direction: column; */
}

ul.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
  padding-inline: 0;
  margin-top: 20px;
  align-items: center;
  justify-content: space-between;
}

.product-list > li {
  display: flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
  flex-basis: 100px;
  flex-grow: 1;
  height: 150px;
  flex-direction: column;
  max-width: 130px;
  padding: 10px;
  border: 1px solid var(--vt-c-divider-dark-2);
  border-radius: 8px;
  position: relative;
}

.product-list li div:not(:first-child) {
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
}

.product-status {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  top: 20px;
  left: 10px;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.product-status > span {
  border-radius: 0;
  width: 10px;
  height: 10px;
}

.good {
  background-color: rgb(1, 228, 88);
}

.warning {
  background-color: yellow;
}

.danger {
  background-color: red;
}

/* .product-head > div,
.product-list > li > div {
  min-width: 100px;
  flex: 1;
} */

.empty-prod {
  font-size: 1.2rem;
  color: #fd6d6d;
  padding: 50px;
  text-align: center;
}

.carts {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-side {
  width: 100%;
  height: calc(100vh - 150px);
  border: 1px solid var(--vt-c-divider-dark-2);
  border-radius: 8px;
  display: flex;
  gap: 20px;
  flex-direction: column;
  overflow: hidden;
  justify-content: space-between;
}

.cart-head {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--vt-c-divider-dark-2);
  background-color: var(--vt-c-divider-dark-1);
}

.cart-head h2 {
  margin: 0;
  text-align: left;
}

.cart-lists {
  padding: 20px;
  padding-top: 0;
  flex: 1;
  overflow-y: scroll;
}

.cart-lists > li {
  border-bottom: 1px solid var(--vt-c-divider-dark-2);
  padding: 10px 5px;
}

.cart-bottom {
  padding: 20px;
  border-top: 1px solid var(--vt-c-divider-dark-2);
}

.summary {
  padding-bottom: 20px;
}

.summary-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
}

.sec-btn {
  border: none;
  padding: 6px 10px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ccc;
  color: #fff;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.sec-btn:hover {
  background-color: #0056b3;
}

.unit-set {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
</style>
