<script setup lang="ts">
import * as THREE from "three"
// import * from '@t'
// 引入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// RGBE加载器(用于加载hdr环境图)
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import type { Material, Texture } from 'three'
import { ref, onMounted } from 'vue'
// import type { Ref } from 'vue'

// 初始化场景
const scene = new THREE.Scene()
// 初始化相机
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
// 设置相机位置
camera.position.set(0, 0, 0.01)

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

// --------------------- 以6张图贴图立方体实现 -------------------

// 添加立方体
// 创建几何体
// const geometry = new THRE E.BoxGeometry(10, 10, 10)
// const material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
// const cube = new THREE.Mesh(geomety, material)
// scene.add(cube)

// 6张图数组
// let arr = ['4_l', '4_r', '4_u', '4_d', '4_b', '4_f']
// let boxMaterials: Material[]  = []

// arr.forEach((item) => {
//   // 纹理加载
//   let texture = new THREE.TextureLoader().load(`./imgs/living/${item}.jpg`)
//   // 上下贴图角度不对，旋转矫正
//   if(item === '4_u' || item === '4_d') {
//     texture.rotation = Math.PI
//     texture.center = new THREE.Vector2(0.5, 0.5)
//   }
//   // 创建材质
//   boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }))
// })
// // 用几何体实例和材质实例创建物体
// const cube = new THREE.Mesh(geometry, boxMaterials)
// // 将Z轴缩放至倒置
// cube.geometry.scale(1, 1, -1)
// scene.add(cube)

// --------------------- 以HDR全景图贴球型物体实现 -------------------
// 创建球
const geometry = new THREE.SphereGeometry(5, 32, 32)
// 创建加载器实例
const rgbeLoader = new RGBELoader()
// 异步的
rgbeLoader.load('./imgs/hdr/ersisd-Merksem_Appartment_Living_4k.hdr', (texture: Texture) => {
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const sphere = new THREE.Mesh(geometry, material)
  // 反置球体，以至于贴图在内部展示
  sphere.geometry.scale(1, 1, -1)
  // sphere.position.z = 3
  scene.add(sphere)
})

// 获取ref元素
// const container: Ref<any> = ref(null)
const container = ref<HTMLElement>()

const render = () => {
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

// 添加轨道控制器变量
let controls: any = null
onMounted(() => {
  // 添加轨道控制器
  controls = new OrbitControls(camera, container.value)
  // 开启控制器阻尼
  controls.enableDamping = true
  container.value?.appendChild(renderer.domElement)
  render()
})

window.addEventListener('resize', () => {
    // 更新摄像头
    camera.aspect = window.innerWidth / window.innerHeight
    // // 更新摄像机的投影矩阵
    camera.updateProjectionMatrix()
    // // 更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    // // 设置渲染器的像素比
    renderer.setPixelRatio(window.devicePixelRatio)
  })

</script>

<template>
  <div class="container" ref="container">

  </div>

</template>

<style>
.container {
  height: 100vh;
  width: 100vw;
  background-color: #f0f0f0;
}
</style>
