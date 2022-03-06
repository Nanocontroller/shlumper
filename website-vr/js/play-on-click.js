AFRAME.registerComponent('play-on-click', {
  init: function () {
    this.onClick = this.onClick.bind(this);
  },
  play: function () {
    window.addEventListener('click', this.onClick);
  },
  pause: function () {
    window.removeEventListener('click', this.onClick);
  },
  onClick: function (evt) {
    var videoEl = this.el.components.material.material.map.image;
    if (!videoEl) { return; }
    //videoEl.paused ? videoEl.play() : videoEl.pause();
    this.el.object3D.visible = true;
    videoEl.play();
  }
});