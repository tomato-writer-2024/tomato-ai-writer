/**
 * 移动端手势支持 Hook
 * 支持滑动手势、点击手势等
 */
import { RefObject, useEffect, useState, useCallback, useRef } from 'react';

export interface SwipeGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // 滑动阈值，默认50px
}

export interface TapGestureHandlers {
  onTap?: () => void;
  onDoubleTap?: () => void;
  longPressDelay?: number; // 长按延迟，默认500ms
}

export interface PinchGestureHandlers {
  onPinch?: (scale: number) => void;
  threshold?: number; // 缩放阈值，默认0.1
}

export function useSwipeGesture(
  ref: RefObject<HTMLElement>,
  handlers: SwipeGestureHandlers
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
  } = handlers;

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      // 判断是否是水平滑动
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      }
      // 判断是否是垂直滑动
      else {
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      touchStart.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);
}

export function useTapGesture(
  ref: RefObject<HTMLElement>,
  handlers: TapGestureHandlers
) {
  const {
    onTap,
    onDoubleTap,
    longPressDelay = 500,
  } = handlers;

  const lastTapTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, longPressDelay);
  }, [longPressDelay]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isLongPress) {
      setIsLongPress(false);
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTime.current;

    if (timeSinceLastTap < 300) {
      // 双击
      onDoubleTap?.();
      lastTapTime.current = 0;
    } else {
      // 单击
      onTap?.();
      lastTapTime.current = currentTime;
    }
  }, [isLongPress, onTap, onDoubleTap, longPressDelay]);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [ref, handleTouchStart, handleTouchEnd, handleTouchMove]);
}

export function usePinchGesture(
  ref: RefObject<HTMLElement>,
  handlers: PinchGestureHandlers
) {
  const {
    onPinch,
    threshold = 0.1,
  } = handlers;

  const initialDistance = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getDistance = (touches: TouchList): number => {
      const touch1 = touches[0];
      const touch2 = touches[1];
      return Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance.current = getDistance(e.touches);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance.current !== null) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance.current;

        if (Math.abs(scale - 1) > threshold) {
          onPinch?.(scale);
          initialDistance.current = currentDistance;
        }
      }
    };

    const handleTouchEnd = () => {
      initialDistance.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onPinch, threshold]);
}

/**
 * 综合手势 Hook，支持滑动、点击、长按等
 */
export function useMobileGestures(
  ref: RefObject<HTMLElement>,
  options: SwipeGestureHandlers & TapGestureHandlers & PinchGestureHandlers
) {
  useSwipeGesture(ref, options);
  useTapGesture(ref, options);
  usePinchGesture(ref, options);
}

/**
 * 检测是否是移动设备
 */
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice =
        /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(userAgent) ||
        window.innerWidth <= 768;

      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}

/**
 * 视口方向检测
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * 触摸反馈效果
 */
export function useTouchFeedback() {
  const [isTouched, setIsTouched] = useState(false);

  const handleTouchStart = useCallback(() => setIsTouched(true), []);
  const handleTouchEnd = useCallback(() => setIsTouched(false), []);
  const handleTouchCancel = useCallback(() => setIsTouched(false), []);

  const touchEvents = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    style: {
      transform: isTouched ? 'scale(0.97)' : 'scale(1)',
      opacity: isTouched ? 0.8 : 1,
    },
  };

  return touchEvents;
}
