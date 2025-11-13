import { environment } from "../environment/environment.ts";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ses = new SESClient({
  region: environment.aws.region,
  credentials: {
    accessKeyId: environment.aws.accessKeyId,
    secretAccessKey: environment.aws.secretAccessKey,
  },
});

export const EmailTemplates = {
  verify_email: path.join(__dirname, "./email_templates/verify_email.html"),
  reset_password: path.join(__dirname, "./email_templates/reset_password.html"),
  tickets: path.join(__dirname, "./email_templates/tickets.html"),
};

type TemplateData = {
  verify_email: { email: string; verificationLink: string; year: string };
  reset_password: { email: string; resetLink: string; year: string };
  tickets: {
    email: string;
    eventTitle: string;
    tickets: string[];
    year: string;
  };
};

export async function sendEmail<T extends keyof typeof EmailTemplates>({
  to,
  subject,
  template,
  data,
}: {
  to: string | string[];
  subject: string;
  template: T;
  data: TemplateData[T];
}) {
  const templatePath = EmailTemplates[template];
  const rawTemplate = await fs.readFile(templatePath, "utf-8");

  const compiled = Handlebars.compile(rawTemplate);
  const htmlBody = compiled(data);

  const params = {
    Source: "no-reply@invenre.com",
    Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: htmlBody } },
    },
  };

  const command = new SendEmailCommand(params);
  await ses.send(command);
}
