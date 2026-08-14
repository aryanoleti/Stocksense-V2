import * as THREE from "three";

/* Minimal one-pass post pipeline: scene renders to a target, then a single
   fullscreen quad applies chromatic aberration + grain + scanlines + vignette.
   One pass instead of an EffectComposer chain keeps the cost predictable;
   low-tier devices skip post entirely. */
export class PostPass {
  private target: THREE.WebGLRenderTarget;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private material: THREE.ShaderMaterial;

  constructor(width: number, height: number) {
    this.target = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: this.target.texture },
        uTime: { value: 0 },
        uAberration: { value: 0.0015 },
        uGrain: { value: 0.05 },
        uVignette: { value: 0.32 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tScene;
        uniform float uTime;
        uniform float uAberration;
        uniform float uGrain;
        uniform float uVignette;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vec2 centered = vUv - 0.5;
          float dist = length(centered);
          // Radial chromatic aberration, stronger at the edges. uAberration is
          // already a UV offset — scaling it up splits bright objects into
          // separate red/green/blue copies instead of fringing their edges.
          vec2 dir = centered * uAberration * (1.0 + dist * 3.0);
          float r = texture2D(tScene, vUv + dir).r;
          float g = texture2D(tScene, vUv).g;
          float b = texture2D(tScene, vUv - dir).b;
          vec3 col = vec3(r, g, b);
          // film grain, re-seeded each frame
          col += (hash(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 61.7) - 0.5) * uGrain;
          // faint scanlines
          col *= 1.0 - 0.03 * sin(vUv.y * 900.0);
          // vignette
          col *= 1.0 - smoothstep(0.35, 0.9, dist) * uVignette;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
  }

  setSize(width: number, height: number): void {
    this.target.setSize(width, height);
  }

  /* aberration boost (0..1) is driven by scroll velocity for a frost-drift feel */
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, t: number, boost: number): void {
    this.material.uniforms.uTime.value = t;
    // ~0.5% of the frame at rest, up to ~2% at speed: visible as a cold fringe
    this.material.uniforms.uAberration.value = 0.005 + boost * 0.014;
    this.material.uniforms.uGrain.value = 0.03 + boost * 0.035;
    renderer.setRenderTarget(this.target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.target.dispose();
    this.material.dispose();
  }
}
