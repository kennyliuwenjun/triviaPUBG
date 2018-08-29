class threeDview {
  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45, // FoV
      window.innerWidth / window.innerHeight, // Ratio
      0.1, // near
      1000 // far
    );

    this.tick = this.tick.bind(this);

    // add some lights to the scene
    this.scene.add(this.createLight(1, 10));
    this.scene.add(this.createLight(0.5, -10));

    // x: -59.4890804496197, y: 91.05971534730678, z: -63.95753916107502
    this.camera.position.set(-60, 90, -60);
    this.camera.lookAt(0,0,0);

    // noise.seed(Math.random());
    this.chunkSize = 5;
    this.heightMutiplier = 100;
    this.widthMutiplier = 50;
    this.cubes = {};

    this.blockSize = 5;

    // Initialise when the document is ready
    document.addEventListener("DOMContentLoaded", this.init.bind(this));
  }

  init() {
    this.renderer.setSize($('#three-d-view').width(),$('#three-d-view').height());
    this.renderer.setClearColor('#000');
    document.getElementById("three-d-view").appendChild(this.renderer.domElement);


    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    // begin processing

    // this.generateChunk();

    this.tick();
  }

  generateChunk(){
    let h = 0
    for(let x = -5; x< this.chunkSize; x++){
      for(let z =-5; z<this.chunkSize; z++){
        const xFreq = x / this.widthMutiplier;
        const zFreq = z / this.widthMutiplier;
        const height = h * 3
        this.cubes.push({
          coord : `${x},${z}`,
          cube : this.generateCube(this.blockSize * x,this.blockSize * z*1.3, height),
          playerId : ""
        })
      }
      h++;
    }
  }

  generateCube(x=0,z=0,height=0){
    this.material = new THREE.MeshLambertMaterial({color:'white'});
    this.geometry = new THREE.BoxGeometry(this.blockSize ,this.blockSize ,this.blockSize );
    const cube = new THREE.Mesh(this.geometry, this.material);
    cube.position.set(x,height,z)

    this.scene.add(cube);

    return cube;
  }

  createLight(strength, direction) {
    const light = new THREE.DirectionalLight(0xffffff, strength);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    light.position.set(direction,10,direction);
    return light
  }
  updateStatus(users){
    console.log(users)
    for (let cube in this.cubes){
      this.scene.remove(this.cubes[cube]);
    }
    for (let index in users){
      this.cubes[users[index].id] = this.generateCube(this.blockSize * index*1.3);
      this.cubes[users[index].id].material.color.set([0,1].includes(users[index].ready) ? 'green':'red');
    }
  }

  tick() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.tick);
  }
}
