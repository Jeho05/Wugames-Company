# Design Document: Vitrine Hero Animations

## Overview

This design document describes the architecture and implementation strategy for enhancing the WUGAMS showcase page (`/vitrine`) with advanced hero animations, micro-interactions, Lottie effects, and modern UI/UX animations. The system will create an immersive, scroll-driven experience while maintaining 60fps performance and full accessibility compliance.

### Goals

- **Immersive Experience**: Create scroll-choreographed animations that tell a visual story about WUGAMS capabilities
- **Performance**: Maintain 60fps across devices with performance budgets under 200ms initialization
- **Accessibility**: Full support for `prefers-reduced-motion` with graceful fallbacks
- **Maintainability**: Modular, reusable animation components with clear separation of concerns

### Technology Stack

The project already includes the following animation libraries:
- **Motion (v12.42.2)**: React animation library (formerly Framer Motion) for declarative animations
- **GSAP (v3.15.0)**: High-performance JavaScript animation library for complex sequences
- **Three.js (v0.185.1)**: 3D rendering library for WebGL-based background effects
- **Next.js (v16.2.10)**: React framework with App Router architecture

Additional library to be added:
- **@lottiefiles/dotlottie-react** or **@lottiefiles/react-lottie-player**: For vector animation playback

### Design Principles

1. **Progressive Enhancement**: Core content accessible without JavaScript; animations enhance the experience
2. **Performance First**: GPU-accelerated transforms, lazy loading, and efficient cleanup
3. **Accessibility by Default**: Reduced motion preferences respected at every animation layer
4. **Responsive Adaptation**: Animation complexity adjusts based on viewport size and device capabilities

## Architecture

### Component Hierarchy

```
/vitrine (page)
├── EnhancedHeroSection (new)
│   ├── ThreeBackgroundScene (enhanced from existing)
│   ├── GradientMesh (existing component)
│   ├── AnimatedHeroContent (new)
│   │   ├── StaggeredText (new)
│   │   └── LottieIcon (new)
│   └── ScrollProgressIndicator (new)
├── StaggeredSection (new wrapper)
│   └── Existing content sections
└── Existing footer
```

### Animation System Layers

The animation system is organized into three distinct layers:

#### Layer 1: Background Effects (Three.js)
- **Responsibility**: Immersive 3D background rendering
- **Components**: Star fields, nebula, mountains, atmospheric effects
- **Performance Strategy**: Render on a single canvas, update via `requestAnimationFrame`
- **Fallback**: Static gradient background for low-end devices or reduced motion

#### Layer 2: Scroll Choreography (Motion)
- **Responsibility**: Scroll-driven hero transformations and content reveals
- **Components**: Hero expansion, clip-path animations, opacity transitions
- **Performance Strategy**: Use `useScroll` with optimized scroll listeners, transform/opacity only
- **Fallback**: Static positioning with immediate visibility

#### Layer 3: Micro-Interactions (GSAP + Motion)
- **Responsibility**: UI feedback on hover, click, and element entry
- **Components**: Button hover states, card lift effects, staggered text reveals
- **Performance Strategy**: Hardware-accelerated CSS properties, minimal DOM manipulation
- **Fallback**: CSS-only hover states

### State Management Strategy

Animation state is managed locally within components using React hooks:

```typescript
// Animation readiness state
const [isReady, setIsReady] = useState(false);

// Scroll progress tracking
const { scrollYProgress } = useScroll({ target: ref, offset: [...] });

// Reduced motion detection
const prefersReducedMotion = useReducedMotion();

// Three.js scene refs (non-reactive)
const sceneRef = useRef<THREE.Scene | null>(null);
const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
```

State flows:
1. **Component Mount** → Initialize animation systems → Set `isReady` → Trigger entrance animations
2. **User Scroll** → Update `scrollYProgress` → Interpolate animation values → Render frame
3. **Component Unmount** → Cleanup event listeners → Dispose Three.js resources → Cancel animation frames

## Components and Interfaces

### EnhancedHeroSection Component

**Purpose**: Orchestrates all hero section animations including 3D background, gradient mesh, and content animations.

**Props Interface**:
```typescript
interface EnhancedHeroSectionProps {
  title: string;
  subtitle: { line1: string; line2: string };
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  proof?: React.ReactNode;
  backgroundSrc: string;
  enable3D?: boolean; // Default: true
  enableLottie?: boolean; // Default: true
  lottieAnimationUrl?: string;
}
```

**Key Responsibilities**:
- Coordinate 3D background scene initialization
- Manage scroll progress and coordinate layer animations
- Handle responsive viewport detection
- Provide reduced motion fallbacks

**Animation Timeline**:
1. **0-500ms**: 3D scene initialization, gradient mesh render
2. **500-1500ms**: Character-by-character title reveal (GSAP)
3. **1000-2000ms**: Subtitle fade-in with vertical translation
4. **0-68% scroll**: Hero clip-path transformation (cinematic frame → mid-frame)
5. **68-100% scroll**: Full-screen expansion with content fade-out

### StaggeredText Component

**Purpose**: Animates text character-by-character or word-by-word with staggered timing.

**Props Interface**:
```typescript
interface StaggeredTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'p' | 'span'; // Default: 'span'
  stagger?: number; // Delay between characters in ms (default: 50)
  duration?: number; // Animation duration per character in ms (default: 800)
  className?: string;
  delay?: number; // Initial delay before animation starts (default: 0)
}
```

**Implementation Strategy**:
- Split text into individual characters using `.split('')`
- Wrap each character in a `<span>` with `display: inline-block`
- Use GSAP timeline with `stagger` for sequential animation
- Apply `y: 200, opacity: 0` → `y: 0, opacity: 1` transform
- Respect `prefersReducedMotion` by skipping animation

### LottieAnimation Component

**Purpose**: Lazy-load and render Lottie animations with intersection observer and accessibility support.

**Props Interface**:
```typescript
interface LottieAnimationProps {
  src: string; // URL or path to .lottie or .json file
  autoplay?: boolean; // Default: true
  loop?: boolean; // Default: true
  className?: string;
  fallbackSrc?: string; // Static image fallback
  onLoad?: () => void;
  onError?: () => void;
}
```

**Implementation Strategy**:
- Use `@lottiefiles/react-lottie-player` library
- Lazy load animation data with dynamic import
- Detect viewport entry with `IntersectionObserver` (10% threshold)
- Pause animation when out of viewport to save CPU
- Display static fallback for `prefers-reduced-motion` users

**Example Usage**:
```tsx
<LottieAnimation
  src="/animations/hero-icon.json"
  className="w-16 h-16"
  fallbackSrc="/images/hero-icon.png"
  loop={true}
/>
```

### ScrollProgressIndicator Component

**Purpose**: Visual feedback showing scroll progress through hero section.

**Props Interface**:
```typescript
interface ScrollProgressIndicatorProps {
  progress: MotionValue<number>; // 0-1 scroll progress
  className?: string;
}
```

**Implementation Strategy**:
- Position fixed at bottom center of viewport
- Progress bar width driven by `progress` motion value
- Gradient fill: amber (#e3a641) → blue (#426b95)
- Fade out when `progress > 1.0` (past hero section)
- Hide immediately for `prefers-reduced-motion` users

### StaggeredSection Component

**Purpose**: Wrapper component that triggers staggered entrance animations for child elements.

**Props Interface**:
```typescript
interface StaggeredSectionProps {
  children: React.ReactNode;
  stagger?: number; // Delay between elements in ms (default: 100)
  threshold?: number; // IntersectionObserver threshold (default: 0.1)
  once?: boolean; // Animate only once (default: true)
  className?: string;
}
```

**Implementation Strategy**:
- Use `IntersectionObserver` to detect viewport entry
- Select direct children and apply staggered animations
- Transform: `y: 50, opacity: 0` → `y: 0, opacity: 1`
- GSAP timeline with 80-120ms stagger delay
- Skip animation for `prefers-reduced-motion`

### GradientMesh Component (Existing - Enhanced)

**Current State**: Already implemented in `app/components/branding/gradient-mesh.tsx` with:
- Three overlapping gradient orbs with different colors
- Slow translation and scale animations (15-20s cycles)
- Motion library with `useReducedMotion` support

**Enhancements**:
- None required; existing implementation meets requirements
- Component will be reused in `EnhancedHeroSection`

### ThreeBackgroundScene Component (Enhanced)

**Current State**: Already implemented in `app/components/ui/horizon-hero-section.tsx` with:
- Star field with shader materials
- Nebula with custom GLSL shaders
- Mountain layers with distance fog
- Atmospheric effects
- Camera movement based on scroll
- Bloom post-processing

**Enhancements Required**:
1. **Performance Monitoring**: Add FPS counter in development mode
2. **Device Detection**: Reduce complexity on low-end devices (check `navigator.hardwareConcurrency`)
3. **Graceful Degradation**: Static background fallback when WebGL unavailable
4. **Cleanup Validation**: Ensure all geometries, materials, and textures properly disposed

## Data Models

### Animation Configuration

```typescript
interface AnimationConfig {
  heroAnimation: {
    clipPathFrames: {
      compact: ClipFrame;
      wide: ClipFrame;
      mid: ClipFrame;
      open: ClipFrame;
    };
    scrollMilestones: {
      heroExpansion: number; // 0.68
      contentFadeOut: number; // 0.55
    };
    textAnimation: {
      titleStagger: number; // 50ms
      titleDuration: number; // 1500ms
      subtitleDelay: number; // 800ms
      subtitleDuration: number; // 1000ms
    };
  };
  microInteractions: {
    buttonHover: {
      scale: number; // 1.05
      duration: number; // 150ms
    };
    cardHover: {
      y: number; // -2px
      shadowIntensity: number; // 15
      duration: number; // 200ms
    };
  };
  three: {
    camera: {
      fov: number; // 75
      near: number; // 0.1
      far: number; // 2000
      positions: Array<{ x: number; y: number; z: number }>;
    };
    bloom: {
      strength: number; // 0.6
      radius: number; // 0.3
      threshold: number; // 0.85
    };
    performance: {
      maxPixelRatio: number; // 2
      targetFPS: number; // 60
    };
  };
  lottie: {
    lazyLoadThreshold: number; // 0.1 (10% in viewport)
    autoplay: boolean;
    defaultLoop: boolean;
  };
}
```

### ClipFrame Model

```typescript
interface ClipFrame {
  top: number; // Percentage
  right: number; // Percentage
  bottom: number; // Percentage
  left: number; // Percentage
  radius: number; // Pixels
}
```

This model defines the clip-path inset values at different animation states for the hero expansion effect.

### LottieAsset Model

```typescript
interface LottieAsset {
  id: string;
  url: string;
  fallbackImage: string;
  preload: boolean; // Whether to preload on page load
  metadata: {
    width: number;
    height: number;
    duration: number; // Animation duration in seconds
    fileSize: number; // Bytes
  };
}
```

### Three.js Scene State

```typescript
interface ThreeSceneState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  
  // Scene objects
  stars: THREE.Points[];
  nebula: THREE.Mesh | null;
  mountains: THREE.Mesh[];
  atmosphere: THREE.Mesh | null;
  
  // Animation state
  animationId: number | null;
  targetCameraPosition: { x: number; y: number; z: number };
  mountainBasePositions: number[];
  
  // Performance
  isReady: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Scroll Interpolation Produces Valid Transformation Values

*For any* scroll progress value between 0 and 1, the interpolation functions SHALL produce valid CSS transformation values (clip-path inset percentages, scale factors, opacity values) that do not cause rendering errors or out-of-bounds values.

**Validates: Requirements 1.2, 9.3**

### Property 2: Reduced Motion Disables All Animated Transitions

*For any* animation component or configuration, when `prefers-reduced-motion` is enabled, the component SHALL either display static content immediately or use only opacity transitions without transforms, ensuring no motion-based animations occur.

**Validates: Requirements 1.6, 2.5, 3.6, 4.5, 5.6, 6.5**

### Property 3: Animation Cleanup Is Complete On Unmount

*For any* animation component that registers event listeners, animation frames, or Three.js resources, unmounting the component SHALL trigger complete cleanup (removeEventListener calls, cancelAnimationFrame, dispose() on geometries/materials/textures/renderers) to prevent memory leaks.

**Validates: Requirements 8.3, 9.5**

### Property 4: Viewport Size Determines Animation Configuration

*For any* viewport width, the animation system SHALL select the appropriate configuration variant (compact vs wide clip-path frames, simplified vs full animation sequences) based on breakpoint thresholds, ensuring responsive adaptation.

**Validates: Requirements 10.1, 10.3**

### Property 5: Staggered Animation Delays Are Correctly Computed

*For any* array of elements to be animated with stagger, the computed animation delay for element at index `i` SHALL equal `baseDelay + (i * staggerInterval)`, ensuring predictable sequential animation timing.

**Validates: Requirements 4.1, 6.1**

### Property 6: Scroll Progress Indicator Width Reflects Scroll Position

*For any* scroll position value `p` between 0 and 1, the scroll progress indicator width SHALL be `p * 100%`, providing accurate visual feedback of scroll progress through the hero section.

**Validates: Requirements 7.2**

### Property 7: Animation Once Prevents Re-Animation

*For any* content section with `once: true` animation configuration, triggering the entrance animation SHALL mark the section as animated, and subsequent viewport entries SHALL not trigger the animation again, ensuring idempotent behavior.

**Validates: Requirements 4.4**

### Property 8: GPU-Accelerated Properties Only

*For any* animation configuration object, the animated CSS properties SHALL be limited to `transform`, `opacity`, and `filter` to ensure GPU acceleration and avoid layout thrashing.

**Validates: Requirements 8.2**

### Property 9: Lottie Load Failure Shows Fallback

*For any* Lottie animation component with a specified fallback image, if the animation file fails to load, the component SHALL render the fallback image instead, ensuring graceful degradation.

**Validates: Requirements 3.4**

### Property 10: Low-Performance Devices Get Simplified Rendering

*For any* device with `navigator.hardwareConcurrency` below a threshold (e.g., 4 cores) or when WebGL is unavailable, the animation system SHALL reduce 3D scene complexity or use 2D fallback rendering to maintain acceptable performance.

**Validates: Requirements 9.6, 11.4**

### Property 11: Gradient Mesh Opacity Within Valid Range

*For any* gradient mesh orb configuration, the opacity value SHALL be between 0.15 and 0.25 inclusive, ensuring visual subtlety without being invisible or overpowering.

**Validates: Requirements 5.5**

### Property 12: Window Resize Updates Animation Parameters

*For any* viewport size change event, the animation system SHALL recalculate responsive parameters (clip-path frames, breakpoint detection, camera aspect ratio) and apply them to ongoing animations without visual glitches.

**Validates: Requirements 12.5**



## Error Handling

### Animation Initialization Failures

**Scenario**: Three.js renderer fails to initialize due to WebGL unavailability or browser restrictions.

**Handling Strategy**:
```typescript
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  // ... initialize scene
} catch (error) {
  console.warn('Three.js initialization failed, using 2D fallback', error);
  setPerformanceMode('fallback');
  // Render static gradient background instead
}
```

**User Impact**: Users see a static gradient background instead of 3D effects. Content remains fully accessible.

### Lottie Loading Failures

**Scenario**: Lottie animation file fails to load due to network error, invalid JSON, or CORS issues.

**Handling Strategy**:
```typescript
<LottieAnimation
  src="/animations/hero.json"
  fallbackSrc="/images/hero-icon.png"
  onError={(error) => {
    console.warn('Lottie failed to load, showing fallback', error);
    // Fallback image automatically displayed by component
  }}
/>
```

**User Impact**: Users see a static fallback image. The page remains visually complete.

### Performance Degradation

**Scenario**: Animation frame rate drops below 30fps on low-end devices.

**Handling Strategy**:
```typescript
let frameCount = 0;
let lastTime = performance.now();

function animate() {
  const now = performance.now();
  frameCount++;
  
  if (now - lastTime >= 1000) {
    const fps = frameCount;
    frameCount = 0;
    lastTime = now;
    
    if (fps < 30 && performanceMode === 'high') {
      console.warn('Low FPS detected, reducing animation complexity');
      setPerformanceMode('low');
      reduceParticleCount();
      disableBloom();
    }
  }
  
  // ... render frame
  requestAnimationFrame(animate);
}
```

**User Impact**: Animation complexity automatically reduces to maintain smooth experience.

### Memory Leaks Prevention

**Scenario**: Component unmounts without cleaning up animation resources.

**Handling Strategy**:
```typescript
useEffect(() => {
  // Initialize animations
  const timeline = gsap.timeline();
  const observer = new IntersectionObserver(handleIntersect);
  
  return () => {
    // Cleanup on unmount
    timeline.kill();
    observer.disconnect();
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };
}, []);
```

**User Impact**: Prevents memory accumulation during navigation, ensuring smooth multi-page sessions.

### GSAP Timeline Errors

**Scenario**: GSAP animation targets elements that don't exist in the DOM.

**Handling Strategy**:
```typescript
useEffect(() => {
  if (!titleRef.current || !isReady) return;
  
  const chars = titleRef.current.querySelectorAll('.title-char');
  if (chars.length === 0) {
    console.warn('No title characters found, skipping animation');
    return;
  }
  
  const tl = gsap.timeline();
  tl.from(chars, { y: 200, opacity: 0, stagger: 0.05 });
  
  return () => tl.kill();
}, [isReady]);
```

**User Impact**: Animation gracefully skips if elements are missing. Content still displays correctly.

### Scroll Event Throttling Failure

**Scenario**: Scroll events fire too rapidly, causing performance issues.

**Handling Strategy**:
- Motion library's `useScroll` hook handles throttling internally
- For custom scroll handlers, use `passive: true` listeners
- Perform calculations in `requestAnimationFrame` to sync with render cycle

```typescript
window.addEventListener('scroll', handleScroll, { passive: true });
```

**User Impact**: Smooth scrolling experience even during rapid scroll events.

## Testing Strategy

### Unit Tests

Unit tests focus on pure functions, configuration validation, and component logic without browser dependencies.

**Test Framework**: Vitest with React Testing Library

**Key Test Areas**:

1. **Interpolation Functions**
   - Test `lerp()` function with boundary values (0, 1) and midpoints
   - Test `mixClip()` produces valid CSS `inset()` strings
   - Test `clipAt()` correctly interpolates between frames at various scroll positions

2. **Configuration Validation**
   - Test animation config objects have required properties
   - Test clip-path frame values are within valid percentage ranges
   - Test easing function names are valid GSAP identifiers

3. **Component Rendering**
   - Test `StaggeredText` splits text into characters correctly
   - Test `LottieAnimation` renders fallback when src is invalid
   - Test `ScrollProgressIndicator` receives and uses progress value

4. **Reduced Motion Handling**
   - Test `useReducedMotion()` hook returns correct value based on media query
   - Test animation components skip animations when reduced motion is true
   - Test static fallback content is rendered correctly

**Example Unit Test**:
```typescript
import { describe, it, expect } from 'vitest';
import { lerp, mixClip, clipAt } from './animation-utils';

describe('lerp', () => {
  it('returns start value at t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });
  
  it('returns end value at t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });
  
  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });
});

describe('clipAt', () => {
  const startFrame = { top: 62, right: 5, bottom: 4, left: 5, radius: 20 };
  
  it('produces valid CSS inset string', () => {
    const result = clipAt(0.5, startFrame);
    expect(result).toMatch(/^inset\(/);
    expect(result).toContain('%');
    expect(result).toContain('round');
  });
  
  it('transitions to mid-frame at 68% progress', () => {
    const resultBefore = clipAt(0.67, startFrame);
    const resultAt = clipAt(0.68, startFrame);
    expect(resultBefore).not.toBe(resultAt);
  });
});
```

### Property-Based Tests

Property-based tests validate universal behaviors across generated inputs using a PBT library.

**Test Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with reference to design property

**Key Properties to Test**:

1. **Property 1: Scroll Interpolation**
   ```typescript
   import fc from 'fast-check';
   
   // Feature: vitrine-hero-animations, Property 1: Scroll Interpolation Produces Valid Transformation Values
   it('scroll interpolation produces valid clip-path values for any progress', () => {
     fc.assert(
       fc.property(fc.float({ min: 0, max: 1 }), (progress) => {
         const result = clipAt(progress, WIDE_START);
         
         // Should produce valid inset() string
         expect(result).toMatch(/^inset\(/);
         
         // Should contain percentage values
         const percentages = result.match(/\d+\.?\d*%/g) || [];
         expect(percentages.length).toBeGreaterThanOrEqual(4);
         
         // All percentages should be valid (0-100)
         percentages.forEach(p => {
           const value = parseFloat(p);
           expect(value).toBeGreaterThanOrEqual(0);
           expect(value).toBeLessThanOrEqual(100);
         });
       }),
       { numRuns: 100 }
     );
   });
   ```

2. **Property 2: Reduced Motion Disables Animations**
   ```typescript
   // Feature: vitrine-hero-animations, Property 2: Reduced Motion Disables All Animated Transitions
   it('any animation component respects prefers-reduced-motion', () => {
     fc.assert(
       fc.property(
         fc.record({
           prefersReducedMotion: fc.boolean(),
           animationType: fc.constantFrom('scale', 'translate', 'rotate', 'opacity')
         }),
         ({ prefersReducedMotion, animationType }) => {
           const animation = createAnimation(animationType);
           const result = applyReducedMotionPreference(animation, prefersReducedMotion);
           
           if (prefersReducedMotion) {
             // Should have no transform animations
             expect(result.transform).toBeUndefined();
             // Only opacity transitions allowed
             if (result.transition) {
               expect(result.transition).toMatch(/opacity/);
               expect(result.transition).not.toMatch(/transform|translate|scale|rotate/);
             }
           }
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

3. **Property 5: Stagger Delays Computation**
   ```typescript
   // Feature: vitrine-hero-animations, Property 5: Staggered Animation Delays Are Correctly Computed
   it('stagger delays are correctly computed for any array length', () => {
     fc.assert(
       fc.property(
         fc.array(fc.string(), { minLength: 1, maxLength: 50 }),
         fc.integer({ min: 10, max: 200 }),
         (elements, staggerMs) => {
           const delays = computeStaggerDelays(elements, staggerMs);
           
           expect(delays.length).toBe(elements.length);
           
           elements.forEach((_, i) => {
             expect(delays[i]).toBe(i * staggerMs);
           });
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

4. **Property 11: Gradient Opacity Range**
   ```typescript
   // Feature: vitrine-hero-animations, Property 11: Gradient Mesh Opacity Within Valid Range
   it('gradient mesh opacity is always within 0.15-0.25 range', () => {
     fc.assert(
       fc.property(
         fc.array(
           fc.record({
             color: fc.hexaString({ minLength: 6, maxLength: 6 }),
             size: fc.integer({ min: 300, max: 800 }),
             position: fc.record({ x: fc.float(), y: fc.float() })
           }),
           { minLength: 3, maxLength: 5 }
         ),
         (orbConfigs) => {
           const gradientMesh = createGradientMesh(orbConfigs);
           
           orbConfigs.forEach((_, i) => {
             const opacity = gradientMesh.orbs[i].opacity;
             expect(opacity).toBeGreaterThanOrEqual(0.15);
             expect(opacity).toBeLessThanOrEqual(0.25);
           });
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

### Integration Tests

Integration tests verify behavior in a real browser environment with DOM, WebGL, and user interactions.

**Test Framework**: Playwright or Cypress

**Key Integration Test Scenarios**:

1. **Hero Section Load Performance**
   - Navigate to `/vitrine`
   - Measure time from navigation to `isReady` state
   - Assert initialization time < 1500ms
   - **Validates: Requirement 1.1**

2. **Scroll-Based Animation Triggering**
   - Load page and wait for animations to initialize
   - Scroll to 50% of hero section height
   - Verify clip-path CSS property has changed
   - Verify opacity values are interpolating
   - **Validates: Requirement 1.2**

3. **Reduced Motion Preference**
   - Set `prefers-reduced-motion: reduce` in browser settings
   - Navigate to `/vitrine`
   - Verify no GSAP timelines are active
   - Verify content is immediately visible without transitions
   - **Validates: Requirements 1.6, 2.5, 3.6**

4. **Lottie Animation Lifecycle**
   - Mock IntersectionObserver
   - Trigger intersection event for Lottie component
   - Verify animation player initializes and plays
   - Scroll component out of viewport
   - Verify animation pauses to save CPU
   - **Validates: Requirements 3.2, 3.5**

5. **Three.js Cleanup Verification**
   - Navigate to `/vitrine`
   - Wait for Three.js scene to initialize
   - Capture initial memory usage
   - Navigate away from page
   - Force garbage collection
   - Verify memory is released (no significant increase)
   - **Validates: Requirements 8.3, 9.5**

6. **Mobile Responsiveness**
   - Set viewport to 375x667 (mobile)
   - Navigate to `/vitrine`
   - Verify compact clip-path frames are used
   - Verify simplified animation sequences
   - Test touch scroll interactions
   - **Validates: Requirements 10.1, 10.2, 10.4**

7. **Performance Under Load**
   - Navigate to `/vitrine`
   - Monitor frame rate using Performance API
   - Simulate rapid scrolling
   - Assert average FPS > 55
   - **Validates: Requirement 1.5**

**Example Integration Test (Playwright)**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Vitrine Hero Animations', () => {
  test('hero section initializes within 1500ms', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/vitrine');
    
    // Wait for animation ready state
    await page.waitForFunction(() => {
      return window.__animationReady === true;
    }, { timeout: 2000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1500);
  });
  
  test('respects prefers-reduced-motion', async ({ page, context }) => {
    // Emulate reduced motion preference
    await context.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/vitrine');
    
    // Check that GSAP timelines are not active
    const hasActiveTimelines = await page.evaluate(() => {
      return window.gsap?.globalTimeline?.getChildren().length > 0;
    });
    
    expect(hasActiveTimelines).toBe(false);
    
    // Verify content is immediately visible
    const titleOpacity = await page.locator('h1').evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    
    expect(Number(titleOpacity)).toBeGreaterThan(0.9);
  });
  
  test('scroll triggers clip-path animation', async ({ page }) => {
    await page.goto('/vitrine');
    await page.waitForLoadState('networkidle');
    
    // Get initial clip-path
    const initialClip = await page.locator('[data-hero-media]').evaluate(
      (el) => window.getComputedStyle(el).clipPath
    );
    
    // Scroll to 50% of hero height
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight * 0.5);
    });
    
    await page.waitForTimeout(100); // Let animation update
    
    // Get updated clip-path
    const updatedClip = await page.locator('[data-hero-media]').evaluate(
      (el) => window.getComputedStyle(el).clipPath
    );
    
    expect(updatedClip).not.toBe(initialClip);
  });
});
```

### Visual Regression Tests

Visual regression tests capture screenshots to detect unintended visual changes.

**Test Framework**: Playwright with built-in screenshot comparison

**Test Cases**:
- Hero section initial state (desktop and mobile)
- Hero section at 50% scroll progress
- Hero section fully expanded
- Gradient mesh background rendering
- Scroll progress indicator appearance
- Reduced motion fallback appearance

**Example**:
```typescript
test('hero section visual regression', async ({ page }) => {
  await page.goto('/vitrine');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of initial state
  await expect(page.locator('[data-hero-section]')).toHaveScreenshot('hero-initial.png');
  
  // Scroll to 68% (expansion point)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.68));
  await page.waitForTimeout(500); // Animation completion
  
  await expect(page.locator('[data-hero-section]')).toHaveScreenshot('hero-expanded.png');
});
```

### Accessibility Testing

**Manual Testing**:
- Test with screen reader (NVDA/JAWS/VoiceOver)
- Verify all content is accessible without animations
- Test keyboard navigation through interactive elements
- Verify focus indicators are visible

**Automated Testing**:
- Run axe-core accessibility checks on `/vitrine` page
- Verify no WCAG 2.1 AA violations
- Validate ARIA attributes if used

**Test Command**:
```bash
npm run test:a11y
```

### Performance Testing

**Lighthouse CI**:
- Run Lighthouse on every deployment
- Assert Performance score >= 85 (mobile)
- Assert Accessibility score >= 95
- Assert Best Practices score >= 90

**Configuration** (`.lighthouserc.json`):
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/vitrine"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "interactive": ["warn", { "maxNumericValue": 3500 }]
      }
    }
  }
}
```

**Bundle Size Monitoring**:
- Track JavaScript bundle size for `/vitrine` route
- Alert if bundle size increases > 10%
- Verify lazy loading reduces initial bundle

### Test Coverage Goals

- **Unit Tests**: 80% code coverage for utility functions and pure logic
- **Property Tests**: All 12 correctness properties implemented
- **Integration Tests**: All critical user flows (7 scenarios minimum)
- **Visual Regression**: Key states captured (6 screenshots minimum)
- **Accessibility**: No WCAG 2.1 AA violations

### Test Execution

**Local Development**:
```bash
npm run test          # Unit tests
npm run test:watch    # Unit tests in watch mode
npm run test:e2e      # Integration tests (requires dev server running)
npm run test:visual   # Visual regression tests
```

**CI/CD Pipeline**:
1. Run unit tests and property tests on every commit
2. Run integration tests on pull requests
3. Run visual regression tests on pull requests
4. Run Lighthouse CI on main branch merges
5. Run full accessibility audit weekly

**Test Data**:
- Use mock Lottie JSON files for testing (< 10KB)
- Use test images optimized for fast loading
- Mock Three.js renderer in unit tests to avoid WebGL dependency

---

## Summary

This design provides a comprehensive architecture for implementing advanced hero animations on the WUGAMS showcase page. The three-layer animation system (Background Effects, Scroll Choreography, Micro-Interactions) ensures separation of concerns and performance optimization. Accessibility is prioritized with full `prefers-reduced-motion` support and fallback strategies. The component interfaces are designed for reusability and maintainability. Correctness properties ensure testability through property-based testing, and the testing strategy covers unit, integration, visual regression, and performance testing to deliver a high-quality, accessible user experience.
