<template>
  <div class="home-container">
    <div class="btn" @click="$router.push('/homeView')">房</div>
    <div class="btn" @click="toPage('carShowroom')">车</div>
    <div class="btn" @click="toPage('christmas')">圣诞</div>
    <div class="btn" @click="toPage('robot')">机器人</div>
    <div class="btn" @click="toPage('spacecraft')">官网</div>
  </div>
</template>
<script setup lang="ts">
import router from '@/router';

const toPage = (page: string) => {
  router.push({
    path: `/${page}`
  })
}
</script>

<style>
.home-container {
  display: flex;
  justify-content: space-evenly;
}
.btn {
  text-align: center;
  margin-top: 100px;
  /* width: 100px; */
  padding: 10px 30px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 10px 2px #bebebe;
}
</style>