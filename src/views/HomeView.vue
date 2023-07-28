<script setup lang="ts">
import * as THREE from "three"
// import * from '@t'
// 引入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// RGBE加载器(用于加载hdr环境图)
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import type { Material, Texture } from 'three'
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
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

const manager = new THREE.LoadingManager()
manager.onLoad = function ( ) {
	console.log( 'Loading complete!')
  // complete.value = false
}
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' )
  // if(loadDom.value) {
  //   loadDom.value.innerHTML = itemsLoaded / itemsTotal === 1 ? '' : `载入中,请稍等--${((itemsLoaded / itemsTotal) * 100).toFixed(0)}%`
  // }
}
manager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url )
}

type RoomItem = {
  path: string,
  index: number,
  position: THREE.Vector3,
  textureArr: string[]
}

const roomMap: RoomItem[] = [
  {
    path: 'kitchen',
    index: 0,
    position: new THREE.Vector3(10, 0, 0),
    textureArr: []
  },
  {
    path: 'kitchen',
    index: 2,
    position: new THREE.Vector3(20, 0, 0),
    textureArr: []
  },
  {
    path: 'living',
    index: 4,
    position: new THREE.Vector3(0, 0, 0),
    textureArr: []
  },
  {
    path: 'restroom',
    index: 7,
    position: new THREE.Vector3(-10, 0, 0),
    textureArr: []
  },
  // {
  //   path: 'childroom',
  //   index: 11,
  //   position: new THREE.Vector3(-20, 0, 0),
  //   textureArr: []
  // },
  // {
  //   path: 'childroom',
  //   index: 19,
  //   position: new THREE.Vector3(-20, 0, 10),
  //   textureArr: []
  // },
  // {
  //   path: 'bedroom',
  //   index: 20,
  //   position: new THREE.Vector3(0, 0, 10),
  //   textureArr: []
  // },
  // {
  //   path: 'bedroom',
  //   index: 23,
  //   position: new THREE.Vector3(0, 0, 10),
  //   textureArr: []
  // }
]

roomMap.map((item) => {
  item.textureArr = [`${item.index}_l`,`${item.index}_r`,`${item.index}_u`,`${item.index}_d`,`${item.index}_b`,`${item.index}_f`,]
})

// 创建几何体
const geometry = new THREE.BoxGeometry(10, 10, 10)
// 将几何体的Z轴缩放至倒置
geometry.scale(1, 1, -1)

roomMap.forEach((roomItem) => {
  const boxMaterials: Material[]  = []
  for(let i = 0; i < 6; i++) {
    // 加载纹理
    const texture = new THREE.TextureLoader(manager).load(`./imgs/${roomItem.path}/${roomItem.textureArr[i]}.jpg`)
    // 上下贴图角度不对，旋转矫正
    if(roomItem.textureArr[i] == `${roomItem.index}_u` || roomItem.textureArr[i] == `${roomItem.index}_d`) {
      texture.rotation = Math.PI
      texture.center = new THREE.Vector2(0.5, 0.5)
    }
    // 创建材质
    boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }))
  }
  // 用几何体实例和材质实例创建物体
  const cube = new THREE.Mesh(geometry, boxMaterials)
  cube.position.set(roomItem.position.x, roomItem.position.y, roomItem.position.z)
  // 将Z轴缩放至倒置
  // cube.geometry.scale(1, 1, -1)
  scene.add(cube)
})

console.log(scene);


// --------------------- 以6张图贴图立方体实现 -------------------
// // 添加立方体
// // 创建几何体
// const geometry = new THREE.BoxGeometry(10, 10, 10)

// // 6张图数组
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
// -----------------------------------------------------------------


// --------------------- 以HDR全景图贴球型物体实现 -------------------
// // 创建球
// const geometry = new THREE.SphereGeometry(5, 32, 32)
// // 创建加载器实例
// const rgbeLoader = new RGBELoader()
// // 异步的
// rgbeLoader.load('./imgs/hdr/ersisd-Merksem_Appartment_Living_4k.hdr', (texture: Texture) => {
//   const material = new THREE.MeshBasicMaterial({ map: texture })
//   const sphere = new THREE.Mesh(geometry, material)
//   // 反置球体，以至于贴图在内部展示
//   sphere.geometry.scale(1, 1, -1)
//   // sphere.position.z = 3
//   scene.add(sphere)
// })

// -----------------------------------------------------------------

// 获取ref元素
const container = ref<HTMLElement>()

const render = () => {
  	// 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera( pointer, camera );

    // 计算物体和射线的焦点
    const intersects = raycaster.intersectObjects(scene.children, true);
  // console.log(intersects[0].point);
  // console.log(scene.children[2].worldToLocal(intersects[0].point));
  
    for ( let i = 0; i < intersects.length; i ++ ) {
      console.log(intersects[ i ].object.material);
      
      // intersects[ i ].object.material[i].color?.set( 0xff0000 );

    }
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
  console.log(controls.target);

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

console.log(camera.position);

const che = (i: number) => {
  gsap.to(camera.position, {
    x: roomMap[i].position.x,
    y: roomMap[i].position.y,
    z: roomMap[i].position.z - 0.01
  })
  gsap.to(controls.target, {
    x: roomMap[i].position.x,
    y: roomMap[i].position.y,
    z: roomMap[i].position.z
  })
}


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove( event: any ) {
	// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1
}

window.addEventListener( 'pointermove', onPointerMove );



</script>

<template>
  <div class="container" ref="container"></div>
  <div class="btn" @click="che(3)">5555555</div>
</template>

<style>
.container {
  height: 100vh;
  width: 100vw;
  background-color: #f0f0f0;
}
.btn {
  position: fixed;
  top: 100px;
  left: 100px;
}
</style>
