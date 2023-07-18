<template>
  <div class="home">
    <div class="power-box" style=""></div>
    <!-- <button @click="lightFlag(flag)">夜晚/白天</button> -->
    <div class="power" :style="{width: `${percentage * 2.8}px`}"></div>
    <div class="canvas-container" ref="canvasDom">
    </div>
    <div class="frame" ref="frameDom"></div>
  </div>
</template>
<script setup lang="ts">
import * as THREE from 'three'
// 物理引擎库
import * as CANNON from 'cannon-es'
import gsap from 'gsap'
import { onMounted, ref, reactive } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'

const canvasDom = ref<HTMLElement | null>(null)
const frameDom = ref<HTMLElement | null>(null)

let flag = true
const lightFlag = (flag: boolean) => {
  flag = !flag
  if(flag) {
    scene.remove(spotLight,spotLight1,spotLight2,spotLight3) 
  } else {
    scene.background = null
    scene.environment = null
    scene.add(spotLight,spotLight1,spotLight2,spotLight3)    
  }
}

// 实例创建一个GUI
const gui = new dat.GUI()
// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(4, 2, 0)
// 更新投影矩阵（在相机设置完宽高比之后使用）
camera.updateProjectionMatrix()
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  // 抗锯齿
  antialias: true,
  // 使用Three进行加载模型时，总会遇到模型相接处或某些区域出现频闪问题或内容被相邻近元素覆盖掉的情况,对数缓存开启可解决
  // 使用对数缓存
  logarithmicDepthBuffer: true
})
// 是否使用传统照明模式,默认为是，关闭传统照明模式即可模仿物理光照，光亮随距离可递减
renderer.useLegacyLights = false;
renderer.setSize(window.innerWidth, window.innerHeight)
// 设置色调映射
renderer.toneMapping = THREE.ACESFilmicToneMapping
// 曝光强度
renderer.toneMappingExposure = 0.8
//设置阴影
// renderer.shadowMap.enabled = true
// renderer.shadowMap.autoUpdate = false
// renderer.shadowMap.needsUpdate = true
// 设置阴影类型
// BasicShadowMap 能够给出没有经过过滤的阴影映射 —— 速度最快，但质量最差。
// PCFShadowMap 为默认值，使用Percentage-Closer Filtering (PCF)算法来过滤阴影映射。
// PCFSoftShadowMap 和PCFShadowMap一样使用 Percentage-Closer Filtering (PCF) 算法过滤阴影映射，但在使用低分辨率阴影图时具有更好的软阴影。
// VSMShadowMap 使用Variance Shadow Map (VSM)算法来过滤阴影映射。当使用VSMShadowMap时，所有阴影接收者也将会投射阴影
// renderer.shadowMap.type = THREE.BasicShadowMap
// console.log(renderer.info.render.frame);

let clock = new THREE.Clock()
const render = () => {
  // let delta = clock.getDelta()
  // world.step(delta)
  // 更新物理世界 step ( dt , [timeSinceLastCalled] , [maxSubSteps=10] )
  // dt：固定时间戳(要使用的固定时间步长)
  // [timeSinceLastCalled]：自上次调用函数以来经过的时间
  // [maxSubSteps=10]：每个函数调用可执行的最大固定步骤数
  // * 设置更新物理世界world的步长timestep
  //  * 这里选用60Hz的速度，即1.0 / 60.0
  world.step(1.0 / 60.0)
  if(ball && ballBody) {
    // 2个库的 vector3 类型不完全相同，我们暂时使用 @ts-ignore 忽视掉 ts 报错
    // @ts-ignore
    ball.position.copy(ballBody.position) 
    // @ts-ignore   
    ball.quaternion.copy(ballBody.quaternion)
  }
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(render)
}

// 在vue挂载完毕后将画布添加到dom当中
onMounted(() => {
  canvasDom.value?.appendChild(renderer.domElement)
  render()
})

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

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
// 加载纹理
const textureLoader = new THREE.TextureLoader()
textureLoader.load('./texture/outdoor.jpg', (texture: THREE.Texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.background = texture
  scene.environment = texture
  // 背景模糊强度
  scene.backgroundBlurriness = 0.2
})

// 添加聚光灯
const spotLight = new THREE.SpotLight(0xffffff, 1)
spotLight.position.set(10.8, 10.8, 6.1)
spotLight.castShadow = true
spotLight.shadow.camera.near = 0.5
spotLight.shadow.camera.far = 39
spotLight.shadow.camera.fov = 30
// spotLight.shadow.mapSize.width = 256
// spotLight.shadow.mapSize.height = 256
// 设置灯光 bias ，解决自阴影问题
spotLight.shadow.bias = -0.0008
spotLight.power = 1888

// 添加聚光灯
const spotLight1 = new THREE.SpotLight(0xffffff, 1)
spotLight1.position.set(-10.2, 10.8, 6.1)
spotLight1.castShadow = true
spotLight1.shadow.camera.near = 0.5
spotLight1.shadow.camera.far = 39
spotLight1.shadow.camera.fov = 30
// spotLight1.shadow.mapSize.width = 256
// spotLight1.shadow.mapSize.height = 256
// 设置灯光 bias ，解决自阴影问题
spotLight1.shadow.bias = -0.0008
spotLight1.power = 1888

// 添加聚光灯
const spotLight2 = new THREE.SpotLight(0xffffff, 1)
spotLight2.position.set(-10.6, 11, -5.8)
spotLight2.castShadow = true
spotLight2.shadow.camera.near = 0.5
spotLight2.shadow.camera.far = 39
spotLight2.shadow.camera.fov = 30
// spotLight2.shadow.mapSize.width = 256
// spotLight2.shadow.mapSize.height = 256
// 设置灯光 bias ，解决自阴影问题
spotLight2.shadow.bias = -0.0008
spotLight2.power = 1888

// 使用辅助器对灯光和阴影进行调整  !!!!!!!!!!
// const cameraHelper = new THREE.CameraHelper(spotLight2.shadow.camera)
// scene.add(cameraHelper)

// 添加聚光灯
const spotLight3 = new THREE.SpotLight(0xffffff, 1)
spotLight3.position.set(10.6, 10.8, -5.8)
spotLight3.castShadow = true
spotLight3.shadow.camera.near = 0.5
spotLight3.shadow.camera.far = 39
spotLight3.shadow.camera.fov = 30
// spotLight3.shadow.mapSize.width = 256
// spotLight3.shadow.mapSize.height = 256
// 设置灯光 bias ，解决自阴影问题
spotLight3.shadow.bias = -0.0008
spotLight3.power = 1888
// scene.add(spotLight,spotLight1,spotLight2,spotLight3)

// 初始化物理世界
const world = new CANNON.World()
// 设置重力
world.gravity.set(0, -9.82, 0)
// NaiveBroadphase Cannon 默认的算法。检测物体碰撞时，一个基础的方式是检测每个物体是否与其他每个物体发生了碰撞
// GridBroadphase 网格检测。轴对齐的均匀网格 Broadphase。将空间划分为网格，网格内进行检测。
// SAPBroadphase(Sweep-and-Prune) 扫描-剪枝算法，性能最好。
// 默认为 NaiveBroadphase，建议替换为 SAPBroadphase
// 碰撞算法
// world.broadphase = new CANNON.SAPBroadphase(world)

let ball: THREE.Mesh, ballBody: CANNON.Body

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('./model/playground02.glb', (gltf: any) => {
  const model = gltf.scene
  model.traverse((child: any) =>{
    
    // if(child.isMesh) {
    //   child.castShadow = true;
    //   child.receiveShadow = true;
    // }
    // 不包括足球模型和一些外围模型 减少物理顶点计算
    if(child.isMesh && child.name.search(/Solid/) == -1 && child.name.search(/Cube019/) == -1 && child.name.search(/Cube020/) == -1 && child.name != 'Plane009') {
    // if(child.isMesh && child.name.search(/Solid/) == -1 && child.name.search(/Cube019/) == -1 && child.name.search(/Cube020/) == -1 && child.name != 'Plane009' && child.name != 'door') {
      child.castShadow = true;
      child.receiveShadow = true;
      // trimesh类型  不规则格点网  两个参数第一个是顶点参数， 第二个是索引
      // 新的CANNON.Trimesh class可用于trimesh碰撞。目前它仅限于球面和平面碰撞。
      const trimesh = new CANNON.Trimesh(
        child.geometry.attributes.position.array,
        child.geometry.index.array
      )
      // 创建刚体
      const trimeshBody = new CANNON.Body({
        // 刚体的质量mass，质量为0的物体为静止的物体
        mass: 0,
        // 刚体形状
        shape: trimesh
      })
      // 获取世界位置和旋转给到物理世界
      // Three.js获得世界坐标.getWorldPosition(target)   将值复制到参数target
      // 通过.getWorldScale(target )方法可以获得一个模型的世界缩放系数
      // 通过.getWorldQuaternion(THREE.Quaternion)方法可以获得一个模型的世界空间中旋转的四元数   将值复制到参数
      trimeshBody.position.copy(child.getWorldPosition(new THREE.Vector3()))
      trimeshBody.quaternion.copy(child.getWorldQuaternion(new THREE.Quaternion()))
      // 添加刚体到物理世界
      world.addBody(trimeshBody)
    }
    // 足球模型集合
    if(child.name === 'Soccer_Ball') {
      ball = child
      // 创建球体
      const ballShape = new CANNON.Sphere(0.15)
      // 创建刚体
      ballBody = new CANNON.Body({
        // 质量为1
        mass: 1,
        // 位置
        position: new CANNON.Vec3(0, 115, 0),
        shape: ballShape
      })
      // 添加钢体到物理世界
      world.addBody(ballBody)
      ballBody.addEventListener('collide', (e: any) => {
        console.log(e.body);        
      })
    }
    if(child.name === 'door') {
      child.material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.5,
        transparent: true
      })
    }
    // setTimeout(() => {
    //   ballBody.position.set(0, 3, 0)
    //   // 速率
    //   ballBody.velocity.set(0, 0, 0)
    //   // 角速度
    //   ballBody.angularVelocity.set(0, 0, 0)
    //   console.log('555')
    // }, 2000)
  })
  scene.add(model)
})

let percentage = ref(30)

gsap.to(percentage, {
  duration: 5,
  value: 100,
  ease: 'linear',
  repeat: -1,
  onUpdate: () => {
    percentage.value = Math.floor(percentage.value)
  }
})

// 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(6)
// scene.add(axesHelper)

let isClick = false
window.addEventListener('click', () => {
  if(isClick) return
  isClick = true
  console.log(percentage.value);
  console.log("Number of Triangles :", renderer.info.render.triangles);
  console.log(world);
  // 第一个参数力度的大小，第二个参数是力度施加的位置 
  ballBody.applyForce(new CANNON.Vec3(-10 * percentage.value, 6 * percentage.value, (Math.random() - 0.5) * percentage.value), ballBody.position)
  setTimeout(() => {
    isClick = false
    ballBody.position.set(0, 3, 0)
    ballBody.velocity.set(0, 0, 0)
    ballBody.angularVelocity.set(0, 0, 0)
  }, 5000)
  console.log(world.broadphase);
})

console.log(world.hasAnyEventListener('ballBody'));


</script>
<style scoped>
.football {
  width: 100vw;
  height: 100vh;
}
.power,
.power-box {
  position: fixed;
  top: 20px;
  left: 50vw;
  transform: translateX(-50%);
  width: 280px;
  height: 30px;
  background-color: #fff;
}
.power {
  position: fixed;
  left: 50vw;
  top: 20px;
  transform: translateX(-140px);
  z-index: 110;
  background: linear-gradient(to right, rgb(156, 113, 108) 50px, red 150px, #d1b041);
}
</style>