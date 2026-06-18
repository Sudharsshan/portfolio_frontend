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
          {/* Monogram Block */}
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background design elements */}
            <div style={{ position: "absolute", inset: "12px", border: `1px dashed ${theme.border}20`, borderRadius: "16px", pointerEvents: "none" }} />
            
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "5.5rem",
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
            <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "0.5rem" }}>
              Silicon & Hardware
            </span>
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
              My experiments involve configuring DMA transfers on STM32 boards, balancing motor limits over CAN bus arrays, and designing high-efficiency power stages like buck controllers to maintain hardware resilience in real-world environments.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ borderLeft: `2px solid ${theme.accent}`, paddingLeft: "1rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: theme.text, margin: "0 0 0.25rem 0" }}>Hardware-Software Co-Design</h4>
              <p style={{ fontSize: "0.80rem", color: theme.textMuted, margin: 0 }}>Maximizing clock cycles on microcontrollers via optimized pointer bindings.</p>
            </div>
            <div style={{ borderLeft: `2px solid ${theme.accent}`, paddingLeft: "1rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: theme.text, margin: "0 0 0.25rem 0" }}>Low-Latency Telemetry</h4>
              <p style={{ fontSize: "0.80rem", color: theme.textMuted, margin: 0 }}>Encoding tight JSON strings or MQTT bytes to safely stream over volatile cellular networks.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
