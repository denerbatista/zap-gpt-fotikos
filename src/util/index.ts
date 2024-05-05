import { type Whatsapp } from '@wppconnect-team/wppconnect';
import * as nodemailer from 'nodemailer';

export function splitMessages(text: string): string[] {
  const complexPattern =
    /(http[s]?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+@[^\s]+\.[^\s]+)|(["'].*?["'])|(\b\d+\.\s)|(\w+\.\w+)/g;
  const placeholders = text.match(complexPattern) ?? [];

  const placeholder = 'PLACEHOLDER_';
  let currentIndex = 0;
  const textWithPlaceholders = text.replace(
    complexPattern,
    () => `${placeholder}${currentIndex++}`
  );

  const splitPattern = /(?<!\b\d+\.\s)(?<!\w+\.\w+)[^.?!]+(?:[.?!]+["']?|$)/g;
  let parts = textWithPlaceholders.match(splitPattern) ?? ([] as string[]);

  if (placeholders.length > 0) {
    parts = parts.map((part) =>
      placeholders.reduce(
        (acc, val, idx) => acc.replace(`${placeholder}${idx}`, val),
        part
      )
    );
  }

  return parts;
}

export async function sendMessagesWithDelay({
  messages,
  client,
  targetNumber,
}: {
  messages: string[];
  client: Whatsapp;
  targetNumber: string;
}): Promise<void> {
  for (const [, msg] of messages.entries()) {
    const dynamicDelay = msg.length * 100;
    await new Promise((resolve) => setTimeout(resolve, dynamicDelay));
    client
      .sendText(targetNumber, msg.trimStart())
      .then((result) => {
        console.log('Mensagem enviada:', result.body);
      })
      .catch((erro) => {
        console.error('Erro ao enviar mensagem:', erro);
      });
  }
}

export async function sendQRCodeByEmail(qrCodeUrl: string, to: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 587,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: 'Zap Fotikós <noreply@telegraf-auto.com>',
    to,
    subject: 'Código QR do WhatsApp',
    html: `<p>Olá,</p>
    <p>Aqui está o código QR do WhatsApp:</p>
    <p>${qrCodeUrl}<p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso com o código QR do WhatsApp.');
  } catch (error) {
    console.error('Erro ao enviar o email com o código QR do WhatsApp:', error);
  }
}
