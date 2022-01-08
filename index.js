import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

let size = {
    width: window.innerWidth,
    height: window.innerHeight
}

let playgroundLength = 20;
let playgroundBreadth = 110;
let playerTargetX = 0
let playerJump = false
let bounceValue = 0.1
let gravity = 0.005
let sleighModel;
let trunkBoxes = []
let startCheckingCollision = false;
let score = 0

let canvas = document.querySelector("canvas")

// scene

let scene = new THREE.Scene()
scene.background = new THREE.Color("#050F26")

// objects

// addingmountains

let makeBgMountains = () => {
    let mountainGeometry = new THREE.IcosahedronGeometry(70, 0);
    let mountainMaterial = new THREE.MeshStandardMaterial({
      color: "grey",
      flatShading: true,
    });
  
    let mountain1 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain1.position.z = -100;
  
    mountain1.position.y = -40;
    mountain1.position.x = -100;
    let mountain2 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain2.position.z = -120;
  
    mountain2.position.y = 0;
    mountain2.position.x = 0;
  
    let mountain3 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain3.position.z = -100;
  
    mountain3.position.y = -20;
    mountain3.position.x = 100;
  
    mountain1.rotation.x = Math.random() * Math.PI;
    mountain2.rotation.y = Math.random() * Math.PI;
    mountain3.rotation.z = Math.random() * Math.PI;
  
    let mountains = new THREE.Group();
    mountains.add(mountain1, mountain2, mountain3);
    return mountains;
  };

let mountain = makeBgMountains()
scene.add(mountain)


// clouds

let makeClouds = () => {
    let clouds = new THREE.Group();
    let cloudPositions = [
      { x: -15, y: 10, z: 0 },
      { x: -15, y: 10, z: 15 },
      { x: 5, y: 8, z: 40 },
      { x: 15, y: 10, z: 0 },
    ];
    let cubeMaterial = new THREE.MeshBasicMaterial({ color: "white" });
    let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    for (let i = 0; i < 4; i++) {
      let cloud = new THREE.Group();
      for (let j = 0; j < 8; j++) {
        let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.rotation.x = (Math.random() * Math.PI) / 2;
        cubeMesh.rotation.y = (Math.random() * Math.PI) / 2;
        cubeMesh.rotation.z = (Math.random() * Math.PI) / 2;
        cubeMesh.position.x = j - Math.random() * 0.1;
        let scaleRandom = Math.random();
        cubeMesh.scale.set(scaleRandom, scaleRandom, scaleRandom);
        cloud.add(cubeMesh);
      }
      cloud.position.set(
        cloudPositions[i].x,
        cloudPositions[i].y,
        cloudPositions[i].z
      );
      clouds.add(cloud);
    }
  
    return clouds;
  };

// moon

let makeMoon = () => {
    let moon = new THREE.Mesh(
      new THREE.SphereGeometry(2, 30, 30),
      new THREE.MeshStandardMaterial({ color: "white", flatShading: true })
    );
  
    moon.position.x = -23;
    moon.position.y = 17;
    moon.position.z = 0;
    return moon;
  };
  
  let moon = makeMoon();
  scene.add(moon);

// particles

let makeParticles = () => {
  
    let bgParticlesGeometry = new THREE.BufferGeometry();
    let count = 1500;
  
    let positions = new Float32Array(count * 3);
  
    for (let i = 0; i < count * 3; i++) {
      if (i % 3 == 0) {
        // x
        positions[i] = (Math.random() - 0.5) * 50;
      }
      if (i % 3 == 1) {
        // y
        positions[i] = (Math.random() - 0.5) * 50;
      }
      if (i % 3 == 2) {
        // z
        positions[i] = (Math.random() - 0.5) * 50;
      }
    }
  
    bgParticlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
  
    let bgParticlesMaterial = new THREE.PointsMaterial();
    bgParticlesMaterial.size = 0.05;
    bgParticlesMaterial.sizeAttenuation = true;
    bgParticlesMaterial.transparent = true;
    bgParticlesMaterial.depthWrite = false;
    bgParticlesMaterial.color = new THREE.Color("white");
  
    let bgParticles = new THREE.Points(bgParticlesGeometry, bgParticlesMaterial);
  
    return bgParticles;
  };

let particles = makeParticles()
particles.position.z = 51;
scene.add(particles)

// snow

let makeSnow = () => {
    let geometry = new THREE.PlaneGeometry(120, 120, 30, 30)
    let material = new THREE.MeshStandardMaterial({ color: 0xeeeeee, flatShading: true })

    let snow = new THREE.Mesh(geometry, material)
    snow.rotation.x = -Math.PI / 2
    snow.position.y = -1
    let array = snow.geometry.attributes.position.array;
    for (let i = 2; i < array.length; i += 3) {
        array[i] = Math.random() / 2
    }
    // console.log(array)
    return snow;
}

// trunk box

let makeTrunkBox = (trunk) => {
    let box = new THREE.Box3()
    let boxHelper = new THREE.Box3Helper(box, 0xff0000)

    trunk.geometry.computeBoundingBox()

    box.copy(trunk.geometry.boundingBox).applyMatrix4(trunk.matrixWorld)

    trunkBoxes.push(box)
    scene.add(boxHelper)
}


// make one tree

let makeOneTree = () => {
    let tree = new THREE.Group()
    let r = 1;
    let colors = ["#008000", "#228B22", "#006400"]
    for (let i = 0; i < 3; i++) {
        let color = colors[i]
        let leavesGeometry = new THREE.ConeGeometry(r, 1, 32)
        let leavesMaterial = new THREE.MeshStandardMaterial({ color: color })

        let leave = new THREE.Mesh(leavesGeometry, leavesMaterial)
        leave.position.y = i * 0.5
        tree.add(leave)
        r = r - 0.25
    }
    let trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 10)
    let trunkMaterial = new THREE.MeshStandardMaterial({ color: "#3A271A" })

    let trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = -0.5
    tree.add(trunk)

    makeTrunkBox(trunk)

    return tree;
}

let makeTrees = (treeNum) => {
    let trees = new THREE.Group()

    for (let i = 0; i < treeNum; i++) {
        let tree = makeOneTree()
        tree.position.set((playgroundLength * Math.random()) / 2 * (i % 2 == 0 ? -1 : 1),
            0,
            (playgroundBreadth * Math.random()) / 2 * (Math.floor(Math.random() * 10) % 2 == 0 ? 1 : -1)
        )
        tree.rotation.x = Math.random() / 3 * (i % 2 == 0 ? -1 : 1)
        trees.add(tree)
    }

    return trees
}


// making player

let makePlayer = () => {
    let playerGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.7)
    let playerMaterial = new THREE.MeshStandardMaterial({ color: "red", transparent: true, opacity: 0 })

    let player = new THREE.Mesh(playerGeometry, playerMaterial)
    player.position.y = -0.5
    player.position.z = 48

    let loader = new GLTFLoader()
    loader.load("./assets/scene.gltf", (gltf) => {
        gltf.scene.scale.x = 0.2
        gltf.scene.scale.y = 0.2
        gltf.scene.scale.z = 0.2
        sleighModel = gltf.scene;
    })

    return player
}

let player = makePlayer()
scene.add(player)

// control player

let handleKeyDown = (keyDown) => {
    if (keyDown.keyCode === 37) {
        // left
        console.log("move left")
        if (playerTargetX > -1) {
            playerTargetX -= 1
        }
    } else if (keyDown.keyCode === 39) {
        //right
        console.log("move right")
        if (playerTargetX < 1) {
            playerTargetX += 1;
        }
    } else {
        if (keyDown.keyCode === 38) {
            // up
            if (player.position.y > -0.5) return
            console.log("jump")
            playerJump = true
            bounceValue = 0.1
        }
    }
}

let handlePlayer = () => {
    if (playerTargetX > player.position.x + 0.02) {
        player.position.x += 0.02
    } else if (playerTargetX < player.position.x - 0.02) {
        player.position.x -= 0.02
    }
    if (playerJump === true) {
        if (player.position.y < -0.5) {
            player.position.y = -0.5
            playerJump = false
        } else {
            player.position.y += bounceValue
            bounceValue -= gravity
        }
    }
}

document.onkeydown = handleKeyDown


// playground

let playground1 = new THREE.Group()

let snow1 = makeSnow()
let trees1 = makeTrees(15)
let cloud1 = makeClouds()

playground1.add(trees1)
playground1.add(snow1)
playground1.add(cloud1)

scene.add(playground1)

let playground2 = new THREE.Group()

let snow2 = makeSnow()
let trees2 = makeTrees(15)
let cloud2 = makeClouds()

playground2.add(trees2)
playground2.add(snow2)
playground2.add(cloud2)
playground2.position.z = -120

scene.add(playground2)

let playground3 = new THREE.Group()

let snow3 = makeSnow()
let trees3 = makeTrees(15)
let cloud3 = makeClouds()

playground3.add(trees3)
playground3.add(snow3)
playground3.add(cloud3)

playground3.position.z = -240

scene.add(playground3)

// regenarete ground

let regenareteGround = () => {
    if (playground1.position.z > 120) {
        playground1.position.z = -200;
        randomizeTree(playground1)
    } else if (playground2.position.z > 120) {
        playground2.position.z = -200
        randomizeTree(playground2)
    } else if (playground3.position.z > 120) {
        playground3.position.z = -200
        randomizeTree(playground3)
    }
}

// randomized tree

let randomizeTree = (playground) => {
    let array = playground.children[0].children
    // console.log(array)
    for (let i = 0; i < array.length; i++) {

        let tree = array[i]
        tree.position.set((playgroundLength * Math.random()) / 2 * (i % 2 == 0 ? -1 : 1),
            0,
            (playgroundBreadth * Math.random()) / 2 * (Math.floor(Math.random() * 10) % 2 == 0 ? 1 : -1)
        )
        tree.rotation.x = Math.random() / 3 * (i % 2 == 0 ? -1 : 1)
    }
}

// adding box

let playerBox = new THREE.Box3()
let playerBoxHelper = new THREE.Box3Helper(playerBox, 0xff0000)

player.geometry.computeBoundingBox()

playerBox.copy(player.geometry.boundingBox).applyMatrix4(player.matrixWorld)

scene.add(playerBoxHelper)

// update box for player tree

let updateBox = () => {
    playerBox.copy(player.geometry.boundingBox).applyMatrix4(player.matrixWorld)

    for (let i = 0; i < trunkBoxes.length; i++) {
        if (i < 15) {
            trunkBoxes[i].copy(trees1.children[i].children[3].geometry.boundingBox)
                .applyMatrix4(trees1.children[i].children[3].matrixWorld)
        } else if (i < 30) {
            trunkBoxes[i].copy(trees2.children[i - 15].children[3].geometry.boundingBox)
                .applyMatrix4(trees2.children[i - 15].children[3].matrixWorld)
        } else {
            trunkBoxes[i].copy(trees3.children[i - 30].children[3].geometry.boundingBox)
                .applyMatrix4(trees3.children[i - 30].children[3].matrixWorld)
        }
    }

}

// collision detection

let collisionDetection = () => {
    for (let i = 0; i < trunkBoxes.length; i++) {
        if (playerBox.intersectsBox(trunkBoxes[i])) {
            console.log("COLLISION!!!")

            alert("GAME OVER! Score: " + Math.ceil(score))
            reset()
        }
    }
}

let reset = () => {
    startCheckingCollision = false;
    currScore = 0;
    playerTargetX = 0;
    playerJump = false;
    bounceValue = 0.1;
    player.position.z = 48;
    player.position.x = 0;
    player.position.y = -0.5;
    playGround1.position.z = 0;
    playGround2.position.z = -120;
    playGround3.position.z = -240;
}

setTimeout(() => {
    startCheckingCollision = true
}, 2000)

// camera

let camera = new THREE.PerspectiveCamera(55, size.width / size.height, 0.1, 500)
camera.position.z = 50
camera.position.y = 0.2
scene.add(camera)

// light 

let light = new THREE.AmbientLight(0xdddddd, 0.3)
scene.add(light)


let pointLight = new THREE.PointLight("white", 1)
pointLight.position.z = 50
scene.add(pointLight)

let pointLight2 = new THREE.PointLight("white", 1)
pointLight2.position.z = 50
pointLight2.position.y = -0.5
scene.add(pointLight2)

// renderer

let renderer = new THREE.WebGLRenderer({
    canvas
})
renderer.setSize(size.width, size.height)

// const controls = new OrbitControls(camera, renderer.domElement)
let clock = new THREE.Clock()
let prevTime = 0;

let animate = () => {

    let elapsedTime = clock.getElapsedTime()
    let deltaTime = elapsedTime - prevTime;
    prevTime = elapsedTime;
    // controls.update()

    if (sleighModel) {
        sleighModel.rotation.y = -Math.PI / 2
        sleighModel.position.x = player.position.x
        sleighModel.position.y = player.position.y - 0.1
        sleighModel.position.z = player.position.z
        sleighModel.rotation.x = Math.sin(prevTime) / 5
        scene.add(sleighModel)
    }

    handlePlayer()

    // collision detection

    if (startCheckingCollision) {
        score += deltaTime
        collisionDetection()
    }

    // playground movement
    regenareteGround()
    updateBox()
    particles.rotation.x -= 0.005;
    playground1.position.z += deltaTime * 20
    playground2.position.z += deltaTime * 20
    playground3.position.z += deltaTime * 20

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()