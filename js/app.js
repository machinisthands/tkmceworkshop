//Variables for setup

let container;
let camera;
let renderer;
let scene;
let work;
let slideIndex = 0;
let timer;

    // Initial auto-play of slides
    autoPlaySlides();

    function autoPlaySlides() {
        displaySlide();
        timer = setTimeout(autoPlaySlides, 3000); // Change slide every 3 seconds
    }

    // Function to display the current slide based on slideIndex
    function displaySlide() {
        const slides = document.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");

        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        // Increment slideIndex and loop back if necessary
        slideIndex++;
        if (slideIndex > slides.length) { slideIndex = 1; }

        // Display current slide and update dot
        slides[slideIndex - 1].style.display = "block";
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        dots[slideIndex - 1].className += " active";
    }

    // Function to jump to a specific slide
    function currentSlide(n) {
        clearTimeout(timer);  // Clear auto-play timer
        slideIndex = n - 1;   // Set slideIndex to target slide
        displaySlide();
        timer = setTimeout(autoPlaySlides, 3000); // Reset auto-play
    }

function init() {
  container = document.querySelector(".scene");

 

  //Create scene
  scene = new THREE.Scene();

  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 1000;

  //Camera setup
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 275);

  const ambient = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(20, 20, 50);
  scene.add(light);

  //Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  //Load Model
  let loader = new THREE.GLTFLoader();
  loader.load("3D Model.gltf", function(gltf) {
    scene.add(gltf.scene);
    work = gltf.scene.children[0];
    animate();
  });
}

function animate() {
  requestAnimationFrame(animate);
  work.rotation.z += 0.003;
  work.rotation.x += 0.003;
  work.rotation.y += 0.003;

  renderer.render(scene, camera);
}

init();

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);
