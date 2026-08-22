import nodemailer from "nodemailer";
import { readConfig } from "../config.js";

export interface MailResult {
  ok: boolean;
  messageId?: string;
  error?: any;
}

// Leemos credenciales de archivo o process.env
let emailUser = process.env.EMAIL_USER || "";
let emailPass = process.env.EMAIL_PASS || "";

if (!emailUser || !emailPass) {
  try {
    const serverConfig = readConfig("/etc/nexus/server.conf");
    emailUser = serverConfig.EMAIL_USER || emailUser;
    emailPass = serverConfig.EMAIL_PASS || emailPass;
  } catch {
    // Si falla la lectura del archivo, continuará validando
  }
}

if (!emailUser || !emailPass) {
  console.warn("[Email Warning] No se encontraron EMAIL_USER o EMAIL_PASS en /etc/nexus/server.conf ni en process.env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export async function sendNotificationEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<MailResult> {
  try {
    const info = await transporter.sendMail({
      from: `"Nexus Notifications" <${emailUser}>`,
      to,
      subject,
      html: htmlContent,
      replyTo: "no-reply@nexusproject.com",
      headers: {
        "X-Auto-Response-Suppress": "All",
        Precedence: "bulk",
      },
    });

    console.log(`[Email] Mensaje enviado con éxito: ${info.messageId}`);
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email] Error enviando correo:", error);
    return { ok: false, error };
  }
}