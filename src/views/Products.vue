<script setup>
import { ref, computed, useTemplateRef, onMounted, onBeforeMount } from 'vue'
import DashboardView from '@/components/DashboardView.vue'
import BtnPry from '@/components/BtnPry.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useStoreManagement } from '@/stores/storeManagement'
import { useAllHistory } from '@/stores/allHistory'
import { useUserManagement } from '@/stores/userManagement'
import { useProdHistory } from '@/stores/productHistory'

const store = useStoreManagement()
const prod_history = useProdHistory()
const stored_user = useUserManagement()
const all_history = useAllHistory()
const user = ref({})
const isForm = ref(false)
const isEditForm = ref(false)
const productList = ref([])
const productCopy = ref([])
const searchValue = ref('')
const notificationMessage = ref('')
const notificationType = ref('')
const isNotification = ref(false)
const productCategories = ref([
  {
    name: 'Electronics & Gadgets',
    subcategories: [
      'Mobile Phones & Accessories',
      'Computers & Laptops',
      'Audio & Video Equipment',
      'Cameras & Photography',
      'Wearable Technology',
      'Home Appliances (Small)',
      'Home Appliances (Large)',
    ],
  },
  {
    name: 'Fashion & Apparel',
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Children's Clothing",
      'Footwear',
      'Bags & Luggage',
      'Jewelry & Accessories',
      'Sportswear',
    ],
  },
  {
    name: 'Home & Kitchen',
    subcategories: [
      'Furniture',
      'Home Decor',
      'Kitchenware & Dining',
      'Bedding & Bath',
      'Cleaning Supplies',
      'Garden & Outdoor',
      'Lighting',
    ],
  },
  {
    name: 'Health & Beauty',
    subcategories: [
      'Skincare',
      'Haircare',
      'Makeup & Cosmetics',
      'Fragrances',
      'Personal Care',
      'Supplements & Vitamins',
      'Medical Supplies',
    ],
  },
  {
    name: 'Food & Beverages',
    subcategories: [
      'Packaged Foods',
      'Fresh Produce',
      'Meats & Seafood',
      'Biscuits & Sweets',
      'Dairy & Eggs',
      'Baked Goods',
      'Drinks (Non-Alcoholic)',
      'Alcoholic Beverages',
    ],
  },
  {
    name: 'Books, Media & Entertainment',
    subcategories: [
      'Books',
      'Movies & TV Shows',
      'Music',
      'Video Games & Consoles',
      'Board Games & Puzzles',
    ],
  },
  {
    name: 'Sports & Fitness',
    subcategories: [
      'Exercise Equipment',
      'Sports Gear & Apparel',
      'Outdoor & Camping',
      'Cycling Equipment',
      'Team Sports Equipment',
    ],
  },
  {
    name: 'Toys & Hobbies',
    subcategories: [
      "Children's Toys",
      'Collectibles',
      'Craft & DIY Supplies',
      'Musical Instruments',
      'Art Supplies',
    ],
  },
  {
    name: 'Automotive & Parts',
    subcategories: [
      'Vehicle Parts',
      'Tires & Wheels',
      'Car Care Products',
      'Motorcycle Parts',
      'Tools & Equipment (Automotive)',
    ],
  },
  {
    name: 'Office Supplies & Stationery',
    subcategories: [
      'Paper Products',
      'Writing Instruments',
      'Desk Accessories',
      'Filing & Storage',
      'Printers & Ink/Toner',
    ],
  },
  {
    name: 'Pet Supplies',
    subcategories: ['Pet Food', 'Pet Accessories', 'Pet Health & Grooming'],
  },
  {
    name: 'Building Materials & Hardware',
    subcategories: [
      'Tools',
      'Electrical',
      'Plumbing',
      'Lumber & Building Supplies',
      'Paints & Finishes',
    ],
  },
  {
    name: 'Industrial & Scientific',
    subcategories: [
      'Lab Equipment',
      'Safety Equipment',
      'Manufacturing Components',
      'Chemicals',
      'Commercial Appliances',
    ],
  },
  {
    name: 'Services (if tracking service-related items like consumables)',
    subcategories: [
      'Consumables (Service)',
      'Rental Equipment',
      'Spare Parts (for service delivery)',
    ],
  },
  {
    name: 'Other', // A catch-all for anything not explicitly listed
  },
])
// checking if product already exist
const isAlrdAvailable = ref(true)
const availableProduct = ref([])

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
const productEditData = ref({
  productName: '',
  description: '',
  prod_category: '',
  sub_category: '',
  selling_price: null,
  purchase_price: null,
  quantity_in_stock: null,
  selectedFile: null,
})
let actualData

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

// search and filter before adding
const findProd = () => {
  const search = productCopy.value.filter((prod) =>
    prod.prod_name.toLowerCase().includes(productData.value.productName.toLowerCase()),
  )

  if (search === '' || productData.value.productName === '') {
    // productList.value = productList.value
    isAlrdAvailable.value = false
    availableProduct.value = []
    return
  }

  isAlrdAvailable.value = true
  availableProduct.value = search
}

const showForm = () => {
  isForm.value = !isForm.value
  isEditForm.value = false
}

// State variables for selected categories
const selectedMainCategory = ref('')
const selectedSubCategory = ref('')

// Computed property to get subcategories based on the selected main category
const availableSubCategories = computed(() => {
  const mainCat = productCategories.value.find((cat) => cat.name === selectedMainCategory.value)
  return mainCat ? mainCat.subcategories : []
})

// Function to reset subcategory when main category changes
const handleMainCategoryChange = () => {
  selectedSubCategory.value = '' // Reset subcategory when main category changes
}

// create ID
const createID = (num = 20) => {
  const idVars = '1234567890abcdefghijklmnopqrstuvwxyz'
  let ids = ''
  for (let i = 0; i < num; i++) {
    const element = Math.floor(Math.random() * idVars.length)
    ids += idVars[element]
  }
  return ids
}

// edit Form handler
const editStock = (id) => {
  isForm.value = false
  const editingProd = store.getSingleProduct(id)
  if (!editingProd) {
    showNotification('No Productiong Match', 'error')
    return
  }

  productEditData.value = { ...editingProd }
  actualData = { ...editingProd }
  isEditForm.value = true
  // showNotification(editingProd, 'success')
}

// Function to handle form submission
const handleSubmit = (e) => {
  e.preventDefault()
  productData.value.mainCategory = selectedMainCategory.value
  productData.value.subCategory = selectedSubCategory.value

  if (
    !productData.value.productName ||
    !productData.value.mainCategory ||
    !productData.value.productName ||
    !productData.value.selling_price ||
    !productData.value.quantity
  ) {
    showNotification('Fill all required fields', 'error')
    return
  }

  const newStock = {
    id: createID(),
    prod_name: productData.value.productName,
    prod_category: productData.value.mainCategory,
    sub_category: productData.value.subCategory,
    quantity_in_stock: productData.value.quantity,
    description: productData.value.description,
    selling_price: productData.value.selling_price,
    purchase_price: productData.value.purchase_price,
    image_name: productData.value.selectedFile,
  }
  store.addProduct(newStock)

  const prodHist = {
    date: new Date(),
    prod_name: newStock.prod_name,
    quantity_added: newStock.quantity_in_stock,
    cost: newStock.purchase_price ? newStock.quantity_in_stock * newStock.purchase_price : 0,
  }

  prod_history.addprodHistory(prodHist)
  console.table(prodHist)

  all_history.addHistory({
    id: createID(),
    title: `${productData.value.productName} added to stock`,
    update_type: 'New Stock',
    data: { ...newStock },
    made_by: user.value.user_name,
    date: new Date(),
  })
  all_history.loadHistories()

  store.loadProducts()
  productList.value = [...store.productList]
  productCopy.value = [...store.productList]
  console.log('Product Data to submit:', productList.value)
  showNotification('Product added!', 'success')
  showForm()

  // Reset form after submission (optional)
  selectedMainCategory.value = ''
  selectedSubCategory.value = ''
  productData.value = {
    productName: '',
    description: '',
    mainCategory: '',
    subCategory: '',
    selling_price: null,
    purchase_price: null,
    stock: null,
    selectedFile: null,
  }
}

// handle file upload
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png']
  if (!validTypes.includes(file.type)) {
    showNotification('Invalid file type. Only JPG, PNG, PDF, and DOCX are allowed.', 'error')
    fileInput.value = '' // Reset input
    return
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('File size must be less than 5MB', 'error')
    fileInput.value = '' // Reset input
    return
  }

  productData.value.selectedFile = file
  // uploadFile()
  console.log(file)
}

// handle edit produt
function submitEditProd(e) {
  e.preventDefault()

  const inputData = { ...productEditData.value }

  if (JSON.stringify(inputData) === JSON.stringify(actualData)) {
    showNotification('No changes made', 'error')
    isEditForm.value = false
    return
  }

  const changes = getObjectDifferences(actualData, inputData)

  for (const key in changes) {
    if (key === 'quantity_in_stock') {
      all_history.addHistory({
        id: createID(),
        title: `Purchase new - ${inputData.prod_name} with ${changes['quantity_in_stock'].new - changes['quantity_in_stock'].old} units`,
        update_type: 'Restock',
        data: { prod_id: actualData.id, quantity_in_stock: changes.quantity_in_stock },
        made_by: user.value.user_name,
        date: new Date(),
      })
    }

    if (key === 'prod_name') {
      all_history.addHistory({
        id: createID(),
        title: `Product Name changed from  ${changes.prod_name.old} to ${changes.prod_name.new} units`,
        update_type: 'Rename',
        data: { prod_id: actualData.id, prod_name: changes.quantity_in_stock },
        made_by: user.value.user_name,
        date: new Date(),
      })
    }

    if (key === 'purchase_price') {
      all_history.addHistory({
        id: createID(),
        title: `Purchase Price for ${inputData.prod_name} changed from ${changes['purchase_price'].old} to ${changes['purchase_price'].new}`,
        update_type: 'Purchase price updated',
        data: { prod_id: actualData.id, purchase_price: changes.quantity_in_stock },
        made_by: user.value.user_name,
        date: new Date(),
      })
    }

    if (key === 'selling_price') {
      all_history.addHistory({
        id: createID(),
        title: `Selling Price for ${inputData.prod_name} changed from ${changes['selling_price'].old} to ${changes['selling_price'].new}`,
        update_type: 'Selling price updated',
        data: { prod_id: actualData.id, selling_price: changes.quantity_in_stock },
        made_by: user.value.user_name,
        date: new Date(),
      })
    }
  }

  all_history.loadHistories()
  store.loadProducts()

  store.editProduct(inputData)
  productEditData.value = {
    productName: '',
    description: '',
    prod_category: '',
    sub_category: '',
    selling_price: null,
    purchase_price: null,
    quantity_in_stock: null,
    selectedFile: null,
  }
  showNotification('Product edited successfully', 'success')
  isEditForm.value = false

  store.loadProducts()
  productList.value = [...store.productList]
  productCopy.value = [...store.productList]
}

// check for changes
function getObjectDifferences(obj1, obj2) {
  const changes = {}

  for (const key in obj2) {
    if (obj1[key] !== obj2[key]) {
      changes[key] = {
        old: obj1[key],
        new: obj2[key],
      }
    }
  }

  return changes
}

// uploading file
const uploadFile = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('duserdata'))

    formData.append('sender_name', user.value.user_name)
    formData.append('sender_permission', user.user_permission)
    formData.append('sender_id', user.user_id)
    formData.append('chat_message', chatInputMessage.value)
    formData.append('sender_color', user.user_color)

    const response = await api.post('/chats/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: `${token}`,
      },
      onUploadProgress: (progressEvent) => {
        progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      },
    })

    showNotification('File uploaded successfully!', 'success')
    console.log('File data:', response.data)

    // Reset after successful upload
    selectedFile.value = null
    fileInput.value = ''
    setTimeout(() => {
      progress.value = 0
    }, 3000)
  } catch (err) {
    console.error('Upload error:', err)
    showNotification(err.response?.data || 'Failed to upload file', 'error')
  }
}

// Format Number to Currency
function formatCurrency(dig) {
  return Number(dig)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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

  prod_history.loadHistory()
})
</script>

<template>
  <NotificationBar v-if="isNotification" :msg="notificationMessage" :type="notificationType" />
  <DashboardView pageTitle="Products" :user>
    <div class="page-actions">
      <div class="search">
        <input autocomplete="off" type="search" v-model="searchValue" @input="filterProd" />
      </div>
      <BtnPry v-if="user.user_permission !== 'staff'" :action="showForm" txt="Add Product" />
    </div>

    <!-- Product List Table -->
    <div class="products-container" v-if="productList.length && !isForm && !isEditForm">
      <div class="product-head">
        <div class="product-name">Name</div>
        <div class="product-category">Category</div>
        <div class="product-qty">Quantity Available</div>
        <div class="product-price">Sales Price</div>
        <div class="product-status">Status</div>
        <div v-if="user.user_permission !== 'staff'" class="product-action">Actions</div>
      </div>
      <ul class="product-list">
        <li v-for="prod in productList">
          <div class="product-name">{{ prod.prod_name }}</div>
          <div class="product-category">{{ prod.sub_category || 'Others' }}</div>
          <div class="product-qty">{{ prod.quantity_in_stock }}</div>
          <div class="product-price">{{ '₦' + formatCurrency(prod.selling_price) }}</div>
          <div class="product-status">
            <span v-if="prod.quantity_in_stock > 5" class="good">In Stock</span>
            <span
              v-else-if="prod.quantity_in_stock < 6 && prod.quantity_in_stock > 0"
              class="warning"
              >Low Stock</span
            >
            <span v-else class="danger">Out of Stock</span>
          </div>
          <div v-if="user.user_permission !== 'staff'" class="product-action">
            <span class="action" @click="editStock(prod.id)">Edit</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- No Product in List -->
    <div class="empty-prod" v-if="!productList.length && !isForm && !isEditForm">
      No Product in stock, click on
      <small @click="showForm" style="cursor: pointer; color: var(--vt-c-black)"
        >+ Add Product</small
      >
      button to add new product
    </div>

    <!-- Form to add New Product -->
    <div class="add-product-form" v-if="isForm">
      <h2>Add New Product</h2>
      <form @submit="handleSubmit">
        <div class="form-group">
          <label for="productName">Product Name:</label>
          <input
            autocomplete="off"
            ref="prodInpField"
            type="text"
            id="productName"
            @input="findProd"
            v-model="productData.productName"
            required
          />
          <div class="prod-find" v-if="isAlrdAvailable">
            <span v-for="prod in availableProduct" @click="editStock(prod.id)" id="prod.id">{{
              prod.prod_name
            }}</span>
          </div>
        </div>

        <div class="form-flex">
          <div class="form-group">
            <label for="mainCategory">Main Category:</label>
            <select
              id="mainCategory"
              v-model="selectedMainCategory"
              @change="handleMainCategoryChange"
              required
            >
              <option value="" disabled>Select a main category</option>
              <option
                v-for="category in productCategories"
                :key="category.name"
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div
            class="form-group"
            v-if="availableSubCategories && availableSubCategories.length > 0"
          >
            <label for="subCategory">Sub-Category:</label>
            <select id="subCategory" v-model="selectedSubCategory">
              <option value="" disabled>Select a sub-category</option>
              <option v-for="sub in availableSubCategories" :key="sub" :value="sub">
                {{ sub }}
              </option>
            </select>
          </div>

          <div
            class="form-group"
            v-else-if="selectedMainCategory && selectedMainCategory !== 'Other'"
          >
            <p class="no-sub-categories">No specific sub-categories for this main category.</p>
          </div>
        </div>

        <div class="form-flex">
          <div class="form-group">
            <label for="price">Purchased Price: (optional)</label>
            <input
              autocomplete="off"
              type="number"
              id="price"
              v-model.number="productData.purchase_price"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="price">Selling Price:</label>
            <input
              autocomplete="off"
              type="number"
              id="price"
              v-model.number="productData.selling_price"
              step="0.01"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="stock">Stock Quantity:</label>
          <input
            autocomplete="off"
            type="number"
            id="stock"
            v-model.number="productData.quantity"
            required
          />
        </div>

        <div class="form-flex">
          <div class="form-group">
            <label for="description">Description: (optional)</label>
            <textarea id="description" v-model="productData.description"></textarea>
          </div>

          <div class="form-group">
            <label @click="triggerFileInput" for="image-upload">
              Image: (optional)
              <br />
              <span> Upload Image </span>
            </label>
            <input
              autocomplete="off"
              type="file"
              ref="fileInputBox"
              accept=".jpg, .jpeg, .png"
              id="image-upload"
              style="display: none"
              @change="handleFileChange"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="stock">Barcode text: (optional)</label>
          <input autocomplete="off" type="text" id="stock" v-model="productData.stock" />
        </div>

        <BtnPry :action="handleSubmit" txt="Add Product" />
      </form>
    </div>

    <!-- Form to edit  Product -->
    <div class="add-product-form" v-if="isEditForm">
      <h2>Edit Product</h2>
      <form @submit="submitEditProd">
        <div class="form-group">
          <label for="productName">Product Name:</label>
          <input
            autocomplete="off"
            ref="prodInpField"
            type="text"
            id="productName"
            v-model="productEditData.prod_name"
            required
          />
        </div>

        <div class="form-flex">
          <div class="form-group">
            <label for="mainCategory">Main Category:</label>
            <select id="mainCategory" v-model="productEditData.prod_category" required disabled>
              <option value="" disabled>Select a main category</option>
              <option
                v-for="category in productCategories"
                :key="category.name"
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="productEditData.sub_category">
            <label for="subCategory">Sub-Category:</label>
            <select id="subCategory" v-model="productEditData.sub_category" disabled>
              <option value="" disabled>Select a sub-category</option>
              <option>{{ productEditData.sub_category }}</option>
            </select>
          </div>

          <div
            class="form-group"
            v-else-if="selectedMainCategory && selectedMainCategory !== 'Other'"
          >
            <p class="no-sub-categories">No specific sub-categories for this main category.</p>
          </div>
        </div>

        <div class="form-flex">
          <div class="form-group" v-if="productEditData.purchase_price">
            <label for="price">Purchased Price: (optional)</label>
            <input
              autocomplete="off"
              type="number"
              id="price"
              v-model.number="productEditData.purchase_price"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="price">Selling Price:</label>
            <input
              autocomplete="off"
              type="number"
              id="price"
              v-model.number="productEditData.selling_price"
              step="0.01"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="stock">Stock Quantity:</label>
          <input
            autocomplete="off"
            type="number"
            id="stock"
            v-model.number="productEditData.quantity_in_stock"
            required
          />
        </div>

        <div class="form-flex">
          <div class="form-group">
            <label for="description">Description: (optional)</label>
            <textarea id="description" v-model="productEditData.description"></textarea>
          </div>

          <div class="form-group">
            <label @click="triggerFileInput" for="image-upload">
              Image: (optional)
              <br />
              <span> Upload Image </span>
            </label>
            <input
              autocomplete="off"
              type="file"
              ref="fileInputBox"
              accept=".jpg, .jpeg, .png"
              id="image-upload"
              style="display: none"
              disabled
            />
          </div>
        </div>

        <div class="form-group">
          <label for="stock">Barcode text: (optional)</label>
          <input autocomplete="off" type="text" id="stock" v-model="productEditData.stock" />
        </div>

        <BtnPry :action="submitEditProd" txt="Edit" />
      </form>
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

.products-container {
  margin-top: 10px;
  border: 1px solid var(--vt-c-divider-dark-2);
  overflow-y: auto;
  border-radius: var(--border-radius);
}

ul.product-list {
  display: flex;
  flex-direction: column;
  /* gap: 10px; */
  list-style: none;
  padding-inline: 0;
}

.product-qty,
.product-action {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-head {
  border-bottom: 1px solid var(--vt-c-divider-dark-2);
  background-color: #cccccc66;
}

.product-head,
.product-list > li {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 1.2rem;
  width: min-content;
}

.product-list > li:not(:last-child) {
  border-bottom: 1px solid var(--vt-c-divider-dark-2);
}

.product-head > div {
  font-weight: 700;
}

.product-head > div,
.product-list > li > div {
  min-width: 100px;
  flex: 1;
}

.empty-prod {
  font-size: 1.2rem;
  color: #fd6d6d;
  padding: 50px;
  text-align: center;
}

/* add product form */
.add-product-form {
  margin: 40px auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  /* max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff; */
}

h2 {
  text-align: center;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 15px;
  position: relative;
}

.no-sub-categories {
  font-style: italic;
  color: #777;
  margin-top: 5px;
  font-size: 0.9em;
}

.form-flex {
  width: 100%;
  display: flex;
  gap: 20px;
}

.form-flex > div {
  flex: 1;
}

label span {
  margin-top: 5px;
  width: calc(100% - 20px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 80px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.product-action {
  min-width: 99px;
  max-width: 100px;
}

.product-name,
.product-category {
  flex: 2 !important;
}

.prod-find {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--color-off-white);
  z-index: 2000;
}

.prod-find span {
  padding: 9px 12px;
  cursor: pointer;
}
</style>
