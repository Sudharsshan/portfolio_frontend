export type TimeOfDay = "morning" | "noon" | "evening" | "night";

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "noon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export interface TimeTheme {
  bg: string;
  bgSecondary: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
  border: string;
  label: string;
  gradient: string;
}

export const timeThemes: Record<TimeOfDay, TimeTheme> = {
  morning: {
    bg: "#FFF8ED",
    bgSecondary: "#FEF3C7",
    accent: "#D97706",
    accentMuted: "#FDE68A",
    text: "#1C1917",
    textMuted: "#78716C",
    border: "#FCD34D",
    label: "Good morning",
    gradient: "linear-gradient(135deg, #FFF8ED 0%, #FEF3C7 50%, #FDE68A 100%)",
  },
  noon: {
    bg: "#F0F9FF",
    bgSecondary: "#E0F2FE",
    accent: "#0284C7",
    accentMuted: "#BAE6FD",
    text: "#0C4A6E",
    textMuted: "#0369A1",
    border: "#7DD3FC",
    label: "Good afternoon",
    gradient: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)",
  },
  evening: {
    bg: "#0F0A1E",
    bgSecondary: "#1E1433",
    accent: "#A78BFA",
    accentMuted: "#4C1D95",
    text: "#EDE9FE",
    textMuted: "#A78BFA",
    border: "#6D28D9",
    label: "Good evening",
    gradient: "linear-gradient(135deg, #0F0A1E 0%, #1E1433 50%, #2D1B5E 100%)",
  },
  night: {
    bg: "#020617",
    bgSecondary: "#0F172A",
    accent: "#38BDF8",
    accentMuted: "#0C4A6E",
    text: "#E2E8F0",
    textMuted: "#94A3B8",
    border: "#1E3A5F",
    label: "Good night",
    gradient: "linear-gradient(135deg, #020617 0%, #0F172A 50%, #0C1A35 100%)",
  },
};
