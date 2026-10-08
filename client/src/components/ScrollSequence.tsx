import { useEffect, useRef, useState } from "react";
import { ArrowDownRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { ENHANCED_FRAME_URLS } from "@/lib/enhancedFrameUrls";

gsap.registerPlugin(ScrollTrigger);
const TOTAL = ENHANCED_FRAME_URLS.length;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const cinematicFrame = (progress: number) => {
  const stops = [[0, 0], [0.12, 0.08], [0.33, 0.28], [0.55, 0.58], [0.76, 0.82], [0.92, 0.95], [1, 1]] as const;
  for (let i = 1; i < stops.length; i += 1) {
    const [endP, endF] = stops[i];
    const [startP, startF] = stops[i - 1];
    if (progress <= endP) {
      const local = (progress - startP) / (endP - startP);
      const eased = local * local * (3 - 2 * local);
      return (startF + (endF - startF) * eased) * (TOTAL - 1);
    }
  }
  return TOTAL - 1;
};

export default function ScrollSequence() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cache = useRef(new Map<number, HTMLImageElement>());
  const jobs = useRef(new Map<number, Promise<HTMLImageElement | null>>());
  const playhead = useRef({ frame: 0, progress: 0 });
  const camera = useRef({ scale: 1, x: 0, y: 0, mouseX: 0, mouseY: 0, velocity: 0 });
  const mouseTarget = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false, desynchronized: true });
    if (!root || !stage || !canvas || !ctx) return;
    let width = 0;
    let height = 0;
    let renderQueued = false;
    let cameraRaf = 0;
    let lastRendered = -1;
    let lastScale = 1;
    let lastX = 0;
    let lastY = 0;

    const load = (index: number) => {
      if (index < 0 || index >= TOTAL || cache.current.has(index)) return Promise.resolve(cache.current.get(index));
      if (jobs.current.has(index)) return jobs.current.get(index)!;
      const promise = new Promise<HTMLImageElement | null>((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = async () => {
          try { await image.decode?.(); } catch { /* optional */ }
          cache.current.set(index, image);
          jobs.current.delete(index);
          setProgress(Math.round((Math.min(cache.current.size, 18) / 18) * 100));
          requestRender();
          resolve(image);
        };
        image.onerror = () => { jobs.current.delete(index); resolve(null); };
        image.src = ENHANCED_FRAME_URLS[index];
      });
      jobs.current.set(index, promise);
      return promise;
    };
    const prioritize = (center: number) => {
      load(center);
      for (let distance = 1; distance <= 16; distance += 1) {
        load(center + distance);
        load(center - distance);
      }
      for (const index of Array.from(cache.current.keys())) {
        if (Math.abs(index - center) > 26 && index !== 0 && index !== TOTAL - 1) cache.current.delete(index);
      }
    };
    const render = () => {
      renderQueued = false;
      const wanted = clamp(Math.round(playhead.current.frame), 0, TOTAL - 1);
      const image = cache.current.get(wanted) || Array.from(cache.current.entries()).sort((a, b) => Math.abs(a[0] - wanted) - Math.abs(b[0] - wanted))[0]?.[1];
      if (!image || !width || !height) return;
      const p = playhead.current.progress;
      const cameraProgress = Math.sin(p * Math.PI);
      const scale = 1 + cameraProgress * 0.045 + Math.abs(camera.current.velocity) * 0.0015;
      const x = camera.current.mouseX * 10 + Math.sin(p * Math.PI * 2) * 3;
      const y = camera.current.mouseY * 7 - cameraProgress * 4;
      if (wanted === lastRendered && Math.abs(scale - lastScale) < 0.002 && Math.abs(x - lastX) < 0.2 && Math.abs(y - lastY) < 0.2) return;
      lastRendered = wanted;
      lastScale = scale;
      lastX = x;
      lastY = y;
      const fit = Math.max(width / image.naturalWidth, height / image.naturalHeight) * scale;
      const drawWidth = image.naturalWidth * fit;
      const drawHeight = image.naturalHeight * fit;
      ctx.fillStyle = "#f4f0e8";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, (width - drawWidth) / 2 + x, (height - drawHeight) / 2 + y, drawWidth, drawHeight);
    };
    function requestRender() {
      if (renderQueued) return;
      renderQueued = true;
      requestAnimationFrame(render);
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.15 : 1.5);
      width = canvas.width = Math.max(1, Math.round(rect.width * dpr));
      height = canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      requestRender();
    };
    const onPointerMove = (event: PointerEvent) => {
      mouseTarget.current.x = ((event.clientX / window.innerWidth) - 0.5) * 2;
      mouseTarget.current.y = ((event.clientY / window.innerHeight) - 0.5) * 2;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    load(0).then((image) => {
      if (image) { setReady(true); prioritize(0); requestRender(); }
    });

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: true });
    const onLenisScroll = ({ velocity }: { velocity: number }) => { camera.current.velocity += (velocity - camera.current.velocity) * 0.16; };
    lenis.on("scroll", onLenisScroll);
    lenis.on("scroll", ScrollTrigger.update);
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: () => `+=${window.innerHeight * (reduced ? 2.2 : 3.2)}`,
      pin: stage,
      scrub: reduced ? false : 0.14,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const nextProgress = self.progress;
        root.style.setProperty("--hero-progress", String(nextProgress));
        playhead.current.progress = nextProgress;
        playhead.current.frame = reduced ? (TOTAL - 1) * nextProgress : cinematicFrame(nextProgress);
        prioritize(Math.round(playhead.current.frame));
        requestRender();
      },
    });
    root.style.setProperty("--hero-progress", "0");
    const tick = (time: number) => {
      lenis.raf(time * 1000);
      camera.current.mouseX += (mouseTarget.current.x - camera.current.mouseX) * 0.06;
      camera.current.mouseY += (mouseTarget.current.y - camera.current.mouseY) * 0.06;
      camera.current.velocity *= 0.92;
      requestRender();
      cameraRaf = requestAnimationFrame((nextTime) => tick(nextTime / 1000));
    };
    cameraRaf = requestAnimationFrame((nextTime) => tick(nextTime / 1000));
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(cameraRaf);
      lenis.off("scroll", onLenisScroll);
      lenis.off("scroll", ScrollTrigger.update);
      trigger.kill();
      lenis.destroy();
    };
  }, [reduced]);

  return <section ref={rootRef} className={`sequence-hero ${reduced ? "sequence-hero--reduced" : ""}`} id="top">
    <div ref={stageRef} className="sequence-hero__stage"><canvas ref={canvasRef} aria-label="Cinematic coffee sequence" /><div className="sequence-hero__wash" />
      <header className="sequence-hero__bar"><span className="sequence-hero__status">Aurora Caffee / East Village</span><span className="sequence-hero__progress">{ready ? `${Math.round(progress)}% ready` : `Warming · ${progress}%`}</span></header>
      <div className="sequence-hero__copy"><p className="eyebrow">A slower kind of energy</p><h1>A better kind<br /><em>of morning.</em></h1><p className="sequence-hero__dek">Coffee with a point of view. Roasted carefully, poured slowly, and served in a room made for staying awhile.</p><a className="button button--dark" href="#ritual">Explore the ritual <ArrowDownRight size={15} /></a></div>
      <div className="sequence-hero__cue"><span>Scroll to wander</span><i /></div>
      <div className="sequence-hero__brand-mask" aria-label="Aurora Caffee logo"><span className="aurora-mark aurora-mark--dark" aria-hidden="true"><i className="aurora-mark__ring" /><b className="aurora-mark__spark">✦</b></span><span>Aurora</span></div>
      <div className={`sequence-hero__loading ${ready ? "is-ready" : ""}`}><div><p>{ready ? "Sequence ready" : `Preparing cinematic sequence · ${progress}%`}</p><span><b style={{ width: `${progress}%` }} /></span></div></div>
    </div>
    <div className="sequence-hero__after"><span>01</span><p>Every good day<br /><em>starts with a ritual.</em></p></div>
  </section>;
}
