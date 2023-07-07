<template>
  <div class="car-home">
    <div class="canvas-container" ref="canvasDom">
    </div>
    <div class="car-content">
      <div class="car-content-title">
        <h1>汽车选配</h1>
      </div>
      <div>
        <h2>请选择车身颜色</h2>
        <div class="select">
          <div class="select-item" v-for="(item, index) in colorList" :key="index" @click="selectColor(index)">
            <div class="select-item-color" :style="{ backgroundColor: item }"></div>
          </div>
        </div>
      </div>
      <div>
        <h2>请选择车身材质</h2>
        <div class="select-material">
            <div class="select-material-item" @click="selectMaterial(false)">
              磨砂
            </div>
            <div class="select-material-item" @click="selectMaterial(true)">
              金属
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, ref, reactive } from 'vue'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入glft 模型载入库
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 因为导入的这个模型压缩过，所以要导入下面这个解压的工具
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import  type { Material  } from 'three'

const colorList: string[] = [
  '#ff0000',
  '#5F1B09',
  '#000000',
  '#005CAA',
  '#E1750E',
  '#FFFFFF',
  '#E4AE2F',
  '#032A51'
]

const selectColor = (index: number) => {
  bodyMaterial.color.set(colorList[index])
  faceMaterial.color.set(colorList[index])
  hoodMaterial.color.set(colorList[index])
  wheelsMaterial.color.set(colorList[index])
}

const selectMaterial = (isMetal: boolean) => {
  bodyMaterial.metalness = isMetal ? 1 : 0
  bodyMaterial.roughness = isMetal ? 1 : 0.4
  bodyMaterial.clearcoatRoughness = isMetal ? 0 : 1
  faceMaterial.metalness = isMetal ? 1 : 0
  faceMaterial.roughness = isMetal ? 1 : 0.4
  faceMaterial.clearcoatRoughness = isMetal ? 0 : 1
  hoodMaterial.metalness = isMetal ? 1 : 0
  hoodMaterial.roughness = isMetal ? 1 : 0.4
  hoodMaterial.clearcoatRoughness = isMetal ? 0 : 1
}

const canvasDom = ref<HTMLElement | null>(null)

const gui = new dat.GUI()
// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 1000)
camera.position.set(0, 3, 5)
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
  // scene.background = new THREE.Color('#000')
  scene.background = new THREE.Color('#ccc')
  // scene.environment = new THREE.Color('#ccc')
  render()
})

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// 添加网格地面
// GridHelper  坐标格
// PolarGridHelper  极坐标格
// const gridHelper = new THREE.GridHelper(10, 10)
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

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(6)
// scene.add(axesHelper)

// 添加灯光
const light1 = new THREE.DirectionalLight(0xffffff, 0.3)
light1.position.set(0, 0, 10)
scene.add(light1)
const light2 = new THREE.DirectionalLight(0xffffff, 0.3)
light2.position.set(0, 10, 0)
scene.add(light2)
const light3 = new THREE.DirectionalLight(0xffffff, 0.3)
light3.position.set(10, 0, 0)
scene.add(light3)
const light4 = new THREE.DirectionalLight(0xffffff, 0.3)
light4.position.set(-10, 0, 0)
scene.add(light4)
const light5 = new THREE.DirectionalLight(0xffffff, 0.3)
light5.position.set(0, 0, -10)
scene.add(light5)
const light6 = new THREE.DirectionalLight(0xffffff, 1)
light6.position.set(0, -10, 0)
scene.add(light6)
const light7 = new THREE.DirectionalLight(0xffffff, 0.3)
light7.position.set(5, 5, 0)
scene.add(light7)
const light8 = new THREE.DirectionalLight(0xffffff, 0.3)
light8.position.set(-5, 5, 0)
scene.add(light8)
const light9 = new THREE.DirectionalLight(0xffffff, 0.3)
light9.position.set(0, 5, -5)
scene.add(light9)
const light10 = new THREE.DirectionalLight(0xffffff, 0.3)
light10.position.set(0, 4, 5)
scene.add(light10)
const light11 = new THREE.DirectionalLight(0xffffff, 0.6)
light11.position.set(0, -3, -5)
scene.add(light11)
const light12 = new THREE.SpotLight(0xffffff, 0.8)
light12.position.set(0, -10, 10)
scene.add(light12)

// 创建材质
// 车身
const bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0，通常没有中间值
  metalness: 0,
  // 材质的粗糙程度。0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0。
  roughness: 0.4,
  // 范围从0.0到1.0m，在表面加一层薄薄的半透明材质
  clearcoat: 1,
  // clear coat层的粗糙度，由0.0到1.0。 默认为0.0
  clearcoatRoughness: 1
})
// 前脸
const faceMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0，通常没有中间值
  metalness: 0,
  // 材质的粗糙程度。0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0。
  roughness: 0.4,
  // 范围从0.0到1.0m，在表面加一层薄薄的半透明材质
  clearcoat: 1,
  // clear coat层的粗糙度，由0.0到1.0。 默认为0.0
  clearcoatRoughness: 1
})
// 引擎盖
const hoodMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0，通常没有中间值
  metalness: 0,
  // 材质的粗糙程度。0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0。
  roughness: 0.4,
  // 范围从0.0到1.0m，在表面加一层薄薄的半透明材质
  clearcoat: 1,
  // clear coat层的粗糙度，由0.0到1.0。 默认为0.0
  clearcoatRoughness: 1
})
// 轮毂
const wheelsMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0，通常没有中间值
  metalness: 1,
  // 材质的粗糙程度。0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0。
  roughness: 0.1,
  // // 范围从0.0到1.0m，在表面加一层薄薄的半透明材质
  clearcoat: 1,
  // // clear coat层的粗糙度，由0.0到1.0。 默认为0.0
  clearcoatRoughness: 1
})
// 玻璃
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0,
  roughness: 0.01,
  transmission: 1,
  transparent: true
})

// 添加gltf汽车模型
const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/gltf/')
// dracoLoader.setDecoderConfig({ type: "js" }); //使用兼容性强的draco_decoder.js解码器
//     dracoLoader.preload();
loader.setDRACOLoader(dracoLoader)
loader.load('./model/bmw01.glb', (gltf: any) => {
  console.log(gltf);
  const bmw = gltf.scene
  bmw.traverse((child: any) => {
    if(child.isMesh) {
      console.log(child.name);
    }
    // 判断是否是轮毂
    if(child.isMesh && child.name.includes('轮毂')) {
      // wheels.push(child)
      child.material = wheelsMaterial
    }
    // 判断是否是车身
    if(child.isMesh && child.name.includes('Mesh002')) {
      // carBody = child
      // carBody.material = bodyMaterial
      child.material = bodyMaterial
    }
    // 判断是否是前脸
    if(child.isMesh && child.name.includes('前脸')) {
      child.material = faceMaterial
    }
    // 判断是否是引擎盖
    if(child.isMesh && child.name.includes('引擎盖_1')) {
      child.material = hoodMaterial
    }
    // 判断是否是挡风玻璃
    if(child.isMesh && child.name.includes('玻璃')) {
      child.material = glassMaterial
    }
  })
  scene.add(bmw)
})
</script>
<style>
.car-content {
  position: fixed;
  top: 10px;
  left: 20px;
}
.select-item {
  display: inline-block;
  width: 40px;
  height: 40px;
  margin: 20px 5px;
}
.select-item-color {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
}
.select-material {
  display: flex;
}
.select-material-item {
  margin: 5px;
  padding: 18px;
  cursor: pointer;
}
</style>