export interface ExperienceItem {
  role: string;
  org: string;
  period: string;
  desc: string;
  tags: string[];
}

export const experiences: ExperienceItem[] = [
  {
    role: "EEE Graduate — Capstone Project Lead",
    org: "Christ University, Bengaluru",
    period: "2022 – 2026",
    desc: "Led embedded systems capstone: IR-CAM + STM32 helmet detection system. Integrated OV2640 camera, TFT display, TFLite model evaluation, and vehicle ignition control.",
    tags: ["STM32", "Embedded C", "TFLite", "YOLOv2"],
  },
  {
    role: "SAE REEV — Vehicle Control Unit",
    org: "SAE India Collegiate Club",
    period: "2024",
    desc: "Designed and implemented the vehicle control unit for a solar electric vehicle as part of the SAE REEV inter-collegiate competition.",
    tags: ["Embedded Systems", "Power Electronics", "CAN Bus"],
  },
  {
    role: "IoT & Flutter Developer",
    org: "Independent / Freelance",
    period: "2023 – Present",
    desc: "Built PulseBoard (multi-tenant IoT SaaS dashboard), Project Genie V2 (AI project ideation platform), P10 LED destination display for tourist buses.",
    tags: ["Flutter", "FastAPI", "MQTT", "Azure OpenAI"],
  },
];
