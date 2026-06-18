export interface SkillGroup {
  category: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Embedded & Hardware",
    skills: ["STM32", "ESP32", "ESP8266", "NodeMCU", "OV2640 Camera", "P10 LED Matrix", "UART", "GPIO", "SPI", "I2C", "Buck Converters", "MOSFET Control"],
  },
  {
    category: "Software & Firmware",
    skills: ["Embedded C/C++", "Arduino", "Flutter", "Dart", "FastAPI", "Python", "JavaScript", "TypeScript"],
  },
  {
    category: "AI & Computer Vision",
    skills: ["TensorFlow Lite", "YOLOv2", "ONNX", "Edge AI", "MATLAB", "Simulink"],
  },
  {
    category: "Cloud & Backend",
    skills: ["Firebase", "Azure OpenAI", "MQTT / EMQX", "Node.js", "TimescaleDB", "REST APIs"],
  },
  {
    category: "Tools & Simulation",
    skills: ["LTSpice", "TINA-TI", "MATLAB Simulink", "Git", "Vercel", "Arduino IDE", "STM32CubeIDE"],
  },
];
