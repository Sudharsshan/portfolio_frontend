import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Project } from "../data/localProjects";
import { Cpu, Code, ArrowUpRight } from "lucide-react";

interface Props {
  project: Project;
  index: number;
  onClick: () => void;
  key?: any;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#F97316",      // Orange
  IN_PROGRESS: "#F97316", // Orange
  COMPLETED: "#22C55E",   // Green
  ABORTED: "#EF4444",     // Red
  IDEA: "#FFFFFF",        // White
  HOLD: "#6B7280",        // Grey
};

export default function ProjectCard({ project, index, onClick }: Props) {
  const { theme } = useTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}40`,
        borderRadius: "16px",
        padding: "1.5rem",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "220px",
      }}
      whileHover={{
        borderColor: theme.accent,
        y: -6,
        boxShadow: `0 10px 30px -10px ${theme.accent}20`,
      }}
    >
      {/* Glow highlight inside card on hover */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "120px",
          background: `radial-gradient(circle, ${theme.accent}08 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div>
        {/* ID & Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: theme.accent,
              fontWeight: "600",
              letterSpacing: "0.1em",
              padding: "0.25rem 0.5rem",
              border: `1px solid ${theme.accent}30`,
              borderRadius: "4px",
              background: `${theme.accent}08`,
            }}
          >
            {project.project_id}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              className={project.status === "ACTIVE" || project.status === "IN_PROGRESS" ? "animate-pulse" : ""}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: STATUS_COLORS[project.status] || "#94A3B8",
                boxShadow: `0 0 8px ${STATUS_COLORS[project.status] || "#94A3B8"}`,
                border: project.status === "IDEA" ? "1px solid rgba(128, 128, 128, 0.4)" : "none",
              }}
            />
            <span style={{ fontSize: "0.7rem", color: theme.textMuted, letterSpacing: "0.08em", fontWeight: "500", textTransform: "uppercase" }}>
              {project.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: theme.text, marginBottom: "0.75rem", lineHeight: "1.3" }}>
          {project.title}
        </h3>

        {/* Tag pills */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.68rem",
                padding: "0.15rem 0.45rem",
                background: `${theme.accent}0f`,
                color: theme.accent,
                border: `1px solid ${theme.accent}1A`,
                borderRadius: "4px",
                letterSpacing: "0.02em",
              }}
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span style={{ fontSize: "0.68rem", color: theme.textMuted, padding: "0.15rem 0.25rem", fontWeight: "500" }}>
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${theme.border}20`,
          paddingTop: "0.75rem",
          marginTop: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: theme.textMuted }}>
          {project.hardware ? (
            <>
              <Cpu size={12} style={{ color: theme.accent }} />
              <span>Hardware · {project.domain}</span>
            </>
          ) : (
            <>
              <Code size={12} style={{ color: theme.accent }} />
              <span>Software · {project.domain}</span>
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.1rem", fontSize: "0.75rem", color: theme.accent, fontWeight: "500" }}>
          <span>details</span>
          <ArrowUpRight size={12} />
        </div>
      </div>
    </motion.div>
  );
}
