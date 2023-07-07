<template>
  <div class="christmas-home">
    <div class="christmas-container" ref="christmasCanvasDom">
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入glft 模型载入库
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 导入GLTF压缩模型的解压库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// 导入用于HDR贴图导入的库
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Water } from 'three/examples/jsm/objects/Water2'

// 获取 DOM 元素
const christmasCanvasDom = ref<HTMLElement | null>(null)

// 自适应分辨率
window.addEventListener('resize', () => {
  // 设置摄像头宽高比
  camera.aspect = window.innerWidth / window.innerHeight
  // 更新摄像头的投影矩阵
  camera.updateProjectionMatrix()
  // 重新设置渲染器的宽高比
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 像素比
  renderer.setPixelRatio(window.devicePixelRatio)
})

// 初始化场景
const scene = new THREE.Scene()
// 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// camera.position.set(-3.23, 2.98, 4.06)
camera.position.set(-12, 3, 0)
// 设置了相机的宽高比后更新相机的投影矩阵
camera.updateProjectionMatrix()
// 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // 抗锯齿
  antialias: true,
})
// 设置渲染器开始对阴影的计算
renderer.setSize(window.innerWidth, window.innerHeight)
// renderer.outputEncoding = THREE.sRGBEncoding
renderer.outputColorSpace = THREE.SRGBColorSpace 
console.log(renderer.outputColorSpace);

// 设置色调映射
// renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMapping = THREE.ACESFilmicToneMapping
// 色调映射的曝光程度，默认为1
renderer.toneMappingExposure = 1
renderer.shadowMap.enabled = true
// 设置物理的光照效果,已移除，使用下面的新API可达同意目的
// renderer.physicallyCorrectLights = true;
// 是否使用传统照明模式,默认为是，关闭传统照明模式即可模仿物理光照，光亮随距离可递减
renderer.useLegacyLights = false;

const render = () => {
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(render)
}

// 初始化轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

onMounted(() => {
  christmasCanvasDom.value?.appendChild(renderer.domElement)
  render()
})

// 加载环境纹理
const rgbeLoader = new RGBELoader()
rgbeLoader.load('./textures/sky.hdr', (texture: THREE.Texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.background = texture
  // 该纹理贴图将会被设为场景中所有物理材质的环境贴图
  scene.environment = texture
})

// 初始化 DRACOLoader 实例
const dracoLoader = new DRACOLoader()
// 设置解码器路径
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
// 设置 DRACOLoader 解码器实例
gltfLoader.setDRACOLoader(dracoLoader)

type Gltf = {
  animations: Array<THREE.AnimationClip>,
  scene: THREE.Group,
  scenes: Array<THREE.Group>,
  cameras: Array<THREE.Camera>,
  asset: Object,
  userData: Object,
}

// 加载模型
gltfLoader.load('./model/scene.glb', (gltf: Gltf) => {
  const model = gltf.scene
  model.traverse((child: any) => {
    if(child.name === 'Plane') {
      child.visible = false
    }
    if(child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
  }
  })
  scene.add(model)
})

const waterGeometry = new THREE.CircleGeometry(200, 18)
const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 10
})
water.rotation.x = -Math.PI / 2
water.position.y = -0.4
scene.add(water)

// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 0.1)
// light.castShadow = true
light.position.set(0, 50, 0)
scene.add(light)

// 添加点光源
const pointLight = new THREE.PointLight(0xffffff, 10)
pointLight.position.set(-0.4, 2.1, 0)
pointLight.castShadow = true
scene.add(pointLight)

// 创建点光源组
const pointLightGroup = new THREE.Group()
pointLightGroup.position.set(-8, 2.5, -1.5)
// 半径变量
const radius = 3
const pointLightArr: THREE.Mesh[] = []

for(let i = 0; i < 3; i++) {
  const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    // 材质的放射（光）颜色，基本上是不受其他光照影响的固有颜色。默认为黑色。
    emissive: 0xffffff,
    // 放射光强度。调节发光颜色。默认为1s
    emissiveIntensity: 10
  })
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
  pointLightArr.push(sphereMesh)
  const pointLight = new THREE.PointLight(0xffffff, 10)
  pointLight.castShadow = true
  // 用来偏置阴影的位置。当你使用非常薄的对象时，
  // 可以使用它来解决一些奇怪的效果。如果你看到奇怪的阴影效果，
  // 将该属性设置为很小的值（例如 -0.0008）通常可以解决问题。此属性的默认值为 0。
  pointLight.shadow.bias = -0.0008;  
  // pointLight.shadow.mapSize.width=1024
  // pointLight.shadow.mapSize.height=1024
  sphereMesh.position.set(
    radius * Math.cos((i * 2 * Math.PI) / 3),
    Math.cos((i * 2 * Math.PI) / 3),
    radius * Math.sin((i * 2 * Math.PI) / 3)
  )
  sphereMesh.add(pointLight)
  pointLightGroup.add(sphereMesh)
}

scene.add(pointLightGroup)
// 使用补间函数，从0到2Π，使灯泡旋转
const options = {
  angle: 0
}

gsap.to(options, {
  angle: Math.PI * 2,
  duration: 10,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    pointLightGroup.rotation.y = options.angle;
    pointLightGroup.rotation.x = options.angle;
    pointLightGroup.rotation.z = options.angle;
    pointLightArr.forEach((item, index) => {
      // item.position.y = Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5)
      // item.position.set(
      //   radius * Math.cos((index * 2 * Math.PI) / 3),
      //   Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5),
      //   radius * Math.sin((index * 2 * Math.PI) / 3)
      // );
    });
  },
})

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

const scenes = [
  {
    text: '新年快乐',
    callback: () => {
      // 执行函数切换位置
      translateCamera(
        new THREE.Vector3(-3.23, 3, 4.06),
        new THREE.Vector3(-8, 2, 0)
        )
    }
  },
  {
    text: '元宵快乐',
    callback: () => {
      // 执行函数切换位置
      translateCamera(
        new THREE.Vector3(7, 0, 23),
        new THREE.Vector3(0, 0, 0)
      )
    }
  },
  {
    text: '五一快乐',
    callback: () => {
      // 执行函数切换位置
      translateCamera(
        new THREE.Vector3(10, 3, 0),
        new THREE.Vector3(5, 2, 0)
      )
    }
  },
  {
    text: '中秋快乐',
    callback: () => {
      // 执行函数切换位置
      translateCamera(
        new THREE.Vector3(7, 0, 23),
        new THREE.Vector3(0, 0, 0)
      )
    }
  },
  {
    text: '国庆快乐',
    callback: () => {
      // 执行函数切换位置
      translateCamera(
        new THREE.Vector3(-20, 1.3, 6.6),
        new THREE.Vector3(5, 2, 0)
      )
    }
  }
]
// 防抖 间隔时间变量
let isAnimate = false
const index = ref(0)
// 监听鼠标滚轮事件
window.addEventListener('wheel', (e) => {
  if(isAnimate) return
  isAnimate = true
  console.log(e);
  if(e.deltaY > 0) {
    index.value++
    if(index.value > scenes.length - 1) {
      index.value = 0
    }
    scenes[index.value].callback()
    console.log(index.value);
    
  }
  setTimeout(() => {
    isAnimate = false
  }, 1000)
})



</script>

<style scoped>

</style>