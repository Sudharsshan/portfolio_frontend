import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { personal } from "../data/personal";
import { GraduationCap, Award, MapPin, Briefcase, Compass } from "lucide-react";

export default function AboutSection() {
  const { theme } = useTheme();

  return (
    <div style={{ padding: "6.5rem 1.5rem 4rem", maxWidth: "1100px", margin: "0 auto", minHeight: "85vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "4rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: theme.accent, letterSpacing: "0.15em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          CURRICULUM VITAE
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: theme.text, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          About S. Y. Sudharsshan
        </h1>
        <p style={{ color: theme.textMuted, marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Electrical engineer designing secure cyberphysical endpoints and micro-operating states.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3.5rem" }} className="md:grid-cols-[1.2fr_2fr]">
        
        {/* Left Column: Monogram & Performance Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Monogram Block with Silhouette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: `linear-gradient(135deg, ${theme.bgSecondary}CC 0%, ${theme.border}20 100%)`,
              border: `1px solid ${theme.border}40`,
              borderRadius: "24px",
              height: "240px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              padding: "0 2rem",
            }}
          >
            {/* Background design elements */}
            <div style={{ position: "absolute", inset: "12px", border: `1px dashed ${theme.border}20`, borderRadius: "16px", pointerEvents: "none" }} />
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", zIndex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "4.5rem",
                  fontWeight: "900",
                  background: `linear-gradient(130deg, ${theme.text} 30%, ${theme.accent} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                SYS
              </span>
              <span style={{ fontSize: "0.7rem", color: theme.textMuted, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.5rem" }}>
                Silicon & Hardware
              </span>
            </div>

            {/* Silhouette Profile Picture */}
            <div
              style={{
                width: "105px",
                height: "105px",
                borderRadius: "50%",
                background: `linear-gradient(180deg, ${theme.accent}15 0%, ${theme.border}40 100%)`,
                border: `1px solid ${theme.accent}30`,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
              }}
            >
              <svg
                viewBox="0 0 100 100"
                style={{
                  width: "80%",
                  height: "80%",
                  fill: theme.textMuted,
                  opacity: 0.8,
                }}
              >
                <circle cx="50" cy="38" r="17" />
                <path d="M50,60 C25,60 20,95 20,100 L80,100 C80,95 75,60 50,60 Z" />
              </svg>
            </div>
          </motion.div>

          {/* Quick Metrics Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                padding: "1rem 1.25rem",
                background: theme.bgSecondary,
                border: `1px solid ${theme.border}20`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <GraduationCap size={18} style={{ color: theme.accent }} />
              <div>
                <p style={{ fontSize: "0.7rem", color: theme.textMuted, margin: 0, textTransform: "uppercase" }}>Christ University</p>
                <p style={{ fontSize: "0.85rem", color: theme.text, fontWeight: "600", margin: 0 }}>B.Tech in EEE (CGPA 8.9)</p>
              </div>
            </div>

            <div
              style={{
                padding: "1rem 1.25rem",
                background: theme.bgSecondary,
                border: `1px solid ${theme.border}20`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <MapPin size={18} style={{ color: theme.accent }} />
              <div>
                <p style={{ fontSize: "0.7rem", color: theme.textMuted, margin: 0, textTransform: "uppercase" }}>Geographic hub</p>
                <p style={{ fontSize: "0.85rem", color: theme.text, fontWeight: "600", margin: 0 }}>Bengaluru, India</p>
              </div>
            </div>

            <div
              style={{
                padding: "1rem 1.25rem",
                background: theme.bgSecondary,
                border: `1px solid ${theme.border}20`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Award size={18} style={{ color: theme.accent }} />
              <div>
                <p style={{ fontSize: "0.7rem", color: theme.textMuted, margin: 0, textTransform: "uppercase" }}>Status</p>
                <p style={{ fontSize: "0.85rem", color: theme.accent, fontWeight: "700", margin: 0 }}>Available For Hire</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio Narrative & Specialty Interests */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: theme.text, marginBottom: "1rem", letterSpacing: "-0.01em" }}>
              My Core Philosophy
            </h2>
            <p style={{ color: theme.textMuted, fontSize: "1rem", lineHeight: "1.8", whiteSpace: "pre-line" }}>
              {personal.bio}
            </p>
          </div>

          <div
            style={{
              padding: "2rem",
              background: `linear-gradient(135deg, ${theme.bgSecondary}50 0%, ${theme.border}0A 100%)`,
              border: `1px dashed ${theme.border}40`,
              borderRadius: "16px",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: theme.accent, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Compass size={16} />
              <span>Co-Design & Hardware Interests</span>
            </h3>
            <p style={{ color: theme.textMuted, fontSize: "0.92rem", lineHeight: "1.7", margin: 0 }}>
              I study edge intelligence architectures that require low CPU states yet handle dynamic computer vision loads offline. 
              My experiments involve configuring DMA transfers on STM32 boards, designing high-efficiency power stages like buck controllers to maintain hardware resilience in real-world environments, and planning and structuring entire project architectures from inception to implementation.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
