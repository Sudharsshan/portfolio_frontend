import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "../lib/router";
import { personal } from "../data/personal";
import { Cpu, ArrowRight, Zap, Radio } from "lucide-react";

const tagline = "Hardware. Firmware. The space between.";

export default function HeroSection() {
  const { theme, timeOfDay } = useTheme();
  const [phase, setPhase] = useState<"hidden" | "greeting" | "name" | "tagline" | "cta">("hidden");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("greeting"), 200),
      setTimeout(() => setPhase("name"), 800),
      setTimeout(() => setPhase("tagline"), 1800),
      setTimeout(() => setPhase("cta"), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 clamp(1.5rem, 8vw, 8rem)",
        position: "relative",
        overflow: "hidden",
        background: theme.gradient,
      }}
    >
      {/* Dynamic Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${theme.border}20 1px, transparent 1px),
            linear-gradient(90deg, ${theme.border}20 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />

      {/* Cybernetic accent element */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          top: "40%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: `${theme.accent}05`,
          border: `1px dashed ${theme.border}30`,
          animation: "spin 60s linear infinite",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="hidden md:flex animate-pulse"
      >
        <div style={{ width: "180px", height: "180px", borderRadius: "50%", border: `1px dotted ${theme.border}20` }} />
        <Cpu size={32} style={{ position: "absolute", color: `${theme.accent}30` }} />
      </div>

      {/* Greeting row */}
      <AnimatePresence>
        {phase !== "hidden" && (
          <motion.p
            key="greeting"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
              color: theme.accent,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Radio size={14} className="animate-pulse" />
            {theme.label} — {timeOfDay === "morning" || timeOfDay === "noon" ? "daytime explorer" : "candlelight hacker"}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Big Display Name */}
      <AnimatePresence>
        {(phase === "name" || phase === "tagline" || phase === "cta") && (
          <motion.h1
            key="name"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: theme.text,
              marginBottom: "1.5rem",
            }}
          >
            S. Y.<br />
            <span style={{ color: theme.accent }}>Sudharsshan</span>
          </motion.h1>
        )}
      </AnimatePresence>

      {/* Typing Tagline */}
      <AnimatePresence>
        {(phase === "tagline" || phase === "cta") && (
          <motion.p
            key="tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.75rem)",
              color: theme.textMuted,
              maxWidth: "650px",
              marginBottom: "2.5rem",
              fontWeight: 300,
              letterSpacing: "0.01em",
              fontFamily: "var(--font-mono)",
            }}
          >
            {tagline.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.15 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Call To Actions */}
      <AnimatePresence>
        {phase === "cta" && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href="/projects"
                style={{
                  padding: "0.75rem 1.75rem",
                  background: theme.accent,
                  color: theme.bg,
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: `0 4px 14px ${theme.accent}33`,
                }}
                className="hover:opacity-90 hover:scale-[1.02]"
              >
                Explore Projects <ArrowRight size={16} />
              </Link>

              <Link
                href="/contact"
                style={{
                  padding: "0.75rem 1.75rem",
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  background: `${theme.bgSecondary}50`,
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  letterSpacing: "0.02em",
                  transition: "all 0.2s ease",
                }}
                className="hover:bg-accent hover:border-accent hover:text-bg"
              >
                Get in Touch
              </Link>
            </div>

            {/* Live Role Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.55rem 1.1rem",
                borderRadius: "100px",
                border: `1px solid ${theme.border}80`,
                background: `${theme.bgSecondary}cc`,
                fontSize: "0.8rem",
                color: theme.textMuted,
                letterSpacing: "0.05em",
                maxWidth: "fit-content",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: theme.accent,
                }}
                className="animate-ping"
              />
              <Zap size={12} style={{ color: theme.accent }} />
              Open to Embedded · IoT · Hardware-Software Roles in Bengaluru & Remote
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Down Scroll indicator */}
      <AnimatePresence>
        {phase === "cta" && (
          <motion.div
            key="scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            style={{
              position: "absolute",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
            onClick={() => {
              window.history.pushState(null, "", "/projects");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            <span style={{ fontSize: "0.7rem", color: theme.textMuted, letterSpacing: "0.15em", fontFamily: "var(--font-mono)" }}>PROJECTS</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: "1.1rem", color: theme.accent }}
            >
              ↓
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
