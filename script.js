import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */
// Debug
const gltfloader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader() 

const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            
           child.material.envMapIntensity = debugObject.envMapIntensity
           child.material.needsUpdate= true
           child.castShadow= true
           child.receiveShadow = true
        }
  
    } )


}


/**
 * Test sphere
 */
const environmentmap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'

])
environmentmap.encoding = THREE.sRGBEncoding
scene.background = environmentmap
scene.enviroment = environmentmap
debugObject.envMapIntensity =5
gui.add(debugObject,'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)


gltfloader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(10,10,10)
        gltf.scene.position.set(0,-4,0)
        gltf.scene.rotation.y =Math.PI * 0.5

        scene.add(gltf.scene)

     
        gui.add(gltf.scene.rotation , 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotation')
           
        updateAllMaterials()

    }



)
/*
lights
*/

const directionalLight = new  THREE.DirectionalLight('#ffffff',3)
directionalLight.position.set(0.25,3,-2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024,102)
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

//


gui.add(directionalLight,'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position,'x').min(-5).max(15).step(0.001).name('lightX')
gui.add(directionalLight.position,'y').min(-5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position,'z').min(-5).max(5).step(0.001).name('light2')


/**
 * Sizes
 */
const sizes = {
     width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias : true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicalyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

gui
    .add(renderer , 'toneMapping',{
        No : THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard : THREE.ReinhardToneMapping,
        Cineon : THREE.CineonToneMapping,
        ACESFilmic : THREE.ACESFilmicToneMappiing
    })
    .onFinishChange(() =>
    {
            renderer.toneMapping = Number(renderer.toneMapping)
            updateAllMaterials()
    })
    
gui.add(renderer , 'toneMappingExposure').min(0).max(10).step(0.001)    

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()