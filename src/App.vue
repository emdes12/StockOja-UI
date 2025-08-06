<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/BtnPry.vue'
</script>

<template>
  <!-- <div class="dashboard-container">
    <header>
      <div class="header-left">
        <button class="menu-toggle" @click="toggleSidebar">
          <svg></svg>
        </button>
      </div>
    </header>
  </div>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->

  <RouterView />
</template>

<style scoped></style>
