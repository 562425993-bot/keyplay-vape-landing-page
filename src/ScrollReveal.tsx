import React, { useEffect, useRef, useState } from 'react';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** 进入视口后再延迟开启动画（毫秒），用于同区块内错开 */
  delayMs?: number;
  /** 位移+透明度动画时长（毫秒）；正文可大于默认以略慢于标题 */
  durationMs?: number;
};

/** 进入视口动画时长（毫秒），标题等默认 */
const SCROLL_REVEAL_DURATION_MS = 1900;
/** 正文段落动画时长（比标题略慢） */
export const SCROLL_REVEAL_BODY_DURATION_MS = 1900;
/** 隐藏时相对最终位置向下偏移（px），出现时为自下而上移入 */
const SCROLL_REVEAL_OFFSET_Y_PX = 20;

/**
 * 进入视口：自下方移入 + 渐显；离开视口：向下移出 + 渐隐。再次进入会重新播放。
 * 使用内联 transform/opacity + transition，避免与 Tailwind 类冲突或首帧未绘制导致看不出位移。
 */
type ScrollRevealScaleInProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  /** 初始缩放比例，远小于 1 即「从很小放大到原尺寸」 */
  fromScale?: number;
  /** 缩放锚点（CSS transform-origin），如左侧图从框内靠右缘放大：right center */
  transformOrigin?: string;
  /**
   * 未展开时是否隐藏（使用 visibility，不改变 opacity）。
   * 用于“先隐藏，播放完成两轮再出现”的需求。
   */
  hiddenWhenNotRevealed?: boolean;
  /**
   * 传入则完全由外部控制是否已放大（同一 `revealed` 可绑多枚，实现同步）；
   * 不传则组件自带 IntersectionObserver。
   */
  revealed?: boolean;
};

const SCROLL_REVEAL_SCALE_IN_DURATION_MS = 1600;

/**
 * 进入视口：仅从很小放大到 1，不改变透明度；离开视口再缩回。与 ScrollReveal 同套 IntersectionObserver 逻辑。
 */
export function ScrollRevealScaleIn({
  children,
  className = '',
  delayMs = 0,
  durationMs = SCROLL_REVEAL_SCALE_IN_DURATION_MS,
  fromScale = 0.32,
  transformOrigin = 'center center',
  hiddenWhenNotRevealed = false,
  revealed: revealedProp,
}: ScrollRevealScaleInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [internalVisible, setInternalVisible] = useState(false);
  const controlled = revealedProp !== undefined;
  const visible = controlled ? revealedProp : internalVisible;

  useEffect(() => {
    if (controlled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const enter = entry.isIntersecting;
        if (enter) {
          requestAnimationFrame(() => setInternalVisible(true));
        } else {
          setInternalVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [controlled]);

  const s = visible ? 1 : fromScale;
  const vis = hiddenWhenNotRevealed && !visible ? 'hidden' : 'visible';

  return (
    <div
      ref={controlled ? undefined : ref}
      className={className.trim()}
      style={{
        transform: `translate3d(0, 0, 0) scale(${s})`,
        transformOrigin,
        opacity: 1,
        visibility: vis,
        transitionProperty: 'transform',
        // 收起瞬间归零，便于循环时先缩回再播放入场，避免可见的缩小动画
        transitionDuration: visible ? `${durationMs}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: visible && delayMs > 0 ? `${delayMs}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
}

export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
  durationMs = SCROLL_REVEAL_DURATION_MS,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const enter = entry.isIntersecting;
        if (enter) {
          // 延后一帧再设为可见，让浏览器先提交「隐藏态」一帧，transition 才能播放位移
          requestAnimationFrame(() => setVisible(true));
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className.trim()}
      style={{
        transform: visible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${SCROLL_REVEAL_OFFSET_Y_PX}px, 0)`,
        opacity: visible ? 1 : 0,
        transitionProperty: 'transform, opacity',
        transitionDuration: `${durationMs}ms`,
        // 末端充分减速，避免 ease-in 结束时速度仍偏快造成的「顿一下」
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: visible && delayMs > 0 ? `${delayMs}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
}
