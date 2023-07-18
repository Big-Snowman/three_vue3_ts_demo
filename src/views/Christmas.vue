<template>
  <div class="christmas-home">
    <div class="text" :style="{transform: `translateY(${-index * 100}vh)`}">
      <div v-for="item in scenes" style="width: 100vw; height: 100vh;">
        <h1>
          {{ item.text }}
        </h1>
      </div>
    </div>
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
camera.position.set(-3.23, 3, 4)
// camera.position.set(-12, 3, 0)
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
// console.log(renderer.outputColorSpace);

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
console.log(renderer.shadowMap.type);
// 设置阴影类型
// BasicShadowMap 能够给出没有经过过滤的阴影映射 —— 速度最快，但质量最差。
// PCFShadowMap 为默认值，使用Percentage-Closer Filtering (PCF)算法来过滤阴影映射。
// PCFSoftShadowMap 和PCFShadowMap一样使用 Percentage-Closer Filtering (PCF) 算法过滤阴影映射，但在使用低分辨率阴影图时具有更好的软阴影。
// VSMShadowMap 使用Variance Shadow Map (VSM)算法来过滤阴影映射。当使用VSMShadowMap时，所有阴影接收者也将会投射阴影
renderer.shadowMap.type = THREE.BasicShadowMap

const render = () => {
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(render)
}

// 初始化轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0)
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

const waterGeometry = new THREE.CircleGeometry(110, 16)
const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  // textureWidth: 1024,
  // textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 10
})
water.rotation.x = -Math.PI / 2
water.position.y = -0.4
scene.add(water)

// 添加平行光
// const light = new THREE.DirectionalLight(0xffffff, 0.1)
// light.castShadow = true
// light.position.set(0, 50, 0)
// scene.add(light)

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
  const sphereGeometry = new THREE.SphereGeometry(0.15, 32, 32)
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
  // pointLight.shadow.mapSize.width = 2048
  // pointLight.shadow.mapSize.height = 2048
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
    // pointLightArr.forEach((item, index) => {
      // item.position.y = Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5)
      // item.position.set(
      //   radius * Math.cos((index * 2 * Math.PI) / 3),
      //   Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5),
      //   radius * Math.sin((index * 2 * Math.PI) / 3)
      // );
    // });
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
      restoreHeart()
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
      makeHeart()
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
  if(e.deltaY > 0) {
    index.value++
    if(index.value > scenes.length - 1) {
      index.value = 0
    }
    scenes[index.value].callback()
    
  }
  setTimeout(() => {
    isAnimate = false
  }, 1000)
})

// 实例化创建满天星
// 下面是一种具有实例化渲染支持的特殊版本的Mesh。你可以使用 InstancedMesh 来渲染大量具有相同几何体与材质、但具有不同世界变换的物体。
// 使用 InstancedMesh 将帮助你减少 draw call 的数量，从而提升你应用程序的整体渲染性能
const starsInstance = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.08, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 10,
  }),
  100
)

// 随机分布在天上
const starsArr: THREE.Vector3[] = []
const endArr: THREE.Vector3[] = []

for(let i = 0; i < 100; i++) {
  const x = Math.random() * 100 - 50
  const y = Math.random() * 60
  const z = Math.random() * 100 - 50
  starsArr.push(new THREE.Vector3(x, y, z))

  // 创建4维矩阵
  let matrix: THREE.Matrix4 = new THREE.Matrix4()
  matrix.setPosition(x, y, z)
  // 第一个参数是实例的索引， 第二个参数是一个4x4矩阵，表示单个实例本地变换。
  starsInstance.setMatrixAt(i, matrix)
}
scene.add(starsInstance)

// 创建路线
let heartShape = new THREE.Shape();
// .moveTo( x, y )：将路径的起点移动到一个新的位置（x,y），并在路径中创建一个新的点。无返回值。
// .lineTo( x, y )：在路径中创建一个新的点（x，y），并在该点和上一个点之间画一条直线。无返回值。
// .ellipse( x, y, rx, ry, astart, aend, acw )：创建一个椭圆形的路径段。无返回值。示例代码: path.ellipse( 50, 50, 15, 8, 0, Math.PI * 2, false );
// arc(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) - 在当前子路径中创建一条弧线段。示例代码：path.arc( 0, 0, 20, 0, Math.PI, true );
// ellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation) - 在当前子路径中创建一个椭圆形。示例代码：javascript path.ellipse( 0, 0, 20, 30, 0, Math.PI, true,0 );
// absarc(x, y, radius, startAngle, endAngle, clockwise) - 在形状上添加一个有中心和半径的弧形。
// absellipse(x, y, xRadius, yRadius, startAngle, endAngle, clockwise) - 在形状上添加一个椭圆
// .quadraticCurveTo( cx, cy, x, y )：在路径中创建一个控制点（cx，cy），并与当前点和结束点形成二次贝塞尔曲线。无返回值
// .bezierCurveTo( cx1, cy1, cx2, cy2, x, y )：在路径中创建两个控制点（cx1，cy1）和（cx2，cy2），并与当前点和结束点形成三次贝塞尔曲线。无返回值
heartShape.moveTo(25, 25);
heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

// 根据路径获取点
let center = new THREE.Vector3(0, 0, 10);
for (let i = 0; i < 100; i++) {
  // .getPoint(t) t在0-1之间，返回曲线内取一个二维坐标
  let point = heartShape.getPoint(i / 100);
  endArr.push(
    new THREE.Vector3(
      point.x * 0.1 + center.x,
      point.y * 0.1 + center.y,
      center.z
    )
  )
}

// 创建动画
function makeHeart() {
  let params = {
    time: 0,
  }
  gsap.to(
    params,
    {
      time: 1,
      duration: 1,
      onUpdate: () => {
        for(let i = 0; i < 100; i++) {
          let x = starsArr[i].x + (endArr[i].x - starsArr[i].x) * params.time;
          let y = starsArr[i].y + (endArr[i].y - starsArr[i].y) * params.time;
          let z = starsArr[i].z + (endArr[i].z - starsArr[i].z) * params.time;
          // 创建4维矩阵
          const matrix = new THREE.Matrix4()
          matrix.setPosition(x, y, z)
          starsInstance.setMatrixAt(i, matrix)
        }
        starsInstance.instanceMatrix.needsUpdate = true
      }
    }
  )
}

function restoreHeart() {
  const params = {
    time: 0,
  }
  gsap.to(
    params,
    {
      time: 1,
      duration: 1,
      onUpdate: () => {
        for(let i = 0; i < 100; i++) {
          let x = endArr[i].x + (starsArr[i].x - endArr[i].x) * params.time;
          let y = endArr[i].y + (starsArr[i].y - endArr[i].y) * params.time;
          let z = endArr[i].z + (starsArr[i].z - endArr[i].z) * params.time;
          const matrix = new THREE.Matrix4()
          matrix.setPosition(x, y, z)
          starsInstance.setMatrixAt(i, matrix)
        }
        starsInstance.instanceMatrix.needsUpdate = true
      }
    }
  )
}
</script>

<style scoped>
.text {
  position: fixed;
  z-index: 100;
  color: #ffffff;
  pointer-events: none;
  transition: all 1s;
  top: 30px;
  left: 80px;
}
</style>