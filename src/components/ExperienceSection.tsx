import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Briefcase, Calendar, Search, Sparkles, Loader2 } from "lucide-react";

export default function ExperienceSection() {
  const { theme } = useTheme();
  const [internshipHtml, setInternshipHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/internship")
      .then((res) => res.json())
      .then((data) => {
        if (data.html) {
          setInternshipHtml(data.html);
        }
      })
      .catch((err) => {
        console.error("Error fetching internship HTML:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "6.5rem 1.5rem 4rem", maxWidth: "900px", margin: "0 auto", minHeight: "85vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: theme.accent, letterSpacing: "0.15em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          PROFESSIONAL PROGRESS
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: theme.text, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          Gears & Experience
        </h1>
      </div>

      {/* Internship Experience Section */}
      <div style={{ marginBottom: "4.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: theme.text, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Briefcase size={22} style={{ color: theme.accent }} />
          <span>Internship Experience</span>
        </h2>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", gap: "1rem" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: theme.accent }} />
            <p style={{ fontSize: "0.85rem", color: theme.textMuted, fontFamily: "var(--font-mono)" }}>Retrieving engineering notebooks...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}40`,
              borderRadius: "16px",
              padding: "2rem",
            }}
            className="prose-content markdown-body"
          >
            {internshipHtml ? (
              <div dangerouslySetInnerHTML={{ __html: internshipHtml }} />
            ) : (
              <p style={{ color: theme.textMuted, fontSize: "0.95rem" }}>No internship experience records found.</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Professional Experience Section */}
      <div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: theme.text, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Search size={22} style={{ color: theme.accent }} />
          <span>Professional Experience</span>
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: `${theme.accent}05`,
            border: `1px dashed ${theme.accent}50`,
            borderRadius: "16px",
            padding: "2.5rem 2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle decoration */}
          <div style={{ position: "absolute", right: "-20px", bottom: "-20px", opacity: 0.03, pointerEvents: "none" }}>
            <Briefcase size={180} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
            <div
              style={{
                background: `${theme.accent}15`,
                color: theme.accent,
                padding: "0.75rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={24} className="animate-pulse" />
            </div>

            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: theme.text, marginBottom: "0.5rem" }}>
                Actively Seeking New Opportunities
              </h3>
              <p style={{ color: theme.text, fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                Embedded Systems · IoT · Firmware Engineering Roles
              </p>
              <p style={{ color: theme.textMuted, fontSize: "0.95rem", lineHeight: "1.6" }}>
                As a fresh Electrical & Electronics Engineering graduate with a CGPA of 8.9 and deep hands-on expertise across STM32/ESP32 firmware development, hardware-software co-design, real-time operating systems, and solar EV control architectures, I am prepared to deliver immediate value in fast-paced product development environments.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.25rem" }}>
                {["STM32", "ESP32", "FreeRTOS", "Embedded C", "KiCad PCB Design", "IoT SaaS", "CAN Bus"].map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: "500",
                      padding: "0.25rem 0.65rem",
                      background: theme.bg,
                      color: theme.accent,
                      border: `1px solid ${theme.border}40`,
                      borderRadius: "6px",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
