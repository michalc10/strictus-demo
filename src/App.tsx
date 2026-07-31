"use client";

/* eslint-disable @next/next/no-img-element -- all imagery is a local copy of official Strictus assets */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const categories = [
  {
    index: "01",
    title: "Okablowanie miedziane",
    description: "Kompletne systemy transmisji danych — od przewodów po elementy zakończeniowe.",
    image: "strictus/category-1.webp",
    href: "https://b2b.strictus.pl/okablowanie-miedziane-c95",
  },
  {
    index: "02",
    title: "Światłowody",
    description: "Infrastruktura optyczna dla sieci o wysokiej przepustowości i niezawodności.",
    image: "strictus/category-5.webp",
    href: "https://b2b.strictus.pl/okablowanie-swiatlowodowe-c64",
  },
  {
    index: "03",
    title: "Produkty elektryczne",
    description: "Aparatura i osprzęt do bezpiecznych, nowoczesnych instalacji elektrycznych.",
    image: "strictus/category-3.webp",
    href: "https://b2b.strictus.pl/produkty-elektryczne-c61",
  },
  {
    index: "04",
    title: "Prowadzenie kabli",
    description: "Trasy, koryta i systemy organizacji instalacji w każdym środowisku technicznym.",
    image: "strictus/category-2.webp",
    href: "https://b2b.strictus.pl/elementy-prowadzenia-kabli-c42",
  },
  {
    index: "05",
    title: "Szafy 19\"",
    description: "Szafy teleinformatyczne i akcesoria do uporządkowanej infrastruktury IT.",
    image: "strictus/category-6.png",
    href: "https://b2b.strictus.pl/szafy-19-c49",
  },
  {
    index: "06",
    title: "Okablowanie telefoniczne",
    description: "Sprawdzone przewody i komponenty dla instalacji telefonicznych i sterujących.",
    image: "strictus/category-4.webp",
    href: "https://b2b.strictus.pl/okablowanie-telefoniczne-c67",
  },
];

const suppliers = [
  "3M",
  "ALANTEC",
  "BELDEN",
  "BITNER",
  "COMMSCOPE",
  "FLUKE",
  "LEGRAND",
  "R&M",
  "RITTAL",
  "SOCOMEC",
  "ZPAS",
];

const departments = {
  handel: {
    label: "Dział handlowy",
    people: [
      ["Łukasz Bartoszuk", "lbartoszuk@strictus.pl", "+48 602 750 977"],
      ["Łukasz Feluch", "lfeluch@strictus.pl", "+48 668 840 387"],
      ["Mirosław Michno", "mmichno@strictus.pl", "+48 668 857 668"],
      ["Jarosław Szulborski", "jszulborski@strictus.pl", "+48 734 191 956"],
    ],
  },
  logistyka: {
    label: "Logistyka",
    people: [
      ["Eryk Cieśluk", "eciesluk@strictus.pl", "+48 602 758 616"],
      ["Łukasz Kalinowski", "lkalinowski@strictus.pl", "+48 734 191 237"],
      ["Paweł Sokólski", "psokolski@strictus.pl", "+48 668 912 700"],
    ],
  },
  biuro: {
    label: "B2B i biuro",
    people: [
      ["Rafał Saniewski · B2B", "rsaniewski@strictus.pl", "+48 664 429 548"],
      ["Aneta Depta · rozliczenia", "adepta@strictus.pl", "+48 85 688 32 85"],
      ["Marcin Depta · dyrektor handlowy", "mdepta@strictus.pl", "+48 662 190 312"],
    ],
  },
} as const;

type DepartmentKey = keyof typeof departments;
type MotionMode = "fiber" | "stream" | "constellation" | "aurora" | "scanner";
type MotionPoint = { x: number; y: number };
type ConstellationNode = MotionPoint & { phase: number; speed: number };

const motionModes: { id: MotionMode; label: string; shortLabel: string }[] = [
  { id: "fiber", label: "Światłowód", shortLabel: "Fiber" },
  { id: "stream", label: "Strumień danych", shortLabel: "Data" },
  { id: "constellation", label: "Konstelacja", shortLabel: "Nodes" },
  { id: "aurora", label: "Aurora", shortLabel: "Glow" },
  { id: "scanner", label: "Skaner LiDAR", shortLabel: "Scan" },
];

function InteractiveSiteField({ mode }: { mode: MotionMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stage = canvas.parentElement;
    const context = canvas.getContext("2d");
    if (!stage || !context) return;
    const canvasElement: HTMLCanvasElement = canvas;
    const drawingContext: CanvasRenderingContext2D = context;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, active: false };
    const easedMouse = { x: 0, y: 0 };
    let trail: MotionPoint[] = [];
    let nodes: ConstellationNode[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    function rebuild() {
      const rect = canvasElement.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvasElement.width = Math.round(width * ratio);
      canvasElement.height = Math.round(height * ratio);
      drawingContext.setTransform(ratio, 0, 0, ratio, 0, 0);

      mouse.x = width * .7;
      mouse.y = height * .42;
      easedMouse.x = mouse.x;
      easedMouse.y = mouse.y;
      trail = Array.from({ length: width < 700 ? 44 : 66 }, (_, index) => ({
        x: width * .72 - index * 9,
        y: height * .42 + Math.sin(index * .32) * 11,
      }));
      nodes = Array.from({ length: width < 700 ? 30 : 56 }, (_, index) => ({
        x: ((Math.sin(index * 91.73) + 1) / 2) * width,
        y: ((Math.cos(index * 47.11) + 1) / 2) * height,
        phase: index * .83,
        speed: .65 + (index % 5) * .08,
      }));
      if (reducedMotion) renderFrame(0, false);
    }

    function updateEasedPointer(time: number) {
      const idleX = width * .68 + Math.cos(time * .00032) * width * .12;
      const idleY = height * .4 + Math.sin(time * .00045) * height * .13;
      const targetX = mouse.active ? mouse.x : idleX;
      const targetY = mouse.active ? mouse.y : idleY;
      easedMouse.x += (targetX - easedMouse.x) * .075;
      easedMouse.y += (targetY - easedMouse.y) * .075;
    }

    function strokeTrail(points: MotionPoint[], color: string, lineWidth: number, offset: number, time: number) {
      if (points.length < 2) return;
      drawingContext.beginPath();
      drawingContext.moveTo(points[0].x, points[0].y + offset);
      for (let index = 1; index < points.length - 1; index += 1) {
        const point = points[index];
        const next = points[index + 1];
        const wave = Math.sin(index * .44 + time * .003) * offset * .7;
        const midX = (point.x + next.x) / 2;
        const midY = (point.y + next.y) / 2 + wave;
        drawingContext.quadraticCurveTo(point.x, point.y + wave, midX, midY);
      }
      drawingContext.strokeStyle = color;
      drawingContext.lineWidth = lineWidth;
      drawingContext.lineCap = "round";
      drawingContext.stroke();
    }

    function drawFiber(time: number) {
      trail[0].x += (easedMouse.x - trail[0].x) * .32;
      trail[0].y += (easedMouse.y - trail[0].y) * .32;
      for (let index = 1; index < trail.length; index += 1) {
        const follow = trail[index - 1];
        trail[index].x += (follow.x - trail[index].x) * .26;
        trail[index].y += (follow.y - trail[index].y) * .26;
      }

      drawingContext.save();
      drawingContext.globalCompositeOperation = "screen";
      drawingContext.shadowBlur = 17;
      drawingContext.shadowColor = "rgba(67, 199, 245, .7)";
      strokeTrail(trail, "rgba(9, 153, 209, .34)", 6, 0, time);
      drawingContext.shadowBlur = 8;
      strokeTrail(trail, "rgba(67, 199, 245, .92)", 1.7, -5, time);
      strokeTrail(trail, "rgba(255, 255, 255, .75)", .8, 3, time);
      strokeTrail(trail, "rgba(31, 91, 210, .7)", 1.1, 8, time);

      for (let index = 0; index < 4; index += 1) {
        const pointIndex = Math.floor((time * .012 + index * 12) % trail.length);
        const point = trail[pointIndex];
        drawingContext.beginPath();
        drawingContext.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
        drawingContext.fillStyle = "rgba(255, 255, 255, .95)";
        drawingContext.fill();
      }
      drawingContext.restore();
    }

    function streamY(line: number, x: number, time: number) {
      const base = height * (.2 + line * .13);
      const wave = Math.sin(x * .012 + time * .0012 + line * .8) * (8 + line * 1.5);
      const distanceX = Math.abs(x - easedMouse.x);
      const influence = mouse.active && distanceX < 250 ? Math.pow(1 - distanceX / 250, 2) : 0;
      return base + wave + (easedMouse.y - base) * influence * .36;
    }

    function drawStream(time: number) {
      drawingContext.save();
      drawingContext.globalCompositeOperation = "screen";
      for (let line = 0; line < 6; line += 1) {
        const gradient = drawingContext.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgba(9, 153, 209, 0)");
        gradient.addColorStop(.35, `rgba(9, 153, 209, ${.2 + line * .035})`);
        gradient.addColorStop(.68, "rgba(67, 199, 245, .56)");
        gradient.addColorStop(1, "rgba(67, 199, 245, 0)");
        drawingContext.beginPath();
        for (let x = -30; x <= width + 30; x += 14) {
          const y = streamY(line, x, time);
          if (x === -30) drawingContext.moveTo(x, y);
          else drawingContext.lineTo(x, y);
        }
        drawingContext.strokeStyle = gradient;
        drawingContext.lineWidth = line === 2 ? 1.7 : .8;
        drawingContext.stroke();

        const pulseX = ((time * (.055 + line * .006) + line * 180) % (width + 100)) - 50;
        const pulseY = streamY(line, pulseX, time);
        drawingContext.beginPath();
        drawingContext.arc(pulseX, pulseY, line === 2 ? 2.8 : 1.7, 0, Math.PI * 2);
        drawingContext.fillStyle = "rgba(255, 255, 255, .88)";
        drawingContext.shadowBlur = 12;
        drawingContext.shadowColor = "#43c7f5";
        drawingContext.fill();
      }
      drawingContext.restore();
    }

    function drawConstellation(time: number) {
      const linkDistance = width < 700 ? 126 : 156;
      const positions = nodes.map((node) => {
        const naturalX = node.x + Math.sin(time * .00028 * node.speed + node.phase) * 11;
        const naturalY = node.y + Math.cos(time * .00034 * node.speed + node.phase) * 9;
        const dx = easedMouse.x - naturalX;
        const dy = easedMouse.y - naturalY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const pull = mouse.active && distance < 310 ? Math.pow(1 - distance / 310, 2) * .62 : 0;
        return { x: naturalX + dx * pull, y: naturalY + dy * pull };
      });

      drawingContext.save();
      drawingContext.globalCompositeOperation = "screen";
      for (let first = 0; first < positions.length; first += 1) {
        for (let second = first + 1; second < positions.length; second += 1) {
          const dx = positions[first].x - positions[second].x;
          const dy = positions[first].y - positions[second].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > linkDistance) continue;
          drawingContext.beginPath();
          drawingContext.moveTo(positions[first].x, positions[first].y);
          drawingContext.lineTo(positions[second].x, positions[second].y);
          drawingContext.strokeStyle = `rgba(67, 199, 245, ${(1 - distance / linkDistance) * .23})`;
          drawingContext.lineWidth = .6;
          drawingContext.stroke();
        }
      }
      positions.forEach((point) => {
        const distance = Math.hypot(point.x - easedMouse.x, point.y - easedMouse.y);
        const close = mouse.active && distance < 240;
        drawingContext.beginPath();
        drawingContext.arc(point.x, point.y, close ? 2.2 : 1.1, 0, Math.PI * 2);
        drawingContext.fillStyle = close ? "rgba(255, 255, 255, .9)" : "rgba(67, 199, 245, .36)";
        drawingContext.fill();
        if (close) {
          drawingContext.beginPath();
          drawingContext.moveTo(point.x, point.y);
          drawingContext.lineTo(easedMouse.x, easedMouse.y);
          drawingContext.strokeStyle = `rgba(67, 199, 245, ${Math.max(0, 1 - distance / 240) * .48})`;
          drawingContext.stroke();
        }
      });
      if (mouse.active) {
        drawingContext.beginPath();
        drawingContext.arc(easedMouse.x, easedMouse.y, 36 + Math.sin(time * .002) * 5, 0, Math.PI * 2);
        drawingContext.strokeStyle = "rgba(67, 199, 245, .18)";
        drawingContext.lineWidth = .7;
        drawingContext.stroke();
      }
      drawingContext.restore();
    }

    function drawAurora(time: number) {
      drawingContext.save();
      drawingContext.globalCompositeOperation = "screen";
      const colors = [
        [67, 199, 245],
        [9, 153, 209],
        [45, 82, 205],
        [111, 234, 210],
      ];
      colors.forEach((color, index) => {
        const orbit = 75 + index * 38;
        const x = easedMouse.x + Math.cos(time * .00038 + index * 1.7) * orbit;
        const y = easedMouse.y + Math.sin(time * .00044 + index * 1.3) * orbit * .65;
        const size = 190 + index * 44;
        const gradient = drawingContext.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `rgba(${color.join(",")}, ${.11 - index * .012})`);
        gradient.addColorStop(.48, `rgba(${color.join(",")}, ${.045 - index * .006})`);
        gradient.addColorStop(1, `rgba(${color.join(",")}, 0)`);
        drawingContext.fillStyle = gradient;
        drawingContext.fillRect(0, 0, width, height);
      });
      drawingContext.restore();
    }

    function drawScanner(time: number) {
      drawingContext.save();
      drawingContext.translate(easedMouse.x, easedMouse.y);
      drawingContext.globalCompositeOperation = "screen";
      for (let ring = 0; ring < 5; ring += 1) {
        const radius = ((time * .045 + ring * 72) % 360) + 18;
        const alpha = Math.max(0, 1 - radius / 380) * .34;
        drawingContext.beginPath();
        drawingContext.arc(0, 0, radius, -.5, Math.PI * 1.35);
        drawingContext.strokeStyle = `rgba(67, 199, 245, ${alpha})`;
        drawingContext.lineWidth = ring === 0 ? 1.5 : .7;
        drawingContext.stroke();
      }
      const sweep = time * .0011;
      drawingContext.rotate(sweep);
      const beam = drawingContext.createLinearGradient(0, 0, 310, 0);
      beam.addColorStop(0, "rgba(67, 199, 245, .7)");
      beam.addColorStop(1, "rgba(67, 199, 245, 0)");
      drawingContext.fillStyle = beam;
      drawingContext.beginPath();
      drawingContext.moveTo(0, 0);
      drawingContext.lineTo(310, -12);
      drawingContext.lineTo(310, 12);
      drawingContext.closePath();
      drawingContext.fill();
      drawingContext.restore();

      drawingContext.save();
      drawingContext.strokeStyle = "rgba(255, 255, 255, .22)";
      drawingContext.lineWidth = .6;
      drawingContext.beginPath();
      drawingContext.moveTo(easedMouse.x - 18, easedMouse.y);
      drawingContext.lineTo(easedMouse.x + 18, easedMouse.y);
      drawingContext.moveTo(easedMouse.x, easedMouse.y - 18);
      drawingContext.lineTo(easedMouse.x, easedMouse.y + 18);
      drawingContext.stroke();
      drawingContext.restore();
    }

    function renderFrame(time: number, continueAnimation = true) {
      drawingContext.clearRect(0, 0, width, height);
      updateEasedPointer(time);
      if (mode === "fiber") drawFiber(time);
      if (mode === "stream") drawStream(time);
      if (mode === "constellation") drawConstellation(time);
      if (mode === "aurora") drawAurora(time);
      if (mode === "scanner") drawScanner(time);
      if (continueAnimation && !reducedMotion) frame = window.requestAnimationFrame((nextTime) => renderFrame(nextTime, true));
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    }

    function handlePointerLeave() {
      mouse.active = false;
    }

    function handlePointerEnd() {
      mouse.active = false;
    }

    const resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(canvasElement);
    stage.addEventListener("pointerdown", handlePointerMove);
    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerleave", handlePointerLeave);
    stage.addEventListener("pointercancel", handlePointerEnd);
    window.addEventListener("pointerup", handlePointerEnd);
    rebuild();
    if (!reducedMotion) frame = window.requestAnimationFrame((time) => renderFrame(time, true));

    return () => {
      resizeObserver.disconnect();
      stage.removeEventListener("pointerdown", handlePointerMove);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
      stage.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("pointerup", handlePointerEnd);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [mode]);

  return <canvas className="strictus-motion-canvas" ref={canvasRef} aria-hidden="true" />;
}

function MagneticLink({
  href,
  children,
  variant = "solid",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  external?: boolean;
}) {
  function handlePointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.14;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
    event.currentTarget.style.setProperty("--magnetic-x", `${x}px`);
    event.currentTarget.style.setProperty("--magnetic-y", `${y}px`);
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--magnetic-x", "0px");
    event.currentTarget.style.setProperty("--magnetic-y", "0px");
  }

  return (
    <a
      className={`strictus-button strictus-button-${variant}`}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span>{children}</span>
      <i aria-hidden="true">↗</i>
    </a>
  );
}

export default function StrictusPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [department, setDepartment] = useState<DepartmentKey>("handel");
  const [motionMode, setMotionMode] = useState<MotionMode>("fiber");

  useEffect(() => {
    const preferenceFrame = window.requestAnimationFrame(() => {
      try {
        const savedMode = window.localStorage.getItem("strictus-motion-mode");
        if (motionModes.some((item) => item.id === savedMode)) setMotionMode(savedMode as MotionMode);
      } catch {
        // A blocked local preference should never prevent the website from loading.
      }
    });
    return () => window.cancelAnimationFrame(preferenceFrame);
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    root.classList.add("strictus-motion-ready");
    const introFrame = window.requestAnimationFrame(() => root.classList.add("strictus-intro-ready"));
    const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("strictus-revealed"));
      return () => window.cancelAnimationFrame(introFrame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("strictus-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => {
      window.cancelAnimationFrame(introFrame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    let frame = 0;
    function updateScroll() {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      pageRef.current?.style.setProperty("--scroll-progress", String(progress));
    }
    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    }
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleHeroPointer(event: ReactPointerEvent<HTMLElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    event.currentTarget.style.setProperty("--pointer-x", `${x}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y}%`);
    event.currentTarget.style.setProperty("--parallax-x", `${(x - 50) * 0.1}px`);
    event.currentTarget.style.setProperty("--parallax-y", `${(y - 50) * 0.08}px`);
  }

  function handlePagePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.currentTarget.style.setProperty("--site-pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--site-pointer-y", `${event.clientY}px`);
  }

  function handleCardPointer(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--card-rotate-x", `${y * -4}deg`);
    event.currentTarget.style.setProperty("--card-rotate-y", `${x * 5}deg`);
    event.currentTarget.style.setProperty("--card-light-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--card-light-y", `${(y + 0.5) * 100}%`);
  }

  function resetCard(event: ReactPointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--card-rotate-x", "0deg");
    event.currentTarget.style.setProperty("--card-rotate-y", "0deg");
  }

  function selectMotionMode(mode: MotionMode) {
    setMotionMode(mode);
    try {
      window.localStorage.setItem("strictus-motion-mode", mode);
    } catch {
      // The selected mode remains active for the current visit.
    }
  }

  return (
    <div className="strictus-page" ref={pageRef} onPointerMove={handlePagePointer}>
      <div className="strictus-scroll-progress" aria-hidden="true" />
      <InteractiveSiteField mode={motionMode} />
      <div className="strictus-page-ambient" aria-hidden="true" />
      <header className="strictus-header">
        <a className="strictus-logo" href="#start" aria-label="Strictus — początek strony">
          <img src="strictus/logo.png" alt="Strictus" />
        </a>
        <nav className="strictus-desktop-nav" aria-label="Główna nawigacja">
          <a href="#oferta">Oferta</a>
          <a href="#o-nas">O firmie</a>
          <a href="#proces">Jak działamy</a>
          <a href="#kontakt">Kontakt</a>
        </nav>
        <a className="strictus-shop-link" href="https://b2b.strictus.pl/" target="_blank" rel="noreferrer">
          Sklep B2B <span aria-hidden="true">↗</span>
        </a>
        <button
          className="strictus-menu-button"
          type="button"
          aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      <div className={`strictus-mobile-menu ${menuOpen ? "strictus-mobile-menu-open" : ""}`}>
        <nav aria-label="Mobilna nawigacja">
          {[
            ["Oferta", "#oferta"],
            ["O firmie", "#o-nas"],
            ["Jak działamy", "#proces"],
            ["Kontakt", "#kontakt"],
          ].map(([label, href], index) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{label}<i>↗</i>
            </a>
          ))}
          <a href="https://b2b.strictus.pl/" target="_blank" rel="noreferrer">
            <span>05</span>Sklep B2B<i>↗</i>
          </a>
        </nav>
      </div>

      <main>
        <section
          className="strictus-hero"
          id="start"
          ref={heroRef}
          onPointerMove={handleHeroPointer}
        >
          <div className="strictus-hero-glow" aria-hidden="true" />
          <div className="strictus-motion-picker" aria-label="Wariant animacji tła">
            <div className="strictus-motion-picker-label">
              <span>Motion lab</span>
              <strong>{motionModes.findIndex((item) => item.id === motionMode) + 1}/5 · {motionModes.find((item) => item.id === motionMode)?.label}</strong>
            </div>
            <div className="strictus-motion-picker-options" role="tablist" aria-label="Wybierz animację">
              {motionModes.map((item, index) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={motionMode === item.id}
                  className={motionMode === item.id ? "strictus-motion-active" : ""}
                  onClick={() => selectMotionMode(item.id)}
                  key={item.id}
                >
                  <span>0{index + 1}</span>
                  <i>{item.shortLabel}</i>
                </button>
              ))}
            </div>
          </div>
          <div className="strictus-hero-copy">
            <p className="strictus-kicker"><span /> Teletechnika / elektroinstalacje / B2B</p>
            <h1>
              <span className="strictus-title-line"><span>Technika,</span></span>
              <span className="strictus-title-line"><span>która <em>łączy.</em></span></span>
            </h1>
            <p className="strictus-lead">
              Doradzamy, dobieramy i dostarczamy rozwiązania dla infrastruktury,
              na której możesz polegać. Od pojedynczego komponentu po wymagający projekt.
            </p>
            <div className="strictus-hero-actions">
              <MagneticLink href="#kontakt">Porozmawiaj z doradcą</MagneticLink>
              <MagneticLink href="https://b2b.strictus.pl/" variant="outline" external>Przejdź do B2B</MagneticLink>
            </div>
          </div>

          <div className="strictus-hero-visual">
            <div className="strictus-hero-image-wrap">
              <img src="strictus/category-1.webp" alt="Okablowanie sieciowe podłączone do infrastruktury teleinformatycznej" />
              <span className="strictus-image-scan" aria-hidden="true" />
            </div>
            <div className="strictus-data-chip strictus-data-chip-top">
              <span>STATUS</span><strong>Gotowi do działania</strong><i />
            </div>
            <div className="strictus-data-chip strictus-data-chip-bottom">
              <span>DOŚWIADCZENIE</span><strong>Od 2010 roku</strong>
            </div>
            <p className="strictus-visual-caption"><span>01</span> Infrastruktura danych / rozwiązania biznesowe</p>
          </div>

          <div className="strictus-hero-stats">
            <div><strong>2010</strong><span>Początek działalności</span></div>
            <div><strong>50+</strong><span>Renomowanych dostawców</span></div>
            <div><strong>3</strong><span>Kroki od potrzeby do dostawy</span></div>
          </div>
        </section>

        <section className="strictus-supplier-strip" aria-label="Wybrani dostawcy">
          <div className="strictus-marquee-track">
            {[...suppliers, ...suppliers].map((supplier, index) => (
              <span key={`${supplier}-${index}`}><i />{supplier}</span>
            ))}
          </div>
        </section>

        <section className="strictus-section strictus-offer" id="oferta">
          <div className="strictus-section-head" data-reveal>
            <p className="strictus-kicker"><span /> Oferta</p>
            <h2>Wszystko, czego wymaga<br /><em>nowoczesna infrastruktura.</em></h2>
            <p>Najważniejsze grupy produktowe są dostępne w sklepie B2B. Jeśli nie wiesz, czego potrzebujesz — dobierzemy rozwiązanie.</p>
          </div>
          <div className="strictus-category-grid">
            {categories.map((category) => (
              <a
                className="strictus-category-card"
                href={category.href}
                target="_blank"
                rel="noreferrer"
                key={category.title}
                onPointerMove={handleCardPointer}
                onPointerLeave={resetCard}
                data-reveal
              >
                <div className="strictus-category-image">
                  <img src={category.image} alt="" />
                </div>
                <div className="strictus-category-copy">
                  <span>{category.index}</span>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <i aria-hidden="true">↗</i>
                </div>
              </a>
            ))}
          </div>
          <div className="strictus-offer-cta" data-reveal>
            <p>Nie widzisz produktu, którego szukasz?</p>
            <MagneticLink href="#kontakt" variant="outline">Zapytaj o rozwiązanie</MagneticLink>
          </div>
        </section>

        <section className="strictus-about" id="o-nas">
          <div className="strictus-about-image" data-reveal>
            <img src="strictus/hero.jpg" alt="Siedziba Strictus w Białymstoku" />
            <div className="strictus-about-badge"><strong>15+</strong><span>lat praktyki<br />w branży</span></div>
          </div>
          <div className="strictus-about-copy" data-reveal>
            <p className="strictus-kicker"><span /> O firmie</p>
            <h2>Technologia potrzebuje<br /><em>dobrego partnera.</em></h2>
            <p>
              STRICTUS działa na rynku teletechniki i elektroinstalacji od 2010 roku.
              Łączymy szeroki wybór produktów renomowanych producentów z doradztwem
              opartym na rzeczywistym doświadczeniu projektowym.
            </p>
            <p>
              Nie sprzedajemy jednego schematu. Dobieramy rozwiązania technologiczne
              i ekonomiczne do wymagań, budżetu oraz skali inwestycji.
            </p>
            <ul>
              <li><span>01</span> Wiedza techniczna zamiast przypadkowego wyboru</li>
              <li><span>02</span> Oferta od rozwiązań ekonomicznych po zaawansowane</li>
              <li><span>03</span> Wsparcie także przy wymagających realizacjach</li>
            </ul>
          </div>
        </section>

        <section className="strictus-section strictus-process" id="proces">
          <div className="strictus-section-head strictus-process-head" data-reveal>
            <p className="strictus-kicker"><span /> Jak działamy</p>
            <h2>Od potrzeby<br /><em>do gotowego rozwiązania.</em></h2>
          </div>
          <div className="strictus-process-grid">
            {[
              ["01", "Rozmowa", "Opowiedz nam o instalacji, terminie i oczekiwanym rezultacie."],
              ["02", "Dobór i wycena", "Porównamy rozwiązania i przygotujemy ofertę dopasowaną do budżetu."],
              ["03", "Dostawa i wsparcie", "Dostarczymy sprzęt i zostaniemy z Tobą, gdy pojawi się pytanie techniczne."],
            ].map(([number, title, description]) => (
              <article key={number} data-reveal>
                <div className="strictus-process-number"><span>{number}</span><i /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="strictus-contact" id="kontakt">
          <div className="strictus-contact-lead" data-reveal>
            <p className="strictus-kicker"><span /> Kontakt</p>
            <h2>Projekt zaczyna się<br /><em>od rozmowy.</em></h2>
            <p>Skontaktuj się bezpośrednio z właściwym działem albo zadzwoń do biura. Odpowiemy konkretnie.</p>
            <a href="tel:+48856883285" className="strictus-phone">+48 85 688 32 85 <span>↗</span></a>
            <a href="mailto:strictus@strictus.pl" className="strictus-email">strictus@strictus.pl</a>
            <address>ul. Handlowa 7 lok. 20<br />15-399 Białystok</address>
          </div>
          <div className="strictus-contact-directory" data-reveal>
            <div className="strictus-department-tabs" role="tablist" aria-label="Działy Strictus">
              {(Object.keys(departments) as DepartmentKey[]).map((key) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={department === key}
                  className={department === key ? "strictus-tab-active" : ""}
                  onClick={() => setDepartment(key)}
                  key={key}
                >
                  {departments[key].label}
                </button>
              ))}
            </div>
            <div className="strictus-people" role="tabpanel" key={department}>
              {departments[department].people.map(([name, email, phone]) => (
                <article key={email}>
                  <div><span>{name.charAt(0)}</span></div>
                  <h3>{name}</h3>
                  <a href={`mailto:${email}`}>{email}</a>
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="strictus-final-cta">
          <div className="strictus-final-grid" aria-hidden="true" />
          <div data-reveal>
            <p className="strictus-kicker"><span /> Strictus / B2B</p>
            <h2>Gotowi połączyć<br />elementy Twojego projektu?</h2>
            <MagneticLink href="https://b2b.strictus.pl/" external>Otwórz sklep B2B</MagneticLink>
          </div>
        </section>
      </main>

      <footer className="strictus-footer">
        <p className="demo-notice">Projekt koncepcyjny — nieoficjalna strona Strictus.</p>
        <div className="strictus-footer-brand">
          <img src="strictus/logo.png" alt="Strictus" />
          <p>Profesjonaliści w teletechnice.</p>
        </div>
        <div>
          <span>Firma</span>
          <a href="#o-nas">O nas</a>
          <a href="#proces">Jak działamy</a>
          <a href="https://strictus.pl/rodo.html" target="_blank" rel="noreferrer">RODO</a>
        </div>
        <div>
          <span>Kontakt</span>
          <a href="tel:+48856883285">+48 85 688 32 85</a>
          <a href="mailto:strictus@strictus.pl">strictus@strictus.pl</a>
          <p>NIP 542-315-29-26</p>
        </div>
        <div className="strictus-footer-meta">
          <span>© {new Date().getFullYear()} STRICTUS</span>
          <a href="#start">Do góry ↑</a>
        </div>
      </footer>
    </div>
  );
}
