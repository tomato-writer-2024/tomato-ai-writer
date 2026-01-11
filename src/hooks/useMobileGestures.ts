/**
 * 移动端触摸手势 Hook
 * 支持滑动手势、点击手势、捏合手势等
 */

import { useRef, useEffect, useState, useCallback } from 'react';

export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
}

export interface SwipeConfig {
  threshold?: number; // 滑动阈值（像素）
  velocityThreshold?: number; // 速度阈值
  longPressDelay?: number; // 长按延迟（毫秒）
  doubleTapDelay?: number; // 双击延迟（毫秒）
}

const DEFAULT_CONFIG: SwipeConfig = {
  threshold: 50,
  velocityThreshold: 0.3,
  longPressDelay: 500,
  doubleTapDelay: 300,
};

export function useMobileGestures(
  handlers: GestureHandlers,
  config: SwipeConfig = {}
) {
  const {
    threshold = DEFAULT_CONFIG.threshold,
    velocityThreshold = DEFAULT_CONFIG.velocityThreshold,
    longPressDelay = DEFAULT_CONFIG.longPressDelay,
    doubleTapDelay = DEFAULT_CONFIG.doubleTapDelay,
  } = config;

  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchStartTimeRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef(0);
  const initialDistanceRef = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchStartTimeRef.current = Date.now();
    setIsDragging(true);

    // 长按检测
    if (handlers.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.();
      }, longPressDelay);
    }

    // 捏合手势（多指触摸）
    if (e.touches.length === 2 && handlers.onPinch) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, [handlers, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // 如果在移动，清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 捏合手势
    if (e.touches.length === 2 && handlers.onPinch) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scale = currentDistance / initialDistanceRef.current;
      handlers.onPinch(scale);
    }
  }, [handlers]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging) return;

    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartTimeRef.current;

    // 计算速度
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // 判断是否是滑动
    const isSwipe =
      (Math.abs(deltaX) > (threshold || 0) || Math.abs(deltaY) > (threshold || 0)) &&
      (velocityX > (velocityThreshold || 0) || velocityY > (velocityThreshold || 0));

    if (isSwipe) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else {
        // 垂直滑动
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    } else {
      // 点击或双击
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (handlers.onDoubleTap && timeSinceLastTap < (doubleTapDelay || 0)) {
        handlers.onDoubleTap();
        lastTapTimeRef.current = 0;
      } else {
        if (handlers.onTap) {
          handlers.onTap();
        }
        lastTapTimeRef.current = now;
      }
    }

    setIsDragging(false);
  }, [isDragging, handlers, threshold, velocityThreshold, doubleTapDelay]);

  useEffect(() => {
    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    element.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });
    element.addEventListener('touchend', handleTouchEnd as EventListener);
    element.addEventListener('touchcancel', handleTouchEnd as EventListener);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('touchend', handleTouchEnd as EventListener);
      element.removeEventListener('touchcancel', handleTouchEnd as EventListener);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isDragging };
}

/**
 * 滚动增强 Hook
 * 支持惯性滚动、弹性边界等
 */
export function useScrollEnhancer() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return { isScrolling };
}

/**
 * 安全区域 Hook
 * 适配刘海屏等特殊屏幕
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.body);
      setSafeArea({
        top: parseInt(style.getPropertyValue('safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('safe-area-inset-left') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeArea;
}

/**
 * 屏幕方向 Hook
 */
export function useScreenOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

/**
 * 移动端工具函数
 */
export const mobileUtils = {
  /**
   * 检测是否是移动设备
   */
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * 检测是否是iOS设备
   */
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  },

  /**
   * 检测是否是Android设备
   */
  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  },

  /**
   * 检测设备像素比
   */
  getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  },

  /**
   * 防止iOS弹性滚动
   */
  preventOverscroll(): void {
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  },

  /**
   * 恢复iOS弹性滚动
   */
  restoreOverscroll(): void {
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  },

  /**
   * 触觉反馈（仅支持iOS）
   */
  hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if ((navigator as any).vibrate) {
      const duration = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      (navigator as any).vibrate(duration[type]);
    }
  },
};
