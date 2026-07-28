"use client";

export function ShaderLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="shader-line shader-line-1" />
      <div className="shader-line shader-line-2" />
      <div className="shader-line shader-line-3" />
    </div>
  );
}

export function ShaderLinesAlt() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="shader-line shader-line-4" />
      <div className="shader-line shader-line-5" />
    </div>
  );
}
