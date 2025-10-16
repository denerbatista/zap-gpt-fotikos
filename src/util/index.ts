import { type Whatsapp } from '@wppconnect-team/wppconnect';
import * as nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function deleteTokensFolder() {
  const tokensPath = path.resolve(__dirname, '..', 'tokens');
  console.log('Caminho da pasta tokens:', tokensPath);

  // Verifica se a pasta existe
  if (!fs.existsSync(tokensPath)) {
    console.error('A pasta tokens não existe:', tokensPath);
    return 'A pasta tokens não existe.';
  }

  // Tenta encerrar processos relacionados antes de excluir
  try {
    console.log('Encerrando processos relacionados...');
    await forceKillProcesses(tokensPath);
    console.log('Processos encerrados. Prosseguindo com a exclusão...');
  } catch (error) {
    console.error('Erro ao finalizar processos relacionados:', error);
    return `Erro ao finalizar processos: ${error}`;
  }

  // Tenta excluir a pasta com retentativas
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      fs.rmSync(tokensPath, { recursive: true, force: true });
      console.log('Pasta tokens deletada com sucesso.');
      return 'Pasta tokens deletada com sucesso.';
    } catch (err: any) {
      if (err.code === 'EBUSY' && attempt < 5) {
        console.warn(
          `Tentativa ${attempt}: Arquivo ocupado. Tentando novamente...`
        );
        await wait(1000); // Aguarda 1 segundo antes de tentar novamente
      } else {
        console.error('Erro ao deletar a pasta tokens:', err.message);
        return `Erro ao deletar a pasta tokens: ${err.message}`;
      }
    }
  }

  return 'Falha ao deletar a pasta tokens após várias tentativas.';
}

async function forceKillProcesses(directoryPath: string) {
  console.log(`Forçando encerramento de processos relacionados à pasta: ${directoryPath}`);

  try {
    const isWindows = process.platform === 'win32';

    // Comando para listar processos no Windows ou Unix
    const lsofCommand = isWindows
      ? `handle "${directoryPath}" /accepteula`
      : `lsof +D "${directoryPath}"`;

    const { stdout } = await execPromise(lsofCommand);
    console.log('Processos encontrados:', stdout);

    const processIds = stdout
      .split('\n')
      .filter((line) => line.includes(directoryPath))
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return isWindows ? parts[1] : parts[1];
      })
      .filter((pid) => !isNaN(Number(pid)));

    console.log('IDs dos processos a serem finalizados:', processIds);

    for (const pid of processIds) {
      try {
        process.kill(Number(pid), 'SIGKILL');
        console.log(`Processo ${pid} finalizado.`);
      } catch (killError) {
        console.error(`Erro ao finalizar processo ${pid}:`, killError);
      }
    }
  } catch (error) {
    if ((error as string).includes('No such file or directory')) {
      console.log('Nenhum processo relacionado foi encontrado.');
    } else {
      console.error('Erro ao forçar o encerramento de processos:', error);
      throw error;
    }
  }
}


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
    <pre>${qrCodeUrl}</pre>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso com o código QR do WhatsApp.');
  } catch (error) {
    console.error('Erro ao enviar o email com o código QR do WhatsApp:', error);
  }
}

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remover caracteres não numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Adicionar o código do país e formatar para o padrão esperado
  const formattedNumber = `55${cleanNumber}@c.us`;

  return formattedNumber;
};
