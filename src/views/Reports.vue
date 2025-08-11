<script setup>
import DashboardView from '@/components/DashboardView.vue'
import TheWelcome from '../components/TheWelcome.vue'
import { onMounted, ref } from 'vue'
import { useUserManagement } from '@/stores/userManagement'
import { useSalesHistory } from '@/stores/saleHistory'
import { useProdHistory } from '@/stores/productHistory'
import { useStoreManagement } from '@/stores/storeManagement'
import BtnPry from '@/components/BtnPry.vue'

const stored_user = useUserManagement()
const sales_history = useSalesHistory()
const prod_history = useProdHistory()
const store = useStoreManagement()
const prodRecords = ref([])
const user = ref({})
const wantToGenerate = ref(false)
const isLoaded = ref(false)
const stock_value = ref(0)
const total_profit = ref(0)
const saleReport = ref({})
const bougtReport = ref({})
const salesTrend = ref('no-changes')
const total_purchase = ref(0)
const purchaseTrend = ref('no-changes')
const salesRecords = ref([])

// FUNCTIONS

const showReportOptions = () => {
  wantToGenerate.value = !wantToGenerate.value
}

// salesTrend function
function getSalesTrend(period) {
  const now = new Date()

  // Define time ranges in milliseconds
  const ranges = {
    '1days': 1 * 24 * 60 * 60 * 1000,
    '7days': 7 * 24 * 60 * 60 * 1000,
    '1month': 30 * 24 * 60 * 60 * 1000,
    '3months': 90 * 24 * 60 * 60 * 1000,
    '6months': 180 * 24 * 60 * 60 * 1000,
    '1year': 365 * 24 * 60 * 60 * 1000,
    '5years': 5 * 365 * 24 * 60 * 60 * 1000,
  }

  const range = ranges[period]
  if (!range) return null

  // Filter current period sales
  const currentSales = salesRecords.value.filter((sale) => now - new Date(sale.sold_date) <= range)

  // Filter previous period sales (same length of time just before current)
  const previousSales = salesRecords.value.filter((sale) => {
    const saleDate = new Date(sale.sold_date)
    return now - saleDate > range && now - saleDate <= range * 2
  })
  // Sum total sales for both periods
  const sumSales = (sales) => sales.reduce((sum, sale) => sum + sale.total_sold, 0)

  const currentTotal = sumSales(currentSales)
  const previousTotal = sumSales(previousSales)

  // Determine rise/fall percentage
  let change = 0
  if (previousTotal > 0) {
    change = ((currentTotal - previousTotal) / previousTotal) * 100
  }

  return (saleReport.value = {
    period,
    currentTotal,
    previousTotal,
    change, // % change
    trend: change > 0 ? 'rise' : change < 0 ? 'fall' : 'no change',
  })
}

// salesTrend function
function getBoughtTrend(period) {
  const now = new Date()

  // Define time ranges in milliseconds
  const ranges = {
    '1days': 1 * 24 * 60 * 60 * 1000,
    '7days': 7 * 24 * 60 * 60 * 1000,
    '1month': 30 * 24 * 60 * 60 * 1000,
    '3months': 90 * 24 * 60 * 60 * 1000,
    '6months': 180 * 24 * 60 * 60 * 1000,
    '1year': 365 * 24 * 60 * 60 * 1000,
    '5years': 5 * 365 * 24 * 60 * 60 * 1000,
  }

  const range = ranges[period]
  if (!range) return null

  // Filter current period bought
  const currentboughts = prodRecords.value.filter((bought) => {
    if (now - new Date(bought.date) <= range) {
      return bought
    }
  })
  console.log('curBo', now, range, currentboughts)

  // Filter previous period boughts (same length of time just before current)
  const previousBoughts = prodRecords.value.filter((bought) => {
    const boughtDate = new Date(bought.date)
    if (now - boughtDate > range && now - boughtDate <= range * 2) {
      return bought
    }
  })
  console.log('prevBo', previousBoughts)
  // Sum total boughts for both periods
  const sumSales = (boughts) => boughts.reduce((sum, bought) => sum + bought.cost, 0)

  const currentTotal = sumSales(currentboughts)
  const previousTotal = sumSales(previousBoughts)

  // Determine rise/fall percentage
  let change = 0
  if (previousTotal > 0) {
    change = ((currentTotal - previousTotal) / previousTotal) * 100
  }

  return (bougtReport.value = {
    period,
    currentTotal,
    previousTotal,
    change, // % change
    trend: change > 0 ? 'rise' : change < 0 ? 'fall' : 'no change',
  })
}

// Format Number to Currency
function formatCurrency(num) {
  if (num === null || num === undefined) return '0'

  const absNum = Math.abs(num)

  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b'
  }
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm'
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  }

  return num.toString()
}

// formating date
const formatDate = (date) => {
  const new_date = new Date(date)

  let day = ''
  let month = ''

  const dateObj = {
    day: new_date.getDay(),
    dayNum: new_date.getDate(),
    year: new_date.getFullYear(),
    month: new_date.getMonth(),
  }

  // check the day
  switch (dateObj.day) {
    case 1:
      day = 'Monday'
      break
    case 2:
      day = 'Tuesday'
      break
    case 3:
      day = 'Wednesday'
      break
    case 4:
      day = 'Thursday'
      break
    case 5:
      day = 'Friday'
      break
    case 6:
      day = 'Saturday'
      break

    default:
      day = 'Sunday'
      break
  }

  // check the month
  switch (dateObj.month) {
    case 1:
      month = 'February'
      break
    case 2:
      month = 'March'
      break
    case 3:
      month = 'April'
      break
    case 4:
      month = 'May'
      break
    case 5:
      month = 'June'
      break
    case 6:
      month = 'July'
      break
    case 7:
      month = 'August'
      break
    case 8:
      month = 'September'
      break
    case 9:
      month = 'October'
      break
    case 10:
      month = 'November'
      break
    case 11:
      month = 'December'
      break

    default:
      month = 'January'
      break
  }

  return `${day}, ${dateObj.dayNum} ${month}, ${dateObj.year}`
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

  // load sales history from db
  sales_history.loadHistory()
  const selling_history = sales_history.sales_history
  if (selling_history.length) {
    selling_history.map((hist) => {
      salesRecords.value.push({
        sold_date: hist.date,
        invoice_id: hist.id,
        number_sold: hist.cartLists.length,
        total_sold: hist.total,
        profit_made: hist.profit,
      })
      total_profit.value += hist.total
    })
  } else {
    salesRecords.value = [
      {
        sold_date: '2025-08-09T13:59:22.309Z',
        invoice_id: '0000000',
        number_sold: 0,
        total_sold: 0,
        profit_made: 0,
      },
    ]
  }

  // load prod history from db
  prod_history.loadHistory()
  const buying_history = prod_history.prod_history
  if (buying_history.length) {
    buying_history.map((hist) => {
      prodRecords.value.push(hist)
    })
  } else {
    prodRecords.value = [
      {
        date: '2025-08-09T13:59:22.309Z',
        prod_name: '0000000',
        quantity_added: 0,
        cost: 0,
      },
    ]
  }

  // load all product
  store.loadProducts()
  const storedStock = store.productList
  if (storedStock) {
    storedStock.map((prod) => {
      stock_value.value += prod.quantity_in_stock * prod.selling_price
    })
  }

  getSalesTrend('1days')
  getBoughtTrend('1days')
  console.log('sale', bougtReport.value)
  isLoaded.value = true
})
</script>

<template>
  <DashboardView page-title="Reports" :user="user" v-if="isLoaded">
    <div class="flex-sb">
      <select name="date-range" id="date-range">
        <option>Date Range</option>
        <option value="1 day">1 day</option>
        <option value="7 days">7 days</option>
        <option value="1 months">1 months</option>
        <option value="1 years">1 years</option>
      </select>
      <div class="report-btn">
        <BtnPry txt="Generate Report" :action="showReportOptions" />
        <div class="report-options" v-if="wantToGenerate">
          <span @click="printLowStock">Low Stock Report</span>
          <span @click="printSalesReport">Sales Report</span>
        </div>
      </div>
    </div>

    <div class="flex-sb flex-wrap">
      <div class="tabs">
        <h4>Total Sales</h4>
        <div class="flex-g2">
          <div v-if="saleReport.trend === 'rise'" class="green">↑</div>
          <div v-if="saleReport.trend === 'fall'" class="blue">↓</div>
          <h3>₦{{ formatCurrency(saleReport.currentTotal) }}</h3>
        </div>
      </div>
      <div class="tabs">
        <h4>Total Purchase</h4>
        <div class="flex-g2">
          <div v-if="bougtReport.trend === 'rise'" class="green">↑</div>
          <div v-if="bougtReport.trend === 'fall'" class="blue">↓</div>
          <h3>₦{{ formatCurrency(bougtReport.currentTotal) }}</h3>
        </div>
      </div>
      <div class="tabs">
        <h4>Stock Value</h4>
        <div class="flex-g2">
          <h3>₦{{ formatCurrency(stock_value) }}</h3>
        </div>
      </div>
      <div class="tabs">
        <h4>Profit</h4>
        <div class="flex-g2">
          <h3>₦{{ formatCurrency(total_profit) }}</h3>
        </div>
      </div>
    </div>

    <!-- Sales Report Section -->
    <div>
      <div class="flex-sb">
        <h3>Sales Report</h3>
      </div>
      <div class="products-container" v-if="salesRecords.length && !isForm && !isEditForm">
        <div class="product-head">
          <div class="product-name">Date</div>
          <div class="product-category">Invoice ID</div>
          <div class="product-qty">Product</div>
          <div class="product-price">Quantity Sold</div>
          <div class="product-status">Profit</div>
        </div>
        <ul class="product-list">
          <li v-for="prod in salesRecords">
            <div class="product-name">{{ formatDate(prod.sold_date) }}</div>
            <div class="product-category">{{ prod.invoice_id || 'Others' }}</div>
            <div class="product-qty">{{ prod.number_sold }}</div>
            <div class="product-price">{{ '₦' + formatCurrency(prod.total_sold) }}</div>
            <div class="product-status">
              {{ '₦' + formatCurrency(prod.profit_made) }}
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Purchase Report Section -->
    <div style="margin-top: 1.2rem">
      <div class="flex-sb">
        <h3>Purchase Report</h3>
      </div>
      <div class="products-container" v-if="prodRecords.length">
        <div class="product-head">
          <div class="product-name">Date</div>
          <div class="product-name">Product Name</div>
          <div class="product-qty">Quantity</div>
          <div class="product-price">Cost</div>
        </div>
        <ul class="product-list">
          <li v-for="prod in prodRecords">
            <div class="product-name">{{ formatDate(prod.date) }}</div>
            <div class="product-category">{{ prod.prod_name || 'Others' }}</div>
            <div class="product-qty">{{ prod.quantity_added }}</div>
            <div class="product-price">{{ '₦' + formatCurrency(prod.cost) }}</div>
          </li>
        </ul>
      </div>
    </div>
  </DashboardView>
</template>

<style scoped>
.flex-sb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  margin-bottom: 1.2rem;
}

.flex-wrap {
  display: flex;
  flex-wrap: wrap;
}

.flex-g2 {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;

  h3 {
    font-weight: 700;
    color: var(--vt-c-black);
  }
}

.tabs {
  padding: 0.92rem;
  border: 1px solid var(--vt-c-divider-dark-2);
  border-radius: var(--border-radius);
  width: 140px;
}

.green {
  color: green;
  font-weight: 900;
}

.blue {
  color: blue;
  font-weight: 900;
}
select {
  max-width: max-content;
  padding-right: 25px;
}

.report-btn {
  position: relative;
}

.report-options {
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  flex-direction: column;
}

.report-options span {
  padding: 5px 10px;
  cursor: pointer;
}

.report-options span:hover {
  background: #d0d0d0ad;
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
  /* min-width: 100%; */
  min-width: min-content;
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

.product-category {
  overflow: hidden;
}
</style>

<script></script>
