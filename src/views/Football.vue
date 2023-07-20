<template>
  <div class="home">
    <div class="mask" v-if="!start">
      <div class="load" ref="loadDom" v-if="complete"></div>
      <div class="start" v-else @click="gameStart">游戏开始</div>
      <div class="tip">
        <div v-if="pc">Tip：按下鼠标蓄力，松开鼠标射球！</div>
        <div v-else>Tip：触碰屏幕蓄力，离开射球！</div>        
      </div>
    </div>
    <div class="power-box" style=""></div>
    <div class="score">得分：{{ score }}</div>
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
// import Stats from 'three/addons/libs/stats.module.js';
import { onMounted, ref, reactive } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'

const canvasDom = ref<HTMLElement | null>(null)
const frameDom = ref<HTMLElement | null>(null)
const loadDom = ref<HTMLElement | null>(null)

const pc = ref<boolean>(true)

// 加载进度变量
let complete = ref<boolean>(true)
// 开始游戏变量
let start = ref<boolean>(false)
// 开始游戏
const gameStart = () => {
  start.value = true
  ballBody.position.set(0, 8, 0)
  // 添加钢体到物理世界
  world.addBody(ballBody)
  let timer: number, isScore = true
  // 对足球刚体监听碰撞事件  可以监听的事件有 'collide', 'sleep' or 'wakeup' 等
  ballBody.addEventListener('collide', (e: any) => {
    playHitSound(e, false)
    // 节流计分 把足球丢场外
    if(isScore && e.body.id === doorID) {
      ballBody.position.set(0, -50, 0)
      ballBody.velocity.set(0, 0, 0)
      ballBody.angularVelocity.set(0, 0, 0)
      score.value++
      playHitSound(e, true)
      isScore = false
      // 中球特效
      gsap.to(doorMaterial.color, {
        r: 1,
        g: 1,
        b: 1,
        duration: 0.8,
        yoyo: true,
        repeat: 3
      })
      timer = setTimeout(() => {
        isScore = true
        clearTimeout(timer)
      }, 1800)
    }
  })



  ballBody.addEventListener('move', (e: any) => {
    console.log(e);
  })
  ballBody.addEventListener('wakeup', (e: any) => {
    console.log(e);
  })
  ballBody.addEventListener('sleep', (e: any) => {
    console.log(e);
  })
  // translateCamera(ball.position, new THREE.Vector3(0, 2, 20))


  let isClick = false
  // window.addEventListener('click', () => {
  //   if(isClick) return
  //   isClick = true
  //   console.log(percentage.value)
  //   console.log("Number of Triangles :", renderer.info.render.triangles)
  //   console.log(world)
  //   hitSound.volume = percentage.value / 100
  //   hitSound.currentTime = 0
  //   hitSound.play()
  //   // 第一个参数力度的大小，第二个参数是力度施加的位置 
  //   ballBody.applyForce(new CANNON.Vec3(-10 * percentage.value - 100, 6 * percentage.value + 6, (Math.random() - 0.7) * percentage.value * 2), ballBody.position)
  //   setTimeout(() => {
  //     isClick = false
  //     ballBody.position.set(0, 1, 0)
  //     ballBody.velocity.set(0, 0, 0)
  //     ballBody.angularVelocity.set(0, 0, 0)
  //   }, 5000)
  //   console.log(world.broadphase);
  // })

  // gsap.to(percentage, {
  //   duration: 5,
  //   value: 100,
  //   ease: 'linear',
  //   repeat: -1,
  //   onUpdate: () => {
  //     percentage.value = Math.floor(percentage.value)
  //   }
  // })

  let cameraViewID: number
  const cameraView = () => {
    // translateCamera(ball.position, new THREE.Vector3(0, 5, 5))
    camera.position.copy(ball.position)
    cameraViewID = requestAnimationFrame(cameraView)
  }

  const down = () => {
    if(isClick) return
      percentage.value = Math.random() * 100
      powerLine()
  }
  const up = () => {
    cancelAnimationFrame(powerID)
    // clearInterval(powerID)
    if(isClick) return
    isClick = true
    console.log(percentage.value)
    console.log("Number of Triangles :", renderer.info.render.triangles)
    console.log(world)
    hitSound.volume = percentage.value / 100
    hitSound.currentTime = 0
    hitSound.play()
    cameraView()
    // 第一个参数力度的大小，第二个参数是力度施加的位置 
    ballBody.applyForce(new CANNON.Vec3(-12 * percentage.value - 100, 8 * percentage.value + 6, (Math.random() - 0.7) * percentage.value * 2), ballBody.position)
    setTimeout(() => {
      cancelAnimationFrame(cameraViewID)
      translateCamera( new THREE.Vector3(4, 2, 0), new THREE.Vector3(0, 0, 0))
      isClick = false
      ballBody.position.set(0, 1, 0)
      ballBody.velocity.set(0, 0, 0)
      ballBody.angularVelocity.set(0, 0, 0)
    }, 5000)
  }
  // pc
  if(pc.value) {
    window.addEventListener('mousedown', () => {
      down()
    })
    window.addEventListener("mouseup", () => {
      up()
    })    
  } else {
    window.addEventListener('touchstart', () => {
      down()
    })
    window.addEventListener("touchend", () => {
      up()
    })    
  }

  // let tween:gsap.core.Tween
  // window.addEventListener('mousedown', () => {
  //   if(isClick) return
  //   percentage.value = Math.random() * 100
  //   tween = gsap.to(percentage, {
  //     duration: 0.8,
  //     value: 100,
  //     ease: 'linear',
  //     repeat: -1,
  //     onUpdate: () => {
  //       percentage.value = Math.floor(percentage.value)
  //     }
  //   })
  // })
  // window.addEventListener("mouseup", () => {
  //   tween.kill()
  //   if(isClick) return
  //   isClick = true
  //   console.log(percentage.value)
  //   console.log("Number of Triangles :", renderer.info.render.triangles)
  //   console.log(world)
  //   hitSound.volume = percentage.value / 100
  //   hitSound.currentTime = 0
  //   hitSound.play()
  //   // 第一个参数力度的大小，第二个参数是力度施加的位置 
  //   ballBody.applyForce(new CANNON.Vec3(-10 * percentage.value - 100, 6 * percentage.value + 6, (Math.random() - 0.7) * percentage.value * 2), ballBody.position)
  //   setTimeout(() => {
  //     isClick = false
  //     ballBody.position.set(0, 1, 0)
  //     ballBody.velocity.set(0, 0, 0)
  //     ballBody.angularVelocity.set(0, 0, 0)
  //   }, 5000)
  // })
}


// 使用补间动画移动相机
const timeLine1 = gsap.timeline()
const timeLine2 = gsap.timeline()
// 定义相机移动函数
function translateCamera(position: THREE.Vector3, target: THREE.Vector3) {
  timeLine1.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1,
    ease: 'power2.inOut'
  })
  timeLine2.to(controls.target, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: 1,
    ease: 'power2.inOut'
  })
}


// 检测是否移动端
function browserRedirect() {
  const sUserAgent = navigator.userAgent.toLowerCase();
  const bIsIpad = sUserAgent.indexOf('ipad') != -1
  const bIsIphoneOs = sUserAgent.indexOf('iphone os') != -1
  const bIsMidp = sUserAgent.indexOf('midp') != -1
  const bIsUc7 = sUserAgent.indexOf('rv:1.2.3.4') != -1
  const bIsUc = sUserAgent.indexOf('ucweb') != -1
  const bIsAndroid = sUserAgent.indexOf('android') != -1
  const bIsCE = sUserAgent.indexOf('windows ce') != -1
  const bIsWM = sUserAgent.indexOf('windows mobile') != -1
  if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ) {
    pc.value = true
  } else {
    pc.value = false
  }
}
browserRedirect()

let powerID: number
// const powerLine = () => {
//   powerID = setInterval(() => {
//     if(percentage.value < 100) {
//       percentage.value++
//     } else {
//       percentage.value = 0
//     }
//   }, 10)
// }
const powerLine = () => {
  if(percentage.value < 100) {
    percentage.value = percentage.value + 2
  } else {
    percentage.value = 0
  }
  powerID = requestAnimationFrame(powerLine)
}

// let stats = new Stats()
// document.body.appendChild( stats.dom )

let score = ref<number>(0)

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
// renderer.useLegacyLights = false;
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

// let clock = new THREE.Clock()
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
  // stats.update()
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

// // 添加聚光灯
// const spotLight2 = new THREE.SpotLight(0xffffff, 1)
// spotLight2.position.set(-10.6, 11, -5.8)
// spotLight2.castShadow = true
// spotLight2.shadow.camera.near = 0.5
// spotLight2.shadow.camera.far = 39
// spotLight2.shadow.camera.fov = 30
// // spotLight2.shadow.mapSize.width = 256
// // spotLight2.shadow.mapSize.height = 256
// // 设置灯光 bias ，解决自阴影问题
// spotLight2.shadow.bias = -0.0008
// spotLight2.power = 1888

// 使用辅助器对灯光和阴影进行调整  !!!!!!!!!!
// const cameraHelper = new THREE.CameraHelper(spotLight2.shadow.camera)
// scene.add(cameraHelper)

// 初始化物理世界
const world = new CANNON.World()
// 设置重力
world.gravity.set(0, -9.82, 0)

// 创建默认材质
const defaultMaterial = new CANNON.Material('default')
//创建塑料材质
const ballMaterial = new CANNON.Material('ball')
// 定义两种材质之间的摩擦因数和弹力系数
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, ballMaterial, {
  friction: 5,
  restitution: 0.2,
})
world.addContactMaterial(defaultContactMaterial)

// NaiveBroadphase Cannon 默认的算法。检测物体碰撞时，一个基础的方式是检测每个物体是否与其他每个物体发生了碰撞
// GridBroadphase 网格检测。轴对齐的均匀网格 Broadphase。将空间划分为网格，网格内进行检测。
// SAPBroadphase(Sweep-and-Prune) 扫描-剪枝算法，性能最好。
// 默认为 NaiveBroadphase，建议替换为 SAPBroadphase
// 碰撞算法
// world.broadphase = new CANNON.SAPBroadphase(world)

let ball: THREE.Mesh, ballBody: CANNON.Body, doorID: Number

// 纹理加载器管理
const manager = new THREE.LoadingManager()
manager.onLoad = function ( ) {
	console.log( 'Loading complete!')
  complete.value = false
}
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' )
  if(loadDom.value) {
    loadDom.value.innerHTML = itemsLoaded / itemsTotal === 1 ? '' : `载入中,请稍等--${((itemsLoaded / itemsTotal) * 100).toFixed(0)}%`
  }
}
manager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url )
}

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader(manager)
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
        shape: trimesh,
        material: defaultMaterial
      })
      // 获取世界位置和旋转给到物理世界
      // Three.js获得世界坐标.getWorldPosition(target)   将值复制到参数target
      // 通过.getWorldScale(target )方法可以获得一个模型的世界缩放系数
      // 通过.getWorldQuaternion(THREE.Quaternion)方法可以获得一个模型的世界空间中旋转的四元数   将值复制到参数
      trimeshBody.position.copy(child.getWorldPosition(new THREE.Vector3()))
      trimeshBody.quaternion.copy(child.getWorldQuaternion(new THREE.Quaternion()))
      // 保存足球们的刚体ID
      if(child.name === 'door') {
        doorID = trimeshBody.id
        child.material = doorMaterial
        // const a = child.getWorldPosition(new THREE.Vector3());
        // const b = child.getWorldQuaternion(new THREE.Vector3());
        // console.log(a);
        // console.log(b);
        
      }
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
        // position: new CANNON.Vec3(0, 5, 0),
        shape: ballShape,
        material: ballMaterial
      })
      // // 添加钢体到物理世界
      // world.addBody(ballBody)
      // let timer: number, isScore = true
      // // 对足球刚体监听碰撞事件
      // ballBody.addEventListener('collide', (e: any) => {
      //   playHitSound(e, false)
      //   // 节流计分 把足球丢场外
      //   if(isScore && e.body.id === doorID) {
      //     ballBody.position.set(0, -50, 0)
      //     ballBody.velocity.set(0, 0, 0)
      //     ballBody.angularVelocity.set(0, 0, 0)
      //     score.value++
      //     playHitSound(e, true)
      //     isScore = false
      //     // 中球特效
      //     gsap.to(doorMaterial.color, {
      //       r: 1,
      //       g: 1,
      //       b: 1,
      //       duration: 0.8,
      //       yoyo: true,
      //       repeat: 3
      //     })
      //     timer = setTimeout(() => {
      //       isScore = true
      //       clearTimeout(timer)
      //     }, 1800)
      //   }
      // })
    }
  })
  scene.add(model)
})

/**
 * Sounds
 */
const hitSound = new Audio('./sounds/football.wav')
const scoreSound = new Audio('./sounds/score.wav')
// const hitSound = new Audio('../assets/sounds/football.wav')
const playHitSound = (collision: { contact: CANNON.ContactEquation }, score: boolean) => {
  if(score) {
    scoreSound.currentTime = 8
    scoreSound.play()
  } else {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if (impactStrength > 1.5) {
      hitSound.volume = Math.random()
      hitSound.currentTime = 0
      hitSound.play()
    }    
  }
}

const doorMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  opacity: 0.5,
  transparent: true
})

// 力度百分比
let percentage = ref(0)

// 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(6)
// scene.add(axesHelper)

// let isClick = false
// window.addEventListener('click', () => {
//   if(isClick) return
//   isClick = true
//   console.log(percentage.value)
//   console.log("Number of Triangles :", renderer.info.render.triangles)
//   console.log(world)
//   hitSound.volume = percentage.value / 100
//   hitSound.currentTime = 0
//   hitSound.play()
//   // 第一个参数力度的大小，第二个参数是力度施加的位置 
//   ballBody.applyForce(new CANNON.Vec3(-10 * percentage.value, 6 * percentage.value, (Math.random() - 0.7) * percentage.value * 2), ballBody.position)
//   setTimeout(() => {
//     isClick = false
//     ballBody.position.set(0, 1, 0)
//     ballBody.velocity.set(0, 0, 0)
//     ballBody.angularVelocity.set(0, 0, 0)
//   }, 5000)
//   console.log(world.broadphase);
// })

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
  bottom: 20px;
  left: 50vw;
  transform: translateX(-50%);
  width: 280px;
  height: 30px;
  background-color: #fff;
}
.power {
  position: fixed;
  left: 50vw;
  bottom: 20px;
  transform: translateX(-140px);
  z-index: 110;
  background: linear-gradient(to right, rgb(156, 113, 108) 50px, red 150px, #d1b041);
}
.score {
  position: fixed;
  left: 20px;
  top: 20px;
  font-weight: 700;
  font-size: 28px;
  color: red;
}
.mask {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2222;
  background-color: #fcf9f9;
  display: flex;
  justify-content: center;
  align-items: center;
}
.load {
  /* background-color: #b6b6b6; */
  display: inline-block;
  /* padding: 20px; */
  height: 80px;
  /* padding: 8px 20px; */
  font-size: 39px;
  font-weight: 900;
  /* border-radius: 20px; */
  color: #000;
}
.start {
  background-color: #b6b6b6;
  display: inline-block;
  /* padding: 20px; */
  height: 80px;
  padding: 8px 20px;
  font-size: 39px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 20px;
  color: #fff;
}
.tip {
  position: fixed;
  top: 50px;
  left: 50px;
}
</style>