import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { experiences } from "../data/experience";
import { Briefcase, Calendar, Award } from "lucide-react";

export default function ExperienceSection() {
  const { theme } = useTheme();

  return (
    <div style={{ padding: "6.5rem 1.5rem 4rem", maxWidth: "900px", margin: "0 auto", minHeight: "85vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "4rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: theme.accent, letterSpacing: "0.15em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          PROFESSIONAL PROGRESS
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: theme.text, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          Gears & Experience
        </h1>
        <p style={{ color: theme.textMuted, marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Milestones across hardware-software co-design, solar electric vehicles, and autonomous firmware loops.
        </p>
      </div>

      {/* Timeline List */}
      <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
        {/* Vertical line accent */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            bottom: "8px",
            left: "4px",
            width: "2px",
            background: `linear-gradient(180deg, ${theme.accent}cc 0%, ${theme.border}40 100%)`,
          }}
        />

        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            style={{ position: "relative", marginBottom: "3rem" }}
          >
            {/* Timeline bullet beacon */}
            <div
              style={{
                position: "absolute",
                left: "-21px",
                top: "6px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: theme.accent,
                border: `3px solid ${theme.bg}`,
                boxShadow: `0 0 10px ${theme.accent}`,
              }}
            />

            {/* Exp Card Content */}
            <div
              style={{
                background: theme.bgSecondary,
                border: `1px solid ${theme.border}30`,
                borderRadius: "16px",
                padding: "2rem",
                transition: "all 0.3s ease",
              }}
              className="hover:border-accent hover:shadow-[0_10px_20px_-10px_rgba(56,189,248,0.08)]"
            >
              {/* Meta row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: theme.accent, marginBottom: "0.25rem" }}>
                    {exp.role}
                  </h3>
                  <p style={{ fontSize: "0.95rem", fontWeight: "600", color: theme.text, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Briefcase size={14} style={{ color: theme.textMuted }} />
                    <span>{exp.org}</span>
                  </p>
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    color: theme.textMuted,
                    background: `${theme.border}1F`,
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}40`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Calendar size={12} />
                  <span>{exp.period}</span>
                </span>
              </div>

              {/* Description */}
              <p style={{ color: theme.textMuted, fontSize: "0.92rem", lineHeight: "1.6", margin: "1.25rem 0" }}>
                {exp.desc}
              </p>

              {/* Tag Pills */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.2rem 0.55rem",
                      background: `${theme.accent}0a`,
                      color: theme.text,
                      border: `1px solid ${theme.border}50`,
                      borderRadius: "6px",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
