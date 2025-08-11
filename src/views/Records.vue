<script setup>
import DashboardView from '@/components/DashboardView.vue'
import TheWelcome from '../components/TheWelcome.vue'
import { useAllHistory } from '@/stores/allHistory'
import { useUserManagement } from '@/stores/userManagement'
import { onMounted, ref } from 'vue'

const user = ref({})

const all_history = useAllHistory()
const stored_user = useUserManagement()
const general_history = ref([])

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
  all_history.loadHistories()
  general_history.value = [...all_history.all_histories]
})
</script>

<template>
  <DashboardView page-title="Activity Log" :user="user">
    <!-- Product List Table -->
    <div class="products-container" v-if="general_history.length">
      <h2>General History</h2>
      <ul class="product-list">
        <li v-for="record in general_history">
          <div class="history-title">
            <small>{{ formatDate(record.date) }}: </small>
            {{ record.title }}
            <p style="color: var(--vt-c-divider-dark-1)" class="bold">
              {{ ' made by: ' + record.made_by }}
            </p>
          </div>
          <!-- <div class="product-action">
            <span class="action" @click="editStock(prod.id)">Edit</span>
          </div> -->
        </li>
      </ul>
    </div>

    <!-- No Product in List -->
    <div class="empty-prod" v-if="!general_history.length">
      Empty - try to adding product and come back
    </div>
  </DashboardView>
</template>

<style scoped>
.products-container {
  padding-top: 10px;
}

ul.product-list {
  display: flex;
  flex-direction: column;
  /* gap: 10px; */
  list-style: none;
  padding-inline: 0;
}

.product-list > li {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.product-list > li:not(:last-child) {
  border-bottom: 1px solid var(--vt-c-divider-dark-2);
}

.history-title {
  padding: 0 10px;
}

h2 {
  font-weight: 700;
}

.empty-prod {
  font-size: 1.2rem;
  color: #fd6d6d;
  padding: 50px;
  text-align: center;
}
</style>
