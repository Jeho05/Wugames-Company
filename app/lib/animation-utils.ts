/**
 * Animation utility functions for interpolation and clip-path calculations
 */

import type { ClipFrame } from './animation-config';

/**
 * Linear interpolation between two values
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Progress value between 0 and 1
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Mix two clip frames with linear interpolation
 * @param frame1 - Starting frame
 * @param frame2 - Ending frame
 * @param t - Progress value between 0 and 1
 * @returns Interpolated frame
 */
export function mixClip(frame1: ClipFrame, frame2: ClipFrame, t: number): ClipFrame {
  return {
    top: lerp(frame1.top, frame2.top, t),
    right: lerp(frame1.right, frame2.right, t),
    bottom: lerp(frame1.bottom, frame2.bottom, t),
    left: lerp(frame1.left, frame2.left, t),
    radius: lerp(frame1.radius, frame2.radius, t),
  };
}

/**
 * Generate CSS inset() string from clip frame
 * @param frame - Clip frame with percentage values
 * @returns CSS inset() string
 */
export function clipToCss(frame: ClipFrame): string {
  return `inset(${frame.top}% ${frame.right}% ${frame.bottom}% ${frame.left}% round ${frame.radius}px)`;
}

/**
 * Calculate clip-path value at a specific scroll progress
 * @param progress - Scroll progress value between 0 and 1
 * @param startFrame - Initial clip frame
 * @param midFrame - Mid-transition clip frame (default transition at 0.68)
 * @param openFrame - Fully open clip frame
 * @param expansionPoint - Progress value where expansion begins (default 0.68)
 * @returns CSS clip-path inset() string
 */
export function clipAt(
  progress: number,
  startFrame: ClipFrame,
  midFrame?: ClipFrame,
  openFrame?: ClipFrame,
  expansionPoint: number = 0.68
): string {
  // Default mid and open frames if not provided
  const mid = midFrame || {
    top: 30,
    right: 2,
    bottom: 2,
    left: 2,
    radius: 12,
  };
  
  const open = openFrame || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    radius: 0,
  };

  if (progress < expansionPoint) {
    // First phase: start → mid
    const t = progress / expansionPoint;
    const frame = mixClip(startFrame, mid, t);
    return clipToCss(frame);
  } else {
    // Second phase: mid → open
    const t = (progress - expansionPoint) / (1 - expansionPoint);
    const frame = mixClip(mid, open, t);
    return clipToCss(frame);
  }
}

/**
 * Compute stagger delays for an array of elements
 * @param elementCount - Number of elements to stagger
 * @param staggerMs - Delay between elements in milliseconds
 * @param baseDelay - Initial delay before first element (default 0)
 * @returns Array of delay values in milliseconds
 */
export function computeStaggerDelays(
  elementCount: number,
  staggerMs: number,
  baseDelay: number = 0
): number[] {
  return Array.from({ length: elementCount }, (_, i) => baseDelay + i * staggerMs);
}

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Ease-in-out cubic easing function
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
