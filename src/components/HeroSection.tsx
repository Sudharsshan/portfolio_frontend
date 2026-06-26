import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "../lib/router";
import { themedQuotes } from "../data/personal";
import { Cpu, ArrowRight, Zap, Radio } from "lucide-react";

export default function HeroSection() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<"hidden" | "greeting" | "quote" | "cta">("hidden");
  const [selectedQuote, setSelectedQuote] = useState("");

  useEffect(() => {
    // Select a random quote on mount to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * themedQuotes.length);
    setSelectedQuote(themedQuotes[randomIndex]);

    const timers = [
      setTimeout(() => setPhase("greeting"), 200),
      setTimeout(() => setPhase("quote"), 800),
      setTimeout(() => setPhase("cta"), 1800),
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

      {/* Schematic Image Placeholder (To be replaced with user's image) */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          top: "22%",
          width: "min(350px, 30vw)",
          height: "min(460px, 45vw)",
          borderRadius: "16px",
          border: `1px dashed ${theme.border}`,
          background: `${theme.bgSecondary}40`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          overflow: "hidden",
          padding: "2rem",
          boxShadow: `0 12px 40px rgba(0,0,0,0.25)`,
          backdropFilter: "blur(4px)",
        }}
        className="hidden lg:flex"
      >
        <div style={{ position: "absolute", top: "12px", left: "12px", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: theme.textMuted, opacity: 0.5 }}>
          SYS_IMAGE_FRAME.BIN
        </div>
        <div style={{ position: "absolute", bottom: "12px", right: "12px", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: theme.textMuted, opacity: 0.5 }}>
          SCALE: 1.00
        </div>
        
        {/* Visual schematic rotating element */}
        <div style={{ position: "relative", width: "130px", height: "130px", display: "flex", alignItems: "center", justifyOrigin: "center", justifyContent: "center" }}>
          <div 
            style={{ 
              position: "absolute", 
              inset: 0, 
              border: `1px solid ${theme.border}60`, 
              borderRadius: "50%",
              animation: "spin 30s linear infinite"
            }} 
          />
          <div style={{ position: "absolute", inset: "16px", border: `1px dotted ${theme.border}80`, borderRadius: "50%" }} />
          <Cpu size={44} style={{ color: theme.accent, opacity: 0.8 }} />
        </div>
        
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: "600", color: theme.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
            Hardware Profile Photo
          </p>
          <p style={{ fontSize: "0.72rem", color: theme.textMuted, maxWidth: "220px", lineHeight: "1.4" }}>
            This placeholder card will render your custom uploaded portfolio image.
          </p>
        </div>
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
            {theme.label}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Big Display Quote instead of name */}
      <AnimatePresence>
        {(phase === "quote" || phase === "cta") && (
          <motion.h1
            key="quote"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: theme.text,
              marginBottom: "2rem",
              maxWidth: "850px",
            }}
          >
            {selectedQuote}
          </motion.h1>
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

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
