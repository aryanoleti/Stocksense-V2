import * as THREE from "three";

/* One shared atmosphere for every custom shader in the world.

   three's scene.fog only reaches its own materials — a raw ShaderMaterial
   ignores it entirely, which leaves hand-written ice sitting in front of the
   mist instead of inside it. These uniform OBJECTS are shared by reference
   across every material, so one write per frame re-tints the whole world. */
export const fogUniforms = {
  uFogColor: { value: new THREE.Color("#dcedf6") },
  uFogDensity: { value: 0.06 },
};

export const FOG_VERT_DECL = /* glsl */ `varying float vFogDepth;`;
/* call after `mv` (the model-view position) is computed */
export const FOG_VERT_BODY = /* glsl */ `vFogDepth = -mv.z;`;

export const FOG_FRAG_DECL = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying float vFogDepth;
  float fogFactor() {
    // matches three's FogExp2 curve so points and meshes agree
    float f = 1.0 - exp(-uFogDensity * uFogDensity * vFogDepth * vFogDepth);
    return clamp(f, 0.0, 1.0);
  }
`;

/* Opaque surfaces fade toward the fog colour... */
export const FOG_FRAG_APPLY = /* glsl */ `col = mix(col, uFogColor, fogFactor());`;
/* ...additive ones fade to nothing, since adding fog colour would brighten
   them into the mist rather than hiding them behind it. */
export const FOG_FRAG_APPLY_ADDITIVE = /* glsl */ `col *= (1.0 - fogFactor());`;
