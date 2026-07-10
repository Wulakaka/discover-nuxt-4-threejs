uniform float uFresnelPower;
uniform float uFresnelStrength;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {

  float fresnel = pow(1.0 - dot(vNormal, vViewDir), uFresnelPower) * uFresnelStrength;

  gl_FragColor = vec4(1.0, 1.0, 1.0, fresnel);
}