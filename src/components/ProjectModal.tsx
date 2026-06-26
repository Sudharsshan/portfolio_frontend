import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Project } from "../data/localProjects";
import { X, Calendar, Compass, Github, ShieldAlert, Cpu, Layers } from "lucide-react";

interface Props {
  project: Project | null;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#F97316",      // Orange
  IN_PROGRESS: "#F97316", // Orange
  COMPLETED: "#22C55E",   // Green
  ABORTED: "#EF4444",     // Red
  IDEA: "#FFFFFF",        // White
  HOLD: "#6B7280",        // Grey
};

export default function ProjectModal({ project, onClose }: Props) {
  const { theme } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2, 6, 23, 0.75)",
              backdropFilter: "blur(8px)",
              zIndex: 2000,
            }}
          />

          {/* Lateral Slide Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(650px, 100vw)",
              background: theme.bgSecondary,
              borderLeft: `1px solid ${theme.border}50`,
              zIndex: 2001,
              overflowY: "auto",
              padding: "clamp(1.5rem, 4vw, 3rem)",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
            }}
          >
            {/* Slide Header sticky bar */}
            <div
              style={{
                position: "sticky",
                top: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: `${theme.bgSecondary}CC`,
                backdropFilter: "blur(12px)",
                paddingBottom: "1rem",
                marginBottom: "2rem",
                borderBottom: `1px solid ${theme.border}20`,
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    color: theme.accent,
                    fontWeight: "700",
                    letterSpacing: "0.05em",
                  }}
                >
                  {project.project_id}
                </span>
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: theme.textMuted,
                  }}
                />
                <span
                  className={project.status === "ACTIVE" || project.status === "IN_PROGRESS" ? "animate-pulse" : ""}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: STATUS_COLORS[project.status] || "#94A3B8",
                    boxShadow: `0 0 8px ${STATUS_COLORS[project.status] || "#94A3B8"}`,
                    border: project.status === "IDEA" ? "1px solid rgba(128,128,128,0.4)" : "none",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "500", textTransform: "uppercase" }}>
                  {project.status.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: `${theme.bg}80`,
                  border: `1px solid ${theme.border}60`,
                  borderRadius: "8px",
                  color: theme.text,
                  padding: "0.4rem 0.8rem",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "all 0.2s ease",
                }}
                className="hover:border-accent hover:text-accent"
              >
                <X size={14} />
                <span>Close</span>
              </button>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 700,
                color: theme.text,
                marginBottom: "1rem",
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              {project.title}
            </h2>

            {/* Tag Pills */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.22rem 0.6rem",
                    background: `${theme.accent}12`,
                    color: theme.accent,
                    border: `1px solid ${theme.accent}20`,
                    borderRadius: "6px",
                    letterSpacing: "0.03em",
                    fontWeight: "500",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Meta Table Block */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2.5rem",
                padding: "1.25rem",
                background: `${theme.border}15`,
                border: `1px solid ${theme.border}30`,
                borderRadius: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Compass size={16} style={{ color: theme.accent }} />
                <div>
                  <p style={{ fontSize: "0.7rem", color: theme.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Domain</p>
                  <p style={{ fontSize: "0.85rem", color: theme.text, fontWeight: "600", margin: 0 }}>
                    {project.domain.replace("- ", "")}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Calendar size={16} style={{ color: theme.accent }} />
                <div>
                  <p style={{ fontSize: "0.7rem", color: theme.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ideation Date</p>
                  <p style={{ fontSize: "0.85rem", color: theme.text, fontWeight: "600", margin: 0 }}>
                    {project.ideation_date}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Layers size={16} style={{ color: theme.accent }} />
                <div>
                  <p style={{ fontSize: "0.7rem", color: theme.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subdomains</p>
                  <p style={{ fontSize: "0.82rem", color: theme.text, fontWeight: "500", margin: 0 }}>
                    {project.subdomains || "Hardware Integration"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {project.hardware ? (
                  <Cpu size={16} style={{ color: theme.accent }} />
                ) : (
                  <Github size={16} style={{ color: theme.accent }} />
                )}
                <div>
                  <p style={{ fontSize: "0.7rem", color: theme.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Repository</p>
                  {project.repository && project.repository.startsWith("http") ? (
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.85rem", color: theme.accent, fontWeight: "600", textDecoration: "none" }}
                      className="hover:underline"
                    >
                      {project.repository} ↗
                    </a>
                  ) : (
                    <p style={{ fontSize: "0.85rem", color: theme.textMuted, fontWeight: "500", margin: 0 }}>
                      {project.repository === "NA" ? "Not Available" : project.repository === "Yet to determine" ? "Yet to determine" : (project.repository || "Not Available")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Markdown Body Content */}
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: project.bodyHtml }}
              style={{ paddingBottom: "2rem" }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
