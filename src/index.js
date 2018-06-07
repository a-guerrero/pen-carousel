import 'reset-css'
import './index.styl'

import * as THREE from 'three'

// HELPERS
// #region
////////////////////////////////////////////////////////////////////////////////
const aspectRatio = () => {
    const { innerWidth, innerHeight } = window
    return innerWidth / innerHeight
}

const getRendererSize = () => {
    const { innerWidth, innerHeight, devicePixelRatio } = window
    return {
        width: innerWidth * devicePixelRatio,
        height: innerHeight * devicePixelRatio,
    }
}

/**
 * @param {THREE.PerspectiveCamera} camera
 */
const updateCameraAspectRatio = (camera) => {
    camera.aspect = aspectRatio()
    camera.updateProjectionMatrix()
}

/**
 * @param {THREE.WebGLRenderer} renderer
 */
const updateRendererSize = (renderer) => {
    const { width, height } = getRendererSize()
    renderer.setSize(width, height, false)
}

/**
 * @param {number} deg
 */
const degToRad = (deg) => {
    return deg * Math.PI / 180
}

/**
 * @param {THREE.Mesh} plane
 * @param {THREE.PerspectiveCamera} camera
 */
const getPlaneSize = (plane, camera) => {
    const dist = camera.position.z - plane.position.z
    const fov = degToRad(camera.fov)
    const height = 2 * Math.tan(fov / 2) * dist
    const width = height * aspectRatio()
    return { width, height }
}

/**
 * @param {THREE.Mesh} plane
 * @param {THREE.PerspectiveCamera} camera
 */
const updatePlaneSize = (plane, camera, scale = 1) => {
    const { width, height } = getPlaneSize(plane, camera)
    plane.scale.x = width * scale
    plane.scale.y = height * scale
}

/**
 * @param {number} y1
 * @param {number} y2
 * @param {number} x
 * @param {number} phase
 */
const cosWave = (y1, y2, x, phase = 1) => {
    const amplitude = (y2 - y1) / 2
    return y1 + amplitude + amplitude * Math.cos(x * phase)
}
// #endregion

// SCENE
////////////////////////////////////////////////////////////////////////////////
const scene = new THREE.Scene()

// CAMERA
////////////////////////////////////////////////////////////////////////////////
const camera = new THREE.PerspectiveCamera(50, aspectRatio(), 0.1, 15)
camera.position.z = 10
updateCameraAspectRatio(camera)

// RENDERER
////////////////////////////////////////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.domElement.classList.add('stage')
updateRendererSize(renderer)

const body = document.querySelector('body')
body.appendChild(renderer.domElement)

// HEMISPHERE LIGHT
////////////////////////////////////////////////////////////////////////////////
const hemiLight = new THREE.HemisphereLight(0XF4F2E4, 0X322F2A, 0.5)
hemiLight.position.y = -6
hemiLight.position.z = 7
scene.add(hemiLight)

// DIRECTIONAL LIGHT
////////////////////////////////////////////////////////////////////////////////
const pointLight = new THREE.PointLight(0XF4F2E4, 1, 100)
pointLight.castShadow = true
pointLight.shadow.mapSize.width = 2048
pointLight.shadow.mapSize.height = 2048
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 15
pointLight.position.y = -3
pointLight.position.z = 8
scene.add(pointLight)

const directionalLightHelper = new THREE.PointLightHelper(pointLight, 0.1, 0xFFFF00)
scene.add(directionalLightHelper)

// BACKGROUND
////////////////////////////////////////////////////////////////////////////////
const backgroundGeom = new THREE.BoxGeometry(4, 4, 0.01)
const backgroundMat = new THREE.MeshPhongMaterial({
    color: 0XFF0000,
    specular: 0X00FFAE,
    shininess: 2,
    morphTargets: true,
    vertexColors: THREE.FaceColors,
    flatShading: true,
})
const background = new THREE.Mesh(backgroundGeom, backgroundMat)
background.receiveShadow = true
background.z = -1
updatePlaneSize(background, camera, 0.9)
pointLight.add(background)
scene.add(background)

// PLANE
////////////////////////////////////////////////////////////////////////////////
const geometry = new THREE.BoxGeometry(1, 1, 0.01)
const material = new THREE.MeshPhongMaterial({
    color: 0X999999,
    specular: 0X999999,
    shininess: 0,
    morphTargets: true,
    vertexColors: THREE.FaceColors,
    flatShading: true,
})

const plane = new THREE.Mesh(geometry, material)
const maxPlaneRotation = degToRad(45)
plane.castShadow = true
plane.position.z = 1
plane.rotation.x = maxPlaneRotation
plane.rotation.y = -maxPlaneRotation
pointLight.add(plane)
scene.add(plane)

// ANIMATION
////////////////////////////////////////////////////////////////////////////////
const then = Date.now()
const animate = () => {
    const now = Date.now()
    const delta = (now - then) * 0.0008
    requestAnimationFrame(animate)
    pointLight.position.x = cosWave(-5, 5, delta)
    pointLight.position.y = cosWave(5, -5, delta)
    plane.rotation.x = cosWave(-maxPlaneRotation, maxPlaneRotation, delta)
    plane.rotation.y = cosWave(-maxPlaneRotation, maxPlaneRotation, delta)
    renderer.render(scene, camera)
}

animate()

// BINDINGS
////////////////////////////////////////////////////////////////////////////////
const onResize = () => {
    updateCameraAspectRatio(camera)
    updateRendererSize(renderer)
    updatePlaneSize(plane, camera, 0.8)
}

window.addEventListener('resize', onResize)
