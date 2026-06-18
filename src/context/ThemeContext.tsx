import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { TimeOfDay, getTimeOfDay, timeThemes, TimeTheme } from "../lib/theme";

interface ThemeContextType {
  timeOfDay: TimeOfDay;
  theme: TimeTheme;
  setTimeOfDayOverride: (time: TimeOfDay | null) => void;
  manualOverride: TimeOfDay | null;
}

const ThemeContext = createContext<ThemeContextType>({
  timeOfDay: "night",
  theme: timeThemes.night,
  setTimeOfDayOverride: () => {},
  manualOverride: null,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("night");
  const [manualOverride, setManualOverride] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    if (manualOverride) {
      setTimeOfDay(manualOverride);
      return;
    }
    setTimeOfDay(getTimeOfDay());
    // Re-check every 10 minutes
    const interval = setInterval(() => {
      if (!manualOverride) {
        setTimeOfDay(getTimeOfDay());
      }
    }, 600_000);
    return () => clearInterval(interval);
  }, [manualOverride]);

  const setTimeOfDayOverride = (time: TimeOfDay | null) => {
    setManualOverride(time);
    if (time) {
      setTimeOfDay(time);
    } else {
      setTimeOfDay(getTimeOfDay());
    }
  };

  const theme = timeThemes[timeOfDay];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-bg", theme.bg);
    root.style.setProperty("--color-bg-secondary", theme.bgSecondary);
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty("--color-accent-muted", theme.accentMuted);
    root.style.setProperty("--color-text", theme.text);
    root.style.setProperty("--color-text-muted", theme.textMuted);
    root.style.setProperty("--color-border", theme.border);
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.transition = "background 0.8s cubic-bezier(0.16, 1, 0.3, 1), color 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ timeOfDay, theme, setTimeOfDayOverride, manualOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
