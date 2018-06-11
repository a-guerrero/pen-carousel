import 'reset-css'
import './index.styl'

import { BokehShader, BokehDepthShader } from './BokehShader2'
import * as THREE from 'three'

// CONSTANTS
////////////////////////////////////////////////////////////////////////////////
// #region
const FOV = 75
const NEAR = 0.1
const FAR = 15

const colors = Object.freeze({
    BACKGROUND: 0x0E0E0F,
    SKY: 0xFFFFFF,
    GROUND: 0x0E0E0F,
    POINT_LIGHT: 0xFFFFFF,
    MESH_COLOR: 0x333438,
    MESH_SHININESS: 0x991A1C,
})
// #endregion

// HELPERS
////////////////////////////////////////////////////////////////////////////////
// #region
/**
 * @param {number} deg
 */
const degToRad = (deg) => {
    return deg * Math.PI / 180
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

const getAspectRatio = () => {
    const { innerWidth, innerHeight } = window
    return innerWidth / innerHeight
}

const updateCameraAspectRatio = (camera) => {
    camera.aspect = getAspectRatio()
    camera.updateProjectionMatrix()
}

const getRendererSize = () => {
    const { innerWidth, innerHeight } = window
    return {
        width: innerWidth,
        height: innerHeight,
    }
}

const updateRendererSize = (renderer) => {
    const { width, height } = getRendererSize()
    renderer.setSize(width, height, false)
}
// #endregion

// SCENE
////////////////////////////////////////////////////////////////////////////////
const scene = new THREE.Scene()
scene.background = new THREE.Color(colors.BACKGROUND)

// CAMERA
////////////////////////////////////////////////////////////////////////////////
const camera = new THREE.PerspectiveCamera(FOV, getAspectRatio(), NEAR, FAR)
camera.position.z = 7

// RENDERER
////////////////////////////////////////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.domElement.classList.add('stage')
updateRendererSize(renderer)

const body = document.querySelector('body')
body.appendChild(renderer.domElement)

// DOF
////////////////////////////////////////////////////////////////////////////////
// #region
const bokehDepthMat = new THREE.ShaderMaterial({
    uniforms: BokehDepthShader.uniforms,
    vertexShader: BokehDepthShader.vertexShader,
    fragmentShader: BokehDepthShader.fragmentShader
})
bokehDepthMat.uniforms['mNear'].value = NEAR
bokehDepthMat.uniforms['mFar'].value = FAR

const postProcessing = (function () {
    const scene = new THREE.Scene()

    const halfW = window.innerWidth / 2
    const halfH = window.innerHeight / 2
    const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, -10000, 10000)
    camera.position.z = 1.55
    scene.add(camera)

    const pars = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
    }
    const rtTextureDepth = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
    const rtTextureColor = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);

    const bokehUniforms = THREE.UniformsUtils.clone(BokehShader.uniforms)
    bokehUniforms['tColor'].value = rtTextureColor.texture
    bokehUniforms['tDepth'].value = rtTextureDepth.texture
    bokehUniforms['textureWidth'].value = window.innerWidth
    bokehUniforms['textureHeight'].value = window.innerHeight

    const bokehMaterial = new THREE.ShaderMaterial({
        uniforms: bokehUniforms,
        vertexShader: BokehShader.vertexShader,
        fragmentShader: BokehShader.fragmentShader,
        defines: {
            RINGS: 3,
            SAMPLES: 4,
        }
    })

    const quadGeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, bokehMaterial)
    const quad = new THREE.Mesh(quadGeometry)
    quad.position.z = -7
    scene.add(quad)

    return {
        scene,
        camera,
        rtTextureDepth,
        rtTextureColor,
        bokehUniforms,
        bokehMaterial,
        quad,
    }
}())
// #endregion

// HEMISPHERE LIGHT
////////////////////////////////////////////////////////////////////////////////
const hemiLight = new THREE.HemisphereLight(colors.SKY, colors.GROUND, 1)
hemiLight.position.y = 10
hemiLight.position.z = 0
scene.add(hemiLight)

// POINT LIGTH
const pointLight = new THREE.PointLight(colors.POINT_LIGHT, 0.2, 100)
pointLight.position.x = 30
pointLight.position.z = 30
scene.add(pointLight)

// MESH
////////////////////////////////////////////////////////////////////////////////
const geometry = new THREE.IcosahedronGeometry(1)
const material = new THREE.MeshPhongMaterial({
    color: colors.MESH_COLOR,
    specular: colors.MESH_SHININESS,
    shininess: 2,
    morphTargets: true,
    vertexColors: THREE.FaceColors,
    flatShading: true
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// ANIMATION
////////////////////////////////////////////////////////////////////////////////
const then = Date.now()
const meshMaxRotation = degToRad(540)

const animate = () => {
    requestAnimationFrame(animate)
    const now = Date.now()
    const delta = (now - then) * 8e-4
    mesh.position.z = cosWave(-4, 4, delta)
    mesh.rotation.x = cosWave(0, meshMaxRotation, delta)
    mesh.rotation.y = cosWave(meshMaxRotation, 0, delta)

    postProcessing.bokehMaterial.defines.RINGS = 3
    postProcessing.bokehMaterial.defines.SAMPLES = 4
    postProcessing.bokehMaterial.needsUpdate = true

    // renderer.render(scene, camera)

    renderer.clear()
    // render scene into texture
    renderer.render(scene, camera, postProcessing.rtTextureColor, true)
    // render depth into texture
    scene.overrideMaterial = bokehDepthMat
    renderer.render(scene, camera, postProcessing.rtTextureDepth, true)
    scene.overrideMaterial = null
    // render bokeh composite
    renderer.render(postProcessing.scene, postProcessing.camera)
}

animate()

// BINDINGS
////////////////////////////////////////////////////////////////////////////////
const onResize = () => {
    updateCameraAspectRatio(camera)
    updateRendererSize(renderer)
}

window.addEventListener('resize', onResize)
