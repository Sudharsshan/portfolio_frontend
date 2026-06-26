import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Project } from "../data/localProjects";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import { Filter, SlidersHorizontal, CloudRain, Trophy, CodeXml, Loader2, Sparkles } from "lucide-react";

interface Props {
  initialProjects?: Project[];
}

// Module-level cache to persist projects across page visits
let cachedProjects: Project[] | null = null;
let cachedSourceInfo = "";

export default function ProjectsClient({ initialProjects }: Props) {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>(initialProjects || cachedProjects || []);
  const [loading, setLoading] = useState(!initialProjects && !cachedProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDomain, setFilterDomain] = useState<string>("ALL");
  const [filterTag, setFilterTag] = useState<string>("ALL");
  const [showCompleted, setShowCompleted] = useState(true);
  const [sourceInfo, setSourceInfo] = useState<string>(cachedSourceInfo);

  // Fetch full portfolio from Express server-side GitHub wrapper api
  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setLoading(false);
      return;
    }
    if (cachedProjects) {
      setProjects(cachedProjects);
      setSourceInfo(cachedSourceInfo);
      setLoading(false);
      return;
    }
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (data.projects) {
          cachedProjects = data.projects;
          cachedSourceInfo = data.source || "";
          setProjects(data.projects);
          setSourceInfo(data.source || "");
        }
      } catch (err) {
        console.error("Failed to load projects from server wrapper:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [initialProjects]);

  // Derive unique filter options dynamically from active dataset
  const allDomains = useMemo(() => {
    const domains = new Set(projects.map((p) => p.domain.replace("- ", "").trim()).filter(Boolean));
    return ["ALL", ...Array.from(domains)];
  }, [projects]);

  const allTags = useMemo(() => {
    const tags = new Set(projects.flatMap((p) => p.tags).filter(Boolean));
    return ["ALL", ...Array.from(tags).sort()];
  }, [projects]);

  const filtered = useMemo(() =>
    projects.filter((p) => {
      if (!showCompleted && p.status === "COMPLETED") return false;
      if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
      if (filterDomain !== "ALL") {
        const dom = p.domain.replace("- ", "").trim();
        if (dom !== filterDomain) return false;
      }
      if (filterTag !== "ALL" && !p.tags.includes(filterTag)) return false;
      return true;
    }),
    [projects, filterStatus, filterDomain, filterTag, showCompleted]
  );

  const pillStyle = (active: boolean) => ({
    padding: "0.35rem 0.85rem",
    borderRadius: "100px",
    border: `1px solid ${active ? theme.accent : `${theme.border}50`}`,
    background: active ? `${theme.accent}12` : `${theme.bgSecondary}50`,
    color: active ? theme.accent : theme.textMuted,
    fontSize: "0.78rem",
    fontWeight: active ? "600" : "400",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ padding: "6.5rem 1.5rem 4rem", maxWidth: "1200px", margin: "0 auto", minHeight: "85vh" }}>
      {/* View Header */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: theme.accent, letterSpacing: "0.15em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          ENGINEERING JOURNAL
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: theme.text, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          My projects
        </h1>
        <p style={{ color: theme.textMuted, marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Files synchronised directly with internal Obsidian lab notebooks (PIDS schema).
        </p>
        
        {sourceInfo && sourceInfo.startsWith("github") && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "1rem", padding: "0.25rem 0.60rem", borderRadius: "100px", border: `1px solid ${theme.accent}20`, background: `${theme.accent}05`, fontSize: "0.72rem", color: theme.accent }}>
            <Sparkles size={10} className="animate-pulse" />
            <span>Connected to Obsidian private cloud repository</span>
          </div>
        )}
      </div>

      {/* Loading Canvas */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "250px", gap: "1rem" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: theme.accent }} />
          <p style={{ fontSize: "0.85rem", color: theme.textMuted, fontFamily: "var(--font-mono)" }}>Synchronizing micro-journals...</p>
        </div>
      ) : (
        <>
          {/* Detailed Filters panel */}
          <div
            style={{
              marginBottom: "2.5rem",
              padding: "1.5rem",
              background: `${theme.bgSecondary}50`,
              border: `1px solid ${theme.border}30`,
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Filter controls info */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: theme.text, fontSize: "0.85rem", fontWeight: "600", borderBottom: `1px solid ${theme.border}20`, paddingBottom: "0.5rem", marginBottom: "0.25rem" }}>
              <SlidersHorizontal size={14} style={{ color: theme.accent }} />
              <span>Specs Query Filter</span>
            </div>

            {/* Status Selector */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", color: theme.textMuted, letterSpacing: "0.08em", fontWeight: "600", minWidth: "100px", textTransform: "uppercase" }}>Status</span>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {["ALL", "COMPLETED", "IN_PROGRESS", "HOLD"].map((s) => (
                  <button key={s} style={pillStyle(filterStatus === s)} onClick={() => setFilterStatus(s)}>
                    {s === "ALL" ? "All Gears" : s.replace("_", " ")}
                  </button>
                ))}
              </div>
              
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  style={{ accentColor: theme.accent, width: "14px", height: "14px" }}
                />
                <span style={{ fontSize: "0.8rem", color: theme.textMuted, fontWeight: "500" }}>Include completed specs</span>
              </label>
            </div>

            {/* Domain Selector */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", color: theme.textMuted, letterSpacing: "0.08em", fontWeight: "600", minWidth: "100px", textTransform: "uppercase" }}>Core Domain</span>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {allDomains.map((d) => (
                  <button key={d} style={pillStyle(filterDomain === d)} onClick={() => setFilterDomain(d)}>
                    {d === "ALL" ? "All Domains" : d}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags row */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", color: theme.textMuted, letterSpacing: "0.08em", fontWeight: "600", minWidth: "100px", textTransform: "uppercase" }}>Key Tech stack</span>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {allTags.map((t) => (
                  <button key={t} style={pillStyle(filterTag === t)} onClick={() => setFilterTag(t === filterTag ? "ALL" : t)}>
                    {t === "ALL" ? "Any Tech" : t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: theme.textMuted, borderTop: `1px solid ${theme.border}20`, paddingTop: "0.5rem" }}>
              <span>Filtered output size: <strong>{filtered.length}</strong> modules</span>
              <span>Obsidian Source Code · PIDS format</span>
            </div>
          </div>

          {/* Fallback Empty State */}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 2rem", border: `1px dashed ${theme.border}40`, borderRadius: "16px", background: `${theme.bgSecondary}20` }}>
              <CloudRain size={36} style={{ color: theme.textMuted, margin: "0 auto 1rem" }} className="animate-bounce" />
              <p style={{ fontSize: "1rem", color: theme.text, fontWeight: "600" }}>No matching engineering logs found</p>
              <p style={{ fontSize: "0.85rem", color: theme.textMuted, marginTop: "0.25rem" }}>Adjust status filters or choose "Any Tech" to reset indices.</p>
              <button
                onClick={() => {
                  setFilterStatus("ALL");
                  setFilterDomain("ALL");
                  setFilterTag("ALL");
                  setShowCompleted(true);
                }}
                style={{
                  marginTop: "1.25rem",
                  padding: "0.5rem 1.25rem",
                  background: "transparent",
                  border: `1px solid ${theme.accent}`,
                  color: theme.accent,
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Clear all indices
              </button>
            </div>
          )}

          {/* Grid Layout of Journal entries */}
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3rem",
            }}
          >
            <AnimatePresence>
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  index={i}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* Modal slider render */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
