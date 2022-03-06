AFRAME.registerComponent('texture', {
  init: function () {
    var textureLoader = new THREE.TextureLoader();
    var newTexture = textureLoader.load("./textures/Rocks008_1K_Color.jpg");
    var renderer = this.el.sceneEl.renderer;
    newTexture.flipY = false;
    
    this.el.addEventListener("model-loaded", e => {
      let mesh = this.el.getObject3D("mesh");
      if (!mesh) {
        return;
      }
      
      var texture = new THREE.TextureLoader().load(
        "https://cdn.glitch.global/dd67623d-ee31-4413-9c35-f03976a4f118/waves.jpg?v=1645242142815",
        function() {
        mesh.traverse( child => {
          if (!child.isMesh) {
            return;
          }
          
          if (child.material){
            child.material.map = newTexture;
          }
          child.material.needsUpdate = true;
        });
          renderer.outputEncoding = THREE.sRGBEncoding;
          
        });
    });
  }
});


