import { useEffect, useRef, useState, type PointerEvent } from 'react';

/** 垂直 0–18、水平 0–35，对应文件名 {v}_{h}.png */
const V_MAX = 18;
const H_MAX = 35;
const SENS_H = 10;
const SENS_V = 12;
const INITIAL_V = 9;
const INITIAL_H = 18;

export function frameSrc(v: number, h: number) {
  return `${import.meta.env.BASE_URL}images/product-360/${v}_${h}.png`;
}

type Product360ViewerProps = {
  className?: string;
  resetSignal?: number;
  autoSpin?: boolean;
  onUserInteract?: () => void;
};

export function Product360Viewer({
  className,
  resetSignal = 0,
  autoSpin = false,
  onUserInteract,
}: Product360ViewerProps) {
  const [v, setV] = useState(INITIAL_V);
  const [h, setH] = useState(INITIAL_H);
  const drag = useRef<{ ox: number; oy: number; ov: number; oh: number } | null>(null);

  useEffect(() => {
    setV(INITIAL_V);
    setH(INITIAL_H);
  }, [resetSignal]);

  useEffect(() => {
    if (!autoSpin) return;
    const id = window.setInterval(() => {
      setH((x) => (x + 1) % (H_MAX + 1));
    }, 55);
    return () => clearInterval(id);
  }, [autoSpin]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    onUserInteract?.();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { ox: e.clientX, oy: e.clientY, ov: v, oh: h };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.ox;
    const dy = e.clientY - drag.current.oy;
    let nh = drag.current.oh - Math.round(dx / SENS_H);
    nh = ((nh % (H_MAX + 1)) + (H_MAX + 1)) % (H_MAX + 1);
    let nv = drag.current.ov + Math.round(dy / SENS_V);
    nv = Math.max(0, Math.min(V_MAX, nv));
    setH(nh);
    setV(nv);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`relative mx-auto my-auto flex h-[400px] w-[472px] max-w-full touch-none select-none items-center justify-center ${className ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <img
        src={frameSrc(v, h)}
        alt=""
        className="max-h-full max-w-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
