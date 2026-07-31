/**
 * Animation configuration for vitrine hero animations
 * Defines clip-path frames, scroll milestones, timing constants, and performance settings
 */

export interface ClipFrame {
  top: number; // Percentage
  right: number; // Percentage
  bottom: number; // Percentage
  left: number; // Percentage
  radius: number; // Pixels
}

export interface AnimationConfig {
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
  cinematic: {
    hero: {
      wrapperHeightVh: number; // 300
      letterboxTopVh: number; // 11
      letterboxBottomVh: number; // 11
      letterboxRetract: number; // 0.22
      sceneFadeEdge: number; // 0.22
      contentParallax: number; // 50
    };
  };
}

export const ANIMATION_CONFIG: AnimationConfig = {
  heroAnimation: {
    clipPathFrames: {
      // Wide viewport - cinematic initial frame
      wide: {
        top: 62,
        right: 5,
        bottom: 4,
        left: 5,
        radius: 20,
      },
      // Compact viewport - mobile initial frame
      compact: {
        top: 58,
        right: 3,
        bottom: 3,
        left: 3,
        radius: 16,
      },
      // Mid transition frame
      mid: {
        top: 30,
        right: 2,
        bottom: 2,
        left: 2,
        radius: 12,
      },
      // Fully open frame
      open: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        radius: 0,
      },
    },
    scrollMilestones: {
      heroExpansion: 0.68,
      contentFadeOut: 0.55,
    },
    textAnimation: {
      titleStagger: 50,
      titleDuration: 1500,
      subtitleDelay: 800,
      subtitleDuration: 1000,
    },
  },
  microInteractions: {
    buttonHover: {
      scale: 1.05,
      duration: 150,
    },
    cardHover: {
      y: -2,
      shadowIntensity: 15,
      duration: 200,
    },
  },
  three: {
    camera: {
      fov: 75,
      near: 0.1,
      far: 2000,
      positions: [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 40, z: -50 },
        { x: 0, y: 50, z: -700 },
      ],
    },
    bloom: {
      strength: 0.6,
      radius: 0.3,
      threshold: 0.85,
    },
    performance: {
      maxPixelRatio: 2,
      targetFPS: 60,
    },
  },
  lottie: {
    lazyLoadThreshold: 0.1,
    autoplay: true,
    defaultLoop: true,
  },
  cinematic: {
    hero: {
      wrapperHeightVh: 300,
      letterboxTopVh: 11,
      letterboxBottomVh: 11,
      letterboxRetract: 0.22,
      sceneFadeEdge: 0.22,
      contentParallax: 50,
    },
  },
};
