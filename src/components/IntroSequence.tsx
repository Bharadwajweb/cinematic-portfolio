import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { ArrowDownRight } from "lucide-react"
import { gsap } from "gsap"
import { ParticlePortrait } from "./ParticlePortrait"

type IntroSequenceProps = {
  onComplete: () => void
}

const firstName = "BHARADWAJ"

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const completedRef = useRef(false)
  const [portraitPhase, setPortraitPhase] = useState<"scatter" | "assemble" | "hold" | "dissolve">("scatter")

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }, [onComplete])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish()
      return
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline()
      timelineRef.current = timeline

      timeline
        // Glowing dot: subtle pulse, then massive expansion
        .fromTo(
          ".intro-core",
          { scale: 0.08, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.38, ease: "back.out(3)" },
        )
        // Dot glow pulse
        .to(
          ".intro-core",
          { boxShadow: "0 0 60px rgba(184, 247, 96, 0.8), 0 0 120px rgba(184, 247, 96, 0.4)" },
          0,
        )
        // Massive expansion pushing out
        .to(".intro-core", {
          scale: 24,
          autoAlpha: 0,
          duration: 0.82,
          ease: "power4.in",
        }, "+=0.18")
        // Portrait phases: scatter → assemble as dot expands
        .call(() => setPortraitPhase("scatter"), [], 0)
        .call(() => setPortraitPhase("assemble"), [], "-=0.5")
        // Kicker label slides in
        .fromTo(
          ".intro-kicker",
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
          "-=0.35",
        )
        // Staggered first name letters with 3D entrance
        .fromTo(
          ".intro-name__char",
          { yPercent: 120, autoAlpha: 0, rotateX: -25, rotateZ: 8 },
          {
            yPercent: 0,
            autoAlpha: 1,
            rotateX: 0,
            rotateZ: 0,
            duration: 0.74,
            stagger: 0.042,
            ease: "power4.out",
          },
          "-=0.1",
        )
        // Subline appears
        .fromTo(
          ".intro-subline",
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
          "-=0.3",
        )
        // Portrait shell enters with scale
        .fromTo(
          ".intro-portrait-shell",
          { y: 20, scale: 0.94, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 0.92, ease: "power3.out" },
          "<",
        )
        // "PORTFOLIO" wordmark slides up from bottom
        .fromTo(
          ".intro-wordmark",
          { yPercent: 88, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 0.96, duration: 0.95, ease: "power3.out" },
          "-=0.5",
        )
        // Progress bar fills
        .fromTo(
          ".intro-progress__fill",
          { scaleX: 0 },
          { scaleX: 1, duration: 2.1, ease: "power1.inOut" },
          "-=0.95",
        )
        // Reveal the still portrait before the final dissolve
        .call(() => setPortraitPhase("hold"))
        .to({}, { duration: 0.92 })
        .call(() => setPortraitPhase("dissolve"))
        // Fade out name and scale portrait
        .to(".intro-name", { y: -20, autoAlpha: 0, duration: 0.48, ease: "power2.in" }, "<")
        .to(".intro-portrait-shell", { scale: 1.06, autoAlpha: 0, duration: 1, ease: "power2.out" }, "<")
        // Fade out entire intro
        .to(root, { autoAlpha: 0, duration: 0.72, ease: "power2.inOut" }, "+=0.28")
        .call(finish)
    }, root)

    return () => {
      timelineRef.current?.kill()
      context.revert()
    }
  }, [finish])

  const skipIntro = () => {
    const root = rootRef.current
    timelineRef.current?.kill()
    setPortraitPhase("dissolve")

    if (!root) {
      finish()
      return
    }

    gsap.to(root, {
      autoAlpha: 0,
      duration: 0.36,
      ease: "power2.out",
      onComplete: finish,
    })
  }

  return (
    <div
      ref={rootRef}
      className="intro-screen"
      role="region"
      aria-label="Cinematic introduction"
    >
      <h2 className="sr-only">Portfolio of Bharadwaj M</h2>
      <div className="intro-core" aria-hidden="true" />

      <div className="intro-topline">
        <p className="intro-topline__mark" aria-hidden="true">
          BM<span>.</span>
        </p>
        <p className="intro-topline__status">COMPUTER SCIENCE / CYBERSECURITY</p>
        <button className="intro-skip" type="button" onClick={skipIntro}>
          <span>Skip intro</span>
          <ArrowDownRight aria-hidden="true" />
        </button>
      </div>

      <div className="intro-layout" aria-hidden="true">
        <div className="intro-copy">
          <p className="intro-kicker">
            <span className="intro-kicker__index">01</span>
            <span>B.TECH CSE / CYBERSECURITY</span>
          </p>
          <h3 className="intro-name">
            <span className="intro-name__line">
              {Array.from(firstName).map((letter, index) => (
                <span className="intro-name__char" key={`${letter}-${index}`}>
                  {letter}
                </span>
              ))}
            </span>
            <span className="intro-name__line intro-name__line--last">
              <span className="intro-name__char">M</span>
              <span className="intro-name__suffix">/ CYBERSECURITY</span>
            </span>
          </h3>
          <p className="intro-subline">SOC ANALYST / SECURITY ANALYST / VAPT</p>
        </div>

        <div className="intro-portrait-shell">
          <ParticlePortrait phase={portraitPhase} className="intro-portrait-canvas" />
          <span className="intro-portrait-caption">FIG. 01 / PARTICLE PORTRAIT</span>
          <span className="intro-portrait-coordinate">CHENNAI / 2026</span>
        </div>
      </div>

      <div className="intro-wordmark" aria-hidden="true">
        PORTFOLIO
      </div>

      <div className="intro-bottomline" aria-hidden="true">
        <span>BHARADWAJ M / SELECTED WORK</span>
        <span className="intro-progress">
          <span className="intro-progress__fill" />
        </span>
        <span>INITIALIZING / 001</span>
      </div>
    </div>
  )
}
