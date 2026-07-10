varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjPos;

void main() {

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
  vNormal = modelNormal.xyz;
  vViewDir = normalize(modelPosition.xyz - cameraPosition);

  vObjPos = modelPosition.xyz;

  gl_Position = projectionPosition;
}
