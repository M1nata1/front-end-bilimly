// src/pages/Auth/StudyCloud.tsx
// Правая панель: хаотичное качание элементов как на глади воды
import { COLORS, RIGHT_SCENE, STUDY_ITEMS } from "./auth.config";
import type { StudyIconName } from "./auth.config";
import type { CSSProperties } from "react";

function Icon({ name }: { name: StudyIconName }) {
    const p = {
        stroke: "rgba(250,250,255,0.9)",
        strokeWidth: 2,
        fill: "none",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    if (name === "sigma") {
        return (
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <path d="M18 5H7l6 7-6 7h11" {...p} />
            </svg>
        );
    }

    if (name === "atom") {
        return (
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="1.8" fill="rgba(255,58,58,0.95)" />
                <ellipse cx="12" cy="12" rx="9" ry="4" {...p} />
                <ellipse cx="12" cy="12" rx="4" ry="9" {...p} />
                <path d="M4.5 7.8c2.5 4.5 12.5 4.5 15 0" {...p} opacity="0.7" />
            </svg>
        );
    }

    if (name === "graph") {
        return (
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <path d="M4 18V6" {...p} />
                <path d="M4 18h16" {...p} />
                <path d="M6 15l4-4 3 3 5-6" {...p} />
                <circle cx="10" cy="11" r="1" fill="rgba(34,197,94,0.95)" />
            </svg>
        );
    }

    if (name === "pi") {
        return (
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <path d="M6 8h12" {...p} />
                <path d="M9 8v9" {...p} />
                <path d="M15 8v9" {...p} />
            </svg>
        );
    }

    if (name === "ruler") {
        return (
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <path d="M5 16 16 5l3 3L8 19H5z" {...p} />
                <path d="M13 8l3 3" {...p} opacity="0.7" />
                <path d="M11 10l3 3" {...p} opacity="0.7" />
            </svg>
        );
    }

    if (name === "flask") {
        return (
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <path d="M10 4h4" {...p} />
                <path d="M11 4v5l-5 8a2 2 0 0 0 1.7 3h8.6A2 2 0 0 0 18 17l-5-8V4" {...p} />
                <path d="M8.5 15h7" {...p} opacity="0.7" />
            </svg>
        );
    }

    // book (default)
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
            <path d="M7 4h10v16H7z" {...p} />
            <path d="M9 7h6" {...p} opacity="0.7" />
            <path d="M9 10h6" {...p} opacity="0.7" />
            <path d="M9 13h5" {...p} opacity="0.7" />
        </svg>
    );
}

const { motion: M, layout: L } = RIGHT_SCENE;

// Защита от слишком больших значений из конфига
const ITEM_PULSE = Math.min(Math.max(M.itemPulseScale ?? 0.04, 0.01), 0.12);
const BLOB_PULSE = Math.min(Math.max(M.blobPulseScale ?? 0.06, 0.01), 0.14);

export default function StudyCloud() {
    return (
        <>
            <style>{`
        .cloud{
          position:relative;
          width:100%;
          height:100%;
          min-height:${L.minHeightDesktop};
          background:${COLORS.bgRight};
          overflow:hidden;
          isolation:isolate;
        }

        /* Фоновые пятна: качаются почти в том же ритме, что и элементы */
        .cloud-blob{
          position:absolute;
          border-radius:50%;
          opacity:.82;
          mix-blend-mode:screen;
          animation:blobSurface ${M.blobSyncDuration}s cubic-bezier(.42,.05,.35,1) infinite;
          will-change:transform;
        }

        @keyframes blobSurface{
          0%{transform:translate3d(0px,0px,0) rotate(0deg) scale(1)}
          14%{transform:translate3d(calc(var(--bfx) * .30px), calc(var(--bfy) * -.20px), 0) rotate(.4deg) scale(calc(1 + var(--bps) * .35))}
          31%{transform:translate3d(calc(var(--bfx) * -.22px), calc(var(--bfy) * -.55px), 0) rotate(-.7deg) scale(calc(1 + var(--bps) * .70))}
          47%{transform:translate3d(calc(var(--bfx) * -.52px), calc(var(--bfy) * .12px), 0) rotate(-1.1deg) scale(calc(1 - var(--bps) * .18))}
          63%{transform:translate3d(calc(var(--bfx) * .18px), calc(var(--bfy) * .42px), 0) rotate(.9deg) scale(calc(1 + var(--bps) * .22))}
          78%{transform:translate3d(calc(var(--bfx) * .46px), calc(var(--bfy) * .08px), 0) rotate(.6deg) scale(calc(1 - var(--bps) * .08))}
          100%{transform:translate3d(0px,0px,0) rotate(0deg) scale(1)}
        }

        .cloud-item{
          position:absolute;
          transform-origin:center;
          animation:surfaceBob 8s cubic-bezier(.42,.05,.35,1) infinite;
          will-change:transform,filter;
        }

        /* Хаотичное качание на глади воды: вбок + чуть вверх/вниз + легкий крен */
        @keyframes surfaceBob{
          0%{transform:translate(-50%,-50%) translate3d(0px,0px,0) rotate(var(--r)) scale(var(--s))}
          14%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * .30px), calc(var(--fy) * -.18px),0) rotate(calc(var(--r) + var(--fr) * .12deg)) scale(calc(var(--s) + ${ITEM_PULSE * 0.25}))}
          31%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * -.22px), calc(var(--fy) * -.52px),0) rotate(calc(var(--r) + var(--fr) * -.20deg)) scale(calc(var(--s) + ${ITEM_PULSE * 0.55}))}
          47%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * -.58px), calc(var(--fy) * .10px),0) rotate(calc(var(--r) + var(--fr) * -.34deg)) scale(calc(var(--s) - ${ITEM_PULSE * 0.18}))}
          63%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * .18px), calc(var(--fy) * .46px),0) rotate(calc(var(--r) + var(--fr) * .26deg)) scale(calc(var(--s) + ${ITEM_PULSE * 0.16}))}
          78%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * .48px), calc(var(--fy) * .08px),0) rotate(calc(var(--r) + var(--fr) * .14deg)) scale(calc(var(--s) - ${ITEM_PULSE * 0.08}))}
          100%{transform:translate(-50%,-50%) translate3d(0px,0px,0) rotate(var(--r)) scale(var(--s))}
        }

        .pill{
          display:inline-flex;
          align-items:center;
          gap:.55rem;
          padding:.58rem .82rem;
          border-radius:999px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          backdrop-filter:blur(16px);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 12px 40px rgba(0,0,0,.18);
        }

        .pill-chip{
          font-size:.8rem;
          color:${COLORS.textBody};
          font-weight:800;
        }

        .pill-formula{
          font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
          font-size:.86rem;
          color:rgba(250,250,255,0.92);
          letter-spacing:-.01em;
        }

        .pill-icon{
          width:46px;
          height:46px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0;
          border-radius:16px;
          line-height:0;
        }

        .pill-icon svg{
          display:block;
          flex:0 0 auto;
          margin:auto;
        }

        .dot{
          width:8px;
          height:8px;
          border-radius:50%;
          background:${COLORS.accent};
          box-shadow:0 0 0 4px rgba(255,58,58,0.14);
        }

        /* Ошибка формы: дрожание */
        @keyframes cloudshake{
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }

        .cloud.bad .cloud-item{
          animation:cloudshake ${M.shakeDuration}s ease-in-out 1 !important;
        }

        /*
          Успех формы: круговое движение вокруг собственной позиции.
          Техника: rotate(Θ) translateX(r) rotate(-Θ + --r) даёт точку на окружности радиуса r.
          0–8%  — разгон наружу к орбите
          8–87% — один полный оборот (360°)
          87–100% — плавный возврат в исходную точку
        */
        @keyframes successOrbit{
          0%  {transform:translate(-50%,-50%) rotate(0deg)   translateX(0px)  rotate(var(--r))               scale(var(--s))}
          8%  {transform:translate(-50%,-50%) rotate(0deg)   translateX(26px) rotate(var(--r))               scale(calc(var(--s) + 0.07))}
          29% {transform:translate(-50%,-50%) rotate(90deg)  translateX(26px) rotate(calc(-90deg  + var(--r))) scale(calc(var(--s) + 0.08))}
          50% {transform:translate(-50%,-50%) rotate(180deg) translateX(26px) rotate(calc(-180deg + var(--r))) scale(calc(var(--s) + 0.06))}
          71% {transform:translate(-50%,-50%) rotate(270deg) translateX(26px) rotate(calc(-270deg + var(--r))) scale(calc(var(--s) + 0.07))}
          87% {transform:translate(-50%,-50%) rotate(360deg) translateX(26px) rotate(calc(-360deg + var(--r))) scale(calc(var(--s) + 0.03))}
          100%{transform:translate(-50%,-50%) rotate(360deg) translateX(0px)  rotate(var(--r))               scale(var(--s))}
        }

        .cloud.good .cloud-item{
          animation:successOrbit ${M.successDuration}s cubic-bezier(.42,.05,.35,1) 1 !important;
        }

        @media (max-width:980px){
          .cloud{
            min-height:${L.minHeightMobile};
            height:${L.minHeightMobile};
          }
        }
      `}</style>

            <div className="cloud" aria-hidden>
                {RIGHT_SCENE.backgrounds.map((b, i) => {
                    const style = {
                        width: b.width,
                        height: b.height,
                        top: b.top,
                        left: b.left,
                        background: b.color,
                        filter: `blur(${b.blur}px)`,
                        animationDuration: `${b.duration || M.blobSyncDuration}s`,
                        animationDelay: `${b.delay || 0}s`,
                        ["--bfx" as string]: String(b.fx),
                        ["--bfy" as string]: String(b.fy),
                        ["--bps" as string]: String(b.pulse ?? BLOB_PULSE),
                    } as CSSProperties;

                    return <div key={`bg-${i}`} className={`cloud-blob cloud-blob-${i + 1}`} style={style} />;
                })}

                {STUDY_ITEMS.map((it, i) => {
                    const style = {
                        top: it.top,
                        left: it.left,
                        animationDelay: `${it.delay}s`,
                        animationDuration: `${it.duration}s`,
                        ["--r" as string]: `${it.rotate}deg`,
                        ["--s" as string]: String(it.scale),
                        ["--fx" as string]: String(it.fx),
                        ["--fy" as string]: String(it.fy),
                        ["--fr" as string]: String(it.fr),
                    } as CSSProperties;

                    return (
                        <div key={`item-${i}`} className={`cloud-item ${it.kind}`} style={style}>
                            {it.kind === "icon" && it.icon ? (
                                <div className="pill pill-icon"><Icon name={it.icon} /></div>
                            ) : it.kind === "chip" ? (
                                <div className="pill pill-chip"><span className="dot" /><span>{it.text}</span></div>
                            ) : (
                                <div className="pill pill-formula">{it.text}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
