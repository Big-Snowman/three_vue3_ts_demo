<template>
  <div class="home">
    <div class="canvas-container" ref="canvasDom">
    </div>
  </div>
</template>
<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, ref, reactive } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import  type { Material  } from 'three'

const canvasDom = ref<HTMLElement | null>(null)
// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 更新投影矩阵（在相机设置完宽高比之后使用）
camera.updateProjectionMatrix()
camera.position.set(0, 2, 6)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  // 抗锯齿
  antialias: true
  // 
})
renderer.setSize(window.innerWidth, window.innerHeight)

const render = () => {
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(render)
}

// 在vue挂载完毕后将画布添加到dom当中
onMounted(() => {
  canvasDom.value?.appendChild(renderer.domElement)
  // 初始化渲染器，渲染背景
  // scene.background = new THREE.Color('#ccc')
  // scene.environment = new THREE.Color('#ccc')
  render()
})

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// 添加网格地面
// GridHelper  坐标格
// PolarGridHelper  极坐标格
const gridHelper = new THREE.PolarGridHelper(10, 16)
// 定义一个限定类型的新变量
const gridHelperMaterial: Material = gridHelper.material as Material
gridHelperMaterial.opacity = 0.3
gridHelperMaterial.transparent = true
scene.add(gridHelper)

window.addEventListener('resize', () => {
  // 设置摄像头的宽高比
  camera.aspect = window.innerWidth / window.innerHeight
  // 更新摄像头的投影矩阵
  camera.updateProjectionMatrix()
  // 重新设置渲染器的宽高
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 像素比
  renderer.setPixelRatio(window.devicePixelRatio)
})
</script>
<style>
</style>