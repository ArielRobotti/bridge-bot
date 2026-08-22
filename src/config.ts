import fs from "fs";

export function readConfig(filePath: string): Record<string, string> {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const config: Record<string, string> = {};
      content.split("\n").forEach((line) => {
        const [key, ...value] = line.split("=");
        if (key && value) config[key.trim()] = value.join("=").trim();
      });
      return config;
    }
  } catch (err) {
    console.warn(`[config] No se pudo leer ${filePath}, usando process.env`);
  }
  return process.env as Record<string, string>;
}
