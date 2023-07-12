<template>
  <div class="robot-home" ref="robotCanvasDom">
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import * as THREE from 'three'

const robotCanvasDom = ref<HTMLElement | null>(null)
// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 1.5, 6)

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)

// 创建辅助坐标轴
const axes = new THREE.AxesHelper(5);
scene.add(axes);

const render = () => {
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(render)
}

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

onMounted(() => {
  robotCanvasDom.value?.appendChild(renderer.domElement)
  render()
})

window.addEventListener('resize', () => {
  // 设置摄像头宽高比
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
})

// 创建RGBE加载器加载环境HDR纹理
const hdrLoader =new RGBELoader()
hdrLoader.load('./assets/sky12.hdr', (texture: THREE.Texture) => {
  // 纹理贴图的映射模式，映射模式常量有以下几个
  // UVMapping是默认值，纹理使用网格的坐标来进行映射。
  // CubeReflectionMapping 和 CubeRefractionMapping 用于 CubeTexture —— 由6个纹理组合而成，每个纹理都是立方体的一个面。 对于CubeTexture来说，CubeReflectionMapping是其默认值。
  // EquirectangularReflectionMapping 和 EquirectangularRefractionMapping 用于等距圆柱投影的环境贴图，也被叫做经纬线映射贴图。等距圆柱投影贴图表示沿着其水平中线360°的视角，以及沿着其垂直轴向180°的视角。贴图顶部和底部的边缘分别对应于它所映射的球体的北极和南极。
  texture.mapping = THREE.EquirectangularReflectionMapping
  // 设置场景的背景纹理
  scene.background = texture
  // 设置环境中物体的身处环境贴图
  scene.environment = texture
})

// 添加机器人
// 设置解压缩的模型加载器
const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader()
dracoLoader.setDecoderPath("./draco/gltf/")
dracoLoader.setDecoderConfig({
  type: 'js'
})
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load("./assets/robot.glb", (gltf: any) => {
  scene.add(gltf.scene)
  console.log(gltf.scene);
  // scene.position.set(0, 5, 5)
  // gltf.scene.traverse((e: any) => {
  //   if(e.isMesh) {
  //     console.log(e);
  //     // e.display = false
  //   }
  // })
})

// 灯光
const light1 = new THREE.DirectionalLight(0xffffff, 0.3)
light1.position.set(0, 10, 10)
const light2 = new THREE.DirectionalLight(0xffffff, 0.3)
light2.position.set(0, 10, -10)
const light3 = new THREE.DirectionalLight(0xffffff, 0.8)
light3.position.set(10, 10, 10)
scene.add(light1, light2, light3)

// 添加旋转光阵
const video= document.createElement('video')
video.src = './assets/zp2.mp4'
video.loop = true
// 静音
video.muted = true
video.play()
const videoTexture = new THREE.VideoTexture(video)
const videoGeometryPlane = new THREE.PlaneGeometry(8, 4.5)
const videoMaterial = new THREE.MeshBasicMaterial({
  map: videoTexture,
  transparent: true,
  side: THREE.DoubleSide,
  // alpha贴图是一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）。 默认值为null。
  alphaMap: videoTexture
})
const videoMesh = new THREE.Mesh(videoGeometryPlane, videoMaterial)
videoMesh.position.set(0, 0.1, 0)
videoMesh.rotation.set(-Math.PI / 2, 0, 0)
scene.add(videoMesh)

// 镜面反射
const reflectorGeometry = new THREE.PlaneGeometry(100, 100)
const reflectorPlane = new Reflector( reflectorGeometry, {
  textureWidth: window.innerWidth,
  textureHeight: window.innerHeight,
  color: 0x333333
})
reflectorPlane.rotation.x = -Math.PI / 2
scene.add(reflectorPlane)

</script>

<style lang="less" scoped>
</style>