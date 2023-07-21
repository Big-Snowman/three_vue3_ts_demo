<template>
  <div class="canvas-box" ref="canvasDom"></div>
  <div class="logo"></div>
  <div class="right-top">
    <div class="right-top-item">首页</div>
    <div class="right-top-item">Roc</div>
    <div class="right-top-item">稀土掘金</div>
    <div class="right-top-item">Github</div>
  </div>
  <div class="pages-box" ref="pages">
    <div class="page">
      <h1 class="line" @click="toPage('football')">足球小游戏</h1>
    </div>
    <div class="page">
      <h1 class="line" @click="toPage('christmas')">Dome2</h1>
    </div>
    <div class="page">
      <h1 class="line">Dome3</h1>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import router from '@/router'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入glft 模型载入库
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 导入GLTF压缩模型的解压库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const toPage = (path: string) => {
  router.push({
    path: `/${path}`
  })
}

const canvasDom = ref<HTMLElement | null>(null)
const pages = ref<HTMLElement | null>(null)
// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000)
camera.position.set(0, 0, 10)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  // 抗锯齿
  antialias: true
  // 
})
renderer.setSize(window.innerWidth, window.innerHeight)

const render = () => {
  renderer.render(scene, camera)
  // controls.update()
  requestAnimationFrame(render)
}

// 创建星空背景
const envTexture = new THREE.TextureLoader().load('./assets/25s.jpg')
// 设置背景图的映射贴图模式
envTexture.mapping = THREE.EquirectangularReflectionMapping

// 在vue挂载完毕后将画布添加到dom当中
onMounted(() => {
  canvasDom.value?.appendChild(renderer.domElement)
  // 初始化渲染器，渲染背景
  scene.background = envTexture
  scene.environment = envTexture
  render()
})

// 创建轨道控制器
// const controls = new OrbitControls(camera, renderer.domElement)
// controls.target.set(3, 0, 0)
// controls.enableDamping = true

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

type Gltf = {
  animations: Array<THREE.AnimationClip>,
  scene: THREE.Group,
  scenes: Array<THREE.Group>,
  cameras: Array<THREE.Camera>,
  asset: Object,
  userData: Object,
}


// 设置解压缩加载器
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/gltf/')
dracoLoader.setDecoderConfig({
  type: 'js'
})
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('./model/xz.glb', (gltf: Gltf) => {
  gltf.scene.scale.set(0.1, 0.1, 0.1)
  gltf.scene.position.set(3, 0, 0)
  gltf.scene.rotation.x = 0.12
  gltf.scene.rotation.y = -0.08
  scene.add(gltf.scene)

  window.addEventListener('mousemove', (e) => {
    // 这么写可以将 0到1 的值范围变成自己需要的范围
    const x = (e.clientX / window.innerWidth) * 2 - 1.7
    const y = (e.clientY / window.innerHeight) * 2 - 1
    const timeline = gsap.timeline()
    timeline.to(gltf.scene.rotation, {
      x: y / 1.5,
      y: x / 1.8,
      duration: 0.5
    })
  })
})

gltfLoader.load('./model/xq6.glb', (gltf: Gltf) => {
  gltf.scene.scale.set(0.1, 0.1, 0.1)
  gltf.scene.position.set(3, -10, 0)
  scene.add(gltf.scene)

  window.addEventListener('mousemove', (e) => {
    // 这么写可以将 0到1 的值范围变成自己需要的范围
    const x = (e.clientX / window.innerWidth) * 2 - 1.77
    const y = (e.clientY / window.innerHeight) * 2 - 1.05
    const timeline = gsap.timeline()
    timeline.to(gltf.scene.rotation, {
      x: y / 2.5,
      y: x / 1.5,
      duration: 0.5
    })
  })
})

gltfLoader.load('./model/gr75.glb', (gltf: Gltf) => {
  // gltf.scene.scale.set(0.1, 0.1, 0.1)
  gltf.scene.position.set(3, -20, 0)
  scene.add(gltf.scene)

  window.addEventListener('mousemove', (e) => {
    // 这么写可以将 0到1 的值范围变成自己需要的范围
    const x = (e.clientX / window.innerWidth) * 2 - 1.80
    const y = (e.clientY / window.innerHeight) * 2 - 1.0
    const timeline = gsap.timeline()
    timeline.to(gltf.scene.rotation, {
      x: y / 3.5,
      y: x / 1.8,
      duration: 0.5
    })
  })
})

let index = 0
const timeline2 = gsap.timeline()
window.addEventListener('wheel', (e) => {
  // 当时间线没在活动时再移动摄像机，防抖
  if(!timeline2.isActive()) {
    if(e.deltaY > 0) {
      index++
      if(index > 2) {
        index = 0
      }
    } else {
      index--
      if(index < 0) {
        index = 2
      }
    }
    timeline2.to(camera.position, {
      y: -10 * index,
      duration: 1
    })
    gsap.to(pages.value, {
      y: -index * window.innerHeight,
      duration: 1
    })
  }
})

gltfLoader.load('./model/moon.glb', (gltf: any) => {
  for(let j = 0; j < 30; j++) {
    const moon = gltf.scene.children[0]
    const moonInstance = new THREE.InstancedMesh(
      moon.geometry,
      moon.material,
      50
    )
    for(let i = 0; i < 50; i++) {
      const x = Math.random() * 1000 - 500
      const y = Math.random() * 1000 - 500
      const z = Math.random() * 1000 - 500

      // 矩阵
      const matrix = new THREE.Matrix4()
      // 设置星球的随机大小
      const size = Math.random() * 300
      matrix.makeScale(size, size, size)
      matrix.makeTranslation(x, y, z)
      moonInstance.setMatrixAt(i, matrix)
    }
    scene.add(moonInstance)
    gsap.to(moonInstance.position, {
      duration: Math.random() * 8 + 3,
      z: -2000,
      repeat: -1,
      ease: 'linear'
    })    
  }
})

// 添加灯光
const light1 = new THREE.DirectionalLight(0xffffff, 0.1)
const light2 = new THREE.DirectionalLight(0xffffff, 0.1)
light1.position.set(1, 1, 10)
light2.position.set(-1, 1, 10)
scene.add(light1, light2)
</script>

<style scoped>
.canvas-box {
  width: 100vw;
  height: 100vh;
}
.logo {
  position: fixed;
  top: 10px;
  left: 10px;
  height: 30px;
  width: 30px;
  background: url('../assets/logo.png') no-repeat;
  background-size: 30px 30px;
}
.right-top {
  position: fixed;
  top: 10px;
  right: 10px;
  display: flex;
  .right-top-item {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    padding: 5px 10px;
    cursor: pointer;
    /* background-color: #d42929; */
    margin: 0 10px;
  }
}

.pages-box {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
  .page {
    color: #fff;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    .line {
      cursor: pointer;
      pointer-events: all;
      margin-top: 50vh;
      margin-left: 15vw;
      font-weight: 700;
      display: inline-block;
      padding: 8px 50px;
    }
  }
}
</style>