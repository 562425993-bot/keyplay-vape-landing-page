import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, RefreshCw } from 'lucide-react';
import { Product360Viewer } from './Product360Viewer';
import { ScrollReveal, ScrollRevealScaleIn, SCROLL_REVEAL_BODY_DURATION_MS } from './ScrollReveal';

/** 与 vite.config base 一致；静态资源须放在 public/images、public/videos（会原样进 dist）或构建后拷入 dist */
const withBase = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, '')}`;

const DUAL_MESH_FRAME_COUNT = 7;
const DUAL_MESH_FRAME_INTERVAL_MS = 200;
/** 悬停放大结束后再开始切帧（毫秒） */
const DUAL_MESH_ANIM_DELAY_MS = 220;
const dualMeshFrameSrc = (index: number) =>
  withBase(`images/dual-mesh-frames/frame-${String((index % DUAL_MESH_FRAME_COUNT) + 1).padStart(2, '0')}.jpg`);

const COMPARISON_IMAGE_URLS = [
  withBase('images/product-comparison-tb18.png'),
  withBase('images/product-comparison-ta18.png'),
  withBase('images/product-comparison-tc18.png'),
] as const;
const COMPARISON_TAB_BY_INDEX = ['keyplay', 'k40', 'k50'] as const;
/** 中间主图逻辑宽度（px），与两侧留白合并为同一容器 */
const COMPARISON_CAROUSEL_CENTER_W = 1600;
/** 并入中间容器两侧的留白（px） */
const COMPARISON_CAROUSEL_GAP_PX = 300;
const COMPARISON_CAROUSEL_MIDDLE_MAX_W =
  COMPARISON_CAROUSEL_CENTER_W + 2 * COMPARISON_CAROUSEL_GAP_PX;
/** 当前屏在中间停留后再左滑下一屏 */
const COMPARISON_CAROUSEL_HOLD_MS = 6000;
/** 左滑过渡时长 */
const COMPARISON_CAROUSEL_SLIDE_MS = 700;
/** 第四屏与第一屏相同，用于无缝左滑回到 Keyplay */
const COMPARISON_CAROUSEL_PANEL_CENTERS = [0, 1, 2, 0] as const;

const DualMeshAnimatedBg = ({ playing }: { playing: boolean }) => {
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);

  // 预加载序列帧，避免 hover 刚开始时图片尚未就绪导致的空帧/闪烁
  useEffect(() => {
    for (let i = 0; i < DUAL_MESH_FRAME_COUNT; i += 1) {
      const img = new window.Image();
      img.src = dualMeshFrameSrc(i);
    }
  }, []);

  useEffect(() => {
    if (!playing) {
      setRunning(false);
      setFrame(0);
      return;
    }

    // 避免在 hover 延迟期间先显示可能为空/加载中的首帧：直接从 frame-02 开始
    setRunning(false);
    setFrame(1);
    const delay = window.setTimeout(() => setRunning(true), DUAL_MESH_ANIM_DELAY_MS);
    return () => clearTimeout(delay);
  }, [playing]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % DUAL_MESH_FRAME_COUNT);
    }, DUAL_MESH_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [running, DUAL_MESH_FRAME_INTERVAL_MS]);

  return (
    <img
      src={dualMeshFrameSrc(frame)}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      aria-hidden
    />
  );
};

const ADJUSTABLE_POWER_FRAME_COUNT = 3;
const ADJUSTABLE_POWER_FRAME_INTERVAL_MS = 500;
const ADJUSTABLE_POWER_ANIM_DELAY_MS = 220;
const adjustablePowerFrameSrc = (index: number) =>
  withBase(`images/adjustable-power-frames/frame-${String((index % ADJUSTABLE_POWER_FRAME_COUNT) + 1).padStart(2, '0')}.jpg`);

const AdjustablePowerAnimatedBg = ({ playing }: { playing: boolean }) => {
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!playing) {
      setRunning(false);
      setFrame(0);
      return;
    }
    const delay = window.setTimeout(() => setRunning(true), ADJUSTABLE_POWER_ANIM_DELAY_MS);
    return () => clearTimeout(delay);
  }, [playing]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % ADJUSTABLE_POWER_FRAME_COUNT);
    }, ADJUSTABLE_POWER_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [running, ADJUSTABLE_POWER_FRAME_INTERVAL_MS]);

  return (
    <img
      src={adjustablePowerFrameSrc(frame)}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      aria-hidden
    />
  );
};

const ADJUSTABLE_AIRFLOW_FRAME_COUNT = 5;
const ADJUSTABLE_AIRFLOW_FRAME_INTERVAL_MS = 250;
const ADJUSTABLE_AIRFLOW_ANIM_DELAY_MS = 220;
const adjustableAirflowFrameSrc = (index: number) =>
  withBase(`images/adjustable-airflow-frames/frame-${String((index % ADJUSTABLE_AIRFLOW_FRAME_COUNT) + 1).padStart(2, '0')}.jpg`);

const LABEL_360_ICON_FRAME_COUNT = 90;
const LABEL_360_ICON_FRAME_INTERVAL_MS = 70;
const label360IconFrameSrc = (index: number) =>
  withBase(`images/360-label-frames/frame-${String((index % LABEL_360_ICON_FRAME_COUNT) + 1).padStart(4, '0')}.png`);
const vapePetIconSrc = (index: number, active: boolean) =>
  withBase(`images/vape-pet-icons/${String(index).padStart(2, '0')}${active ? 'a' : 'b'}.png`);

/** 01 砖石/钻石 → 02 五角星 → 03 方块 → 04 月亮 → 05 MIX（与下方图标顺序一致） */
const VAPE_PET_VIDEO_BY_ICON: Record<number, string> = {
  1: withBase('videos/vape-pet/diamond.mp4'),
  2: withBase('videos/vape-pet/star.mp4'),
  3: withBase('videos/vape-pet/square.mp4'),
  4: withBase('videos/vape-pet/moon.mp4'),
  5: withBase('videos/vape-pet/mix.mp4'),
};
const INSTANT_HIT_FRAME_COUNT = 40;
const INSTANT_HIT_FRAME_INTERVAL_MS = 90;
const instantHitFrameSrc = (index: number) =>
  withBase(`images/instant-hit-frames/frame-${String((index % INSTANT_HIT_FRAME_COUNT) + 1).padStart(2, '0')}.jpg`);
const DUAL_MESH_SECTION_FRAME_COUNT = 19;
const DUAL_MESH_SECTION_FRAME_INTERVAL_MS = 90;
const dualMeshSectionFrameSrc = (index: number) =>
  withBase(`images/dual-mesh-section-frames/frame-${String((index % DUAL_MESH_SECTION_FRAME_COUNT) + 1).padStart(2, '0')}.jpg`);
/** 仅 CLACK JOY 大区块：开发时 Vite 映射 replacement-images/详情切图 - 副本/05咔哒/动画帧；生产用 images/clack-joy-frames */
const USE_LOCAL_CLACK_JOY_SECTION_FRAMES = import.meta.env.DEV;
const CLACK_JOY_SECTION_FRAME_COUNT = 16;
/** 正序时长（越小越快） - 正序再慢一点 */
const CLACK_JOY_SECTION_FORWARD_MS = 500;
/** 倒序时长（单独加速） - 倒序更快以保证整体更快 */
const CLACK_JOY_SECTION_REVERSE_MS = 180;
const CLACK_JOY_UNLOCK_SCROLL_COUNT = 2;
/** 卡片 hover 始终用 public/images/clack-joy-frames（01.jpg–40.jpg） */
const CLACK_JOY_CARD_FRAME_COUNT = 40;
const CLACK_JOY_FRAME_INTERVAL_MS = 90;
/** 悬停后延迟启动序列帧（毫秒），与其它卡片动画保持一致 */
const CLACK_JOY_ANIM_DELAY_MS = 220;
const clackJoySectionFrameSrc = (index: number) => {
  const n = (index % CLACK_JOY_SECTION_FRAME_COUNT) + 1;
  const pad = String(n).padStart(2, '0');
  if (USE_LOCAL_CLACK_JOY_SECTION_FRAMES) {
    return `${import.meta.env.BASE_URL}local-clack-joy-frames/${pad}.jpg`;
  }
  return withBase(`images/clack-joy-frames/${pad}.jpg`);
};
const clackJoyCardFrameSrc = (index: number) => {
  const n = (index % CLACK_JOY_CARD_FRAME_COUNT) + 1;
  const pad = String(n).padStart(2, '0');
  return withBase(`images/clack-joy-frames/${pad}.jpg`);
};
/** 与 replacement-images/详情切图 - 副本/05咔哒/CLACK左.png、CLACK右.png 同源，见 public/images/clack-joy-aside/ */
const CLACK_JOY_ASIDE_LEFT_SRC = withBase('images/clack-joy-aside/clack-left.png');
const CLACK_JOY_ASIDE_RIGHT_SRC = withBase('images/clack-joy-aside/clack-right.png');
const POWER_SCENE_FRAME_COUNT = 12;
const POWER_SCENE_FRAME_INTERVAL_MS = 90;
const HIDDEN_SCREEN_FRAMES = [
  withBase('images/hidden-screen-frames/frame-02.jpg'),
  withBase('images/hidden-screen-frames/frame-3.jpg'),
];
const HIDDEN_SCREEN_FRAME_INTERVAL_MS = 440;
const CHILD_LOCK_FRAME_COUNT = 17;
const CHILD_LOCK_FRAME_INTERVAL_MS = 120;

const Label360AnimatedIcon = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % LABEL_360_ICON_FRAME_COUNT);
    }, LABEL_360_ICON_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return <img src={label360IconFrameSrc(frame)} alt="" aria-hidden className="h-8 w-8 object-contain" />;
};

const InstantHitAnimatedBg = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % INSTANT_HIT_FRAME_COUNT);
    }, INSTANT_HIT_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return <img src={instantHitFrameSrc(frame)} className="w-full h-full object-cover" alt="Instant Hit" />;
};

const DualMeshSectionAnimatedBg = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % DUAL_MESH_SECTION_FRAME_COUNT);
    }, DUAL_MESH_SECTION_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <img
      src={dualMeshSectionFrameSrc(frame)}
      alt=""
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  );
};

const ClackJoySectionAnimatedBg = ({
  playToken,
  onSequenceComplete,
}: {
  playToken: number;
  onSequenceComplete?: () => void;
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (playToken <= 0) {
      setFrame(0);
      return;
    }

    let rafId = 0;
    const startedAt = performance.now();
    const forwardMs = CLACK_JOY_SECTION_FORWARD_MS;
    const reverseMs = CLACK_JOY_SECTION_REVERSE_MS;
    const cycleMs = forwardMs + reverseMs; // 单轮：正序+倒序（往返一次）
    const cyclesPerTrigger = 2; // 正序-反序-正序-反序
    const totalMs = cycleMs * cyclesPerTrigger;
    const maxFrame = CLACK_JOY_SECTION_FRAME_COUNT - 1;
    // 比 cubic 更强的缓进缓出：起步/收尾更慢，中段更快
    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      if (elapsed >= totalMs) {
        setFrame(0);
        onSequenceComplete?.();
        return;
      }

      const cycleIndex = Math.floor(elapsed / cycleMs); // 0 或 1
      const cycleTime = elapsed - cycleIndex * cycleMs; // 0..cycleMs

      const forward = cycleTime < forwardMs;
      const phaseT = forward ? cycleTime / forwardMs : (cycleTime - forwardMs) / reverseMs;
      const eased = easeInOutQuint(phaseT);
      // forward: 0->1, reverse: 1->0（通过 1-eased）
      const normalized = forward ? eased : 1 - eased;
      const nextFrame = Math.round(normalized * maxFrame);
      setFrame((prev) => (prev === nextFrame ? prev : nextFrame));
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [playToken, onSequenceComplete]);

  return (
    <img
      src={clackJoySectionFrameSrc(frame)}
      alt=""
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  );
};

/** 左右 CLACK 侧图缩放由父级控制，与中间序列帧每轮起点同步 */
const ClackJoyAsideScaleRow = ({ revealed }: { revealed: boolean }) => {
  return (
    <div className="flex w-full max-w-[1450px] items-center justify-between gap-8 lg:gap-12 xl:gap-16 px-2 sm:px-4">
      <div className="pointer-events-auto hidden shrink-0 lg:flex lg:w-[min(400px,36vw)] xl:w-[460px]">
        <ScrollRevealScaleIn className="w-full" revealed={revealed} hiddenWhenNotRevealed transformOrigin="right center">
          <div className="w-full overflow-hidden rounded-3xl p-0">
            <img
              src={CLACK_JOY_ASIDE_LEFT_SRC}
              alt=""
              className="mx-auto h-auto w-full max-h-[500px] object-contain"
              draggable={false}
            />
          </div>
        </ScrollRevealScaleIn>
      </div>
      <div className="pointer-events-auto hidden shrink-0 lg:flex lg:w-[min(400px,36vw)] xl:w-[460px]">
        <ScrollRevealScaleIn className="w-full" revealed={revealed} hiddenWhenNotRevealed transformOrigin="left center">
          <div className="w-full overflow-hidden rounded-3xl p-0">
            <img
              src={CLACK_JOY_ASIDE_RIGHT_SRC}
              alt=""
              className="mx-auto h-auto w-full max-h-[500px] object-contain"
              draggable={false}
            />
          </div>
        </ScrollRevealScaleIn>
      </div>
    </div>
  );
};

const ClackJoyCardAnimatedBg = ({ playing }: { playing: boolean }) => {
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);
  const preloadRef = React.useRef<HTMLImageElement[]>([]);

  // 预加载序列帧，避免 hover 刚开始时 background-image 尚未加载导致露出父级黄色底。
  useEffect(() => {
    // 只预加载一次，并保留引用，避免某些浏览器在短时间内回收导致 hover 首次切帧仍闪烁
    if (preloadRef.current.length > 0) return;
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < CLACK_JOY_CARD_FRAME_COUNT; i += 1) {
      const img = new window.Image();
      img.src = clackJoyCardFrameSrc(i);
      imgs.push(img);
    }
    preloadRef.current = imgs;
  }, []);

  useEffect(() => {
    if (!playing) {
      setRunning(false);
      setFrame(0);
      return;
    }

    // hover 刚开始时先切到 02，避免 01->02 首次切帧的空白/闪跳
    setFrame(1);
    const id = window.setTimeout(() => setRunning(true), CLACK_JOY_ANIM_DELAY_MS);
    return () => clearTimeout(id);
  }, [playing]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % CLACK_JOY_CARD_FRAME_COUNT);
    }, CLACK_JOY_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div
      className="absolute inset-0 bg-black bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${clackJoyCardFrameSrc(frame)})` }}
      aria-hidden
    />
  );
};

const AdjustablePowerSceneAnimated = ({ power }: { power: 22 | 26 | 28 }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % POWER_SCENE_FRAME_COUNT);
    }, POWER_SCENE_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [power]);

  return (
    <img
      src={withBase(`images/power-scene-frames/${power}/frame-${String((frame % POWER_SCENE_FRAME_COUNT) + 1).padStart(2, '0')}.jpg`)}
      className="h-full w-full object-cover"
      alt="Adjustable Power"
      draggable={false}
    />
  );
};

const HiddenScreenAnimated = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % HIDDEN_SCREEN_FRAMES.length);
    }, HIDDEN_SCREEN_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <img
      src={HIDDEN_SCREEN_FRAMES[frame]}
      className="h-full w-full object-cover"
      alt="Hidden Screen"
      draggable={false}
    />
  );
};

const ChildLockAnimated = () => {
  const [frame, setFrame] = useState(0);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: '0px 0px -5% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) {
      setFrame(0);
      return;
    }

    setFrame(0);
    const id = window.setInterval(() => {
      setFrame((f) => {
        if (f >= CHILD_LOCK_FRAME_COUNT - 1) {
          window.clearInterval(id);
          return f;
        }
        return f + 1;
      });
    }, CHILD_LOCK_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <img
        src={withBase(`images/child-lock-frames/frame-${String((frame % CHILD_LOCK_FRAME_COUNT) + 1).padStart(2, '0')}.png`)}
        className="h-full w-full object-contain drop-shadow-2xl"
        alt="Child Lock"
        draggable={false}
      />
    </div>
  );
};

const AdjustableAirflowAnimatedBg = ({ playing }: { playing: boolean }) => {
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!playing) {
      setRunning(false);
      setFrame(0);
      return;
    }
    const delay = window.setTimeout(() => setRunning(true), ADJUSTABLE_AIRFLOW_ANIM_DELAY_MS);
    return () => clearTimeout(delay);
  }, [playing]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % ADJUSTABLE_AIRFLOW_FRAME_COUNT);
    }, ADJUSTABLE_AIRFLOW_FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [running, ADJUSTABLE_AIRFLOW_FRAME_INTERVAL_MS]);

  return (
    <img
      src={adjustableAirflowFrameSrc(frame)}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      aria-hidden
    />
  );
};

/** 悬停时循环：仅顶层 01 反复 100%→0%；底层 02 始终不透明；通过 remount 立即回到 opacity:1，不做 0→100% 动画。 */
const Power1100CrossfadeBg = ({ playing }: { playing: boolean }) => {
  const [cycleKey, setCycleKey] = useState(0);
  const playingRef = useRef(playing);
  const holdTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  playingRef.current = playing;

  useEffect(() => {
    if (!playing) setCycleKey(0);
  }, [playing]);

  const handleFadeEnd = () => {
    if (!playingRef.current) return;
    // 淡出结束后不要立刻切下一张，让“最后一张/底层画面”多停留一点
    if (holdTimerRef.current != null) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      if (!playingRef.current) return;
      setCycleKey((k) => k + 1);
    },400);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current != null) window.clearTimeout(holdTimerRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        src={withBase('images/power-1100mah-crossfade/frame-02.jpg')}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
      />
      {!playing ? (
        <img
          src={withBase('images/power-1100mah-crossfade/frame-01.jpg')}
          alt=""
          className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover object-center"
        />
      ) : (
        <img
          key={cycleKey}
          src={withBase('images/power-1100mah-crossfade/frame-01.jpg')}
          alt=""
          className="power-1100-fade-out-once pointer-events-none absolute inset-0 z-10 h-full w-full object-cover object-center"
          onAnimationEnd={handleFadeEnd}
        />
      )}
    </div>
  );
};

const App = () => {
  const [dualMeshHover, setDualMeshHover] = useState(false);
  const [clackJoyHover, setClackJoyHover] = useState(false);
  const [adjustablePowerHover, setAdjustablePowerHover] = useState(false);
  const [adjustableAirflowHover, setAdjustableAirflowHover] = useState(false);
  const [airflowMode, setAirflowMode] = useState<'tight' | 'loose'>('tight');
  const [power1100MahHover, setPower1100MahHover] = useState(false);
  const [viewer360Reset, setViewer360Reset] = useState(0);
  const [viewer360Spin, setViewer360Spin] = useState(false);
  const [activeVapePetIcon, setActiveVapePetIcon] = useState<number | null>(1);
  const [selectedPowerButton, setSelectedPowerButton] = useState<22 | 26 | 28>(22);
  const [selectedELiquidCapacity, setSelectedELiquidCapacity] = useState<10 | 30>(10);
  const [comparisonIndex, setComparisonIndex] = useState<0 | 1 | 2>(0);
  /** 0–2 为三屏；3 为第 1 屏克隆，用于 3→1 向左滑入后无动画归位 */
  const [comparisonCarouselPage, setComparisonCarouselPage] = useState<0 | 1 | 2 | 3>(0);
  const [comparisonSkipSlideTransition, setComparisonSkipSlideTransition] = useState(false);
  const [carouselKick, setCarouselKick] = useState(0);
  /** 与 CLACK JOY 中间序列帧每一轮起点（frame 0）同步，两侧缩放循环播放 */
  const [clackJoyAsideRevealed, setClackJoyAsideRevealed] = useState(false);
  const [clackJoySectionInView, setClackJoySectionInView] = useState(false);
  const [clackJoyPlayToken, setClackJoyPlayToken] = useState(0);
  const [clackJoyLockActive, setClackJoyLockActive] = useState(false);
  const [clackJoySequencePlaying, setClackJoySequencePlaying] = useState(false);
  const [clackJoyScrollTriggers, setClackJoyScrollTriggers] = useState(0);
  const clackJoySectionRef = useRef<HTMLDivElement>(null);
  const bodyOverflowRef = useRef<string>('');
  const htmlOverflowRef = useRef<string>('');

  const triggerClackJoySequence = useCallback(() => {
    if (clackJoySequencePlaying) return;
    if (clackJoyScrollTriggers >= CLACK_JOY_UNLOCK_SCROLL_COUNT) return;
    setClackJoyAsideRevealed(false);
    setClackJoySequencePlaying(true);
    setClackJoyPlayToken((t) => t + 1);
  }, [clackJoyScrollTriggers, clackJoySequencePlaying]);

  const handleClackJoyBgSequenceComplete = useCallback(() => {
    setClackJoySequencePlaying(false);
    setClackJoyScrollTriggers((n) => {
      const next = n + 1;
      if (next >= CLACK_JOY_UNLOCK_SCROLL_COUNT) {
        setClackJoyLockActive(false);
      }
      return next;
    });
    setClackJoyAsideRevealed(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setClackJoyAsideRevealed(true);
      });
    });
  }, []);

  // CLACK JOY：只有进入视口后才启动序列帧与触发左右/文字
  useEffect(() => {
    const el = clackJoySectionRef.current;
    if (!el) return;
    // 兜底：如果一开始就在视口内，IntersectionObserver 可能来不及触发
    const rect = el.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      setClackJoySectionInView(true);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setClackJoySectionInView(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const clackJoyWasInViewRef = useRef(false);

  // 离开 CLACK JOY 区块后重置进度，下次滚回该区块会再次走锁死 → 吸附 → 滚轮解锁
  useEffect(() => {
    const was = clackJoyWasInViewRef.current;
    if (was && !clackJoySectionInView) {
      setClackJoyScrollTriggers(0);
      setClackJoyLockActive(false);
      setClackJoySequencePlaying(false);
      setClackJoyAsideRevealed(false);
      setClackJoyPlayToken(0);
    }
    clackJoyWasInViewRef.current = clackJoySectionInView;
  }, [clackJoySectionInView]);

  // 浏览器后退恢复（bfcache）：若仍停在该区块，同样重置一轮交互
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      const el = clackJoySectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      setClackJoyScrollTriggers(0);
      setClackJoyLockActive(false);
      setClackJoySequencePlaying(false);
      setClackJoyAsideRevealed(false);
      setClackJoyPlayToken(0);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // 进入 CLACK JOY 区块且尚未完成滚动解锁次数时，自动吸附到顶部并锁定滚动
  useEffect(() => {
    if (clackJoySectionInView && clackJoyScrollTriggers < CLACK_JOY_UNLOCK_SCROLL_COUNT) {
      setClackJoyLockActive(true);
      clackJoySectionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [clackJoySectionInView, clackJoyScrollTriggers]);

  // 锁定时禁止页面滚动（仍允许 wheel 作为触发信号）
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (clackJoyLockActive) {
      bodyOverflowRef.current = body.style.overflow;
      htmlOverflowRef.current = html.style.overflow;
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      return () => {
        body.style.overflow = bodyOverflowRef.current;
        html.style.overflow = htmlOverflowRef.current;
      };
    }
    body.style.overflow = bodyOverflowRef.current;
    html.style.overflow = htmlOverflowRef.current;
  }, [clackJoyLockActive]);

  // 锁定期间：每次滚轮触发一次完整序列；达到解锁次数后解锁
  useEffect(() => {
    if (!clackJoyLockActive) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;
      triggerClackJoySequence();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel as EventListener);
  }, [clackJoyLockActive, triggerClackJoySequence]);
  const sectionVideoRef = useRef<HTMLVideoElement>(null);
  const diyPetVideoRef = useRef<HTMLVideoElement>(null);
  const comparisonIndexRef = useRef(comparisonIndex);
  comparisonIndexRef.current = comparisonIndex;
  const comparisonCarouselPageRef = useRef(comparisonCarouselPage);
  comparisonCarouselPageRef.current = comparisonCarouselPage;

  const displayCategoryTab = COMPARISON_TAB_BY_INDEX[comparisonIndex];
  const petVideoSrc = activeVapePetIcon != null ? VAPE_PET_VIDEO_BY_ICON[activeVapePetIcon] : VAPE_PET_VIDEO_BY_ICON[1];
  const powerButtonSrc = withBase(`images/power-buttons/${selectedPowerButton}.png`);
  const airflowModeSrc =
    airflowMode === 'tight' ? withBase('images/airflow-mode-tight.png') : withBase('images/airflow-mode-loose.png');
  const airflowVideoSrc = airflowMode === 'tight' ? withBase('videos/airflow-modes/tight.mp4') : withBase('videos/airflow-modes/loose.mp4');
  const productCategoryTabSrc =
    displayCategoryTab === 'keyplay'
      ? withBase('images/category-tabs/icon-tb18.png')
      : displayCategoryTab === 'k40'
        ? withBase('images/category-tabs/icon-ta18.png')
        : withBase('images/category-tabs/icon-tc18.png');
  const goComparisonTab = useCallback((index: 0 | 1 | 2) => {
    const pageNow = comparisonCarouselPageRef.current;
    const prev = comparisonIndexRef.current;

    if (pageNow === 3) {
      setComparisonSkipSlideTransition(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setComparisonSkipSlideTransition(false));
      });
      setComparisonCarouselPage(index);
      setComparisonIndex(index);
      setCarouselKick((k) => k + 1);
      return;
    }

    /** 向左点 Tab（2→1、1→0）：保留过渡动画，与向右一致 */
    const animateBackward = (prev === 1 && index === 0) || (prev === 2 && index === 1);
    if (animateBackward) {
      setComparisonCarouselPage(index);
      setComparisonIndex(index);
      setCarouselKick((k) => k + 1);
      return;
    }

    const animateForward = (prev === 0 && index === 1) || (prev === 1 && index === 2);
    const animateWrapToKeyplay = prev === 2 && index === 0;
    const jumpTo50K = prev === 0 && index === 2;

    if (jumpTo50K) {
      setComparisonSkipSlideTransition(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setComparisonSkipSlideTransition(false));
      });
      setComparisonCarouselPage(2);
    } else if (animateWrapToKeyplay) {
      setComparisonCarouselPage(3);
    } else if (animateForward) {
      setComparisonCarouselPage(index);
    } else {
      setComparisonSkipSlideTransition(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setComparisonSkipSlideTransition(false));
      });
      setComparisonCarouselPage(index);
    }

    setComparisonIndex(index);
    setCarouselKick((k) => k + 1);
  }, []);

  const handleComparisonCarouselTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== 'transform' || e.target !== e.currentTarget) return;
      if (comparisonCarouselPageRef.current !== 3) return;
      setComparisonSkipSlideTransition(true);
      setComparisonCarouselPage(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setComparisonSkipSlideTransition(false));
      });
    },
    [],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (comparisonIndex === 2) {
        setComparisonIndex(0);
        setComparisonCarouselPage(3);
      } else {
        const next = ((comparisonIndex + 1) % 3) as 0 | 1 | 2;
        setComparisonIndex(next);
        setComparisonCarouselPage(next);
      }
    }, COMPARISON_CAROUSEL_HOLD_MS);
    return () => clearTimeout(id);
  }, [comparisonIndex, carouselKick]);

  useEffect(() => {
    if (activeVapePetIcon == null) return;
    const el = diyPetVideoRef.current;
    if (!el) return;
    el.muted = true;
    el.load();
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, [activeVapePetIcon]);

  return (
    <div className="font-harmony w-full overflow-x-hidden text-black bg-white">
      {/* 3. Hero Banner */}
      <div className="w-full relative bg-gray-200 overflow-hidden">
        <video
          className="block w-full h-auto"
          src={withBase('images/hero-tb18-home.mp4')}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* 4. Core Features Module */}
      <div className="min-h-[960px] w-full bg-[#d7ff00] py-[80px] flex justify-center items-center px-4">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row justify-between items-center gap-5">
          {/* Left Cards */}
          <div className="flex flex-col gap-[20px] w-full lg:w-[420px]">
            <div className="w-full origin-center cursor-pointer transition-transform duration-300 ease-out hover:z-20 hover:scale-[1.06] hover:shadow-xl">
              <div className="relative flex h-[230px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl shadow-sm">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${withBase('images/01-diy-cartridge.jpg')})` }}
                  aria-hidden
                />
                <h3 className="relative z-10 w-full px-6 pt-6 text-center text-[18px] font-harmony-black uppercase tracking-[0px]">
                  DIY CARTRIDGE
                </h3>
              </div>
            </div>
            <div
              className="w-full origin-center cursor-pointer transition-transform duration-300 ease-out hover:z-20 hover:scale-[1.06] hover:shadow-xl"
              onMouseEnter={() => setDualMeshHover(true)}
              onMouseLeave={() => setDualMeshHover(false)}
            >
              <div className="relative flex h-[180px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl shadow-sm">
                <DualMeshAnimatedBg playing={dualMeshHover} />
                <h3 className="relative z-10 w-full px-6 pt-6 text-center text-[18px] font-harmony-black uppercase tracking-[0px]">
                  DUAL MESH
                </h3>
              </div>
            </div>
            <div
              className="w-full origin-center cursor-pointer transition-transform duration-300 ease-out hover:z-20 hover:scale-[1.06] hover:shadow-xl"
              onMouseEnter={() => setClackJoyHover(true)}
              onMouseLeave={() => setClackJoyHover(false)}
            >
              <div className="relative flex h-[230px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl shadow-sm">
                <ClackJoyCardAnimatedBg playing={clackJoyHover} />
                <h3 className="relative z-10 w-full px-6 pt-6 text-center text-[18px] font-harmony-black uppercase tracking-[0px]">
                  CLACK JOY
                </h3>
              </div>
            </div>
          </div>

          {/* Center 360 */}
          <div className="relative flex h-[680px] w-full flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-sm lg:w-[520px]">
            <h3 className="translate-y-[15px] text-[18px] font-harmony-black uppercase tracking-[0px]">
              <span className="inline-flex items-center gap-2">
                <Label360AnimatedIcon />
                <span>360° EXPERIENCE</span>
              </span>
            </h3>
            <Product360Viewer
              resetSignal={viewer360Reset}
              autoSpin={viewer360Spin}
              onUserInteract={() => setViewer360Spin(false)}
            />
            <div className="mt-6 flex gap-10">
              <button
                type="button"
                className="flex cursor-pointer flex-col items-center gap-2 border-0 bg-transparent p-0"
                onClick={() => {
                  setViewer360Spin(false);
                  setViewer360Reset((x) => x + 1);
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7ff00]">
                  <RotateCcw size={20} />
                </div>
                <span className="text-[13px] tracking-[0px]">Reset</span>
              </button>
              <button
                type="button"
                className="flex cursor-pointer flex-col items-center gap-2 border-0 bg-transparent p-0"
                onClick={() => setViewer360Spin((s) => !s)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7ff00]">
                  <RefreshCw size={20} />
                </div>
                <span className="text-[13px] tracking-[0px]">360°</span>
              </button>
            </div>
          </div>

          {/* Right Cards */}
          <div className="flex flex-col gap-[20px] w-full lg:w-[420px]">
            <div
              className="w-full origin-center cursor-pointer transition-transform duration-300 ease-out hover:z-20 hover:scale-[1.06] hover:shadow-xl"
              onMouseEnter={() => setAdjustablePowerHover(true)}
              onMouseLeave={() => setAdjustablePowerHover(false)}
            >
              <div className="relative flex h-[230px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl shadow-sm">
                <AdjustablePowerAnimatedBg playing={adjustablePowerHover} />
                <h3 className="relative z-10 w-full px-6 pt-6 text-center text-[18px] font-harmony-black uppercase tracking-[0px]">
                  ADJUSTABLE POWER
                </h3>
              </div>
            </div>
            <div
              className="w-full origin-center cursor-pointer transition-transform duration-300 ease-out hover:z-20 hover:scale-[1.06] hover:shadow-xl"
              onMouseEnter={() => setAdjustableAirflowHover(true)}
              onMouseLeave={() => setAdjustableAirflowHover(false)}
            >
              <div className="relative flex h-[180px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl shadow-sm">
                <AdjustableAirflowAnimatedBg playing={adjustableAirflowHover} />
                <h3 className="relative z-10 w-full px-6 pt-6 text-center text-[18px] font-harmony-black uppercase tracking-[0px]">
                  ADJUSTABLE AIRFLOW
                </h3>
              </div>
            </div>
            <div
              className="w-full origin-center cursor-pointer transition-transform duration-300 ease-out hover:z-20 hover:scale-[1.06] hover:shadow-xl"
              onMouseEnter={() => setPower1100MahHover(true)}
              onMouseLeave={() => setPower1100MahHover(false)}
            >
              <div className="relative flex h-[230px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl text-center shadow-sm">
                <Power1100CrossfadeBg playing={power1100MahHover} />
                <h3 className="relative z-10 w-full px-6 pt-6 text-center text-[18px] font-harmony-black uppercase tracking-[0px]">
                  POWER THAT LASTS-1100MAH
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Video Module */}
      <div
        className="relative w-full cursor-default overflow-hidden bg-gray-900"
        onMouseEnter={() => {
          void sectionVideoRef.current?.play().catch(() => {});
        }}
        onMouseLeave={() => {
          sectionVideoRef.current?.pause();
        }}
      >
        <video
          ref={sectionVideoRef}
          className="block w-full h-auto"
          src={withBase('videos/section-video.mp4')}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* 6. DIY CARTRIDGE Module */}
      <div className="min-h-[960px] w-full relative flex flex-col items-center pt-[80px] px-4">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row justify-between items-start z-10">
          <div className="w-full lg:w-1/2">
            <ScrollReveal>
              <h2 className="text-[48px] leading-[48px] tracking-[0px] uppercase font-harmony-black mb-[20px]">
                INTERACTIVE<br/>& PLAYFUL
              </h2>
            </ScrollReveal>
            <ScrollReveal delayMs={80}>
              <h3 className="text-[22px] tracking-[0px] uppercase font-harmony-black">
                DIY CARTRIDGE
              </h3>
            </ScrollReveal>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-start lg:items-end mt-10 lg:mt-0">
            <div className="flex flex-col items-start w-fit">
              <ScrollReveal delayMs={200} durationMs={SCROLL_REVEAL_BODY_DURATION_MS}>
                <p className="text-[16px] leading-[18px] tracking-[0px] text-left">
                  KeyPlay vape pets are designed to enhance the fun and enjoyment.<br/>
                  DIY your cartridege with the vape pets, your imagination has been<br/>
                  brought to Vapor Life.
                </p>
              </ScrollReveal>
              <div className="flex gap-[30px] mt-[50px] justify-start">
                <ScrollReveal delayMs={880} className="flex flex-col items-start gap-4">
                  <img src={withBase('images/icon-food-grade.png')} className="w-[60px] h-[60px] object-contain" alt="Food-grade PCTG" />
                  <span className="text-[16px] tracking-[0px]">Food-grade PCTG</span>
                </ScrollReveal>
                <ScrollReveal delayMs={1000} className="flex flex-col items-start gap-4">
                  <img src={withBase('images/icon-individual-packaging.png')} className="w-[60px] h-[60px] object-contain" alt="Individual packaging" />
                  <span className="text-[16px] tracking-[0px]">Individual packaging and optional</span>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[1400px] h-[540px] bg-gray-100 rounded-[40px] absolute bottom-[72px] flex items-end justify-center pb-8 shadow-2xl overflow-hidden">
          <video
            ref={diyPetVideoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={petVideoSrc}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="DIY Cartridge"
          />
          <div className="relative z-10 flex gap-[30px]">
            {[1, 2, 3, 4, 5].map((iconIndex) => (
              <button
                key={iconIndex}
                type="button"
                className="h-[50px] w-[50px] cursor-pointer border-0 bg-transparent p-0"
                onClick={() => {
                  setActiveVapePetIcon((prev) => {
                    if (prev === iconIndex) {
                      queueMicrotask(() => {
                        const v = diyPetVideoRef.current;
                        if (v) {
                          v.currentTime = 0;
                          void v.play().catch(() => {});
                        }
                      });
                      return prev;
                    }
                    return iconIndex;
                  });
                }}
                aria-label={`Vape pet icon ${iconIndex}`}
              >
                <img
                  src={vapePetIconSrc(iconIndex, activeVapePetIcon === iconIndex)}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7. CLACK JOY Module */}
      <div ref={clackJoySectionRef} className="min-h-[960px] w-full relative flex flex-col items-center overflow-hidden pt-[50px] px-4">
        <ClackJoySectionAnimatedBg
          playToken={clackJoyPlayToken}
          onSequenceComplete={handleClackJoyBgSequenceComplete}
        />
        {/* 左右图：相对整段 min-h 垂直居中，不与顶部文案同一 flex 行对齐 */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-2 sm:px-4 translate-y-[calc(7rem-1.25rem-1.875rem-1.25rem)]">
          <ClackJoyAsideScaleRow revealed={clackJoyAsideRevealed} />
        </div>
        <ScrollReveal className="relative z-20 w-full text-center mb-[8px]">
          <h2 className="text-[48px] tracking-[0px] uppercase font-harmony-black text-white">CLACK JOY</h2>
        </ScrollReveal>
        <ScrollReveal
          className="relative z-20 w-full max-w-[800px] mx-auto text-center"
          delayMs={200}
          durationMs={SCROLL_REVEAL_BODY_DURATION_MS}
        >
          <p className="text-[22px] tracking-[0px] text-white">
            The pod-system product, friendly vape companion. Clack and play, the satisfying vape that lives in your hands.
          </p>
        </ScrollReveal>
      </div>

      {/* 8. Instant Hit Module */}
      <div className="min-h-[960px] w-full relative flex flex-col items-center pt-[80px] px-4">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row justify-between items-start z-10">
          <div className="w-full lg:w-1/2">
            <ScrollReveal>
              <h2 className="text-[48px] leading-[48px] tracking-[0px] uppercase font-harmony-black">
                ZERO WAIT.<br/>INSTANT HIT.
              </h2>
            </ScrollReveal>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-start lg:items-end mt-10 lg:mt-0">
            <div className="flex flex-col items-start w-fit">
              <ScrollReveal delayMs={200} durationMs={SCROLL_REVEAL_BODY_DURATION_MS}>
                <p className="text-[16px] leading-[18px] tracking-[0px] text-left">
                  Our upgraded wicking system eliminates the prime time,<br/>
                  so you never have to wait for your first hit again.
                </p>
              </ScrollReveal>
              <div className="flex gap-[120px] mt-[60px] justify-start">
                <ScrollReveal delayMs={880} className="flex flex-col items-start gap-4">
                  <img src={withBase('images/icon-zero-wait-core.png')} className="w-[60px] h-[60px] object-contain" alt="Zero wait core" />
                  <span className="text-[16px] tracking-[0px]">Flash Wicking</span>
                </ScrollReveal>
                <ScrollReveal delayMs={980} className="flex flex-col items-start gap-4">
                  <img src={withBase('images/icon-zero-wait-no-dry-hit.png')} className="w-[60px] h-[60px] object-contain" alt="Zero wait no dry hit" />
                  <span className="text-[16px] tracking-[0px]">Zero Dry Hits</span>
                </ScrollReveal>
                <ScrollReveal delayMs={1080} className="flex flex-col items-start gap-4">
                  <img src={withBase('images/icon-zero-wait-inhale.png')} className="w-[60px] h-[60px] object-contain" alt="Zero wait inhale" />
                  <span className="text-[16px] tracking-[0px]">Instant Satisfaction</span>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[1400px] h-[540px] bg-gray-100 rounded-[40px] absolute bottom-[72px] overflow-hidden shadow-2xl">
          <InstantHitAnimatedBg />
        </div>
      </div>

      {/* 9. Dual Mesh Module */}
      <div className="min-h-[960px] w-full relative flex flex-col items-center pt-[50px] px-4">
        <DualMeshSectionAnimatedBg />
        <ScrollReveal className="relative z-10 w-full text-center mb-[8px]">
          <h2 className="text-[48px] tracking-[0px] uppercase font-harmony-black text-black">SUPERIOR VAPOR</h2>
        </ScrollReveal>
        <ScrollReveal className="relative z-10 -top-[5px] w-full text-center mb-[8px]" delayMs={80}>
          <h3 className="text-[22px] tracking-[0px] uppercase font-harmony-black text-black">DUAL MESH</h3>
        </ScrollReveal>
        <ScrollReveal
          className="relative z-10 w-full max-w-[800px] mx-auto text-center"
          delayMs={200}
          durationMs={SCROLL_REVEAL_BODY_DURATION_MS}
        >
          <p className="text-[16px] leading-[18px] tracking-[0px] text-black">
            The dual mesh coils work together for decent clouds and satisfying hits.<br/>
            Innovative new generation of dual mesh inside is to ensure simultaneous flavor precision and cloud excellence.
          </p>
        </ScrollReveal>
      </div>

      {/* 10. Power Adjustment Module */}
      <div className="min-h-[960px] w-full relative -top-[20px] flex flex-col lg:flex-row items-center justify-center px-4">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center justify-between h-full py-20">
          <div className="w-full lg:w-1/2 flex flex-col items-start relative h-[600px] justify-center">
            <ScrollReveal>
              <h2 className="text-[48px] leading-[48px] tracking-[0px] uppercase font-harmony-black mb-[30px]">
                YOUR VAPOR,<br/>YOUR RULES
              </h2>
            </ScrollReveal>
            <ScrollReveal delayMs={80}>
              <h3 className="text-[22px] tracking-[0px] uppercase font-harmony-black mb-[30px]">
                ADJUSTABLE POWER-22W-26W-28W
              </h3>
            </ScrollReveal>
            <ScrollReveal delayMs={200} durationMs={SCROLL_REVEAL_BODY_DURATION_MS}>
              <p className="text-[16px] leading-[18px] tracking-[0px] text-left">
                Craving richer clouds? Boost to 28W for intense vapor.<br/>
                Prefer smooth taste? Dial down to 22W for a milder hit.<br/>
                Find your sweet spot (22W-26W-28W) and savor every<br/>
                draw—your way!
              </p>
            </ScrollReveal>
            <div className="relative mt-10 h-[60px] w-[360px] overflow-hidden rounded-full">
              <img
                src={powerButtonSrc}
                alt={`${selectedPowerButton}W`}
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 z-10 flex">
                <button
                  type="button"
                  className="h-full flex-1 border-0 bg-transparent p-0"
                  onClick={() => setSelectedPowerButton(22)}
                  aria-label="22W"
                />
                <button
                  type="button"
                  className="h-full flex-1 border-0 bg-transparent p-0"
                  onClick={() => setSelectedPowerButton(26)}
                  aria-label="26W"
                />
                <button
                  type="button"
                  className="h-full flex-1 border-0 bg-transparent p-0"
                  onClick={() => setSelectedPowerButton(28)}
                  aria-label="28W"
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[770px] h-[600px] mt-10 lg:mt-0 rounded-[40px] overflow-hidden shadow-2xl">
            <AdjustablePowerSceneAnimated power={selectedPowerButton} />
          </div>
        </div>
      </div>

      {/* 11. Large Tank Module */}
      <div className="min-h-[960px] w-full relative bg-cover bg-center flex flex-col items-center pt-[50px] px-4" style={{ backgroundImage: `url(${withBase('images/large-tank-bg.jpg')})` }}>
        <ScrollReveal className="w-full text-center mb-[8px]">
          <h2 className="text-[48px] tracking-[0px] uppercase font-harmony-black text-black">CLEAR AND LARGE CAPACITY TANK</h2>
        </ScrollReveal>
        <ScrollReveal
          className="w-full max-w-[800px] mx-auto text-center"
          delayMs={200}
          durationMs={SCROLL_REVEAL_BODY_DURATION_MS}
        >
          <p className="text-[16px] leading-[18px] tracking-[0px] text-black">
            Every drop stays securely inside, clearly in sight, while precision wicking ensures nothing goes to waste.<br/>
            Large capacity, total visibility, and reliable performance—engineered as one.
          </p>
        </ScrollReveal>
      </div>

      {/* 12. Airflow Adjustment Module */}
      <div className="min-h-[960px] w-full relative flex flex-col lg:flex-row items-center justify-center px-4">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center justify-between h-full py-20">
          <div className="w-full lg:w-[770px] h-[600px] relative mb-10 lg:mb-0 rounded-[40px] overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center">
            <video
              key={airflowMode}
              className="h-full w-full object-cover"
              src={airflowVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Airflow Adjustment"
            />
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[200px] h-[60px] bg-white rounded-full flex items-center justify-center font-bold text-black border-2 border-gray-200 shadow-lg overflow-hidden p-1">
              <img
                src={airflowModeSrc}
                alt={`${airflowMode} mode`}
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 z-10 flex">
                <button
                  type="button"
                  className="h-full flex-1 border-0 bg-transparent p-0"
                  onClick={() => setAirflowMode('tight')}
                  aria-label="Tight mode"
                />
                <button
                  type="button"
                  className="h-full flex-1 border-0 bg-transparent p-0"
                  onClick={() => setAirflowMode('loose')}
                  aria-label="Loose mode"
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-start lg:pl-20 justify-center">
            <ScrollReveal>
              <h2 className="text-[48px] leading-[48px] tracking-[0px] uppercase font-harmony-black mb-[30px]">
                YOUR VAPOR,<br/>YOUR RULES
              </h2>
            </ScrollReveal>
            <ScrollReveal delayMs={80}>
              <h3 className="text-[22px] leading-[22px] tracking-[0px] uppercase font-harmony-black mb-[30px]">
                ADJUSTABLE AIRFLOW-<br/>LOOSE/TIGHT MTL
              </h3>
            </ScrollReveal>
            <ScrollReveal delayMs={200} durationMs={SCROLL_REVEAL_BODY_DURATION_MS}>
              <p className="text-[16px] leading-[18px] tracking-[0px] text-left">
                Equipped with 2 sizes of air intakes, the KeyPlay allows<br/>
                you to switch between loose or tight MTL.<br/>
                Whether you prefer a tighter draw for a satisfying<br/>
                throat hit or a more airy draw for bigger clouds,<br/>
                the KeyPlay delivers.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* 13. Battery Life Module */}
      <div className="min-h-[960px] w-full relative bg-cover bg-center flex flex-col items-center pt-[50px] px-4" style={{ backgroundImage: `url(${withBase('images/battery-fast-charge-bg.jpg')})` }}>
        <ScrollReveal className="w-full text-center mb-[8px]">
          <h2 className="text-[48px] tracking-[0px] uppercase font-harmony-black text-black">POWER THAT LASTS-1100MAH</h2>
        </ScrollReveal>
        <ScrollReveal
          className="w-full max-w-[800px] mx-auto text-center"
          delayMs={200}
          durationMs={SCROLL_REVEAL_BODY_DURATION_MS}
        >
          <p className="text-[16px] leading-[18px] tracking-[0px] text-black">
            Powerful 1100mAh Battery, Quick Recharging<br/>
            Powered by an integrated 1100mAh battery, long-lasting use and Type-C charging for quick power-ups.
          </p>
        </ScrollReveal>
      </div>

      {/* 14. Hidden Screen Module */}
      <div className="min-h-[960px] w-full relative flex flex-col items-center pt-[50px] px-4">
        <div className="w-full max-w-[1400px] flex flex-col items-start mb-10">
          <ScrollReveal className="w-full">
            <h2 className="text-[48px] tracking-[0px] uppercase font-harmony-black mb-[8px]">HIDDEN SCREEN</h2>
          </ScrollReveal>
          <ScrollReveal className="w-full" delayMs={200} durationMs={SCROLL_REVEAL_BODY_DURATION_MS}>
            <p className="text-[16px] tracking-[0px] text-left">
              The hidden screen will be glittering when you vape, which shows the battery level and power wattage.
            </p>
          </ScrollReveal>
        </div>
        <div className="w-full max-w-[1400px] h-[620px] rounded-[40px] overflow-hidden shadow-2xl">
          <HiddenScreenAnimated />
        </div>
      </div>

      {/* 15. Child Lock Module */}
      <div className="min-h-[960px] w-full bg-[#d7ff00] relative flex flex-col items-center pt-[50px] pb-[57px] px-4">
        <ScrollReveal className="w-full text-center mb-[8px]">
          <h2 className="text-[48px] tracking-[0px] uppercase font-harmony-black">CHILD-PROF DEVICE</h2>
        </ScrollReveal>
        <ScrollReveal
          className="w-full max-w-[800px] mx-auto text-center mb-10"
          delayMs={200}
          durationMs={SCROLL_REVEAL_BODY_DURATION_MS}
        >
          <p className="text-[16px] leading-[18px] tracking-[0px]">
            This Child-proof locking button is designed on the device, easy to use button locking system allows for<br/>
            adult consumers to open easily while protecting children from nicotine-containing vapour.
          </p>
        </ScrollReveal>
        <div className="relative z-0 w-full max-w-[550px] h-[580px] mt-auto mb-10">
          <ChildLockAnimated />
        </div>
        <div className="relative z-10 w-full max-w-[800px] h-[70px] bg-white rounded-full flex items-center justify-center text-[16px] tracking-[0px] font-bold mt-auto shadow-xl">
          Press the button for 5 times within 1.5 seconds to turn on/ turn off the device.
        </div>
      </div>

      {/* 16. E-liquid Module */}
      <div className="min-h-[1200px] w-full relative flex flex-col items-center pt-[50px] pb-[65px] px-4">
        <ScrollReveal className="w-full text-center mb-[8px]">
          <h2 className="text-[48px] tracking-[0px] uppercase font-harmony-black">KEYPLAY E-LIQUID</h2>
        </ScrollReveal>
        <ScrollReveal className="relative -top-[5px] w-full text-center mb-[8px]" delayMs={80}>
          <h3 className="text-[22px] tracking-[0px] uppercase font-harmony-black">PEFECTLY MATCH WITH KEYPLAY DEVICE</h3>
        </ScrollReveal>
        <ScrollReveal
          className="w-full max-w-[1000px] mx-auto text-center mb-10"
          delayMs={200}
          durationMs={SCROLL_REVEAL_BODY_DURATION_MS}
        >
          <p className="text-[16px] leading-[18px] tracking-[0px] lowercase">
            Professional flavorist team is to ensure the e-liquid perfectly matching with KeyPlay series devices,<br/>
            indulging in clouds of pure flavor with every puff.<br/>
            Different Capacity for Different Markets 10mL/30mL different capacities are available for EU or other markets.
          </p>
        </ScrollReveal>
        <div className="relative mb-10 h-[60px] w-[280px] overflow-hidden rounded-full">
          <img
            src={selectedELiquidCapacity === 10 ? withBase('images/e-liquid-capacity-10ml.png') : withBase('images/e-liquid-capacity-30ml.png')}
            alt={`${selectedELiquidCapacity}mL capacity`}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 z-10 flex">
            <button
              type="button"
              className="h-full flex-1 border-0 bg-transparent p-0"
              onClick={() => setSelectedELiquidCapacity(10)}
              aria-label="10mL"
            />
            <button
              type="button"
              className="h-full flex-1 border-0 bg-transparent p-0"
              onClick={() => setSelectedELiquidCapacity(30)}
              aria-label="30mL"
            />
          </div>
        </div>
        <div className="w-full max-w-[1400px] h-[700px] mt-auto rounded-[40px] overflow-hidden">
          <img
            src={selectedELiquidCapacity === 10 ? withBase('images/e-liquid-10ml.jpg') : withBase('images/e-liquid-30ml.jpg')}
            className="w-full h-full object-cover"
            alt="E-liquid"
          />
        </div>
      </div>

      {/* 17. Product Comparison Module：标题/Tab 保留左右留白，对比图框全屏宽 */}
      <div className="min-h-[1780px] w-full relative flex flex-col items-center justify-center bg-white">
        <div className="flex w-full max-w-[1400px] mx-auto flex-col items-center px-4">
          <ScrollReveal className="relative -top-[80px] w-full text-center mb-[20px]">
            <h2 className="text-[48px] leading-[48px] tracking-[0px] uppercase font-harmony-black">WHICH KEYPLAY FITS YOU BEST?</h2>
          </ScrollReveal>
          <div className="relative -top-[20px] w-full max-w-[540px] h-[48px] mb-[70px] overflow-hidden rounded-full">
            <img
              src={productCategoryTabSrc}
              alt="Product category"
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 z-10 flex">
              <button
                type="button"
                className="h-full flex-1 border-0 bg-transparent p-0"
                onClick={() => goComparisonTab(0)}
                aria-label="KEYPLAY"
              />
              <button
                type="button"
                className="h-full flex-1 border-0 bg-transparent p-0"
                onClick={() => goComparisonTab(1)}
                aria-label="KEYPLAY 40K"
              />
              <button
                type="button"
                className="h-full flex-1 border-0 bg-transparent p-0"
                onClick={() => goComparisonTab(2)}
                aria-label="KEYPLAY 50K"
              />
            </div>
          </div>
        </div>
        <div className="relative h-[1225px] w-full max-w-[1400px] mx-auto shrink-0 overflow-hidden rounded-none bg-white">
          <div
            className="flex h-full ease-in-out"
            role="presentation"
            onTransitionEnd={handleComparisonCarouselTransitionEnd}
            style={{
              width: '400%',
              transform: `translateX(calc(-${comparisonCarouselPage} * 100% / 4))`,
              transition: comparisonSkipSlideTransition
                ? 'none'
                : `transform ${COMPARISON_CAROUSEL_SLIDE_MS}ms ease-in-out`,
            }}
          >
            {COMPARISON_CAROUSEL_PANEL_CENTERS.map((centerIndex, slideIndex) => {
              const leftIndex = ((centerIndex + 2) % 3) as 0 | 1 | 2;
              const rightIndex = ((centerIndex + 1) % 3) as 0 | 1 | 2;
              const isActiveSlide =
                comparisonIndex === centerIndex && comparisonCarouselPage === slideIndex;
              return (
                <div
                  key={slideIndex === 3 ? 'comparison-clone' : slideIndex}
                  className="flex h-full shrink-0"
                  style={{ width: `${100 / 4}%` }}
                >
                  <div className="flex h-full w-full items-stretch bg-white">
                    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
                      <img
                        src={COMPARISON_IMAGE_URLS[leftIndex]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-right"
                        draggable={false}
                        aria-hidden
                      />
                    </div>
                    <div
                      className="relative min-h-0 min-w-0 shrink-0 overflow-hidden"
                      style={{
                        flex: `0 1 ${COMPARISON_CAROUSEL_MIDDLE_MAX_W}px`,
                        maxWidth: '100%',
                      }}
                    >
                      <img
                        src={COMPARISON_IMAGE_URLS[centerIndex]}
                        alt={isActiveSlide ? 'KeyPlay product comparison' : ''}
                        className="absolute inset-0 h-full w-full object-cover object-center"
                        draggable={false}
                        aria-hidden={!isActiveSlide}
                      />
                    </div>
                    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
                      <img
                        src={COMPARISON_IMAGE_URLS[rightIndex]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-left"
                        draggable={false}
                        aria-hidden
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;
