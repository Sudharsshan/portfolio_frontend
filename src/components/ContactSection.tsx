import { useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { personal } from "../data/personal";
import { Mail, Github, Linkedin, Copy, Check, Send, Sparkles } from "lucide-react";

export default function ContactSection() {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(personal.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "6.5rem 1.5rem 4rem", maxWidth: "800px", margin: "0 auto", minHeight: "85vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {/* Header */}
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: theme.accent, letterSpacing: "0.15em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          SIGNAL CHANNEL
        </p>
        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.2rem)", fontWeight: 800, color: theme.text, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          Let's Connect
        </h1>
        <p style={{ color: theme.textMuted, marginTop: "0.5rem", fontSize: "0.95rem", maxWidth: "500px", margin: "0.5rem auto 0" }}>
          Looking for custom hardware design, firmware loops, or remote engineering collaborations? Send a signal.
        </p>
      </div>

      {/* Main Terminal-Style Communication Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}40`,
          borderRadius: "20px",
          padding: "2.5rem clamp(1.5rem, 4vw, 3rem)",
          boxShadow: `0 15px 35px -10px rgba(0,0,0,0.4)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Email segment */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: `${theme.accent}12`,
                color: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail size={20} />
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "600", margin: "0 0 0.25rem 0" }}>
                Direct Email channel
              </p>
              
              {/* Copyable address widget */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  background: `${theme.bg}B3`,
                  border: `1px solid ${theme.border}50`,
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                  marginTop: "0.25rem",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.85rem, 2vw, 1rem)", color: theme.text, fontWeight: "500" }}>
                  {personal.email}
                </span>
                
                <button
                  onClick={copyEmail}
                  style={{
                    background: "transparent",
                    color: copied ? "#22C55E" : theme.accent,
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease",
                  }}
                  title="Copy email to clipboard"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ height: "1px", background: `${theme.border}30`, margin: "0.5rem 0" }} />

          {/* Mailto & Socials grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Quick launch client mailto */}
            <a
              href={`mailto:${personal.email}`}
              style={{
                background: theme.accent,
                color: theme.bg,
                padding: "0.8rem 1.5rem",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: `0 4px 12px ${theme.accent}20`,
              }}
              className="hover:opacity-95 hover:scale-[1.01]"
            >
              <Send size={14} />
              <span>Launch Mail Client</span>
            </a>

            {/* Social Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: `${theme.border}15`,
                  border: `1px solid ${theme.border}50`,
                  color: theme.text,
                  padding: "0.8rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                className="hover:border-accent hover:text-accent hover:bg-bg"
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>

              <a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: `${theme.border}15`,
                  border: `1px solid ${theme.border}50`,
                  color: theme.text,
                  padding: "0.8rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                className="hover:border-accent hover:text-accent hover:bg-bg"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
