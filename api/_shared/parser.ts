import { parseMarkdownToHtml } from "./markdown";

export const fallbackProjects = [
  {
    project_id: "C2025EMB-01",
    title: "AI-Powered Smart Helmet Detection System",
    owner: "College",
    status: "COMPLETED",
    ideation_date: "2025-02-15",
    domain: "Embedded Systems",
    subdomains: "Deep Learning, Computer Vision, Ignitions",
    repository: "https://github.com/Sudharsshan/smart-helmet-detection",
    hardware: true,
    tags: ["STM32", "OV2640", "TensorFlow Lite", "Embedded C", "YOLOv2"],
    slug: "ai-smart-helmet-detection",
    bodyHtml: `
      <h2>Project Overview</h2>
      <p>This capstone project aims to improve two-wheeler safety by preventing vehicle start unless the driver is wearing a certified safety helmet. Built using an STM32 MCU paired with an OV2640 camera module, the system processes a live camera stream on-device and uses a quantized TensorFlow Lite Micro model to detect helmet usage in real time.</p>
      
      <h2>Core Architecture</h2>
      <ul>
        <li><strong>Microcontroller:</strong> STM32F4 series running at high clock rates.</li>
        <li><strong>Camera Interface:</strong> OV2640 camera configured with DMA (Direct Memory Access) for high-performance frame capture.</li>
        <li><strong>Edge AI:</strong> Quantized YOLOv2 model compiled to run efficiently on TensorFlow Lite Micro with weight pruning and micro-operator scaling.</li>
        <li><strong>Ignition Control:</strong> Solid-state relay connected to the vehicle starter coil requiring a certified cryptographic OK pulse from the MCU.</li>
      </ul>

      <h2>Key Features</h2>
      <ol>
        <li>Real-time helmet presence assessment within 420 milliseconds.</li>
        <li>Low hardware latency and battery footprint.</li>
        <li>Offline verification without cloud dependency, securing local driver privacy.</li>
        <li>Anti-spoofing mechanism to prevent bypass using paper photos.</li>
      </ol>
    `,
    ownerCode: "C",
    yearMonth: "2025",
    domainCode: "EMB",
    sequence: "01"
  },
  {
    project_id: "C2024EV-02",
    title: "Solar Electric Vehicle - Control Unit (VCU)",
    owner: "College",
    status: "COMPLETED",
    ideation_date: "2024-06-10",
    domain: "Power Electronics",
    subdomains: "CAN Bus, Battery Management System, Telemetry",
    repository: "NA",
    hardware: true,
    tags: ["Embedded Systems", "Power Electronics", "CAN Bus", "LTSpice", "Simulink"],
    slug: "solar-ev-control-unit",
    bodyHtml: `
      <h2>Project Overview</h2>
      <p>Designed and programmed the Master Vehicle Control Unit (VCU) for Christ University's solar-powered electric buggy entering the 2024 SAE REEV regional competition. The unit coordinates driver inputs, monitors battery temperature and state-of-charge, controls high-voltage contactors, and streams real-time cell parameters over CAN bus.</p>

      <h2>Engineering Highlights</h2>
      <ul>
        <li>Implemented multi-master CAN bus topology to synchronize State of Charge (SoC) from BMS with Motor Controller feedback loops.</li>
        <li>Developed hardware-in-the-loop (HIL) safety routines using MATLAB Simulink to validate throttle pedal plausibility (preventing runaway motor commands).</li>
        <li>Designed a low-ripple buck converter circuit in LTSpice to step down the 48V auxiliary pack safely to 12V for accessory control.</li>
      </ul>
    `,
    ownerCode: "C",
    yearMonth: "2024",
    domainCode: "EV",
    sequence: "02"
  },
  {
    project_id: "P2023SaaS-01",
    title: "PulseBoard - IoT SaaS Device Management Dashboard",
    owner: "personal",
    status: "IN_PROGRESS",
    ideation_date: "2023-11-05",
    domain: "IoT Cloud",
    subdomains: "MQTT Broker, Multi-tenant Dashboard, WebSockets",
    repository: "https://github.com/Sudharsshan/pulseboard-iot",
    hardware: false,
    tags: ["Flutter", "FastAPI", "MQTT", "Firebase", "TimescaleDB"],
    slug: "pulseboard-iot-dashboard",
    bodyHtml: `
      <h2>Project Overview</h2>
      <p>PulseBoard is a high-speed multi-tenant device telemetry dashboard. It enables real-time device health reporting, MQTT configuration sync, and analytical graphs showing voltage logs, temperature trends, and ping ratios for ESP32/ESP8266 fleets deployed in remote agricultural pumps.</p>

      <h2>Technical Implementation</h2>
      <ul>
        <li><strong>Frontend:</strong> Cross-platform Flutter client with local SQLite buffer and elegant animated canvas dashboards.</li>
        <li><strong>Backend:</strong> High-performance FastAPI server processing device logs concurrently at up to 1200 messages/sec.</li>
        <li><strong>Messaging Layer:</strong> EMQX MQTT Cluster utilizing WebSockets for real-time frontend notifications.</li>
        <li><strong>Storage:</strong> TimescaleDB (PostgreSQL extension) for high-performance and low-overhead hypertable queries of historical telemetry logs.</li>
      </ul>
    `,
    ownerCode: "P",
    yearMonth: "2023",
    domainCode: "SaaS",
    sequence: "01"
  }
];

export function parseProjectId(id: string) {
  const match = id.match(/^([CP])(\d{4})([A-Z]+)-(\d+)$/);
  if (!match) return { ownerCode: "P" as const, yearMonth: "", domainCode: "", sequence: "01" };
  return {
    ownerCode: match[1] as "C" | "P",
    yearMonth: match[2],
    domainCode: match[3],
    sequence: match[4],
  };
}

/**
 * Parses and maps raw markdown and folder name into a project object.
 */
export async function parseProjectMarkdown(folder: string, readmeContent: string): Promise<any | null> {
  try {
    const { data, html } = await parseMarkdownToHtml(readmeContent);
    if (data.project_id && data.title) {
      const parsedId = parseProjectId(data.project_id);

      return {
        project_id: data.project_id,
        title: data.title,
        owner: data.owner || "personal",
        status: data.status || "IN_PROGRESS",
        ideation_date: data.ideation_date || "",
        domain: data.domain || "",
        subdomains: data.subdomains || "",
        repository: data.repository || "NA",
        hardware: data.hardware === true || data.hardware === "true",
        tags: Array.isArray(data.tags) ? data.tags : [],
        slug: folder.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        bodyHtml: html,
        ...parsedId,
      };
    }
  } catch (err) {
    console.error(`Error parsing project content in folder: ${folder}`, err);
  }
  return null;
}
