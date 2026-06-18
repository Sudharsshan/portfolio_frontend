import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { skillGroups } from "../data/skills";
import { Hammer, Blocks, Cpu, Database, Award, Settings2 } from "lucide-react";

// Choose nice representative icons based on index
const ICONS = [Cpu, Blocks, Hammer, Database, Settings2];

export default function SkillsSection() {
  const { theme } = useTheme();

  return (
    <div style={{ padding: "6.5rem 1.5rem 4rem", maxWidth: "1200px", margin: "0 auto", minHeight: "85vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "4rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: theme.accent, letterSpacing: "0.15em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          ENGINEERING SPECS
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: theme.text, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          Technical Stack & Skillsets
        </h1>
        <p style={{ color: theme.textMuted, marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Specialized indices across embedded silicon, responsive firmware, neural networking, and IoT telemetry architectures.
        </p>
      </div>

      {/* Grid of group cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {skillGroups.map((group, index) => {
          const GroupIcon = ICONS[index % ICONS.length] || Cpu;

          return (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              style={{
                background: theme.bgSecondary,
                border: `1px solid ${theme.border}30`,
                borderRadius: "16px",
                padding: "2rem",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="group hover:border-accent hover:shadow-[0_12px_24px_-10px_rgba(56,189,248,0.12)]"
            >
              {/* Subtle corner aura gradient */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  background: `radial-gradient(circle, ${theme.accent}05 0%, transparent 75%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Title & Icon */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    padding: "0.5rem",
                    borderRadius: "8px",
                    background: `${theme.accent}12`,
                    color: theme.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GroupIcon size={18} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: theme.text }}>
                  {group.category}
                </h3>
              </div>

              {/* Badges Container */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {group.skills.map((skill, subIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index * 0.05) + (subIndex * 0.02), duration: 0.3 }}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.65rem",
                      background: `${theme.border}15`,
                      color: theme.text,
                      border: `1px solid ${theme.border}25`,
                      borderRadius: "6px",
                      cursor: "default",
                      transition: "all 0.2s ease",
                    }}
                    whileHover={{
                      borderColor: theme.accent,
                      background: `${theme.accent}0b`,
                      color: theme.accent,
                      scale: 1.05,
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
