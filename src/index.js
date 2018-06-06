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
const cosWave = (y1, y2, x, phase = 0) => {
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
const hemiLight = new THREE.HemisphereLight(0XF4F2E4, 0X322F2A, 1)
hemiLight.position.y = -6
hemiLight.position.z = 7
// scene.add(hemiLight)

// DIRECTIONAL LIGHT
////////////////////////////////////////////////////////////////////////////////
const pointLight = new THREE.PointLight(0XF4F2E4, 1, 100)
pointLight.castShadow = true
pointLight.position.y = -3
pointLight.position.z = 7
pointLight.shadowCameraVisible = true
console.log(pointLight.shadowCameraVisible)
scene.add(pointLight)
const directionalLightHelper = new THREE.PointLightHelper(pointLight, 0.1, 0xFFFF00)
scene.add(directionalLightHelper)

// BACKGROUND
////////////////////////////////////////////////////////////////////////////////
const backgroundGeom = new THREE.PlaneGeometry(4, 4)
const backgroundMat = new THREE.MeshPhongMaterial({
    color: 0X2B2B2F,
    specular: 0X2B2B2F,
    shininess: 20,
    morphTargets: true,
    vertexColors: THREE.FaceColors,
    flatShading: true,
})
const background = new THREE.Mesh(backgroundGeom, backgroundMat)
background.receiveShadow = true
background.castShadow = true
background.z = -4
scene.add(background)

// PLANE
////////////////////////////////////////////////////////////////////////////////
const geometry = new THREE.PlaneGeometry(1, 1)
const material = new THREE.MeshPhongMaterial({
    color: 0X999999,
    specular: 0X999999,
    shininess: 20,
    morphTargets: true,
    vertexColors: THREE.FaceColors,
    flatShading: true,
})

const plane = new THREE.Mesh(geometry, material)
plane.castShadow = true
plane.receiveShadow = true
plane.position.z = 2
// plane.rotation.x = degToRad(10)
// plane.rotation.y = degToRad(-10)
// updatePlaneSize(plane, camera, 0.9)
scene.add(plane)

// ANIMATION
////////////////////////////////////////////////////////////////////////////////
const then = Date.now()
const animate = () => {
    const now = Date.now()
    const delta = now - then
    requestAnimationFrame(animate)
    pointLight.position.y = cosWave(3, -3, delta, 0.00025)
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
