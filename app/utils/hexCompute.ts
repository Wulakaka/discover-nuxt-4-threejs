import {
  Fn,
  abs,
  dot,
  float,
  floor,
  fract,
  max,
  select,
  sin,
  smoothstep,
  time,
  uniform,
  vec2,
  vec4,
} from "three/tsl";

export interface HexComputeOptions {
  hexScale?: number;
  edgeWidth?: number;
  flashSpeed?: number;
  flashIntensity?: number;
}

/**
 * Creates reusable TSL functions that can be compiled to WGSL by WebGPURenderer.
 *
 * The functions are valid in both material node graphs and `Fn().compute()`
 * compute graphs.
 */
export function createHexCompute({
  hexScale = 1,
  edgeWidth = 0.05,
  flashSpeed = 1,
  flashIntensity = 1,
}: HexComputeOptions = {}) {
  const uHexScale = uniform(hexScale);
  const uEdgeWidth = uniform(edgeWidth);
  const uFlashSpeed = uniform(flashSpeed);
  const uFlashIntensity = uniform(flashIntensity);

  const hexPattern = Fn(([position]: [ReturnType<typeof vec2>]) => {
    const p = vec2(position).mul(uHexScale);
    const size = vec2(1, 1.7320508);
    const candidates = vec4(p, p.sub(vec2(0.5, 1)))
      .div(size.xyxy)
      .floor()
      .add(0.5);
    const offsets = vec4(
      p.sub(candidates.xy.mul(size)),
      p.sub(candidates.zw.add(0.5).mul(size)),
    );
    const cell = select(
      dot(offsets.xy, offsets.xy).lessThan(dot(offsets.zw, offsets.zw)),
      offsets.xy,
      offsets.zw,
    );
    const absoluteCell = abs(cell);
    const distance = max(dot(absoluteCell, size.mul(0.5)), absoluteCell.x);

    return smoothstep(float(0.5).sub(uEdgeWidth), 0.5, distance);
  });

  const hexCellId = Fn(([position]: [ReturnType<typeof vec2>]) => {
    const p = vec2(position).mul(uHexScale);
    const size = vec2(1, 1.7320508);
    const candidates = floor(vec4(p, p.sub(vec2(0.5, 1))).div(size.xyxy)).add(
      0.5,
    );
    const offsets = vec4(
      p.sub(candidates.xy.mul(size)),
      p.sub(candidates.zw.add(0.5).mul(size)),
    );

    return select(
      dot(offsets.xy, offsets.xy).lessThan(dot(offsets.zw, offsets.zw)),
      candidates.xy,
      candidates.zw.add(0.5),
    );
  });

  const cellFlash = Fn(([cellId]: [ReturnType<typeof vec2>]) => {
    const random = fract(sin(dot(cellId, vec2(127.1, 311.7))).mul(43758.5453));
    const phase = random.mul(6.2831);
    const speed = random.mul(1.5).add(0.5);

    return smoothstep(
      0.6,
      1,
      sin(time.mul(uFlashSpeed).mul(speed).add(phase)),
    ).mul(uFlashIntensity);
  });

  return {
    uniforms: {
      uHexScale,
      uEdgeWidth,
      uFlashSpeed,
      uFlashIntensity,
    },
    hexPattern,
    hexCellId,
    cellFlash,
  };
}
