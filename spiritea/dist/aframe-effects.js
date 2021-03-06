/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	if (!window.AFRAME) {
    var Component = function (el, id) {
        var self = this;
        this.el = el;
        this.el;
        this.id = id;
        this.attrName = this.name + (id ? '__' + id : '');
        this.el.components[this.attrName] = this;
        this.data = {};
    };

    var System = function (el) {
        var self = this;
        this.el = this.sceneEl = el;
        this.el.systems[this.name] = this;
    };

    AFRAME = {
        components: {},
        systems: {},
        registerShader: function () {}
    };

    AFRAME.registerComponent = function (name, definition) {
        var NewComponent;
        var proto = {};

        Object.keys(definition).forEach(function (key) {
            proto[key] = {
                value: definition[key],
                writable: true
            };
        });

        NewComponent = function (el, attr, id) {
            Component.call(this, el, attr, id);
        };

        NewComponent.prototype = Object.create(Component.prototype, proto);
        NewComponent.prototype.name = name;
        NewComponent.prototype.constructor = NewComponent;

        AFRAME.components[name] = NewComponent;
        return NewComponent;              
    };

    AFRAME.registerSystem = function (name, definition) {
        var NewSystem;
        var proto = {};

        Object.keys(definition).forEach(function (key) {
            proto[key] = {
                value: definition[key],
                writable: true
            };
        });

        NewSystem = function (el, attr, id) {
            System.call(this, el, attr, id);
        };

        NewSystem.prototype = Object.create(System.prototype, proto);
        NewSystem.prototype.name = name;
        NewSystem.prototype.constructor = NewSystem;

        AFRAME.systems[name] = NewSystem;
        return NewSystem;              
    };

    var fx = function(renderer, scene, cameras) {
        this.sceneEl = this;
        this.renderTarget = null;
        this.renderer = renderer;
        this.object3D = scene;
        this.cameras = Array.isArray(cameras) ? cameras : [cameras];
        this.components = {};
        this.systems = {};
        this.isPlaying = true;
        this.systems.effects = new AFRAME.systems.effects(this)
        this.systems.effects.init();
    };

    fx.prototype = Object.create({}, {
        chain: {
            value: function(chain) {
                var sys = this.systems.effects, self = this;
                var oldData = sys.data;
                sys.data = chain;
                sys.update(oldData);
                sys.tick(0,0);
            }
        },

        camera: {
            set: function(cameras) {
                this.cameras = Array.isArray(cameras) ? cameras : [cameras];
            },
            
            get: function () {
                return this.cameras[0];
            }
        },

        scene: {
            set: function(v) {
                this.object3D = v;
            },
            
            get: function () {
                return this.object3D;
            }
        },

        init: {
            value: function(name) {
                this.remove(name);
                var arr = name.split("__");
                var pro = AFRAME.components[arr[0]];
                if(!pro) return null;
                var obj = new pro(this, arr[1]);
                if(obj.schema.type || obj.schema.default) {
                    obj.data = obj.schema.default;
                } else {
                    for(var i in obj.schema) {
                        obj.data[i] = obj.schema[i].default;
                    }
                }
                if(obj.init) obj.init();
                if(obj.update) obj.update({});
                return obj;
            }
        },

        update: {
            value: function(name, data) {
                var obj = this.components[name];
                if(!obj) { obj = this.init(name); }
                if(!obj || data === undefined) return;
                
                var oldData = obj.data, nd = obj.data, schema = obj.schema;
                if (obj.schema.type || obj.schema.default) {
                    obj.data = data;
                } else {
                    oldData = {};
                    for(var o in nd) {
                        oldData[o] = nd[o];
                        if (data[o]) nd[o] = data[o]; 
                    }
                }
                if(obj.update) obj.update(oldData);
            }
        },

        remove: {
            value: function(name) {
                var obj = this.components[name];
                if(obj && obj.remove) { obj.remove(); }
                delete this.components[name];
            }
        },

        render: { 
            value: function(time) {
                var behaviors = this.components;
                var sys = this.systems.effects;

                var timeDelta = this.time ? time - this.time : 0;
                this.time = time;

                for(var b in behaviors) {
                    var behavior = behaviors[b];
                    if (behavior.tick) behavior.tick(time, timeDelta);
                }

                sys.tick(time, timeDelta);
                sys.cameras = this.cameras;

                for(var b in behaviors) {
                    var behavior = behaviors[b];
                    if (behavior.tock) behavior.tock(time, timeDelta);
                }

                sys.tock(time, timeDelta);
            }
        }
    });

    window.AFRAME.Effects = fx;
}

__webpack_require__(1)
__webpack_require__(3)
__webpack_require__(17)


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Copyright 2017-2018 Yannis Gravezas <wizgrav@gmail.com> MIT licensed

AFRAME.registerSystem("effects", {
    schema: { type: "array", default: [] },

    init: function () {
        this.effects = {};
        this.passes = [];
        this._passes = [];
        this.cameras = [];
        this.setupPostState();
        this.needsOverride = true;
        this.lightComponents = [];
    this.LightState = {
      rows: 0,
      cols: 0,
      width: 0,
      height: 0,
      tileData: { value: null },
      tileTexture: { value: null },
      lightTexture: {
        value: new THREE.DataTexture( new Float32Array( 32 * 2 * 4 ), 32, 2, THREE.RGBAFormat, THREE.FloatType )
      },
    };
    },

    update: function () {
        this.needsUpdate = true;
    },
    
    addLight: function (behavior) {
    this.lightComponents.push(behavior);
  },
  
  removeLight: function (behavior) {
    var index = this.lightComponents.indexOf(behavior);
    this.lightComponents.splice(index);
    },
    
    setupPostState: function () {
        this.renderTarget = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
        this.renderTarget.texture.generateMipmaps = false;
        this.renderTarget.depthBuffer = true;
        this.renderTarget.depthTexture = new THREE.DepthTexture();
        this.renderTarget.depthTexture.type = THREE.UnsignedShortType;
        this.renderTarget.depthTexture.minFilter = THREE.LinearFilter;
        this.renderTarget.stencilBuffer = false;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
        this.quad.frustumCulled = false;
        this.scene.add(this.quad);
        this.sceneLeft = new THREE.Scene();
        this.quadLeft = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
        this.quadLeft.geometry.attributes.uv.array.set([0, 1, 0.5, 1, 0, 0, 0.5, 0]);
        this.quadLeft.frustumCulled = false;
        this.sceneLeft.add(this.quadLeft);
        this.sceneRight = new THREE.Scene();
        this.quadRight = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
        this.quadRight.geometry.attributes.uv.array.set([0.5, 1, 1, 1, 0.5, 0, 1, 0]);
        this.quadRight.frustumCulled = false;
        this.sceneRight.add(this.quadRight);
        this.targets = [
            new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat }),
            new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat })
        ];
        
        this.tDiffuse = {type: "t", value: null};
        this.tDepth = {type: "t", value: this.renderTarget.depthTexture};
        this.cameraFar = {type: "f", value: 0};
        this.cameraNear = {type: "f", value: 0};
        this.time = { type: "f", value: 0 };
        this.timeDelta = { type: "f", value: 0 };
        this.uvClamp = { type: "v2", value: this.uvBoth };
        this.resolution = { type: "v4", value: new THREE.Vector4() };

    },

    vertexShader: [
        '#include <common>',
        'varying vec2 vUv;',
        'void main() {',
        '   vUv = uv;',
        '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
    ].join('\n'),

    uvLeft: new THREE.Vector2(0, 0.5),
    uvRight: new THREE.Vector2(0.5, 1),
    uvBoth: new THREE.Vector2(0, 1),

    parseToken: /([#a-z0-9\-\_]+)\.{0,1}([#a-z0-9\-\_]*)\s*\({0,1}\s*([\$a-z0-9\-\_\.\s]*)\){0,1}([\!\?]{0,1})/i,

    renderPass: function (material, renderTarget, viewCb, forceClear){
        var renderer = this.sceneEl.renderer;
        this.quad.material = material;
        var isFn = typeof viewCb === "function";
        var s = renderTarget || renderer.getSize();
        this.resolution.value.set(s.width, s.height, 1/s.width, 1/s.height);
        var oldClear = renderer.autoClear;
        renderer.autoClear = false;
        if (viewCb) {
            if (this.cameras.length > 1){
                this.quadLeft.material = material;
                this.uvClamp.value = this.uvLeft;
                setView(0, 0, Math.round(s.width * 0.5), s.height);
                if (isFn) viewCb(material, this.cameras[0], -1);
          renderer.render(this.sceneLeft, this.camera, renderTarget, oldClear || forceClear);        
                
                this.quadRight.material = material;
                this.uvClamp.value = this.uvRight;
                setView(Math.round(s.width * 0.5), 0, Math.round(s.width * 0.5), s.height);
                if (isFn) viewCb(material, this.cameras[1], 1);
                renderer.render( this.sceneRight, this.camera, renderTarget);

                this.uvClamp.value = this.uvBoth;
                setView(0, 0, s.width, s.height);
            } else {
                setView(0, 0, s.width, s.height);
                if (isFn) viewCb(material, this.sceneEl.camera, 0);
                renderer.render( this.scene, this.camera, renderTarget, oldClear || forceClear);
            }
        } else {
            setView(0, 0, s.width, s.height);
            renderer.render(this.scene, this.camera, renderTarget, oldClear || forceClear);
        }
        renderer.autoClear = oldClear;
        function setView(x,y,w,h) {
            if (renderTarget) {
                renderTarget.viewport.set( x, y, w, h );
        renderTarget.scissor.set( x, y, w, h );
            } else {
                renderer.setViewport( x, y, w, h );
        renderer.setScissor( x, y, w, h );
            }
        }
    },

    materialize: function (m) {
        var fs = [
            "uniform vec2 uvClamp;",
            "vec4 textureVR( sampler2D sampler, vec2 uv ) {",
            " return texture2D(sampler, vec2(clamp(uv.x, uvClamp.x, uvClamp.y), uv.y));",
            "} ",
            m.fragmentShader            
        ].join("\n");
        
        m.uniforms.uvClamp = this.uvClamp;
        
        return new THREE.ShaderMaterial({
            uniforms: m.uniforms,
            vertexShader: m.vertexShader || this.vertexShader,
            fragmentShader: fs,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NoBlending,
            fog: false,
            extensions: {
                derivatives: true
            },
            defines: m.defines || {}
        });
    },

    fuse: function (temp, alpha) {
        if (!temp.length) return;
        var self = this, count=0;
        var chunks = [], head = [], main = [], includes = {}, 
            needsDepth = false, needsDiffuse = false, k;
 
        var uniforms = {
            time: this.time,
            timeDelta: this.timeDelta,
            resolution: this.resolution
        };

        temp.forEach(function (obj) {
            var callMain = true, swapMain = false, args=[];
            if (typeof obj === "string") {
                var tok = self.parseToken.exec(obj);
                if(!tok) return;
                
                callMain = tok[4] !== "!";
                swapMain = tok[4] === "?";
                obj = tok[1];
                var prop = tok[2];
                var temp = {};
                
                if(obj[0] === "#") {
                    var el = document.querySelector(obj);
                    if(!el) return;
                    
                    obj = {
                        attrName: [obj.replace("#", "script_"), "_", (count++), "_"].join(""),
                        fragment: prop ? 
                            (el[prop] instanceof Document ? el[prop].body.textContent : el[prop]) 
                            : el.textContent,
                        depth: el.dataset.depth !== undefined,
                        diffuse: el.dataset.diffuse !== undefined,
                        includes: el.dataset.includes ? el.dataset.includes.trim().split(" ") : null,
                        defaults: el.dataset.defaults ? el.dataset.defaults.trim().split(" ") : null
                    };
                } else {
                    obj = self.effects[obj];
                    if (!obj) return;
                    if (prop) {
                        obj = obj.exports ? obj.exports[prop] : null;
                        if (!obj) return;
                        obj.attrName = tok[1] + "_" + prop + "_";
                    }
                }
                if (tok[3]) {
                    args = tok[3].trim().split(" ");
                }
            }
            var prefix = (obj.attrName ? obj.attrName : "undefined_" + (count++)) + "_";
            prefix = prefix.replace("__","_");
            if (obj.defaults) {
                obj.defaults.forEach(function (d, i) {
                    var v = args[i];
                    chunks.push(["#define $", i, " ", v  && v !== "$" ? v : d ].join("").replace(/\$/g, prefix).replace("__","_"));
                });
            }
            if (obj.diffuse) { needsDiffuse = true; }
            if (obj.depth) { needsDepth = true; }
            if (obj.fragment) { chunks.push(obj.fragment.replace(/\$/g, prefix)); }
            if (obj.uniforms) {
                for (var u in obj.uniforms) {
                    uniforms[prefix + u] = obj.uniforms[u];
                }
            };
            if (obj.includes) {
                obj.includes.forEach(function (inc) {
                    includes[inc] = true;
                });
            }
            if (callMain) {
                main.push(["  ", prefix, "main(", ( swapMain ? "origColor, color": "color, origColor"), ", vUv, depth);"].join(""));
            }
        });
        var t2u = { "i": "int", "f": "float", "t": "sampler2D",
            "v2": "vec2", "v3": "vec3", "c": "vec3","v4": "vec4", 
            "m2": "mat2", "m3":"mat3", "m4": "mat4", "b": "bool" };

        for(k in includes) { head.push("#include <" + k + ">"); }
        
        var premain = [
            "void main () {" 
        ];
        uniforms["tDiffuse"] = this.tDiffuse;
             
        if (needsDiffuse){
             premain.push("  vec4 color = texture2D(tDiffuse, vUv);"); 
        } else {
             premain.push("  vec4 color = vec4(0.0);"); 
        }
        premain.push("  vec4 origColor = color;"); 
        
        uniforms["tDepth"] = this.tDepth;
        uniforms["cameraFar"] = this.cameraFar;
        uniforms["cameraNear"] = this.cameraNear;
            
        if (needsDepth){
            premain.push("  float depth = texture2D(tDepth, vUv).x;");
        } else {
            premain.push("  float depth = 0.0;");
        }
        
        for(k in uniforms) {
            var u = uniforms[k];
            head.push(["uniform", t2u[u.type], k, ";"].join(" "));
        }
        
        head.push("varying vec2 vUv;");
        var source = [
            head.join("\n"), chunks.join("\n"), "\n",
                premain.join("\n"), main.join("\n"), 
                alpha ? "  gl_FragColor = color;" : "  gl_FragColor = vec4(color.rgb, 1.0);", "}"
        ].join("\n");

        var material = this.materialize({
            fragmentShader: source, 
            uniforms: uniforms
        });

        if(this.sceneEl.components.debug) console.log(source, material);
        return material;
    },

    rebuild: function () {
        var self = this, passes = [], temp = [];
        this.passes.forEach(function(pass){
            if (pass.dispose) pass.dispose();
        });
        this.data.forEach(function (k) {
            if(!k){
                pickup();
                return;
            }
            var obj, name;
            var tok = self.parseToken.exec(k);
            if(!tok || !tok[1]) return;
            name = tok[1];
            obj = self.effects[name];
            if (!obj){
                temp.push(k);
                return;
            }
            if (obj.pass) {
                pickup();
                passes.push({ pass: obj.pass, behavior: obj } );
            } else if (obj.material){
                pickup();
                passes.push({ pass: makepass(obj.material, false, obj.vr), behavior: obj });
            } else {
                temp.push(k);
            }          
        });

        function pickup () {
            if (!temp.length) return;
            passes.push({ pass: makepass(self.fuse(temp), true)});
            temp = [];
        }

        function makepass (material, dispose, viewCb) {
            return {
                render: function(renderer, writeBuffer, readBuffer){
                    self.renderPass(material, writeBuffer, viewCb);
                },

                dispose: function () {
                    if (dispose) material.dispose();
                }
            }
        }
        pickup();
        this.needsUpdate = false;
        this.passes = passes;
    },

    isActive: function (behavior, resize) {
        var scene = this.sceneEl;
        if (behavior.bypass) return false;
        var isEnabled = scene.renderTarget ? true : false;
        if (!isEnabled) return false;
        if (resize && (this.needsResize || behavior.needsResize) && behavior.setSize) {
            var size = scene.renderer.getSize();
            behavior.setSize(size.width, size.height);
            delete behavior.needsResize;
        }
        return true;
    },

    register: function (behavior) {
        this.effects[behavior.attrName] = behavior;
        this.needsUpdate = true;
    },

    unregister: function (behavior) {
        delete this.effects[behavior.attrName];
        this.needsUpdate = true;
    },

    tick: function (time, timeDelta) {
        var self = this, sceneEl = this.sceneEl, renderer = sceneEl.renderer, effect = sceneEl.effect, 
            rt = this.renderTarget, rts = this.targets, scene = sceneEl.object3D;
        if(!rt || !renderer) { return; }
        if (this.needsOverride) {
            if(scene.onBeforeRender) {
                scene.onBeforeRender = function (renderer, scene, camera) {
                    var size = renderer.getSize();
                    if (size.width !== rt.width || size.height !== rt.height) {
                        rt.setSize(size.width, size.height);
                        rts[0].setSize(size.width, size.height);
                        rts[1].setSize(size.width, size.height);
                        self.resolution.value.set(size.width, size.height, 1/size.width, 1/size.height);
                        self.needsResize = true;
                        self.resizeTiles();
                    }
                    if(camera instanceof THREE.ArrayCamera) {
                        self.cameras = camera.cameras;
                    } else {
                        self.cameras.push(camera);
                    }
                    self.tileLights(renderer, scene, camera);
                }
            } else {
                var rendererRender = renderer.render;
                renderer.render = function (scene, camera, renderTarget, forceClear) {
                    if (renderTarget === rt) {
                        var size = renderer.getSize();
                        if (size.width !== rt.width || size.height !== rt.height) {
                            rt.setSize(size.width, size.height);
                            rts[0].setSize(size.width, size.height);
                            rts[1].setSize(size.width, size.height);
                            self.resolution.value.set(size.width, size.height, 1/size.width, 1/size.height);
                            self.needsResize = true;
                        }
                        self.cameras.push(camera);
                    }
                    rendererRender.call(renderer, scene, camera, renderTarget, forceClear);
                }
            }        
            this.needsOverride = false;
        }
        this.cameras = [];
        this.time.value = time / 1000;
        this.timeDelta.value = timeDelta / 1000;

        if (this.needsUpdate === true) { this.rebuild(); }

       this.setupPasses();

        this.tDiffuse.value = this.renderTarget.texture;
        this.tDepth.value = this.renderTarget.depthTexture;
        var camera = this.sceneEl.camera;
        this.cameraFar.value = camera.far;
        this.cameraNear.value = camera.near;                
    },

    setupPasses : function () {
        var arr = [], rt = this.renderTarget;
        this.passes.forEach(function (p) {
            if (p.behavior && p.behavior.bypass === true) return;
            arr.push(p);
        });
        this.sceneEl.renderTarget = arr.length && this.sceneEl.isPlaying ? rt : null;
        this._passes = arr;
    },
    tock: function () {
        var scene = this.sceneEl, renderer = scene.renderer, self = this;
        if(!scene.renderTarget) { return; }
        var rt = scene.renderTarget, rts = this.targets;
        this._passes.forEach(function (pass, i) {
            var r = i ? rts[i & 1] : rt;
            self.tDiffuse.value = r.texture;   
            if (pass.behavior && pass.behavior.resize) self.isActive(pass.behavior, true);
            pass.pass.render(renderer, i < self._passes.length - 1 ? rts[(i+1) & 1] : null, r);
        });
        this.needsResize = false;
    },

    resizeTiles: function () {
        var LightState = this.LightState;
        var width = LightState.width;
        var height = LightState.height;
        LightState.cols = Math.ceil( width / 32 );
        LightState.rows = Math.ceil( LightState.height / 32 );
        LightState.tileData.value = [ width, height, 0.5 / Math.ceil( width / 32 ), 0.5 / Math.ceil( height / 32 ) ];
        LightState.tileTexture.value = new THREE.DataTexture( new Uint8Array( LightState.cols * LightState.rows * 4 ), LightState.cols, LightState.rows );
    },
    
    tileLights: function ( renderer, scene, camera ) {
        if ( ! camera.projectionMatrix ) return;
        var LightState = this.LightState, lights = this.lightComponents;
        var size = renderer.getSize();
        var d = LightState.tileTexture.value.image.data;
        var ld = LightState.lightTexture.value.image.data;
        var viewMatrix = camera.matrixWorldInverse;
        d.fill( 0 );
        var vector = new THREE.Vector3();

        var passes;
        if(camera instanceof THREE.ArrayCamera) {
            passes = [ [0.5, 0, camera.cameras[0]], [0.5, 0.5, camera.cameras[1]]];
        } else {
            passes = [1.0, 0, camera];
        }
        passes.forEach(function(pass){
            lights.forEach( function ( light, index ) {
                vector.setFromMatrixPosition( light.el.object3D.matrixWorld );
                var pw = LightState.width * pass[0];
                var pm = LightState.width * pass[1];
                var bs = self.lightBounds( pass[2], vector, light.data.radius, pw );
                vector.applyMatrix4( viewMatrix );
                vector.toArray( ld, 4 * index );
                ld[ 4 * index + 3 ] = light.data.radius;
                light.data.color.toArray( ld, 32 * 4 + 4 * index );
                ld[ 32 * 4 + 4 * index + 3 ] = light.data.decay;
                if ( bs[ 1 ] < 0 || bs[ 0 ] > pw || bs[ 3 ] < 0 || bs[ 2 ] > LightState.height ) return;
                if ( bs[ 0 ] < 0 ) bs[ 0 ] = 0;
                if ( bs[ 1 ] > pw ) bs[ 1 ] = pw;
                if ( bs[ 2 ] < 0 ) bs[ 2 ] = 0;
                if ( bs[ 3 ] > LightState.height ) bs[ 3 ] = LightState.height;
                var i4 = Math.floor( index / 8 ), i8 = 7 - ( index % 8 );
                for ( var i = Math.floor( bs[ 2 ] / 32 ); i <= Math.ceil( bs[ 3 ] / 32 ); i ++ ) {
                    for ( var j = Math.floor( (bs[ 0 ] + pm) / 32  ); j <= Math.ceil( (bs[ 1 ] + pm) / 32 ); j ++ ) {
                        d[ ( LightState.cols * i + j ) * 4 + i4 ] |= 1 << i8;
                    }
                }
            } );
        });
        LightState.tileTexture.value.needsUpdate = true;
        LightState.lightTexture.value.needsUpdate = true;
    },
    
    lightBounds: function () {  
        v = new THREE.Vector3();
        return function ( camera, pos, r, w ) {
            var LightState = this.LightState;
            var minX = w, maxX = 0, minY = LightState.height, maxY = 0, hw = w / 2, hh = LightState.height / 2;
            for ( var i = 0; i < 8; i ++ ) {
                v.copy( pos );
                v.x += i & 1 ? r : - r;
                v.y += i & 2 ? r : - r;
                v.z += i & 4 ? r : - r;
                var vector = v.project( camera );
                var x = ( vector.x * hw ) + hw;
                var y = ( vector.y * hh ) + hh;
                minX = Math.min( minX, x );
                maxX = Math.max( maxX, x );
                minY = Math.min( minY, y );
                maxY = Math.max( maxY, y );
            }
            return [ minX, maxX, minY, maxY ];
    };
    }()
});


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(4);
__webpack_require__(5);
__webpack_require__(6);
__webpack_require__(8);
__webpack_require__(10);
__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(16);


/***/ }),
/* 4 */
/***/ (function(module, exports) {

// Sobel and freichen shaders from three.js examples

AFRAME.registerComponent("outline", {
  multiple: true,

    schema: {
    enabled: { default: true },
        color: { type: "color", default: "#000000" },
    width: { type: "vec2", default: new THREE.Vector2(1,1) },
    range: { type: "vec2", default: new THREE.Vector2(0,1500) },
    strength: {type: "number", default: 1},
    ratio: { type: "number", default: 0.5 },
    smooth: { default: false }  
  },

    init: function () {
        this.system = this.el.sceneEl.systems.effects;
    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        this.renderTarget = new THREE.WebGLRenderTarget( 1, 1, pars );
    this.blurTarget = new THREE.WebGLRenderTarget( 1, 1, pars );
    this.needsResize = true;
    this.resolution = { type: "v4", value: new THREE.Vector4()};
    this.tockUniforms = {
      resolution: this.resolution,
            color: { type: "c", value: new THREE.Color() },
      width: { type: "v2", value: null },
      range: { type: "v2", value: null },
      strength: { type: "f", value: 1 }
        };
    
    this.blurDirection = { type: "v2", value: new THREE.Vector2()};
    
    this.exports = {
      sobel: {
        fragment: this.sobel,
        uniforms: this.tockUniforms,
        includes: ["packing"],
        depth: true
      },

      blur: {
        fragment: this.blur,
        uniforms: { resolution: this.tockUniforms.resolution, direction: this.blurDirection },
        diffuse: true
      }
    }
    this.currentMaterial = this.system.fuse([this.exports.sobel], true);

    
    this.blurMaterial = this.system.fuse([this.exports.blur], true);

    this.uniforms = {
      texture: { type: "t", value: this.renderTarget.texture }
    }
    
    this.system.register(this);
    },

    update: function (oldData) {
    this.bypass = !this.data.enabled;
        this.tockUniforms.color.value.set(this.data.color);
    this.tockUniforms.width.value = this.data.width;
    this.tockUniforms.range.value = this.data.range;
    this.tockUniforms.strength.value = 1 / this.data.strength;
    },

  setSize: function(w, h) {
    w = Math.round(w * this.data.ratio);
    h = Math.round(h * this.data.ratio);
    this.renderTarget.setSize(w,h);
    this.blurTarget.setSize(w,h);
    this.resolution.value.set(w, h, 1/w, 1/h);
  },

  tock: function () {
    if (!this.system.isActive(this, true)) return;
    this.system.renderPass(this.currentMaterial, this.renderTarget);
    this.system.tDiffuse.value = this.renderTarget;
    if (!this.data.smooth) return;
    this.blurDirection.value.set(1,0);
    this.system.renderPass(this.blurMaterial, this.blurTarget);
    this.system.tDiffuse.value = this.blurTarget;
    this.blurDirection.value.set(0,1);
    this.system.renderPass(this.blurMaterial, this.renderTarget);
  },

    remove: function () {
        this.system.unregister(this);
    },

    diffuse: true,

    sobel: [
    "mat3 $G[2];",

    "const mat3 $g0 = mat3( 1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0 );",
    "const mat3 $g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );",


    "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth) {",
    
      "vec3 I[3];",
      "float cnv[2];",
      "float d;",

      "$G[0] = $g0;",
      "$G[1] = $g1;",

      "for (float i=0.0; i<3.0; i++)",
      "for (float j=0.0; j<3.0; j++) {",
    "           d = texture2D(tDepth, uv + resolution.zw * vec2(i-1.0,j-1.0) ).x;",
        "           d = perspectiveDepthToViewZ(d, cameraNear, cameraFar); ",
    "			I[int(i)][int(j)] = viewZToOrthographicDepth(d, cameraNear, cameraFar);",
      "}",

      "for (int i=0; i<2; i++) {",
        "float dp3 = dot($G[i][0], I[0]) + dot($G[i][1], I[1]) + dot($G[i][2], I[2]);",
        "cnv[i] = dp3 * dp3; ",
      "}",
      "color = vec4($color, sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]));",
    "} "
  ].join("\n"),

  blur: [
    "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth){",
    "color.a *= 0.44198;",
    "color.a += texture2D(tDiffuse, uv + ($direction * $resolution.zw )).a * 0.27901;",
    "color.a += texture2D(tDiffuse, uv - ($direction * $resolution.zw )).a * 0.27901;",
    "}"
  ].join("\n"),

  fragment: [
        "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth){",
        "	vec4 texel = texture2D($texture, uv);",
    "   color.rgb = mix(color.rgb, texel.rgb, smoothstep(0.1,0.3,texel.a));",
        "}"
    ].join("\n")
});

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// Ported from the standard shader in Three.js examples

AFRAME.registerComponent("film", {
    multiple: true,

    schema: {
        "speed":       { default: 1.0 },
        "nIntensity": { default: 0.5 },
        "sIntensity": { default: 0.05 },
        "sCount":     { default: 4096 }
  },

    init: function () {
        this.uniforms = {
            "speed":       { type: "f", value: 0.0 },
            "nIntensity": { type: "f", value: 0.5 },
            "sIntensity": { type: "f", value: 0.05 },
            "sCount":     { type: "f", value: 4096 }
      };
        this.system = this.el.sceneEl.systems.effects;
        this.system.register(this);
    },

    update: function () {
        var d = this.data, us =  this.uniforms;
        for(var u in us) {
            if(d[u]) us[u].value = d[u]; 
        }
    },

    remove: function () {
        this.system.unregister(this);
    },

    includes: ["common"],

    diffuse: true,

    fragment: [
    "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth) {",
    "   vec4 cTextureScreen = color;",
    "   float dx = rand( uv + mod(time, 3.14) * $speed );",
    "   vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );",
    "   vec2 sc = vec2( sin( uv.y * $sCount ), cos( uv.y * $sCount ) );",
    "   cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * $sIntensity;",
        "   cResult = cTextureScreen.rgb + clamp( $nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",
    "   color.rgb =  cResult; //cResult;",
    "}"
  ].join( "\n" )
});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// Uses matdesl's three-fxaa-shader

var FXAAShader = __webpack_require__(7);

AFRAME.registerComponent("fxaa", {
    schema: { default: true },

    init: function () {
        this.system = this.el.sceneEl.systems.effects;
        this.material = new THREE.ShaderMaterial({
            fragmentShader: FXAAShader.fragmentShader,
            vertexShader: FXAAShader.vertexShader,
            uniforms: {
                tDiffuse: this.system.tDiffuse,
                resolution: { type: 'v2', value: new THREE.Vector2() }
            }
        });
        this.system.register(this);
        this.needsResize = true;
    },

    update: function () {
        this.bypass = !this.data;
    },

    setSize: function (w, h) {
        this.material.uniforms.resolution.value.set(w, h);
    },

    resize: true,

    remove: function () {
        this.material.dispose();
        this.system.unregister(this);
    }
});

/***/ }),
/* 7 */
/***/ (function(module, exports) {


// Adapted from https://github.com/mattdesl/three-shader-fxaa
module.exports =  {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    resolution: { type: 'v2', value: new THREE.Vector2() }
  },
  vertexShader: "#define GLSLIFY 1\nvarying vec2 vUv;\n\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nuniform vec2 resolution;\n\nvoid main() {\n  vUv = uv;\n  vec2 fragCoord = uv * resolution;\n  vec2 inverseVP = 1.0 / resolution.xy;\n  v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n  v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n  v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n  v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n  v_rgbM = vec2(fragCoord * inverseVP);\n\n  gl_Position = projectionMatrix *\n              modelViewMatrix *\n              vec4(position,1.0);\n}\n",
  fragmentShader: "#define GLSLIFY 1\nvarying vec2 vUv;\n\n//texcoords computed in vertex step\n//to avoid dependent texture reads\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\n//make sure to have a resolution uniform set to the screen size\nuniform vec2 resolution;\nuniform sampler2D tDiffuse;\n\n/**\nBasic FXAA implementation based on the code on geeks3d.com with the\nmodification that the texture2DLod stuff was removed since it's\nunsupported by WebGL.\n\n--\n\nFrom:\nhttps://github.com/mitsuhiko/webgl-meincraft\n\nCopyright (c) 2011 by Armin Ronacher.\n\nSome rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n\n    * Redistributions in binary form must reproduce the above\n      copyright notice, this list of conditions and the following\n      disclaimer in the documentation and/or other materials provided\n      with the distribution.\n\n    * The names of the contributors may not be used to endorse or\n      promote products derived from this software without specific\n      prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n#ifndef FXAA_REDUCE_MIN\n    #define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n    #define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n    #define FXAA_SPAN_MAX     8.0\n#endif\n\n//optimized version for mobile, where dependent \n//texture reads can be a bottleneck\nvec4 fxaa_1540259130(sampler2D tex, vec2 fragCoord, vec2 resolution,\n            vec2 v_rgbNW, vec2 v_rgbNE, \n            vec2 v_rgbSW, vec2 v_rgbSE, \n            vec2 v_rgbM) {\n    vec4 color;\n    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n    vec4 texColor = texture2D(tex, v_rgbM);\n    vec3 rgbM  = texColor.xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n    \n    mediump vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n    \n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n    \n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n              dir * rcpDirMin)) * inverseVP;\n    \n    vec3 rgbA = 0.5 * (\n        texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n        texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n\n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, texColor.a);\n    else\n        color = vec4(rgbB, texColor.a);\n    return color;\n}\n\nvoid main() {\n  vec2 fragCoord = vUv * resolution;   \n  gl_FragColor = fxaa_1540259130(tDiffuse, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}\n"
}



/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// Adapted from spidersharma UnrealBloomPass
var LuminosityHighPassShader = __webpack_require__(9);

var BlurDirectionX = new THREE.Vector2( 1.0, 0.0 );
var BlurDirectionY = new THREE.Vector2( 0.0, 1.0 );

AFRAME.registerComponent("bloom", {
  multiple: true,

    schema: {
    enable: { default: true},
        strength: { default: 1 },
        radius: { default: 0.4 },
        threshold: { default: 0.8 },
    filter: { type: "array", default: [] }
    },

    init: function () {
        this.system = this.el.sceneEl.systems.effects;
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        this.renderTargetsHorizontal = [];
        this.renderTargetsVertical = [];
        this.nMips = 5;
        
        this.renderTargetBright = new THREE.WebGLRenderTarget( 1, 1, pars );
        this.renderTargetBright.texture.name = "UnrealBloomPass.bright";
        this.renderTargetBright.texture.generateMipmaps = false;

        for( var i=0; i<this.nMips; i++) {

            var renderTarget = new THREE.WebGLRenderTarget( 1, 1, pars );

            renderTarget.texture.name = "UnrealBloomPass.h" + i;
            renderTarget.texture.generateMipmaps = false;

            this.renderTargetsHorizontal.push(renderTarget);

            var renderTarget = new THREE.WebGLRenderTarget( 1, 1, pars );

            renderTarget.texture.name = "UnrealBloomPass.v" + i;
            renderTarget.texture.generateMipmaps = false;

            this.renderTargetsVertical.push(renderTarget);

        }

        // luminosity high pass material, accessable as bloom.filter

    this.exports = {
      "filter": {
        uniforms: {
          "luminosityThreshold": { type: "f", value: 1.0 },
          "smoothWidth": { type: "f", value: 0.01 },
          "defaultColor": { type: "c", value: new THREE.Color( 0x000000 ) },
          "defaultOpacity":  { type: "f", value: 1.0 }
        },
        diffuse: true,
        fragment: [
          "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth) {",
            "vec4 texel = color;",
            "float v = dot( texel.xyz, vec3( 0.299, 0.587, 0.114 ) );",
            "vec4 outputColor = vec4( $defaultColor.rgb, $defaultOpacity );",
            "float alpha = smoothstep( $luminosityThreshold, $luminosityThreshold + $smoothWidth, v );",
            "color = mix( outputColor, texel, alpha );",
          "}"
        ].join("\n")
      }
    }

        this.materialHighPassFilter = null;
        // Gaussian Blur Materials
        this.separableBlurMaterials = [];
        var kernelSizeArray = [3, 5, 7, 9, 11];
        
        for( var i=0; i<this.nMips; i++) {

            this.separableBlurMaterials.push(this.getSeperableBlurMaterial(kernelSizeArray[i]));

            this.separableBlurMaterials[i].uniforms[ "texSize" ].value = new THREE.Vector2(1, 1);

        }

        // Composite material
        this.compositeMaterial = this.getCompositeMaterial(this.nMips);
        this.compositeMaterial.uniforms["blurTexture1"].value = this.renderTargetsVertical[0].texture;
        this.compositeMaterial.uniforms["blurTexture2"].value = this.renderTargetsVertical[1].texture;
        this.compositeMaterial.uniforms["blurTexture3"].value = this.renderTargetsVertical[2].texture;
        this.compositeMaterial.uniforms["blurTexture4"].value = this.renderTargetsVertical[3].texture;
        this.compositeMaterial.uniforms["blurTexture5"].value = this.renderTargetsVertical[4].texture;
        this.compositeMaterial.needsUpdate = true;

        var bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
        this.compositeMaterial.uniforms["bloomFactors"].value = bloomFactors;
        this.bloomTintColors = [new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1)
                                                    ,new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1)];
        this.compositeMaterial.uniforms["bloomTintColors"].value = this.bloomTintColors;
    this.oldClearColor = new THREE.Color();
        this.uniforms = {
            "texture": { type: "t", value: this.renderTargetsHorizontal[0] }
        }
        this.needsResize = true;
        this.system.register(this);
    },

  update: function (oldData) {
    if (oldData.filter !== this.data.filter) {
      if (this.materialHighPassFilter) this.materialHighPassFilter.dispose();
      var chain = this.data.filter.length ? this.data.filter : [this.exports.filter];
      this.materialHighPassFilter = this.system.fuse(chain, false);
    }
  },

    tock: function (time) {
        if (!this.data.enable || !this.system.isActive(this, true)) return;
    var scene = this.el.sceneEl;
    var renderer = scene.renderer;
        var readBuffer = scene.renderTarget;
        this.oldClearColor.copy( renderer.getClearColor() );
    this.oldClearAlpha = renderer.getClearAlpha();
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setClearColor( new THREE.Color( 0, 0, 0 ), 0 );

    // 1. Extract Bright Areas
    this.system.tDiffuse.value = readBuffer.texture;
    this.exports.filter.uniforms[ "luminosityThreshold" ].value = this.data.threshold;
    this.system.renderPass(this.materialHighPassFilter, this.renderTargetBright, null, false);

    // 2. Blur All the mips progressively
    var inputRenderTarget = this.renderTargetBright;

    for(var i=0; i<this.nMips; i++) {
  
      this.separableBlurMaterials[i].uniforms[ "colorTexture" ].value = inputRenderTarget.texture;

      this.separableBlurMaterials[i].uniforms[ "direction" ].value = BlurDirectionX;

            this.system.renderPass(this.separableBlurMaterials[i], this.renderTargetsHorizontal[i], true);

      this.separableBlurMaterials[i].uniforms[ "colorTexture" ].value = this.renderTargetsHorizontal[i].texture;

      this.separableBlurMaterials[i].uniforms[ "direction" ].value = BlurDirectionY;

      this.system.renderPass(this.separableBlurMaterials[i], this.renderTargetsVertical[i], true);

      inputRenderTarget = this.renderTargetsVertical[i];
    }

    // Composite All the mips
    this.compositeMaterial.uniforms["bloomStrength"].value = this.data.strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = this.data.radius;
    this.compositeMaterial.uniforms["bloomTintColors"].value = this.bloomTintColors;
        this.system.renderPass(this.compositeMaterial, this.renderTargetsHorizontal[0], null);

    renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
    renderer.autoClear = oldAutoClear;
  },

    setSize: function ( width, height ) {

    var resx = Math.round(width/2);
    var resy = Math.round(height/2);

    this.renderTargetBright.setSize(resx, resy);

    for( var i=0; i<this.nMips; i++) {

      this.renderTargetsHorizontal[i].setSize(resx, resy);
      this.renderTargetsVertical[i].setSize(resx, resy);

      this.separableBlurMaterials[i].uniforms[ "texSize" ].value = new THREE.Vector2(resx, resy);

      resx = Math.round(resx/2);
      resy = Math.round(resy/2);
    }
  },

    remove: function () {
        this.system.unregister(this);
        for( var i=0; i< this.renderTargetsHorizontal.length; i++) {
      this.renderTargetsHorizontal[i].dispose();
    }
    for( var i=0; i< this.renderTargetsVertical.length; i++) {
      this.renderTargetsVertical[i].dispose();
    }
    this.renderTargetBright.dispose();
    },

    getSeperableBlurMaterial: function(kernelRadius) {

    return this.system.materialize( {

      defines: {
        "KERNEL_RADIUS" : kernelRadius,
        "SIGMA" : kernelRadius
      },

      uniforms: {
        "colorTexture": { value: null },
        "texSize": 				{ value: new THREE.Vector2( 0.5, 0.5 ) },
        "direction": 				{ value: new THREE.Vector2( 0.5, 0.5 ) }
      },

      vertexShader:
        "varying vec2 vUv;\n\
        void main() {\n\
          vUv = uv;\n\
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
        }",

      fragmentShader:
        "#include <common>\
        varying vec2 vUv;\n\
        uniform sampler2D colorTexture;\n\
        uniform vec2 texSize;\
        uniform vec2 direction;\
        float gaussianPdf(in float x, in float sigma) {\
          return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\
        }\
        void main() {\n\
          vec2 invSize = 1.0 / texSize;\
          float fSigma = float(SIGMA);\
          float weightSum = gaussianPdf(0.0, fSigma);\
          vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\
          for( int i = 1; i < KERNEL_RADIUS; i ++ ) {\
            float x = float(i);\
            float w = gaussianPdf(x, fSigma);\
            vec2 uvOffset = direction * invSize * x;\
            vec3 sample1 = textureVR( colorTexture, vUv + uvOffset).rgb;\
            vec3 sample2 = textureVR( colorTexture, vUv - uvOffset).rgb;\
            diffuseSum += (sample1 + sample2) * w;\
            weightSum += 2.0 * w;\
          }\
          gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\
        }"
    } );
  },

  getCompositeMaterial: function(nMips) {

    return new THREE.ShaderMaterial( {

      defines:{
        "NUM_MIPS" : nMips
      },

      uniforms: {
        "blurTexture1": { value: null },
        "blurTexture2": { value: null },
        "blurTexture3": { value: null },
        "blurTexture4": { value: null },
        "blurTexture5": { value: null },
        "bloomStrength" : { value: 1.0 },
        "bloomFactors" : { value: null },
        "bloomTintColors" : { value: null },
        "bloomRadius" : { value: 0.0 }
      },

      vertexShader:
        "varying vec2 vUv;\n\
        void main() {\n\
          vUv = uv;\n\
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
        }",

      fragmentShader:
        "varying vec2 vUv;\
        uniform sampler2D blurTexture1;\
        uniform sampler2D blurTexture2;\
        uniform sampler2D blurTexture3;\
        uniform sampler2D blurTexture4;\
        uniform sampler2D blurTexture5;\
        uniform float bloomStrength;\
        uniform float bloomRadius;\
        uniform float bloomFactors[NUM_MIPS];\
        uniform vec3 bloomTintColors[NUM_MIPS];\
        \
        float lerpBloomFactor(const in float factor) { \
          float mirrorFactor = 1.2 - factor;\
          return mix(factor, mirrorFactor, bloomRadius);\
        }\
        \
        void main() {\
          gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + \
                          lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + \
                         lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + \
                         lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + \
                         lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );\
        }"
    } );
  },

  diffuse: true,
  defaults: ["1.0"],
    fragment: [
        "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth){",
        "   color.rgb += texture2D($texture, uv).rgb;",
        "}"
    ].join("\n")
});

/***/ }),
/* 9 */
/***/ (function(module, exports) {

/**
 * @author bhouston / http://clara.io/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

module.exports = {

  shaderID: "luminosityHighPass",

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "luminosityThreshold": { type: "f", value: 1.0 },
    "smoothWidth": { type: "f", value: 1.0 },
    "defaultColor": { type: "c", value: new THREE.Color( 0x000000 ) },
    "defaultOpacity":  { type: "f", value: 0.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",

      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform vec3 defaultColor;",
    "uniform float defaultOpacity;",
    "uniform float luminosityThreshold;",
    "uniform float smoothWidth;",

    "varying vec2 vUv;",

    "void main() {",

      "vec4 texel = texture2D( tDiffuse, vUv );",

      "vec3 luma = vec3( 0.299, 0.587, 0.114 );",

      "float v = dot( texel.xyz, luma );",

      "vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

      "float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

      "gl_FragColor = mix( outputColor, texel, alpha );",

    "}"

  ].join("\n")

};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

AFRAME.registerComponent("colors", {
    multiple: true,

    schema: {
        "mode": { default: "map" },
        "lut": { type: "selector"},
        "lutClamp": { default: false },
        "lutFlip": { default: false },
        "add": { type: "vec3", default: new THREE.Vector3(0,0,0) },
        "mul": { type: "vec3", default: new THREE.Vector3(1,1,1) },
        "pow": { type: "vec3", default: new THREE.Vector3(1,1,1) },
        "left": { type: "vec3", default: new THREE.Vector3(0,0,0) },
        "right": { type: "vec3", default: new THREE.Vector3(1,1,1) },
        "min": { type: "vec3", default: new THREE.Vector3(0,0,0) },
        "max": { type: "vec3", default: new THREE.Vector3(1,1,1) },
        "quant": { type: "vec3", default: new THREE.Vector3(0.2,0.2,0.2) },
        "orig": { type: "vec3", default: new THREE.Vector3(1,1,1) },
        "red": { type: "vec3", default: new THREE.Vector3(1,0,0) },
        "green": { type: "vec3", default: new THREE.Vector3(0,0.5,0.5) },
        "blue": { type: "vec3", default: new THREE.Vector3(0,0.5,0.5) },
    },

    init: function () {
        this.system = this.el.sceneEl.systems.effects;
        this.uniforms = {
            "add": { type: "v3", value: null },
            "mul": { type: "v3", value: null },
            "pow": { type: "v3", value: null },
            "left": { type: "v3", value: null },
            "right": { type: "v3", value: null },
            "min": { type: "v3", value: null },
            "max": { type: "v3", value: null },
            "quant": { type: "v3", value: null },
            "orig": { type: "v3", value: null },
            "red": { type: "v3", value: null },
            "green": { type: "v3", value: null },
            "blue": { type: "v3", value: null },
            "texture": { 
                type: "t", 
                value: new THREE.Texture(
                    undefined, // Default Image
                    undefined, // Default Mapping
                    undefined, // Default wrapS
                    undefined, // Default wrapT
                    THREE.NearestFilter, // magFilter
                    THREE.NearestFilter  // minFilter
                )}
        }
        
        this.rebuild();
    
        this.system.register(this);
    },

    update: function (oldData) {
        var d = this.data, us =  this.uniforms, needsRebuild = false;
        
        for(var u in us) {
            if(d[u] !== undefined) us[u].value = d[u]; 
        }
        []
        if(this.data.lutFlip !== oldData.lutFlip || this.data.lutClamp !== oldData.lutClamp || this.data.mode != oldData.mode) {
            this.rebuild();
        }

        if(this.data.lut !== oldData.lut) {
            const texture = this.uniforms.texture.value;
            texture.image = this.data.lut;
            texture.needsUpdate = true;
        }
    },

    remove: function () {
        this.system.unregister(this);
    },

    rebuild: function () {
        var arr = [], m = this.data.mode;
        for(var i=0; i < m.length; i++){
            var op = this.ops[m[i]];
            if(op) arr.push(op);
        }
        
        this.fragment = [
            this.data.lutClamp ? "" : "#define $LUT_NO_CLAMP 1",
            this.data.lutFlip ? "#define $LUT_FLIP_Y 1" : "",
            this.preFragment, 
            arr.join("\n"), 
            "}"
        ].join("\n");

        this.system.needsUpdate = true;
    },

    ops: {
        "m": "color.rgb *= $mul;",
        "a": "color.rgb += $add;",
        "p": "color.rgb = pow(color.rgb, $pow);",
        "h": "color.rgb = $rgb2hsv(color.rgb);",
        "r": "color.rgb = $hsv2rgb(color.rgb);",
        "s": "color.rgb = smoothstep($left, $right, color.rgb);",
        "l": "color.rgb = $lut(color).rgb;",
        "q": "color.rgb = floor(color.rgb / $quant) * $quant;",
        "c": "color.rgb = clamp(color.rgb, $min, $max);",
        "g": "color.rgb = vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114)));",
        "o": "color.rgb = mix(color.rgb, orig.rgb, $orig);",
        "t": "color.rgb = vec3(dot(color.rgb, $red), dot(color.rgb, $green), dot(color.rgb, $blue));",
        "b": "color.rgb = color.rgb;"
    },

    diffuse: true,

    preFragment: [
        // Lut from https://github.com/mattdesl/glsl-lut
        "vec4 $lut(vec4 textureColor) {",
        "    #ifndef $LUT_NO_CLAMP",
        "        textureColor = clamp(textureColor, 0.0, 1.0);",
        "    #endif",

        "    mediump float blueColor = textureColor.b * 63.0;",

        "    mediump vec2 quad1;",
        "    quad1.y = floor(floor(blueColor) / 8.0);",
        "    quad1.x = floor(blueColor) - (quad1.y * 8.0);",

        "    mediump vec2 quad2;",
        "    quad2.y = floor(ceil(blueColor) / 8.0);",
        "    quad2.x = ceil(blueColor) - (quad2.y * 8.0);",

        "    highp vec2 texPos1;",
        "    texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);",
        "    texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);",

        "    #ifdef $LUT_FLIP_Y",
        "        texPos1.y = 1.0-texPos1.y;",
        "    #endif",

        "    highp vec2 texPos2;",
        "    texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);",
        "    texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);",

        "    #ifdef $LUT_FLIP_Y",
        "        texPos2.y = 1.0-texPos2.y;",
        "    #endif",

        "    lowp vec4 newColor1 = texture2D($texture, texPos1);",
        "    lowp vec4 newColor2 = texture2D($texture, texPos2);",

        "    lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));",
        "    return newColor;",
        "}",

        "vec3 $rgb2hsv(vec3 c){",
        
        "    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);",
        "    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));",
        "    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));",

        "    float d = q.x - min(q.w, q.y);",
        "    float e = 1.0e-10;",
        "    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);",
        "}",

        "vec3 $hsv2rgb(vec3 c)",
        "{",
        "    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
        "    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
        "    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
        "}",

        "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth){",
        "vec3 orig = color.rgb;",
    ].join("\n")
});

/***/ }),
/* 11 */
/***/ (function(module, exports) {

// Ported from three's glitch pass/shader and added VR support

AFRAME.registerComponent("glitch", {
    schema: { default: true },

    init: function () {
        this.system = this.el.sceneEl.systems.effects;

        this.uniforms = {
            "tDisp":		{ type: "t", value: this.generateHeightmap( 64 ) },
            "amount":		{ type: "f", value: 0.08 },
            "angle":		{ type: "f", value: 0.02 },
            "seed":			{ type: "f", value: 0.02 },
            "seed_x":		{ type: "f", value: 0.02 },//-1,1
            "seed_y":		{ type: "f", value: 0.02 },//-1,1
            "distortion_x":	{ type: "f", value: 0.5 },
            "distortion_y":	{ type: "f", value: 0.6 },
            "col_s":		{ type: "f", value: 0.05 }
      };
        
    this.exports = {
      glitch: {
                fragment: this.fragment,
                uniforms: this.uniforms
            }
    }
        // by declaring a .material property we set this component to take a whole pass of it's own
        this.material = this.system.fuse([this.exports.glitch]);

        this.system.register(this);
    },

    vr: true,

    update: function () {
        this.bypass = !this.data;
        this.curF = 0;
        this.generateTrigger();
    },

    remove: function () {
        this.system.unregister(this);
    },

    tock: function () {
        this.uniforms[ 'seed' ].value = Math.random();//default seeding
    
    if ( this.curF % this.randX == 0) {

      this.uniforms[ 'amount' ].value = Math.random() / 30;
      this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
      this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 1, 1 );
      this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 1, 1 );
      this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
      this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
      this.curF = 0;
      this.generateTrigger();

    } else if ( this.curF % this.randX < this.randX / 5 ) {

      this.uniforms[ 'amount' ].value = Math.random() / 90;
      this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
      this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
      this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
      this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
      this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 0.3, 0.3 );

    } 

    this.curF ++;
    },

    generateTrigger: function() {

    this.randX = THREE.Math.randInt( 120, 240 );

  },

  generateHeightmap: function( dt_size ) {

    var data_arr = new Float32Array( dt_size * dt_size * 3 );
    var length = dt_size * dt_size;

    for ( var i = 0; i < length; i ++ ) {

      var val = THREE.Math.randFloat( 0, 1 );
      data_arr[ i * 3 + 0 ] = val;
      data_arr[ i * 3 + 1 ] = val;
      data_arr[ i * 3 + 2 ] = val;

    }

    var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
    texture.needsUpdate = true;
    return texture;

  },

    fragment: [
    "float $rand(vec2 co){",
      "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}",
        
    "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth) {",
        "vec2 p = uv;",
                "vec2 p2 = vec2( smoothstep(uvClamp.x, uvClamp.y, p.x),p.y);",
        "float xs = floor(gl_FragCoord.x / 0.5);",
        "float ys = floor(gl_FragCoord.y / 0.5);",
        //based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
        "vec4 normal = texture2D ($tDisp, p2 * $seed * $seed);",
        "if(p2.y < $distortion_x + $col_s && p2.y > $distortion_x - $col_s * $seed) {",
          "if($seed_x>0.){",
            "p.y = 1. - (p.y + $distortion_y);",
          "}",
          "else {",
            "p.y = $distortion_y;",
          "}",
        "}",
        "if(p2.x < $distortion_y + $col_s && p2.x > $distortion_y - $col_s * $seed) {",
          "if( $seed_y > 0.){",
            "p.x = $distortion_x;",
          "}",
          "else {",
            "p.x = 1. - (p.x + $distortion_x);",
          "}",
        "}",
        "p.x+=normal.x* $seed_x * ($seed/5.);",
        "p.y+=normal.y* $seed_y * ($seed/5.);",
        //base from RGB shift shader
        "vec2 offset = $amount * vec2( cos($angle), sin($angle));",
        "vec4 cr = textureVR(tDiffuse, p + offset);",
        "vec4 cga = textureVR(tDiffuse, p);",
        "vec4 cb = textureVR(tDiffuse, p - offset);",
        "color = vec4(cr.r, cga.g, cb.b, cga.a);",
        //add noise
        "vec4 snow = 200.*$amount*vec4($rand(vec2(xs * $seed,ys * $seed*50.))*0.2);",
        "color = color+ snow;",
    "}"
  ].join( "\n" )
});

/***/ }),
/* 12 */
/***/ (function(module, exports) {

// Ported from the shader in Three.js examples
// with the addition of a separate input pass

AFRAME.registerComponent("godrays", {
    schema: {
        "tint": { type: "color", default: "#FFFFFF" },
        "threshold": { type: "vec4", default: new THREE.Vector4(0,1,1) },
        "src": { type: "selector", default: null },
        "intensity": { default: 1 },
        "filter": { type: "array", default: [] },
        "ratio": { default: 0.25 }
  },

    init: function () {
        this.system = this.el.sceneEl.systems.effects;
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
    this.rtFilter = new THREE.WebGLRenderTarget( 1, 1, pars );
        this.rtTextureGodRays1 = new THREE.WebGLRenderTarget( 1, 1, pars );
    this.rtTextureGodRays2 = new THREE.WebGLRenderTarget( 1, 1, pars );
        
        this.exports = {
            filter: {
                includes: ["packing"],
                uniforms: {
                    "tint": { type: "c", value: new THREE.Color() },
                    "threshold": { type: "v2", value: new THREE.Vector2(0,1) },
                },
                depth: true, 
                fragment: [
                    "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth) {",
                    "   float v = viewZToOrthographicDepth(perspectiveDepthToViewZ(depth, cameraNear, cameraFar), cameraNear, cameraFar);",
                    "   color.rgb = vec3(smoothstep($threshold.x, $threshold.y, v)) * $tint;",
                    "}"
                ].join( "\n" ),
            },
            blur: {
                uniforms: {
                    step: { type:"f", value: 1.0 },
                    src: { type: "v3", value: new THREE.Vector3( 0.5, 0.5, 0. ) }
                },
                fragment: [
                    "void $main(inout vec4 color, vec4 orig, vec2 uv, float depth) {",
                        "vec2 center = vec2(mix(uvClamp.x, uvClamp.y, $src.x), $src.y);",
                        "vec2 delta = center - uv;",
                        "float dist = length( delta );",
                        "vec2 stepv = $step * delta / dist;",
                        "float iters = dist/$step;",
                        "vec4 col = vec4(0.0);",
                        "if ( 0.0 <= iters && uv.y < 1.0 ) col += textureVR( tDiffuse, uv );",
                        "uv += stepv;",
                        "if ( 1.0 <= iters && uv.y < 1.0 ) col += textureVR( tDiffuse, uv );",
                        "uv += stepv;",
                        "if ( 2.0 <= iters && uv.y < 1.0 ) col += textureVR( tDiffuse, uv );",
                        "uv += stepv;",
                        "if ( 3.0 <= iters && uv.y < 1.0 ) col += textureVR( tDiffuse, uv );",
                        "uv += stepv;",
                        "if ( 4.0 <= iters && uv.y < 1.0 ) col += textureVR( tDiffuse, uv );",
                        "uv += stepv;",
                        "if ( 5.0 <= iters && uv.y < 1.0 ) col += textureVR( tDiffuse, uv );",
                        "color = col/6.0;",
                    "}"

                ].join( "\n" )
            }
        }
        
        this.materialGodraysGenerate = this.system.fuse([this.exports.blur]);
        this.uniforms = {
            "intensity": { type: "f", value: 1 },
            "attenuation": {type: "f", value: 1 },
            "texture": { type: "t", value: this.rtTextureGodRays2 }
      };

        this.materialFilter = null;
        
        this.needsResize = true;
        this.system.register(this);
    },

    setSize: function (w,h) {
       w = Math.round(w * this.data.ratio);
       h = Math.round(h * this.data.ratio);
       this.rtTextureGodRays1.setSize(w,h);
       this.rtTextureGodRays2.setSize(w,h);
       this.rtFilter.setSize(w,h);
    },

    update: function (oldData) {
        this.exports.filter.uniforms.tint.value.set(this.data.tint);
        this.uniforms.intensity.value = this.data.intensity;
        if(this.data.filter !== oldData.filter) {
            if(this.materialFilter) this.materialFilter.dispose();
            this.materialFilter = this.system.fuse(this.data.filter.length ? this.data.filter : [this.exports.filter]);
        }
        this.bypass = this.data.src === null;
    },

    tock: function () {
        if (!this.system.isActive(this, true)) return;
        var self = this;
        
        this.system.tDiffuse.value = this.system.renderTarget.texture;
        this.system.renderPass(this.materialFilter, this.rtFilter, fn )

        var fn = function (material, camera, eye) {
            var cp3 = new THREE.Vector3(), cd3 = new THREE.Vector3();
            var v3 = self.exports.blur.uniforms[ "src" ].value;
            self.data.src.object3D.getWorldPosition(v3);
            camera.getWorldPosition(cp3);
            camera.getWorldDirection(cd3);
            cp3.sub(v3);
            cp3.normalize();
            cd3.normalize();
            self.uniforms.attenuation.value = Math.pow(Math.max(0, -cd3.dot(cp3)), 1.33);
            
            v3.project( camera );
            v3.set((v3.x + 1 ) / 2, (v3.y + 1 ) / 2, 0);
            
        };

        var filterLen = 1.0;
    var TAPS_PER_PASS = 6.0;
        
        var pass = 1.0;
        var stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );
        this.exports.blur.uniforms[ "step" ].value = stepLen;
        this.system[ "tDiffuse" ].value = this.rtFilter.texture;
        this.system.renderPass(this.materialGodraysGenerate, this.rtTextureGodRays2, fn )
        
        pass = 2.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );
        this.exports.blur.uniforms[ "step" ].value = stepLen;
        this.system[ "tDiffuse" ].value = this.rtTextureGodRays2.texture;
        this.system.renderPass(this.materialGodraysGenerate, this.rtTextureGodRays1, fn );
        
        pass = 3.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );
        this.exports.blur.uniforms[ "step" ].value = stepLen;
        this.system[ "tDiffuse" ].value = this.rtTextureGodRays1.texture;
        this.system.renderPass(this.materialGodraysGenerate, this.rtTextureGodRays2, fn )
    },

    remove: function () {
        this.rtTextureGodRays1.dispose();
        this.rtTextureGodRays2.dispose();
        this.rtFilter.dispose();

        this.materialGodraysGenerate.dispose();
        this.materialFilter.dispose();
        this.system.unregister(this);
    },

    diffuse: true,

    fragment: [
        "float $blendScreen(float base, float blend) {",
        "    return 1.0-((1.0-base)*(1.0-blend));",
        "}",

        "vec3 $blendScreen(vec3 base, vec3 blend) {",
        "    return vec3($blendScreen(base.r,blend.r),$blendScreen(base.g,blend.g),$blendScreen(base.b,blend.b));",
        "}",

        "vec3 $blendScreen(vec3 base, vec3 blend, float opacity) {",
      "    return ($blendScreen(base, blend) * opacity + base * (1.0 - opacity));",
        "}",

    "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth) {",
    "   vec4 texel = texture2D($texture, uv);",
        "   color.rgb = $blendScreen( color.rgb, texel.rgb, $intensity * $attenuation);",
        "}"
  ].join( "\n" )
});

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var SAOShader = __webpack_require__(14);
var DepthLimitedBlurShader = __webpack_require__(15);

AFRAME.registerComponent("ssao", {
    schema: {
        "samples": { type: "number", default: 16},
        "rings": { type: "number", default: 7 },
        "radius": { type: "number", default: 0.5 },
        "ratio": { default: 0.5 },
        "intensity": { default: 1.0 },
        "maxDepth": { default: 0.99 },
        "bias": { default: 0.05 },
        "scale": { default: 0.15 },
        "blurRadius": { default: 7 },
        "depthCutoff":  { default: 10 }
  },

    init: function () {
        this.system = this.el.sceneEl.systems.effects;
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        this.renderTargets = [];
    this.renderTargets.push(new THREE.WebGLRenderTarget( 1, 1, pars));
    this.renderTargets.push(new THREE.WebGLRenderTarget( 1, 1, pars));	
        this.uniforms = {
            "texture": { type: "t", value: this.renderTargets[0].texture },
            "intensity": { type: "f", value: 1.0 },
            "maxDepth": { type: "f", value: 0.99 },
            "depthCutoff": { type: "f", default: 1}
      };
        this.SAOMaterial = null;
        this.hBlurMaterial = null;
        this.vBlurMaterial = null;
        this.sizeUniform = { type: "v2", value: new THREE.Vector2()};
        this.system.register(this);
    },

    update: function (od) {
        var d = this.data, self=this;

        this.rebuild(d.rings !== od.rings || d.samples !== od.samples, d.blurRadius !== od.blurRadius);
        this.uniforms.depthCutoff.value = d.depthCutoff;
        this.uniforms.intensity.value = d.intensity;
        this.uniforms.maxDepth.value = d.maxDepth;
        this.SAOMaterial.uniforms.bias.value = d.bias;
        this.SAOMaterial.uniforms.scale.value = d.scale;
        this.SAOMaterial.uniforms.kernelRadius.value = d.radius;
        this.hBlurMaterial.uniforms.depthCutoff.value = d.depthCutoff;
        this.vBlurMaterial.uniforms.depthCutoff.value = d.depthCutoff;
    },

    rebuild: function (sao, blur) {
        var d = this.data;
        if(sao) {
            if (this.SAOMaterial) {
                this.SAOMaterial.dispose();
            }
            this.SAOMaterial = this.system.materialize(SAOShader(true));
      this.SAOMaterial.defines["RINGS"] = parseInt(d.rings) + ".";
      this.SAOMaterial.defines["SAMPLES"] = parseInt(d.samples) + ".";
      this.SAOMaterial.uniforms.cameraFar = this.system.cameraFar;
            this.SAOMaterial.uniforms.cameraNear = this.system.cameraNear;
        }
        if(blur) {
            if (this.hBlurMaterial) {
                this.hBlurMaterial.dispose();
                this.vBlurMaterial.dispose();
            }
            this.hBlurMaterial = this.system.materialize(DepthLimitedBlurShader(d.blurRadius, d.blurRadius/2, new THREE.Vector2(1,0)));
            this.vBlurMaterial = this.system.materialize(DepthLimitedBlurShader(d.blurRadius, d.blurRadius/2, new THREE.Vector2(0,1)));
            this.hBlurMaterial.uniforms.size = this.sizeUniform;
            this.vBlurMaterial.uniforms.size = this.sizeUniform;
            this.hBlurMaterial.uniforms.cameraFar = this.system.cameraFar;
            this.hBlurMaterial.uniforms.cameraNear = this.system.cameraNear;
            this.vBlurMaterial.uniforms.cameraFar = this.system.cameraFar;
            this.vBlurMaterial.uniforms.cameraNear = this.system.cameraNear;
        }
    },

    setSize: function(w, h) {
        w = Math.ceil(w * this.data.ratio);
        h = Math.ceil(h * this.data.ratio);
        
        this.sizeUniform.value.set(w,h);

        this.renderTargets.forEach(function (rt) {
            rt.setSize(w,h);
        });
    },

    tock: function (time) {
        if (!this.system.isActive(this, true)) return;
        //this.SAOMaterial.uniforms.randomSeed.value = Math.random();
        this.SAOMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.getInverse( this.el.sceneEl.camera.projectionMatrix );
    this.SAOMaterial.uniforms[ 'cameraProjectionMatrix' ].value = this.el.sceneEl.camera.projectionMatrix;
    
        this.SAOMaterial.uniforms.tDepth.value = this.el.sceneEl.renderTarget.depthTexture;
        this.system.renderPass(this.SAOMaterial, this.renderTargets[0], true);

    if(this.data.blurRadius) {
      this.hBlurMaterial.uniforms.tDiffuse.value = this.renderTargets[0].texture;
      this.system.renderPass(this.hBlurMaterial, this.renderTargets[1], true);

      this.vBlurMaterial.uniforms.tDiffuse.value = this.renderTargets[1].texture;
      this.system.renderPass(this.vBlurMaterial, this.renderTargets[0], true);
    }
  },

    remove: function () {
        this.SAOMaterial.dispose();
        this.hBlurMaterial.dispose();
        this.vBlurMaterial.dispose();
        this.renderTargets[0].dispose();
        this.renderTargets[1].dispose();
        this.system.unregister(this);
    },

    includes: ["packing"],

    depth: true,

    diffuse: true,
    
    fragment: [
        "float $unpackDepth(vec3 pack) {",
        "	float depth = dot( pack, 1.0 / vec3(1.0, 256.0, 256.0*256.0) );",
        "	return depth * (256.0*256.0*256.0) / (256.0*256.0*256.0 - 1.0);",
        "}",
    "void $main(inout vec4 color, vec4 origColor, vec2 uv, float depth) {",
    "   vec4 texel = texture2D($texture, uv);",
        "   float z = perspectiveDepthToViewZ( $unpackDepth(texel.xyz), cameraNear, cameraFar );",
        "   float Z = perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",
        "   color.rgb *= abs(z-Z) > $depthCutoff || Z >= $maxDepth * cameraFar ? 1.0  :  1.0 - texel.a * $intensity;",
        "}"
  ].join( "\n" )
});

/***/ }),
/* 14 */
/***/ (function(module, exports) {

/**
 * @author bhouston / http://clara.io/
 *
 * Scalable Ambient Occlusion
 *
 */

module.exports = function (isFirst) {
  return {
    defines: {},

    uniforms: {

      "tDepth":       { type: "t", value: null },
      
      "cameraNear":   { type: "f", value: 1 },
      "cameraFar":    { type: "f", value: 100 },
      "cameraProjectionMatrix": { type: "m4", value: new THREE.Matrix4() },
      "cameraInverseProjectionMatrix": { type: "m4", value: new THREE.Matrix4() },

      "scale":        { type: "f", value: 1.0 },
      "bias":         { type: "f", value: 0.5 },

      "minResolution": { type: "f", value: 0.0 },
      "kernelRadius": { type: "f", value: 0.5 },
      "randomSeed":   { type: "f", value: 0.0 },
      "maxDepth":   { type: "f", value: 1.0 }
    },

    vertexShader: [

      "varying vec2 vUv;",
      "void main() {",

        "vUv = uv;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

    ].join( "\n" ),

    fragmentShader: [

      // total number of samples at each fragment",
      
      "#include <common>",
      "#include <packing>",

      "varying vec2 vUv;",

      "uniform sampler2D tDepth;",

      "uniform float cameraNear;",
      "uniform float cameraFar;",
      "uniform mat4 cameraProjectionMatrix;",
      "uniform mat4 cameraInverseProjectionMatrix;",

      "uniform float scale;",
      "uniform float intensity;",
      "uniform float bias;",
      "uniform float kernelRadius;",
      "uniform float minResolution;",
      "uniform float randomSeed;",
      "uniform float maxDepth;",
      
      
      "float unpackDepth(vec3 pack) {",
      "	float depth = dot( pack, 1.0 / vec3(1.0, 256.0, 256.0*256.0) );",
        "	return depth * (256.0*256.0*256.0) / (256.0*256.0*256.0 - 1.0);",
      "}",
      
      "vec3 packDepth(float depth) {",
      "	float depthVal = depth * (256.0*256.0*256.0 - 1.0) / (256.0*256.0*256.0);",
         "	vec4 encode = fract( depthVal * vec4(1.0, 256.0, 256.0*256.0, 256.0*256.0*256.0) );",
        "	return encode.xyz - encode.yzw / 256.0 + 1.0/512.0;",
      "}",

      
      "float getViewZ( const in float depth ) {",

        "return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",

      "}",

      "vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {",

        "float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];",
        "vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );",
        "clipPosition *= clipW;", // unprojection.
        "return ( cameraInverseProjectionMatrix * clipPosition ).xyz;",

      "}",

      "vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {",

        "return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );",
      
      "}",

      "float scaleDividedByCameraFar;",
      "float minResolutionMultipliedByCameraFar;",

      "float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {",

        "vec3 viewDelta = sampleViewPosition - centerViewPosition;",
        "float viewDistance = length( viewDelta );",
        "float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;",
        "return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );",

      "}",

      // moving costly divides into consts
      "const float ANGLE_STEP = PI2 * RINGS / SAMPLES;",
      "const float INV_NUM_SAMPLES = 1.0 / SAMPLES;",

      "float getAmbientOcclusion( const in vec3 centerViewPosition) {",

        // precompute some variables require in getOcclusion.
        "scaleDividedByCameraFar = scale;",
        "minResolutionMultipliedByCameraFar = minResolution * cameraFar;",
        "vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );",

        // jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
        "float angle = rand( vUv + randomSeed ) * PI2;",
        "vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES );",
        "vec2 radiusStep = radius;",
        "float occlusionSum = 0.;",
        "float weightSum = 0.;",
        "for( int i = 0; i < int(SAMPLES); i ++ ) {",
          "vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;",
          "radius += radiusStep;",
          "angle += ANGLE_STEP;",

          "float sampleDepth = textureVR( tDepth, sampleUv ).x;",
          "if( sampleDepth >= ( 1.0 - EPSILON ) ) {",
            "continue;",
          "}",

          "float sampleViewZ = getViewZ( sampleDepth );",
          "vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );",
          "occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );",
          "weightSum += 1.0;",

        "}",

        "if( weightSum == 0.0 ) discard;",
        "return occlusionSum / weightSum;",
        
      "}",


      "void main() {",
        "vec4 texel = texture2D( tDepth, vUv );",
        "float centerDepth = texel.x;",
        
        "if( centerDepth >= ( maxDepth - EPSILON ) ) {",
          "discard;",
        "}",

        "float centerViewZ = getViewZ( centerDepth );",
        "vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );",

        "gl_FragColor =  vec4(packDepth(texel.x), getAmbientOcclusion( viewPosition));",
      "}"

    ].join( "\n" )

  };
}

/***/ }),
/* 15 */
/***/ (function(module, exports) {

/**
 * @author bhouston / http://clara.io
 *
 * For a horizontal blur, use X_STEP 1, Y_STEP 0
 * For a vertical blur, use X_STEP 0, Y_STEP 1
 *
 *
 */

// Adapted by wizgrav to pack depth and AO in a single rgba texture

THREE.BlurShaderUtils = {

  createSampleWeights: function( kernelRadius, stdDev ) {

    var gaussian = function( x, stdDev ) {
      return Math.exp( - ( x*x ) / ( 2.0 * ( stdDev * stdDev ) ) ) / ( Math.sqrt( 2.0 * Math.PI ) * stdDev );
    };

    var weights = [];

    for( var i = 0; i <= kernelRadius; i ++ ) {
      weights.push( gaussian( i, stdDev ) );
    }

    return weights;
  },

  createSampleOffsets: function( kernelRadius, uvIncrement ) {

    var offsets = [];

    for( var i = 0; i <= kernelRadius; i ++ ) {
      offsets.push( uvIncrement.clone().multiplyScalar( i ) );
    }

    return offsets;

  },

  configure: function( kernelRadius, stdDev, uvIncrement ) {
    return {
      'sampleUvOffsets': THREE.BlurShaderUtils.createSampleOffsets( kernelRadius, uvIncrement ),
      'sampleWeights': THREE.BlurShaderUtils.createSampleWeights( kernelRadius, stdDev )
    }
  }

};


module.exports =  function (radius, stdDev, uvIncrement) {
  radius = radius || 4;
  var config = THREE.BlurShaderUtils.configure(radius, stdDev, uvIncrement )
  return {
    defines: {

      "KERNEL_RADIUS": radius,

    },

    uniforms: {

      "tDiffuse":         { type: "t", value: null },
      "size":             { type: "v2", value: new THREE.Vector2( 512, 512 ) },
      "sampleUvOffsets":  { type: "v2v", value: config.sampleUvOffsets },
      "sampleWeights":    { type: "1fv", value: config.sampleWeights },
      "depthCutoff":      { type: "f", value: 10 },
      "cameraFar":      { type: "f", value: 1 },
      "cameraNear":      { type: "f", value: 1000 }
    },

    vertexShader: [

      "#include <common>",

      "uniform vec2 size;",

      "varying vec2 vUv;",
      "varying vec2 vInvSize;",

      "void main() {",

        "vUv = uv;",
        "vInvSize = 1.0 / size;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

    ].join( "\n" ),

    fragmentShader: [

      "#include <common>",
      "#include <packing>",

      "uniform sampler2D tDiffuse;",
      
      "uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];",
      "uniform float sampleWeights[ KERNEL_RADIUS + 1 ];",
      "uniform float depthCutoff;",
      "uniform float cameraFar;",
      "uniform float cameraNear;",

      "varying vec2 vUv;",
      "varying vec2 vInvSize;",
      
      "float unpackDepth(vec3 pack) {",
      "	float depth = dot( pack, 1.0 / vec3(1.0, 256.0, 256.0*256.0) );",
        "	return depth * (256.0*256.0*256.0) / (256.0*256.0*256.0 - 1.0);",
      "}",
      
      "float getViewZ( const in float depth ) {",

       "return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",

       "}",
      "void main() {",
        "vec4 texel = texture2D( tDiffuse, vUv );",
        "vec3 orig = texel.xyz;",
        "float depth = unpackDepth( orig );",
        "if( depth >= ( 1.0 - EPSILON ) ) {",
          "discard;",
        "}",
        "float centerViewZ = -getViewZ( depth );",
        "bool rBreak = false, lBreak = false;",

        "float weightSum = sampleWeights[0];",
        "float AOSum = texel.a * weightSum;",

        "for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {",

          "float sampleWeight = sampleWeights[i];",
          "vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;",

          "vec2 sampleUv = vUv + sampleUvOffset;",
          "texel = textureVR( tDiffuse, sampleUv );",
          "float viewZ = -getViewZ(unpackDepth( texel.xyz ));",

          "if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;",

          "if( ! rBreak ) {",
            "AOSum += texel.a * sampleWeight;",
            "weightSum += sampleWeight;",
          "}",

          "sampleUv = vUv - sampleUvOffset;",
          "texel = textureVR( tDiffuse, sampleUv );",
          "viewZ = -getViewZ(unpackDepth( texel.xyz ));",

          "if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;",

          "if( ! lBreak ) {",
            "AOSum += texel.a * sampleWeight;",
            "weightSum += sampleWeight;",
          "}",

        "}",

        "gl_FragColor = vec4(orig, AOSum / weightSum);",

      "}"

    ].join( "\n" )

};
}

/***/ }),
/* 16 */
/***/ (function(module, exports) {

AFRAME.registerComponent("lighty", {
  schema: {
    color: { type: "color", default: "#000000" },
    radius: { type: "number", default: 0 },
    decay: { type: "number", default: 1 }
  },
  
  init: function () {
    this.el.sceneEl.systems.effects.addLight(this);
  },
  
  remove: function () {
    this.el.sceneEl.systems.effects.removeLight(this);
  }
});

/***/ }),
/* 17 */
/***/ (function(module, exports) {

THREE.ShaderChunk[ 'lights_pars_maps' ] += [
  '#if defined TILED_FORWARD',
  'uniform vec4 tileData;',
  'uniform sampler2D tileTexture;',
  'uniform sampler2D lightTexture;',
  '#endif'
].join( '\n' );

THREE.ShaderChunk[ 'lights_fragment_maps' ] += [
  '',
  '#if defined TILED_FORWARD',
  'vec2 tUv = floor(gl_FragCoord.xy / tileData.xy * 32.) / 32. + tileData.zw;',
  'vec4 tile = texture2D(tileTexture, tUv);',
  'for (int i=0; i < 4; i++) {',
  '	float tileVal = tile.x * 255.;',
  '  	tile.xyzw = tile.yzwx;',
  '	if(tileVal == 0.){ continue; }',
  '  	float tileDiv = 128.;',
  '	for (int j=0; j < 8; j++) {',
  '  		if (tileVal < tileDiv) {  tileDiv *= 0.5; continue; }',
  '		tileVal -= tileDiv;',
  '		tileDiv *= 0.5;',
  '  		PointLight pointlight;',
  '		float uvx = (float(8 * i + j) + 0.5) / 32.;',
  '  		vec4 lightData = texture2D(lightTexture, vec2(uvx, 0.));',
  '  		vec4 lightColor = texture2D(lightTexture, vec2(uvx, 1.));',
  '  		pointlight.position = lightData.xyz;',
  '  		pointlight.distance = lightData.w;',
  '  		pointlight.color = lightColor.rgb;',
  '  		pointlight.decay = lightColor.a;',
  '  		getPointDirectLightIrradiance( pointlight, geometry, directLight );',
  '		RE_Direct( directLight, geometry, material, reflectedLight );',
  '	}',
  '}',
  '#endif'
].join( '\n' );

var utils = AFRAME.utils;

var CubeLoader = new THREE.CubeTextureLoader();
var texturePromises = {};

/**
 * Standard (physically-based) shader with tiled forward lighting.
 */
AFRAME.registerShader('standard-fx', {
  schema: {
    ambientOcclusionMap: {type: 'map'},
    ambientOcclusionMapIntensity: {default: 1},
    ambientOcclusionTextureOffset: {type: 'vec2'},
    ambientOcclusionTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    color: {type: 'color'},

    displacementMap: {type: 'map'},
    displacementScale: {default: 1},
    displacementBias: {default: 0.5},
    displacementTextureOffset: {type: 'vec2'},
    displacementTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},
    emissive: {type: 'color', default: '#000'},
    emissiveIntensity: {default: 1},
    envMap: {default: ''},

    fog: {default: true},
    height: {default: 256},

    metalness: {default: 0.0, min: 0.0, max: 1.0},
    metalnessMap: {type: 'map'},
    metalnessTextureOffset: {type: 'vec2'},
    metalnessTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    normalMap: {type: 'map'},
    normalScale: {type: 'vec2', default: {x: 1, y: 1}},
    normalTextureOffset: {type: 'vec2'},
    normalTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    offset: {type: 'vec2', default: {x: 0, y: 0}},
    repeat: {type: 'vec2', default: {x: 1, y: 1}},

    roughness: {default: 0.5, min: 0.0, max: 1.0},
    roughnessMap: {type: 'map'},
    roughnessTextureOffset: {type: 'vec2'},
    roughnessTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    sphericalEnvMap: {type: 'map'},
    src: {type: 'map'},
    width: {default: 512},
    wireframe: {default: false},
    wireframeLinewidth: {default: 2}
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.material = new THREE.MeshStandardMaterial(getMaterialData(data));
    utils.material.updateMap(this, data);
    if (data.normalMap) { utils.material.updateDistortionMap('normal', this, data); }
    if (data.displacementMap) { utils.material.updateDistortionMap('displacement', this, data); }
    if (data.ambientOcclusionMap) { utils.material.updateDistortionMap('ambientOcclusion', this, data); }
    if (data.metalnessMap) { utils.material.updateDistortionMap('metalness', this, data); }
    if (data.roughnessMap) { utils.material.updateDistortionMap('roughness', this, data); }
    this.updateEnvMap(data);
  this.material.onBeforeCompile = function ( shader ) {
    shader.uniforms.tileData = State.tileData;
    shader.uniforms.tileTexture = State.tileTexture;
    shader.uniforms.lightTexture = State.lightTexture;
    shader.defines[ 'TILED_FORWARD' ] = 1;  
  }
  },

  update: function (data) {
    this.updateMaterial(data);
    utils.material.updateMap(this, data);
    if (data.normalMap) { utils.material.updateDistortionMap('normal', this, data); }
    if (data.displacementMap) { utils.material.updateDistortionMap('displacement', this, data); }
    if (data.ambientOcclusionMap) { utils.material.updateDistortionMap('ambientOcclusion', this, data); }
    if (data.metalnessMap) { utils.material.updateDistortionMap('metalness', this, data); }
    if (data.roughnessMap) { utils.material.updateDistortionMap('roughness', this, data); }
    this.updateEnvMap(data);
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   * @returns {object} Material.
   */
  updateMaterial: function (data) {
    var material = this.material;
    data = getMaterialData(data);
    Object.keys(data).forEach(function (key) {
      material[key] = data[key];
    });
  },

  /**
   * Handle environment cubemap. Textures are cached in texturePromises.
   */
  updateEnvMap: function (data) {
    var self = this;
    var material = this.material;
    var envMap = data.envMap;
    var sphericalEnvMap = data.sphericalEnvMap;

    // No envMap defined or already loading.
    if ((!envMap && !sphericalEnvMap) || this.isLoadingEnvMap) {
      material.envMap = null;
      material.needsUpdate = true;
      return;
    }
    this.isLoadingEnvMap = true;

    // if a spherical env map is defined then use it.
    if (sphericalEnvMap) {
      this.el.sceneEl.systems.material.loadTexture(sphericalEnvMap, {src: sphericalEnvMap}, function textureLoaded (texture) {
        self.isLoadingEnvMap = false;
        texture.mapping = THREE.SphericalReflectionMapping;
        material.envMap = texture;
        utils.material.handleTextureEvents(self.el, texture);
        material.needsUpdate = true;
      });
      return;
    }

    // Another material is already loading this texture. Wait on promise.
    if (texturePromises[envMap]) {
      texturePromises[envMap].then(function (cube) {
        self.isLoadingEnvMap = false;
        material.envMap = cube;
        utils.material.handleTextureEvents(self.el, cube);
        material.needsUpdate = true;
      });
      return;
    }

    // Material is first to load this texture. Load and resolve texture.
    texturePromises[envMap] = new Promise(function (resolve) {
      utils.srcLoader.validateCubemapSrc(envMap, function loadEnvMap (urls) {
        CubeLoader.load(urls, function (cube) {
          // Texture loaded.
          self.isLoadingEnvMap = false;
          material.envMap = cube;
          utils.material.handleTextureEvents(self.el, cube);
          resolve(cube);
        });
      });
    });
  }
});

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @returns {object} data - Processed material data.
 */
function getMaterialData (data) {
  var newData = {
    color: new THREE.Color(data.color),
    emissive: new THREE.Color(data.emissive),
    emissiveIntensity: data.emissiveIntensity,
    fog: data.fog,
    metalness: data.metalness,
    roughness: data.roughness,
    wireframe: data.wireframe,
    wireframeLinewidth: data.wireframeLinewidth
  };

  if (data.normalMap) { newData.normalScale = data.normalScale; }

  if (data.ambientOcclusionMap) { newData.aoMapIntensity = data.ambientOcclusionMapIntensity; }

  if (data.displacementMap) {
    newData.displacementScale = data.displacementScale;
    newData.displacementBias = data.displacementBias;
  }

  return newData;
}

/***/ })
/******/ ]);