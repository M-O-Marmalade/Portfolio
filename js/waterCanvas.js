import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js';

const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
const zAxis = new THREE.Vector3(0, 0, 1);
// let exampleVector = new THREE.Vector3(0,0,1);
// console.log(exampleVector.x + ' : ' + exampleVector.y + ' : ' + exampleVector.z);
// exampleVector.applyAxisAngle(xAxis, 1);
// console.log(exampleVector.x + ' : ' + exampleVector.y + ' : ' + exampleVector.z);

const portrait = screen.height > screen.width;

const waterCanvas = document.createElement("canvas");
waterCanvas.style.position = "fixed";
waterCanvas.style.top = 0;
waterCanvas.style.margin = 0;
waterCanvas.style.width = portrait ? window.innerHeight > window.innerWidth ? screen.width : screen.height : "100vw";
waterCanvas.style.height = portrait ? window.innerHeight > window.innerWidth ? screen.height : screen.width : "100vh";
waterCanvas.style.overflow = "hidden";
waterCanvas.style.zIndex = -10;
// document.body.appendChild(waterCanvas);
document.body.insertBefore(waterCanvas, document.body.firstChild);

const fps = 60;
const msPerFrame = 1000 / fps;
const minMsPerFrame = 1000 / 50;
const damping = 0.984;
const pointerStrength = 0.2;
const pointerSize = 2;
let mouseDown = false;
let pixelDensity = window.devicePixelRatio;
const minPixelDensity = 0.5;
let lastRenderTimes = [
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
];

const totalSegments = portrait ? 27000 : 48000;
let wX;
let wY;
let wAspectFloat;
let wXYgcd;
let aspectScale;
let xSeg;
let ySeg;
let yPoi;
let xPoi;

let prev;
let curr;

calculateWaterSettings();

function calculateWaterSettings(){
    wX = portrait ? window.innerHeight > window.innerWidth ? screen.width : screen.height : window.innerWidth;
    wY = portrait ? window.innerHeight > window.innerWidth ? screen.height : screen.width : window.innerHeight
    wAspectFloat = wX / wY;
    wXYgcd = gcd(wX, wY);
    aspectScale = aspectScaleSolve(wX / wXYgcd, wY / wXYgcd, totalSegments);
    xSeg = Math.floor(wX / wXYgcd * aspectScale);
    ySeg = Math.floor(wY / wXYgcd * aspectScale);
    yPoi = ySeg + 1;
    xPoi = xSeg + 1;
    prev = new Array(xPoi * yPoi).fill(0);
    curr = new Array(xPoi * yPoi).fill(0);
}


//Three.js settings
THREE.Cache.enabled = true;
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();


//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: waterCanvas,
    powerPreference: "high-performance",
    // precision: 'lowp',
    // depth: false,
    // stencil: false
    // antialias: true
});
renderer.setPixelRatio(pixelDensity);
renderer.setSize(wX, wY);


//scene & camera
const scene = new THREE.Scene();
const bgTex = textureLoader.load('graphics/textures/scene-background.png');
// scene.background = new THREE.Color(0x0080ff);
scene.background = bgTex;
scene.environment = bgTex;
// const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 1000);
const camera = new THREE.PerspectiveCamera(26.5, wAspectFloat, 0.5, 1000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2.1;
camera.lookAt(0, 0, 0);


// light
const light = new THREE.DirectionalLight(0xf8f8f8, 1.5);
light.position.set(-2, 2, 10);
scene.add(light);

// materials
const matRefractive = new THREE.MeshPhysicalMaterial({
    side: THREE.FrontSide,
    transmission: 1.0,
    roughness: 0,
    ior: 1.333,
    thickness: 1,
    specularIntensity: 0.1,
    // reflectivity: 1,
});

const matNormalFlat = new THREE.MeshNormalMaterial({
    side: THREE.FrontSide,
    flatShading: true
});

const matNormalSmooth = new THREE.MeshNormalMaterial({
    side: THREE.FrontSide
});

const matVertColor = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.FrontSide
});

const matPhong = new THREE.MeshPhongMaterial({
    color: 0x0060ff,
    specular: 0x0000ff,
    //vertexColors: true,
    side: THREE.FrontSide
});

// water geometry
let waterGeometry = new THREE.BufferGeometry();

//water attributes
let waterIndices;
let waterPositions;
let waterNormals;
let positionsA;
let normalsA;
let waterMesh;
// const waterUVs;
const waterScale = 1;

createWater();
waterMesh = new THREE.Mesh(waterGeometry, matRefractive);
scene.add(waterMesh);


//add torus to scene
const torusGeometry = new THREE.TorusKnotGeometry(10, 2.3, 256, 64);
const torusMesh = new THREE.Mesh(torusGeometry, matNormalSmooth);
torusMesh.position.z = -1;
torusMesh.position.y = -5.5;
torusMesh.scale.x = 0.034;
torusMesh.scale.y = 0.034;
torusMesh.scale.z = 0.034;
scene.add(torusMesh);


//add name plane to scene
// const nameGeometry = new THREE.PlaneGeometry(32, 32);
// const nameTex = textureLoader.load('graphics/textures/texture.png');
// const nameMat = new THREE.MeshBasicMaterial({map: nameTex});
// const nameMesh = new THREE.Mesh( nameGeometry, nameMat );
// nameMesh.position.z = -5;
// nameMesh.position.y = -1;
// if (wAspectFloat < 1) {
//     nameMesh.scale.set(0.2,0.2,0.2);
//     // nameMesh.position.y = .5 * (1 - wAspectFloat);
// }
// scene.add( nameMesh );


//add blender scene
let blenderScene;
gltfLoader.load("graphics/models/james-graham.glb", function (gltf) {
    // gltf.scene.position.z = -1.25;
    if (wAspectFloat < 1) {
        gltf.scene.scale.set(wAspectFloat, wAspectFloat, wAspectFloat);
        // nameMesh.position.y = .5 * (1 - wAspectFloat);
    }
    gltf.scene.traverse((o) => {
        // if (o.name === "Text") {
        //     o.material = matNormalFlat;
        // }
        // if (o.name === "Cloth") {
        //     o.material = matNormalFlat;
        // }
        o.material = matNormalFlat;
    })
    scene.add(gltf.scene);
})


//add document event handlers
document.body.addEventListener('mousemove', onMouseMove);
document.body.addEventListener('touchmove', onTouchMove);
document.body.addEventListener('mousedown', onMouseDown);
document.body.addEventListener('mouseup', onMouseUp);
window.addEventListener("resize", onWindowResize);
document.addEventListener("visibilitychange", onVisibilityChange);

//start the animation
let prevRippleTime = performance.now();
let extraRippleTime = 0.0;
let lastRenderTime = performance.now();
animate();


function createWater(){
    calculateWaterSettings();

    waterIndices = [];
    waterPositions = [];
    waterNormals = [];
    // waterUVs = [];
    
    // generate water positions, normals and UVs for a simple grid geometry
    for (let i = 0; i < yPoi; i++) {
    
        const y = i / ySeg - 0.5;    //set y position from 0 - 1
    
        for (let j = 0; j < xPoi; j++) {
    
            const x = j / xSeg - 0.5;    //set x position from 0 - 1
    
            waterPositions.push(x * waterScale * wAspectFloat, y * waterScale, 0);
            waterNormals.push(0, 0, 1);
            // waterUVs.push(x,y);
        }
    }
    
    // generate water indices (data for element array buffer)
    for (let i = 0; i < ySeg; i++) {
    
        for (let j = 0; j < xSeg; j++) {
    
            const a = i * (xSeg + 1) + (j + 1);
            const b = i * (xSeg + 1) + j;
            const c = (i + 1) * (xSeg + 1) + j;
            const d = (i + 1) * (xSeg + 1) + (j + 1);
    
            // generate two faces (triangles) per iteration
            waterIndices.push(d, b, a); // face one
            waterIndices.push(d, c, b); // face two
        }
    }
    
    //set water mesh data and add to scene
    waterGeometry.setIndex(waterIndices);
    positionsA = new THREE.Float32BufferAttribute(waterPositions, 3);
    normalsA = new THREE.Float32BufferAttribute(waterNormals, 3);
    // const UVsA = new THREE.Float32BufferAttribute(waterUVs,2);
    waterGeometry.setAttribute('position', positionsA);
    waterGeometry.setAttribute('normal', normalsA);
    // waterGeometry.setAttribute( 'uv', UVsA) ;
};

function affectWater(x, y, p) {
    //determine which vertex the cursor is closest to
    const indX = Math.floor((x / wX) * xPoi);
    const indY = Math.floor((1 - y / wY) * yPoi);

    //apply an offset to the selected vertex and its neighboring vertices
    for (let i = -(pointerSize - 1); i < pointerSize; i++) {
        const xtemp = i + indX;
        for (let j = -(pointerSize - 1); j < pointerSize; j++) {
            const ytemp = j + indY;
            if (0 < xtemp && xtemp < xSeg && 0 < ytemp && ytemp < ySeg) {
                const indtemp = xtemp + (ytemp * xPoi);
                prev[indtemp] += p * (pointerSize - (Math.abs(i) + Math.abs(j))) / pointerSize;
            }
        }
    }
}

function onTouchMove(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
    for (let i = 0; i < e.touches.length; i++) {
        affectWater(e.touches[i].clientX, e.touches[i].clientY, pointerStrength);
    }
}

function onMouseMove(e) {
    affectWater(e.clientX, e.clientY, mouseDown ? pointerStrength*2 : pointerStrength);
}

function onMouseDown(e) {
    affectWater(e.clientX, e.clientY, pointerStrength*50);
    mouseDown = true;
}

function onMouseUp(e) {
    mouseDown = false;
}

function rippleAnimate() {
    for (let x = 1; x < xPoi; x++) {
        for (let y = 1; y < yPoi; y++) {
            const index = x + (y * xPoi);
            curr[index] = (prev[index - 1] +
                prev[index + 1] +
                prev[index + xPoi] +
                prev[index - xPoi]) / 2 - curr[index];
            curr[index] = curr[index] * damping;
            curr[index] = isNaN(curr[index]) ? 0 : curr[index];

            let normalVector = new THREE.Vector3(0, 0, 1);

            normalVector.applyAxisAngle(xAxis, curr[index]);
            normalVector.applyAxisAngle(yAxis, curr[index]);
            normalsA.setX(index, normalVector.x);
            normalsA.setY(index, normalVector.y);
            normalsA.setZ(index, normalVector.z);
        }
    }

    for (let i = 0; i < xPoi * yPoi; i++) {
        const temp = prev[i];
        prev[i] = curr[i];
        curr[i] = temp;
    }

    // console.log(normalsA.getX(3 + xPoi * (yPoi-3)) + ' : ' + normalsA.getY(3 + xPoi * (yPoi-3)) + ' : ' + normalsA.getZ(3 + xPoi * (yPoi-3)));
    normalsA.needsUpdate = true;
}

function scrollAnimate() {
    const scrolledPages = window.scrollY / document.body.offsetHeight;
    const offsetAmount = -5.5;
    camera.position.y = scrolledPages * offsetAmount;
    waterMesh.position.y = scrolledPages * offsetAmount;
}

function animate(sysTime) {
    let cumulativeRippleTime = extraRippleTime + sysTime - prevRippleTime;
    
    if (pixelDensity > minPixelDensity) {
        const renderDeltaTime = sysTime - lastRenderTime;
        if (!isNaN(renderDeltaTime)) {
            lastRenderTimes.shift();
            lastRenderTimes.push(renderDeltaTime);
        }

        let sum = 0;
        lastRenderTimes.forEach(item => {
            sum += item;
        });
        const avgFPS = sum / 30;
        // console.log(avgFPS);
    
        if (avgFPS > minMsPerFrame) {
            pixelDensity = Math.max(pixelDensity * 0.98, minPixelDensity);
            renderer.setPixelRatio(pixelDensity);
        }
    }

    if (cumulativeRippleTime >= msPerFrame) {
        prevRippleTime = performance.now();
        while (cumulativeRippleTime >= msPerFrame) {
            cumulativeRippleTime -= msPerFrame;
            rippleAnimate();
        }
        extraRippleTime = cumulativeRippleTime;

        scrollAnimate();
        torusMesh.rotation.x += 0.003;
		torusMesh.rotation.y += 0.003;
    }
    
    renderer.render(scene, camera);
    lastRenderTime = performance.now();
    requestAnimationFrame(animate)
}

function onVisibilityChange(e) {
    if (document.visibilityState === 'visible') {
      prevRippleTime = performance.now();
      lastRenderTime = performance.now();
    }
}

function onWindowResize() {
    if (!portrait) {
        createWater();
        camera.aspect = wAspectFloat;
        camera.updateProjectionMatrix();
        waterGeometry.setIndex(waterIndices);
        positionsA.needsUpdate = true;
        normalsA.needsUpdate = true;
    }
    renderer.setSize(wX, wY);
}

function gcd(a, b) {
    return (b == 0) ? a : gcd(b, a % b);
}

function aspectScaleSolve(a, b, c) {
    const tempA = a;
    a = tempA * b * 2;
    b = tempA + b;
    c = -c;
    return (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
}
