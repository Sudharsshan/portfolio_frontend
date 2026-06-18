import { useState, useEffect } from "react";
import { Link, useLocation } from "../lib/router";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { TimeOfDay } from "../lib/theme";
import { Menu, X, Sun, Sunrise, Sunset, Moon, Sparkles } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const THEME_OPTIONS: Array<{ value: TimeOfDay; label: string; icon: any }> = [
  { value: "morning", label: "Morning", icon: Sunrise },
  { value: "noon", label: "Noon", icon: Sun },
  { value: "evening", label: "Evening", icon: Sunset },
  { value: "night", label: "Night", icon: Moon },
];

export default function Navigation() {
  const { pathname } = useLocation();
  const { theme, timeOfDay, setTimeOfDayOverride, manualOverride } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const ActiveThemeIcon = THEME_OPTIONS.find((t) => t.value === timeOfDay)?.icon || Moon;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 clamp(1rem, 5vw, 4rem)",
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? `${theme.bg}E6` : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${theme.border}40` : "1px solid transparent",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Logo/Monogram */}
      <Link href="/" className="group" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: "700",
            fontSize: "1.1rem",
            color: theme.accent,
            letterSpacing: "0.05em",
            border: `1px solid ${theme.accent}40`,
            padding: "0.25rem 0.6rem",
            borderRadius: "6px",
            background: `${theme.accent}0D`,
            transition: "all 0.3s ease",
          }}
          className="group-hover:border-accent"
        >
          SYS
        </div>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: "500",
            color: theme.text,
            letterSpacing: "0.05em",
            transition: "all 0.3s ease",
          }}
          className="hidden lg:inline"
        >
          S. Y. Sudharsshan
        </span>
      </Link>

      {/* Desktop Links & Theme Selector */}
      <div className="hidden md:flex items-center" style={{ gap: "2rem" }}>
        <div style={{ display: "flex", gap: "1.75rem" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  position: "relative",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? "600" : "400",
                  letterSpacing: "0.05em",
                  color: isActive ? theme.accent : theme.textMuted,
                  transition: "color 0.3s ease",
                  textTransform: "uppercase",
                  padding: "0.5rem 0",
                }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: theme.accent,
                      borderRadius: "100px",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "18px", background: `${theme.border}60` }} />

        {/* Theme TimeOfDay Selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            style={{
              background: manualOverride ? `${theme.accent}15` : "transparent",
              border: `1px solid ${manualOverride ? theme.accent : theme.border}`,
              color: manualOverride ? theme.accent : theme.text,
              borderRadius: "8px",
              padding: "0.4rem 0.75rem",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <ActiveThemeIcon size={14} />
            <span className="capitalize">{timeOfDay}</span>
            {manualOverride && <Sparkles size={10} style={{ color: theme.accent }} />}
          </button>

          <AnimatePresence>
            {showThemeSelector && (
              <>
                {/* Click outside backdrop */}
                <div
                  onClick={() => setShowThemeSelector(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 90 }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    width: "180px",
                    background: theme.bgSecondary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
                    padding: "0.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    zIndex: 91,
                  }}
                >
                  <p style={{ fontSize: "0.7rem", color: theme.textMuted, padding: "0.25rem 0.5rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Select Aura Mode
                  </p>
                  {THEME_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = timeOfDay === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setTimeOfDayOverride(opt.value);
                          setShowThemeSelector(false);
                        }}
                        style={{
                          background: isSelected ? `${theme.accent}1A` : "transparent",
                          border: "none",
                          color: isSelected ? theme.accent : theme.text,
                          borderRadius: "6px",
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.8rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <OptIcon size={12} style={{ color: isSelected ? theme.accent : theme.textMuted }} />
                        <span style={{ fontWeight: isSelected ? "600" : "400" }}>{opt.label}</span>
                      </button>
                    );
                  })}
                  
                  {manualOverride && (
                    <button
                      onClick={() => {
                        setTimeOfDayOverride(null);
                        setShowThemeSelector(false);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        borderTop: `1px solid ${theme.border}`,
                        color: theme.accent,
                        borderRadius: "0 0 6px 6px",
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        textAlign: "center",
                        marginTop: "0.25rem",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Reset to Local Time
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Menu Action Row */}
      <div className="flex md:hidden items-center" style={{ gap: "0.75rem" }}>
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "transparent",
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "0.5rem 0.6rem",
            cursor: "pointer",
            color: theme.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.25rem",
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
          <span style={{ fontSize: "0.75rem", fontWeight: "600", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Menu</span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "#000000",
                backdropFilter: "blur(4px)",
                zIndex: 150,
              }}
            />

            {/* Slider Panel right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(300px, 85vw)",
                background: theme.bgSecondary,
                borderLeft: `1px solid ${theme.border}40`,
                boxShadow: "-10px 0 30px rgba(0,0,0,0.3)",
                padding: "2rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                zIndex: 160,
                overflowY: "auto",
              }}
            >
              {/* Header inside drawer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    color: theme.accent,
                    letterSpacing: "0.05em",
                    border: `1px solid ${theme.accent}30`,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "6px",
                    background: `${theme.accent}0A`,
                  }}
                >
                  SYS
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${theme.border}`,
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: theme.text,
                    transition: "all 0.2s ease",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation links inside drawer */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "3rem" }}>
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          textDecoration: "none",
                          fontSize: "1.2rem",
                          fontWeight: isActive ? "700" : "400",
                          color: isActive ? theme.accent : theme.text,
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          transition: "color 0.2s ease",
                          padding: "0.25rem 0",
                          textTransform: "uppercase",
                        }}
                      >
                        {isActive && (
                          <div style={{ width: "6px", height: "6px", background: theme.accent, borderRadius: "50%" }} />
                        )}
                        <span style={{ marginLeft: isActive ? 0 : "14px" }}>{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Integrated Aura Mode Selection */}
              <div style={{ marginTop: "auto", borderTop: `1px solid ${theme.border}40`, paddingTop: "1.5rem" }}>
                <p style={{ fontSize: "0.7rem", color: theme.textMuted, marginBottom: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Aura Mode
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {THEME_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = timeOfDay === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTimeOfDayOverride(opt.value)}
                        style={{
                          background: isSelected ? `${theme.accent}1A` : "transparent",
                          border: `1px solid ${isSelected ? theme.accent : theme.border}`,
                          color: isSelected ? theme.accent : theme.text,
                          borderRadius: "8px",
                          padding: "0.5rem 0.4rem",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          justifyContent: "center",
                        }}
                      >
                        <OptIcon size={12} style={{ color: isSelected ? theme.accent : theme.textMuted }} />
                        <span style={{ fontWeight: isSelected ? "600" : "400" }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {manualOverride && (
                  <button
                    onClick={() => setTimeOfDayOverride(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: theme.accent,
                      padding: "0.4rem 0",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      textAlign: "left",
                      marginTop: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <Sparkles size={10} /> Reset to Local Time
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
