(function () {

    "use strict";

    /* =====================================================
       LATHE BISHOP - THREE.JS 3D VIEWER
       Three.js r112
    ===================================================== */

    let scene = null;
    let camera = null;
    let renderer = null;
    let model = null;
    let modelContainer = null;

    let isDragging = false;

    let previousMouseX = 0;
    let previousMouseY = 0;

    let rotationX = 0;
    let rotationY = 0;

    let originalScale = 1;

    let touchStartX = 0;
    let touchStartY = 0;

    const MODEL_PATH = "./model/latheBishop.gltf";


    /* =====================================================
       DEGREE TO RADIAN
    ===================================================== */

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init() {

        console.log("======================================");
        console.log("LATHE BISHOP 3D VIEWER");
        console.log("======================================");

        if (typeof THREE === "undefined") {

            console.error("Three.js was not loaded.");

            showError(
                "Three.js library could not be loaded."
            );

            return;
        }


        console.log(
            "Three.js version:",
            THREE.REVISION
        );


        /* =================================================
           FIND CONTAINER
        ================================================= */

        modelContainer =
            document.querySelector(".scene");


        if (!modelContainer) {

            console.error(
                "3D model container (.scene) not found."
            );

            return;
        }


        modelContainer.innerHTML = "";


        /* =================================================
           CONTAINER SIZE
        ================================================= */

        let width =
            modelContainer.clientWidth || 900;

        let height =
            modelContainer.clientHeight || 500;


        /* =================================================
           SCENE
        ================================================= */

        scene =
            new THREE.Scene();


        scene.background =
            new THREE.Color(0x151515);


        /* =================================================
           CAMERA
        ================================================= */

        camera =
            new THREE.PerspectiveCamera(
                35,
                width / height,
                0.01,
                1000
            );


        camera.position.set(
            0,
            0,
            10
        );


        /* =================================================
           LIGHTS
        ================================================= */

        const ambientLight =
            new THREE.AmbientLight(
                0xffffff,
                1.8
            );

        scene.add(
            ambientLight
        );


        const mainLight =
            new THREE.DirectionalLight(
                0xffffff,
                2.5
            );

        mainLight.position.set(
            50,
            50,
            100
        );

        scene.add(
            mainLight
        );


        const fillLight =
            new THREE.DirectionalLight(
                0xffffff,
                1.2
            );

        fillLight.position.set(
            -50,
            20,
            50
        );

        scene.add(
            fillLight
        );


        const backLight =
            new THREE.DirectionalLight(
                0xffffff,
                1
            );

        backLight.position.set(
            0,
            -50,
            -50
        );

        scene.add(
            backLight
        );


        /* =================================================
           RENDERER
        ================================================= */

        renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );


        renderer.setSize(
            width,
            height
        );


        if (
            typeof THREE.sRGBEncoding !==
            "undefined"
        ) {

            renderer.outputEncoding =
                THREE.sRGBEncoding;

        }


        renderer.shadowMap.enabled = true;


        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        modelContainer.appendChild(
            renderer.domElement
        );


        /* =================================================
           CHECK GLTF LOADER
        ================================================= */

        if (
            typeof THREE.GLTFLoader ===
            "undefined"
        ) {

            console.error(
                "GLTFLoader.js was not loaded."
            );

            showError(
                "GLTFLoader.js could not be loaded."
            );

            return;
        }


        /* =================================================
           LOAD MODEL
        ================================================= */

        const loader =
            new THREE.GLTFLoader();


        updateStatus(
            "Loading 3D model..."
        );


        console.log(
            "Loading model:",
            MODEL_PATH
        );


        loader.load(

            MODEL_PATH,

            function (gltf) {

                console.log(
                    "3D model loaded successfully."
                );


                model =
                    gltf.scene;


                if (!model) {

                    showError(
                        "The GLTF file contains no valid scene."
                    );

                    return;
                }


                scene.add(
                    model
                );


                prepareModel(
                    model
                );


                fitModel(
                    model
                );


                updateStatus(
                    "3D model loaded successfully"
                );


                console.log(
                    "Model fitted successfully."
                );


                renderer.render(
                    scene,
                    camera
                );

            },


            function (xhr) {

                if (
                    xhr &&
                    xhr.total > 0
                ) {

                    const percent =
                        Math.round(
                            (
                                xhr.loaded /
                                xhr.total
                            ) * 100
                        );


                    updateStatus(
                        "Loading 3D model... " +
                        percent +
                        "%"
                    );

                }

            },


            function (error) {

                console.error(
                    "3D MODEL LOAD ERROR:",
                    error
                );


                showError(
                    "Unable to load the 3D model."
                );

            }

        );


        /* =================================================
           CONTROLS
        ================================================= */

        setupMouseControls();

        setupTouchControls();

        setupWheelZoom();

        setupResetButton();


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            onWindowResize
        );


        /* =================================================
           ANIMATION
        ================================================= */

        animate();

    }


    /* =====================================================
       PREPARE MODEL
       ORANGE COLOUR
    ===================================================== */

    function prepareModel(object) {

        object.traverse(
            function (child) {

                if (child.isMesh) {

                    child.castShadow = true;

                    child.receiveShadow = true;


                    if (child.material) {

                        /*
                         * ORANGE MODEL COLOUR
                         * #FF6600
                         */

                        if (Array.isArray(child.material)) {

                            child.material.forEach(
                                function (material) {

                                    material.color.set(
                                        0xff6600
                                    );

                                    material.needsUpdate =
                                        true;

                                }
                            );

                        } else {

                            child.material.color.set(
                                0xff6600
                            );

                            child.material.needsUpdate =
                                true;

                        }

                    }

                }

            }
        );

    }


    /* =====================================================
       FIT MODEL
    ===================================================== */

    function fitModel(object) {

        console.log(
            "Fitting 3D model..."
        );


        object.position.set(
            0,
            0,
            0
        );


        object.rotation.set(
            0,
            0,
            0
        );


        object.scale.set(
            1,
            1,
            1
        );


        /* =================================================
           ORIGINAL BOUNDING BOX
        ================================================= */

        let box =
            new THREE.Box3()
                .setFromObject(
                    object
                );


        let size =
            box.getSize(
                new THREE.Vector3()
            );


        let center =
            box.getCenter(
                new THREE.Vector3()
            );


        console.log(
            "Model size:",
            size
        );


        console.log(
            "Model center:",
            center
        );


        const maxDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            );


        if (
            !isFinite(maxDimension) ||
            maxDimension <= 0
        ) {

            showError(
                "Invalid 3D model dimensions."
            );

            return;
        }


        /* =================================================
           CENTER
        ================================================= */

        object.position.x =
            -center.x;


        object.position.y =
            -center.y;


        object.position.z =
            -center.z;


        /* =================================================
           MODEL SIZE
        ================================================= */

        const desiredSize = 7;


        originalScale =
            desiredSize /
            maxDimension;


        object.scale.set(
            originalScale,
            originalScale,
            originalScale
        );


        /* =================================================
           INITIAL ROTATION
        ================================================= */

        rotationX = 0;

        rotationY =
            degToRad(25);


        object.rotation.x =
            rotationX;


        object.rotation.y =
            rotationY;


        /* =================================================
           SCALED BOUNDING BOX
        ================================================= */

        box =
            new THREE.Box3()
                .setFromObject(
                    object
                );


        size =
            box.getSize(
                new THREE.Vector3()
            );


        const scaledMax =
            Math.max(
                size.x,
                size.y,
                size.z
            );


        console.log(
            "Scaled model size:",
            size
        );


        /* =================================================
           CAMERA
        ================================================= */

        const fovRadians =
            degToRad(
                camera.fov
            );


        const distance =
            (
                scaledMax / 2
            ) /
            Math.tan(
                fovRadians / 2
            );


        camera.position.set(
            0,
            0,
            distance * 1.55
        );


        camera.near =
            Math.max(
                0.01,
                distance / 100
            );


        camera.far =
            Math.max(
                1000,
                distance * 100
            );


        camera.updateProjectionMatrix();


        camera.lookAt(
            0,
            0,
            0
        );


        console.log(
            "Camera distance:",
            distance * 1.55
        );

    }


    /* =====================================================
       ANIMATION
    ===================================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );


        if (model) {

            model.rotation.x =
                rotationX;


            model.rotation.y =
                rotationY;

        }


        if (
            renderer &&
            scene &&
            camera
        ) {

            renderer.render(
                scene,
                camera
            );

        }

    }


    /* =====================================================
       RESIZE
    ===================================================== */

    function onWindowResize() {

        if (
            !modelContainer ||
            !camera ||
            !renderer
        ) {

            return;
        }


        const width =
            modelContainer.clientWidth;


        const height =
            modelContainer.clientHeight;


        if (
            width <= 0 ||
            height <= 0
        ) {

            return;
        }


        camera.aspect =
            width / height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height
        );

    }


    /* =====================================================
       MOUSE ROTATION
    ===================================================== */

    function setupMouseControls() {

        modelContainer.addEventListener(
            "mousedown",
            function (event) {

                if (!model) {
                    return;
                }


                isDragging = true;


                previousMouseX =
                    event.clientX;


                previousMouseY =
                    event.clientY;


                modelContainer.style.cursor =
                    "grabbing";

            }
        );


        window.addEventListener(
            "mouseup",
            function () {

                isDragging = false;


                if (modelContainer) {

                    modelContainer.style.cursor =
                        "grab";

                }

            }
        );


        window.addEventListener(
            "mousemove",
            function (event) {

                if (
                    !isDragging ||
                    !model
                ) {

                    return;
                }


                const deltaX =
                    event.clientX -
                    previousMouseX;


                const deltaY =
                    event.clientY -
                    previousMouseY;


                rotationY +=
                    deltaX * 0.01;


                rotationX +=
                    deltaY * 0.01;


                const limit =
                    degToRad(85);


                rotationX =
                    Math.max(
                        -limit,
                        Math.min(
                            limit,
                            rotationX
                        )
                    );


                previousMouseX =
                    event.clientX;


                previousMouseY =
                    event.clientY;

            }
        );


        modelContainer.style.cursor =
            "grab";

    }


    /* =====================================================
       TOUCH ROTATION
    ===================================================== */

    function setupTouchControls() {

        modelContainer.addEventListener(
            "touchstart",
            function (event) {

                if (
                    event.touches.length !== 1
                ) {

                    return;
                }


                touchStartX =
                    event.touches[0].clientX;


                touchStartY =
                    event.touches[0].clientY;

            },
            {
                passive: true
            }
        );


        modelContainer.addEventListener(
            "touchmove",
            function (event) {

                if (
                    event.touches.length !== 1 ||
                    !model
                ) {

                    return;
                }


                const currentX =
                    event.touches[0].clientX;


                const currentY =
                    event.touches[0].clientY;


                const deltaX =
                    currentX -
                    touchStartX;


                const deltaY =
                    currentY -
                    touchStartY;


                rotationY +=
                    deltaX * 0.01;


                rotationX +=
                    deltaY * 0.01;


                const limit =
                    degToRad(85);


                rotationX =
                    Math.max(
                        -limit,
                        Math.min(
                            limit,
                            rotationX
                        )
                    );


                touchStartX =
                    currentX;


                touchStartY =
                    currentY;

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       WHEEL ZOOM
    ===================================================== */

    function setupWheelZoom() {

        modelContainer.addEventListener(
            "wheel",
            function (event) {

                if (!model) {
                    return;
                }


                event.preventDefault();


                const factor =
                    event.deltaY > 0
                        ? 0.90
                        : 1.10;


                let newScale =
                    model.scale.x *
                    factor;


                const minScale =
                    originalScale * 0.50;


                const maxScale =
                    originalScale * 2.50;


                newScale =
                    Math.max(
                        minScale,
                        Math.min(
                            maxScale,
                            newScale
                        )
                    );


                model.scale.set(
                    newScale,
                    newScale,
                    newScale
                );

            },
            {
                passive: false
            }
        );

    }


    /* =====================================================
       RESET VIEW
    ===================================================== */

    function setupResetButton() {

        const button =
            document.getElementById(
                "reset-model"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                if (!model) {
                    return;
                }


                fitModel(
                    model
                );

            }
        );

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function updateStatus(text) {

        const status =
            document.getElementById(
                "model-status"
            );


        if (status) {

            status.textContent =
                text;

        }

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError(message) {

        updateStatus(
            "3D model could not be loaded"
        );


        if (!modelContainer) {
            return;
        }


        modelContainer.innerHTML = `

            <div
                style="
                    width:100%;
                    height:100%;
                    min-height:400px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    padding:30px;
                    color:white;
                    background:#151515;
                    border-radius:8px;
                "
            >

                <div>

                    <h3>
                        3D Model Unavailable
                    </h3>

                    <p>
                        ${message}
                    </p>

                    <p
                        style="
                            font-family:monospace;
                            font-size:13px;
                            opacity:.7;
                        "
                    >
                        ${MODEL_PATH}
                    </p>

                </div>

            </div>

        `;

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();