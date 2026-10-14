import React, { useEffect, useRef, useState } from 'react';

type CursorType = 'default' | 'interactive' | 'video' | 'drag' | 'text' | 'hidden';

export const CustomMagneticCursor: React.FC = () => {
  const [isPointerFine, setIsPointerFine] = useState<boolean>(false);

  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Only activate if device has mouse pointer and hover capability
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mql.matches) {
      setIsPointerFine(false);
      return;
    }

    setIsPointerFine(true);
    document.documentElement.classList.add('custom-cursor-enabled');

    const state = {
      mouseX: -200,
      mouseY: -200,
      ringX: -200,
      ringY: -200,
      dotX: -200,
      dotY: -200,
      targetX: -200,
      targetY: -200,
      targetScale: 1,
      currentScale: 1,
      targetOpacity: 0,
      currentOpacity: 0,
      type: 'default' as CursorType,
      isMouseDown: false,
    };

    const updateCursorType = (newType: CursorType, labelText = '') => {
      if (state.type === newType && labelRef.current?.textContent === labelText) {
        return;
      }
      state.type = newType;

      if (ringRef.current) {
        ringRef.current.setAttribute('data-cursor-type', newType);
      }

      if (labelRef.current) {
        labelRef.current.textContent = labelText;
      }

      if (iconRef.current) {
        if (newType === 'video') {
          iconRef.current.style.display = 'block';
        } else {
          iconRef.current.style.display = 'none';
        }
      }
    };

    let lastInteractiveEl: HTMLElement | null = null;
    let cachedCenterX = 0;
    let cachedCenterY = 0;
    let cachedIsCompact = false;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      state.mouseX = clientX;
      state.mouseY = clientY;
      state.targetOpacity = 1;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 0. Inside payment modal or standard cursor container: hide custom cursor so native cursor works!
      const isStandardCursorArea = target.closest('[data-standard-cursor], [role="dialog"], .standard-cursor');
      if (isStandardCursorArea) {
        state.targetOpacity = 0;
        lastInteractiveEl = null;
        return;
      }

      // 1. Text input / textarea: native caret takes precedence
      const isInput = target.closest('input, textarea, [contenteditable="true"]');
      if (isInput) {
        state.targetX = clientX;
        state.targetY = clientY;
        state.targetScale = 0.2;
        updateCursorType('text');
        lastInteractiveEl = null;
        return;
      }

      // 2. Video container: clean, non-intrusive interactive cursor
      const videoContainer = target.closest(
        'video, [data-cursor="play"], [data-cursor="video"], .video-container, [data-theater-stage]'
      );
      if (videoContainer) {
        state.targetX = clientX;
        state.targetY = clientY;
        state.targetScale = 1.35;
        updateCursorType('interactive');
        lastInteractiveEl = null;
        return;
      }

      // 3. 3D spatial rotating sphere / draggable gallery
      const dragContainer = target.closest('[data-cursor="drag"], .drag-container');
      if (dragContainer) {
        state.targetX = clientX;
        state.targetY = clientY;
        state.targetScale = 1.45;
        updateCursorType('drag', 'DRAG');
        lastInteractiveEl = null;
        return;
      }

      // 4. Interactive elements: buttons, links, clickable triggers
      const interactiveEl = target.closest(
        'button, a, [role="button"], select, [data-cursor="interactive"], [data-magnetic], .cursor-pointer'
      ) as HTMLElement | null;

      if (interactiveEl) {
        // Cache rect so getBoundingClientRect is NOT called on every single mousemove pixel
        if (interactiveEl !== lastInteractiveEl) {
          lastInteractiveEl = interactiveEl;
          const rect = interactiveEl.getBoundingClientRect();
          cachedIsCompact = rect.width < 340 && rect.height < 140;
          cachedCenterX = rect.left + rect.width / 2;
          cachedCenterY = rect.top + rect.height / 2;
        }

        if (cachedIsCompact) {
          const pullStrength = 0.32;
          state.targetX = clientX + (cachedCenterX - clientX) * pullStrength;
          state.targetY = clientY + (cachedCenterY - clientY) * pullStrength;
        } else {
          state.targetX = clientX;
          state.targetY = clientY;
        }

        state.targetScale = 1.35;
        updateCursorType('interactive');
        return;
      }

      lastInteractiveEl = null;

      // 5. Default state
      state.targetX = clientX;
      state.targetY = clientY;
      state.targetScale = 1;
      updateCursorType('default');
    };

    const handleMouseDown = () => {
      state.isMouseDown = true;
      state.targetScale *= 0.85;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${state.dotX}px, ${state.dotY}px, 0) translate(-50%, -50%) scale(0.65)`;
      }
    };

    const handleMouseUp = () => {
      state.isMouseDown = false;
      state.targetScale /= 0.85;
    };

    const handleMouseLeave = () => {
      state.targetOpacity = 0;
    };

    const handleMouseEnter = () => {
      state.targetOpacity = 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let animationFrameId: number;

    const render = () => {
      // Physics interpolation constants
      const ringLerp = 0.18;
      const dotLerp = 0.85; // highly responsive, zero-lag pinpoint center
      const opacityLerp = 0.2;
      const scaleLerp = 0.25;

      state.ringX += (state.targetX - state.ringX) * ringLerp;
      state.ringY += (state.targetY - state.ringY) * ringLerp;

      state.dotX += (state.mouseX - state.dotX) * dotLerp;
      state.dotY += (state.mouseY - state.dotY) * dotLerp;

      state.currentOpacity += (state.targetOpacity - state.currentOpacity) * opacityLerp;
      state.currentScale += (state.targetScale - state.currentScale) * scaleLerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0) translate(-50%, -50%) scale(${state.currentScale})`;
        ringRef.current.style.opacity = `${state.currentOpacity}`;
      }

      if (dotRef.current) {
        if (!state.isMouseDown) {
          dotRef.current.style.transform = `translate3d(${state.dotX}px, ${state.dotY}px, 0) translate(-50%, -50%)`;
        }
        dotRef.current.style.opacity = `${
          state.type === 'video' || state.type === 'drag' || state.type === 'text'
            ? 0
            : state.currentOpacity
        }`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointerFine(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('custom-cursor-enabled');
      } else {
        document.documentElement.classList.remove('custom-cursor-enabled');
      }
    };

    mql.addEventListener('change', handleMediaChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      mql.removeEventListener('change', handleMediaChange);
      document.documentElement.classList.remove('custom-cursor-enabled');
    };
  }, []);

  if (!isPointerFine) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Outer Magnetic Ring / Aura with non-neon obsidian & frosted luxury styling */}
      <div
        ref={ringRef}
        data-cursor-type="default"
        className="magnetic-cursor-ring fixed top-0 left-0 rounded-full flex items-center justify-center will-change-transform transform-gpu pointer-events-none"
      >
        {/* Play Icon */}
        <svg
          ref={iconRef}
          className="w-2.5 h-2.5 fill-white text-white ml-0.5 mr-1"
          viewBox="0 0 24 24"
          style={{ display: 'none' }}
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>

        {/* Dynamic Contextual Mono Badge Label */}
        <span
          ref={labelRef}
          className="text-[9px] font-mono tracking-widest font-semibold text-white/95 uppercase pointer-events-none"
        />
      </div>

      {/* Inner Precision Tracking Dot (Zero-lag, pure optical white pinpoint) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.45)] will-change-transform transform-gpu transition-opacity duration-150 pointer-events-none"
      />
    </div>
  );
};
