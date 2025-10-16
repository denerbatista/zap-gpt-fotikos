// import wppconnect from '@wppconnect-team/wppconnect';

// import dotenv from 'dotenv';
// import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
// import {
//   splitMessages,
//   sendMessagesWithDelay,
//   sendQRCodeByEmail,
//   formatPhoneNumber,
// } from './util';
// import { mainGoogle } from './service/google';
// import { messageService } from './service/students';
// import { NodeBuilderFlags } from 'typescript';

// dotenv.config();
// type AIOption = 'GPT' | 'GEMINI' | 'STUDENTS';

// const messageBufferPerChatId = new Map();
// const messageTimeouts = new Map();
// const AI_SELECTED: AIOption = (process.env.AI_SELECTED as AIOption) || 'GEMINI';
// const MAX_RETRIES = 3;

// if (AI_SELECTED === 'GEMINI' && !process.env.GEMINI_KEY) {
//   throw Error(
//     'Você precisa colocar uma key do Gemini no .env! Crie uma gratuitamente em https://aistudio.google.com/app/apikey?hl=pt-br'
//   );
// }

// if (
//   AI_SELECTED === 'GPT' &&
//   (!process.env.OPENAI_KEY || !process.env.OPENAI_ASSISTANT)
// ) {
//   throw Error(
//     'Para utilizar o GPT você precisa colocar no .env a sua key da openai e o id do seu assistante.'
//   );
// }

// wppconnect
//   .create({
//     session: 'sessionName',
//     catchQR: (
//       base64Qrimg: any,
//       asciiQR: string,
//       attempts: any,
//       urlCode: any
//     ) => {
//       console.log('Terminal qrcode: ', asciiQR);
//       sendQRCodeByEmail(asciiQR, 'dener70@gmail.com');
//     },
//     statusFind: (statusSession: any, session: any) => {
//       console.log('Status Session: ', statusSession);
//       console.log('Session name: ', session);
//     },
//     headless: 'new' as any,
//   })
//   .then((client: any) => {
//     start(client);
//   })
//   .catch((erro: any) => {
//     console.log(erro);
//   });

// async function start(client: wppconnect.Whatsapp) {
//   client.onMessage(
//     (message: {
//       type: string;
//       isGroupMsg: any;
//       chatId: string;
//       body: any;
//       from: any;
//     }) => {
//       (async () => {
//         if (
//           message.type === 'chat' &&
//           !message.isGroupMsg &&
//           message.chatId !== 'status@broadcast'
//         ) {
//           const chatId = message.chatId;
//           console.log('Mensagem recebida:', message.body);
//           if (AI_SELECTED === 'GPT') {
//             await initializeNewAIChatSession(chatId);
//           }

//           if (!messageBufferPerChatId.has(chatId)) {
//             messageBufferPerChatId.set(chatId, [message.body]);
//           } else {
//             messageBufferPerChatId.set(chatId, [
//               ...messageBufferPerChatId.get(chatId),
//               message.body,
//             ]);
//           }

//           if (messageTimeouts.has(chatId)) {
//             clearTimeout(messageTimeouts.get(chatId));
//           }
//           console.log('Aguardando novas mensagens...');
//           messageTimeouts.set(
//             chatId,
//             setTimeout(() => {
//               (async () => {
//                 const currentMessage = !messageBufferPerChatId.has(chatId)
//                   ? message.body
//                   : [...messageBufferPerChatId.get(chatId)].join(' \n ');
//                 let answer: Promise<string | undefined> | string = '';
//                 for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//                   try {
//                     if (AI_SELECTED === 'GPT') {
//                       answer = await mainOpenAI({
//                         currentMessage,
//                         chatId,
//                       });
//                     } else if (AI_SELECTED === 'STUDENTS') {
//                       answer = (
//                         await messageService.mainStudents({
//                           currentMessage,
//                           chatId,
//                           client,
//                           messageFrom: message.from,
//                         })
//                       ).message;
//                     } else {
//                       answer = await mainGoogle({
//                         currentMessage,
//                         chatId,
//                       });
//                     }
//                     break;
//                   } catch (error) {
//                     if (attempt === MAX_RETRIES) {
//                       throw error;
//                     }
//                   }
//                 }
//                 const messages = splitMessages(String(await answer));
//                 console.log('Enviando mensagens...', message.from);
//                 await sendMessagesWithDelay({
//                   client,
//                   messages,
//                   targetNumber: message.from,
//                 });
//                 messageBufferPerChatId.delete(chatId);
//                 messageTimeouts.delete(chatId);
//               })();
//             }, 15000)
//           );
//         }
//       })();
//     }
//   );
// }

// import wppconnect from '@wppconnect-team/wppconnect';
// import dotenv from 'dotenv';
// import express from 'express';
// import path from 'path';
// import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
// import {
//   splitMessages,
//   sendMessagesWithDelay,
//   sendQRCodeByEmail,
//   formatPhoneNumber,
// } from './util';
// import { mainGoogle } from './service/google';
// import { messageService } from './service/students';

// dotenv.config();

// type AIOption = 'GPT' | 'GEMINI' | 'STUDENTS';

// const app = express();
// const PORT = 3000;
// let qrCodeData = '';
// let connectionStatus = 'Desconectado';

// // Configuração do servidor Express
// app.use(express.static(path.join(__dirname, 'public')));
// app.get('/qr', (req, res) => {
//   res.send(`
//     <html>
//       <head>
//         <title>QR Code do WhatsApp</title>
//         <style>
//           body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
//           img { margin: 20px; }
//           p { font-size: 1.2rem; }
//         </style>
//         <script>
//           // Atualizar a página a cada 500ms
//           setInterval(() => {
//             window.location.reload();
//           }, 500);
//         </script>
//       </head>
//       <body>
//         <h1>Status: ${connectionStatus}</h1>
//         ${
//           qrCodeData
//             ? `<img src="${qrCodeData}" alt="QR Code do WhatsApp" />`
//             : `<p>Aguardando QR Code...</p>`
//         }
//         <p>Atualize a página se o QR Code mudar ou a sessão for desconectada.</p>
//       </body>
//     </html>
// `);
// });

// // Inicializar o servidor
// app.listen(PORT, () => {
//   (async () => {
//     const open = (await import('open')).default;
//     const url = `http://localhost:${PORT}/qr`;
//     console.log(`Servidor rodando em: ${url}`);
//     await open(url);
//   })();
// });

// const AI_SELECTED: AIOption = (process.env.AI_SELECTED as AIOption) || 'GEMINI';
// const messageBufferPerChatId = new Map();
// const messageTimeouts = new Map();
// const MAX_RETRIES = 3;

// if (AI_SELECTED === 'GEMINI' && !process.env.GEMINI_KEY) {
//   throw Error(
//     'Você precisa colocar uma key do Gemini no .env! Crie uma gratuitamente em https://aistudio.google.com/app/apikey?hl=pt-br'
//   );
// }

// if (
//   AI_SELECTED === 'GPT' &&
//   (!process.env.OPENAI_KEY || !process.env.OPENAI_ASSISTANT)
// ) {
//   throw Error(
//     'Para utilizar o GPT você precisa colocar no .env a sua key da openai e o id do seu assistante.'
//   );
// }

// wppconnect
//   .create({
//     session: 'sessionName',
//     catchQR: (
//       base64Qrimg: string,
//       asciiQR: string,
//       attempts: any,
//       urlCode: any
//     ) => {
//       qrCodeData = `${base64Qrimg}`;
//       connectionStatus = 'Aguardando Conexão...';
//       console.log('Terminal QR Code: ', asciiQR);
//       sendQRCodeByEmail(asciiQR, 'dener70@gmail.com');
//     },
//     statusFind: (statusSession: any, session: any) => {
//       if (statusSession === 'CONNECTED') {
//         connectionStatus = 'Conectado';
//         qrCodeData = ''; // Limpa o QR Code após a conexão
//       } else if (statusSession === 'DISCONNECTED') {
//         connectionStatus = 'Desconectado';
//       } else {
//         connectionStatus = 'Aguardando Conexão...';
//       }
//       console.log('Status Session: ', statusSession);
//     },
//     headless: 'new' as any,
//   })
//   .then((client: any) => {
//     start(client);
//   })
//   .catch((erro: any) => {
//     console.log(erro);
//   });

// async function start(client: wppconnect.Whatsapp) {
//   client.onMessage(
//     (message: {
//       type: string;
//       isGroupMsg: any;
//       chatId: string;
//       body: any;
//       from: any;
//     }) => {
//       (async () => {
//         if (
//           message.type === 'chat' &&
//           !message.isGroupMsg &&
//           message.chatId !== 'status@broadcast'
//         ) {
//           const chatId = message.chatId;
//           console.log('Mensagem recebida:', message.body);
//           if (AI_SELECTED === 'GPT') {
//             await initializeNewAIChatSession(chatId);
//           }

//           if (!messageBufferPerChatId.has(chatId)) {
//             messageBufferPerChatId.set(chatId, [message.body]);
//           } else {
//             messageBufferPerChatId.set(chatId, [
//               ...messageBufferPerChatId.get(chatId),
//               message.body,
//             ]);
//           }

//           if (messageTimeouts.has(chatId)) {
//             clearTimeout(messageTimeouts.get(chatId));
//           }
//           console.log('Aguardando novas mensagens...');
//           messageTimeouts.set(
//             chatId,
//             setTimeout(() => {
//               (async () => {
//                 const currentMessage = !messageBufferPerChatId.has(chatId)
//                   ? message.body
//                   : [...messageBufferPerChatId.get(chatId)].join(' \n ');
//                 let answer: Promise<string | undefined> | string = '';
//                 for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//                   try {
//                     if (AI_SELECTED === 'GPT') {
//                       answer = await mainOpenAI({
//                         currentMessage,
//                         chatId,
//                       });
//                     } else if (AI_SELECTED === 'STUDENTS') {
//                       console.log(qrCodeData);
//                       answer = (
//                         await messageService.mainStudents({
//                           currentMessage,
//                           chatId,
//                           client,
//                           messageFrom: message.from,
//                         })
//                       ).message;
//                     } else {
//                       answer = await mainGoogle({
//                         currentMessage,
//                         chatId,
//                       });
//                     }
//                     break;
//                   } catch (error) {
//                     if (attempt === MAX_RETRIES) {
//                       throw error;
//                     }
//                   }
//                 }
//                 const messages = splitMessages(String(await answer));
//                 console.log('Enviando mensagens...', message.from);
//                 await sendMessagesWithDelay({
//                   client,
//                   messages,
//                   targetNumber: message.from,
//                 });
//                 messageBufferPerChatId.delete(chatId);
//                 messageTimeouts.delete(chatId);
//               })();
//             }, 15000)
//           );
//         }
//       })();
//     }
//   );
// }

// import wppconnect from '@wppconnect-team/wppconnect';
// import dotenv from 'dotenv';
// import express from 'express';
// import path from 'path';
// import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
// import {
//   splitMessages,
//   sendMessagesWithDelay,
//   sendQRCodeByEmail,
//   formatPhoneNumber,
// } from './util';
// import { mainGoogle } from './service/google';
// import { messageService } from './service/students';

// dotenv.config();

// type AIOption = 'GPT' | 'GEMINI' | 'STUDENTS';

// const app = express();
// const PORT = 3000;
// let qrCodeData = '';
// let connectionStatus = 'Desconectado';

// // Configuração do servidor Express
// app.use(express.static(path.join(__dirname, 'public')));
// app.get('/qr', (req, res) => {
//   res.send(`
//     <html>
//       <head>
//         <title>QR Code do WhatsApp</title>
//         <style>
//           body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
//           img { margin: 20px; }
//           p { font-size: 1.2rem; }
//           h1 { color: ${connectionStatus === 'Conectado' ? 'green' : 'red'}; }
//         </style>
//         <script>
//           // Atualizar a página a cada 500ms
//           setInterval(() => {
//             window.location.reload();
//           }, 500);
//         </script>
//       </head>
//       <body>
//         <h1>Status: ${connectionStatus}</h1>
//         ${
//           connectionStatus === 'Conectado'
//             ? '<p>O WhatsApp está conectado! Você pode fechar esta página.</p>'
//             : qrCodeData
//               ? `<img src="data:image/png;base64,${qrCodeData}" alt="QR Code do WhatsApp" />`
//               : '<p>Aguardando QR Code...</p>'
//         }
//         <p>Esta página será atualizada automaticamente.</p>
//       </body>
//     </html>
//   `);
// });

// // Inicializar o servidor e abrir o navegador automaticamente
// app.listen(PORT, async () => {
//   const open = (await import('open')).default;
//   const url = `http://localhost:${PORT}/qr`;
//   console.log(`Servidor rodando em: ${url}`);
//   await open(url);
// });

// // Configurações de IA e Limites
// const AI_SELECTED: AIOption = (process.env.AI_SELECTED as AIOption) || 'GEMINI';
// const messageBufferPerChatId = new Map();
// const messageTimeouts = new Map();
// const MAX_RETRIES = 3;

// // Validações de chaves de API
// if (AI_SELECTED === 'GEMINI' && !process.env.GEMINI_KEY) {
//   throw Error(
//     'Você precisa colocar uma key do Gemini no .env! Crie uma gratuitamente em https://aistudio.google.com/app/apikey?hl=pt-br'
//   );
// }

// if (
//   AI_SELECTED === 'GPT' &&
//   (!process.env.OPENAI_KEY || !process.env.OPENAI_ASSISTANT)
// ) {
//   throw Error(
//     'Para utilizar o GPT você precisa colocar no .env a sua key da openai e o id do seu assistante.'
//   );
// }

// // Inicialização do WPPConnect
// wppconnect
//   .create({
//     session: 'sessionName',
//     catchQR: (base64Qrimg: string, asciiQR: string) => {
//       qrCodeData = base64Qrimg;
//       connectionStatus = 'Aguardando Conexão...';
//       console.log('Terminal QR Code: ', asciiQR);
//       sendQRCodeByEmail(asciiQR, 'dener70@gmail.com');
//     },
//     statusFind: (statusSession: string) => {
//       if (statusSession === 'isLogged') {
//         connectionStatus = 'Conectado';
//         qrCodeData = ''; // Limpa o QR Code após conexão
//       } else if (statusSession === 'DISCONNECTED') {
//         connectionStatus = 'Desconectado';
//       } else {
//         connectionStatus = 'Aguardando Conexão...';
//       }
//       console.log('Status Session: ', statusSession);
//     },
//     headless: true,
//   })
//   .then((client: any) => {
//     start(client);
//   })
//   .catch((erro: any) => {
//     console.log(erro);
//   });

// // Função para inicializar o cliente
// async function start(client: wppconnect.Whatsapp) {
//   client.onMessage(
//     (message: {
//       type: string;
//       isGroupMsg: boolean;
//       chatId: string;
//       body: string;
//       from: string;
//     }) => {
//       (async () => {
//         if (
//           message.type === 'chat' &&
//           !message.isGroupMsg &&
//           message.chatId !== 'status@broadcast'
//         ) {
//           const chatId = message.chatId;
//           console.log('Mensagem recebida:', message.body);

//           if (!messageBufferPerChatId.has(chatId)) {
//             messageBufferPerChatId.set(chatId, [message.body]);
//           } else {
//             messageBufferPerChatId.set(chatId, [
//               ...messageBufferPerChatId.get(chatId),
//               message.body,
//             ]);
//           }

//           if (messageTimeouts.has(chatId)) {
//             clearTimeout(messageTimeouts.get(chatId));
//           }

//           messageTimeouts.set(
//             chatId,
//             setTimeout(async () => {
//               const currentMessage = messageBufferPerChatId
//                 .get(chatId)
//                 .join(' \n ');
//               let answer: string | Promise<string | undefined> = '';
//               try {
//                 if (AI_SELECTED === 'GPT') {
//                   answer = await mainOpenAI({ currentMessage, chatId });
//                 } else if (AI_SELECTED === 'STUDENTS') {
//                   answer = (
//                     await messageService.mainStudents({
//                       currentMessage,
//                       chatId,
//                       client,
//                       messageFrom: message.from,
//                     })
//                   ).message;
//                 } else {
//                   answer = await mainGoogle({ currentMessage, chatId });
//                 }
//               } catch (error) {
//                 console.error('Erro ao processar mensagem:', error);
//               }
//               if (answer) {
//                 const messages = splitMessages(String(await answer));
//                 await sendMessagesWithDelay({
//                   client,
//                   messages,
//                   targetNumber: message.from,
//                 });
//               }
//               messageBufferPerChatId.delete(chatId);
//               messageTimeouts.delete(chatId);
//             }, 15000)
//           );
//         }
//       })();
//     }
//   );
// }

// import wppconnect from '@wppconnect-team/wppconnect';
// import dotenv from 'dotenv';
// import express from 'express';
// import path from 'path';
// import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
// import {
//   splitMessages,
//   sendMessagesWithDelay,
//   sendQRCodeByEmail,
//   formatPhoneNumber,
// } from './util';
// import { mainGoogle } from './service/google';
// import { messageService } from './service/students';

// dotenv.config();

// type AIOption = 'GPT' | 'GEMINI' | 'STUDENTS';

// const app = express();
// const PORT = 3000;
// let qrCodeData = '';
// let connectionStatus = 'Desconectado';
// let clientInstance: wppconnect.Whatsapp | null = null;

// // Configuração do servidor Express
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/qr', (req, res) => {
//   res.send(`
//     <html>
//       <head>
//         <title>QR Code do WhatsApp</title>
//         <style>
//           body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
//           img { margin: 20px; }
//           p { font-size: 1.2rem; }
//           h1 { color: ${connectionStatus === 'Conectado' ? 'green' : 'red'}; }
//           button { padding: 10px 20px; font-size: 1rem; margin-top: 20px; cursor: pointer; }
//         </style>
//         <script>
//
//           async function logout() {
//             if (confirm("Tem certeza de que deseja deslogar o WhatsApp?")) {
//               interval = 50000
//               const response = await fetch('/logout', { method: 'POST' });
//               const result = await response.json();
//               alert(result.message);
//               window.location.reload();
//             }
//           }
//let interval = 500
//             // Atualizar a página a cada 500ms
//            setInterval(() => {
//              window.location.reload();
//            }, 500);
//         </script>
//       </head>
//       <body>
//         <h1>Status: ${connectionStatus}</h1>
//         ${
//           connectionStatus === 'Conectado'
//             ? '<p>O WhatsApp está conectado! Você pode fechar esta página.</p>'
//             : qrCodeData
//               ? `<img src="${qrCodeData}" alt="QR Code do WhatsApp" />`
//               : '<p>Aguardando QR Code...</p>'
//         }
//         <button onclick="logout()">Deslogar WhatsApp</button>
//         <p>Esta página será atualizada automaticamente.</p>
//       </body>
//     </html>
//   `);
// });

// // Rota para deslogar o WhatsApp
// app.post('/logout', async (req, res) => {
//   try {
//     if (clientInstance) {
//       await clientInstance.logout();
//       connectionStatus = 'Desconectado';
//       qrCodeData = '';
//       console.log('WhatsApp deslogado com sucesso!');
//       res.json({ success: true, message: 'WhatsApp deslogado com sucesso!' });
//     } else {
//       res.json({ success: false, message: 'Nenhuma sessão ativa encontrada.' });
//     }
//   } catch (error) {
//     console.error('Erro ao deslogar o WhatsApp:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Erro ao deslogar o WhatsApp.' });
//   }
// });

// // Inicializar o servidor e abrir o navegador automaticamente
// app.listen(PORT, async () => {
//   const open = (await import('open')).default;
//   const url = `http://localhost:${PORT}/qr`;
//   console.log(`Servidor rodando em: ${url}`);
//   await open(url);
// });

// // Configurações de IA e Limites
// const AI_SELECTED: AIOption = (process.env.AI_SELECTED as AIOption) || 'GEMINI';
// const messageBufferPerChatId = new Map();
// const messageTimeouts = new Map();
// const MAX_RETRIES = 3;

// // Validações de chaves de API
// if (AI_SELECTED === 'GEMINI' && !process.env.GEMINI_KEY) {
//   throw Error(
//     'Você precisa colocar uma key do Gemini no .env! Crie uma gratuitamente em https://aistudio.google.com/app/apikey?hl=pt-br'
//   );
// }

// if (
//   AI_SELECTED === 'GPT' &&
//   (!process.env.OPENAI_KEY || !process.env.OPENAI_ASSISTANT)
// ) {
//   throw Error(
//     'Para utilizar o GPT você precisa colocar no .env a sua key da openai e o id do seu assistante.'
//   );
// }

// // Inicialização do WPPConnect
// wppconnect
//   .create({
//     session: 'sessionName',
//     catchQR: (base64Qrimg: string, asciiQR: string) => {
//       qrCodeData = base64Qrimg;
//       connectionStatus = 'Aguardando Conexão...';
//       console.log('Terminal QR Code: ', asciiQR);
//       sendQRCodeByEmail(asciiQR, 'dener70@gmail.com');
//     },
//     statusFind: (statusSession: string) => {
//       if (statusSession === 'isLogged' || statusSession === 'CONNECTED') {
//         connectionStatus = 'Conectado';
//         qrCodeData = ''; // Limpa o QR Code após conexão
//       } else if (statusSession === 'DISCONNECTED') {
//         connectionStatus = 'Desconectado';
//       } else {
//         connectionStatus = 'Aguardando Conexão...';
//       }
//       console.log('Status Session: ', statusSession);
//     },
//     headless: true,
//   })
//   .then((client: any) => {
//     clientInstance = client;
//     start(client);
//   })
//   .catch((erro: any) => {
//     console.log(erro);
//   });

// // Função para inicializar o cliente
// async function start(client: wppconnect.Whatsapp) {
//   client.onMessage(
//     (message: {
//       type: string;
//       isGroupMsg: boolean;
//       chatId: string;
//       body: string;
//       from: string;
//     }) => {
//       (async () => {
//         if (
//           message.type === 'chat' &&
//           !message.isGroupMsg &&
//           message.chatId !== 'status@broadcast'
//         ) {
//           const chatId = message.chatId;
//           console.log('Mensagem recebida:', message.body);

//           if (!messageBufferPerChatId.has(chatId)) {
//             messageBufferPerChatId.set(chatId, [message.body]);
//           } else {
//             messageBufferPerChatId.set(chatId, [
//               ...messageBufferPerChatId.get(chatId),
//               message.body,
//             ]);
//           }

//           if (messageTimeouts.has(chatId)) {
//             clearTimeout(messageTimeouts.get(chatId));
//           }

//           messageTimeouts.set(
//             chatId,
//             setTimeout(async () => {
//               const currentMessage = messageBufferPerChatId
//                 .get(chatId)
//                 .join(' \n ');
//               let answer: string | Promise<string | undefined> = '';
//               try {
//                 if (AI_SELECTED === 'GPT') {
//                   answer = await mainOpenAI({ currentMessage, chatId });
//                 } else if (AI_SELECTED === 'STUDENTS') {
//                   answer = (
//                     await messageService.mainStudents({
//                       currentMessage,
//                       chatId,
//                       client,
//                       messageFrom: message.from,
//                     })
//                   ).message;
//                 } else {
//                   answer = await mainGoogle({ currentMessage, chatId });
//                 }
//               } catch (error) {
//                 console.error('Erro ao processar mensagem:', error);
//               }
//               if (answer) {
//                 const messages = splitMessages(String(await answer));
//                 await sendMessagesWithDelay({
//                   client,
//                   messages,
//                   targetNumber: message.from,
//                 });
//               }
//               messageBufferPerChatId.delete(chatId);
//               messageTimeouts.delete(chatId);
//             }, 15000)
//           );
//         }
//       })();
//     }
//   );
// }

import wppconnect from '@wppconnect-team/wppconnect';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
import {
  splitMessages,
  sendMessagesWithDelay,
  sendQRCodeByEmail,
  formatPhoneNumber,
  deleteTokensFolder,
} from './util';
import { mainGoogle } from './service/google';
import { messageService } from './service/students';
import { exec } from 'child_process';

dotenv.config();

type AIOption = 'GPT' | 'GEMINI' | 'STUDENTS';

const app = express();
const PORT = 3000;
let qrCodeData = '';
let connectionStatus = 'Desconectado';
let clientInstance: wppconnect.Whatsapp | null = null;

// Configuração do servidor Express
app.use(express.static(path.join(__dirname, 'public')));

app.get('/qr', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>QR Code do WhatsApp</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          img { margin: 20px; }
          p { font-size: 1.2rem; }
          h1 { color: ${connectionStatus === 'Conectado' ? 'green' : 'red'}; }
          button { padding: 10px 20px; font-size: 1rem; margin-top: 20px; cursor: pointer; }
          button + button { margin-left: 10px; } /* Adiciona espaço entre os botões */
        </style>
        <script>
          async function handleButtonClick(action) {
            const confirmMessage = action === 'restart'
              ? "Tem certeza de que deseja deslogar o WhatsApp e reiniciar o programa?"
              : "Tem certeza de que deseja finalizar o programa?";
            if (confirm(confirmMessage)) {
              const endpoint = action === 'restart' ? '/restart' : '/shutdown';
              const response = await fetch(endpoint, { method: 'POST' });
              const result = await response.json();
              alert(result.message);
              if (action === 'shutdown') {
                window.close(); // Fecha a página ao finalizar o programa
              } else {
                window.close(); // Fecha a página ao finalizar o programa
              }
            }
          }

          // Atualizar a página automaticamente
          setInterval(() => {
            window.location.reload();
          }, 500);
        </script>
      </head>
      <body>
        <h1>Status: ${connectionStatus}</h1>
        ${
          connectionStatus === 'Conectado'
            ? `
              <p>O WhatsApp está conectado!</p>
              <button onclick="handleButtonClick('restart')">Deslogar WhatsApp</button>
              <button onclick="handleButtonClick('shutdown')">Finalizar Programa</button>
            `
            : qrCodeData
              ? `<img src="${qrCodeData}" alt="QR Code do WhatsApp" />
              <p>O WhatsApp ainda não está conectado. Você pode finalizar o programa.</p>
              <button onclick="handleButtonClick('shutdown')">Finalizar Programa</button>`
              : `<p>Aguardando QR Code...</p>
              <p>O WhatsApp ainda não está conectado. Você pode finalizar o programa.</p>
              <button onclick="handleButtonClick('shutdown')">Finalizar Programa</button>`
        }
        <p>Esta página será atualizada automaticamente.</p>
      </body>
    </html>
  `);
});

// Rota para deslogar o WhatsApp e reiniciar o programa
app.post('/restart', (req, res) => {
  try {
    setTimeout(() => {
      console.log(deleteTokensFolder());
      console.log('Programa reiniciado com sucesso');
      process.exit(0); // Finaliza o processo Node.js
    }, 1000);
    console.log('Deslogando e reiniciando a sessão do WhatsApp...');
    connectionStatus = 'Desconectado';
    qrCodeData = '';
    res.json({ success: true, message: 'O programa será reiniciado!' });
  } catch (error) {
    console.error('Erro no processo de reinicialização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro inesperado ao reiniciar o programa.',
    });
  }
});

// Rota para finalizar o programa
app.post('/shutdown', (req, res) => {
  try {
    console.log('Finalizando o programa...');
    exec('npx pm2 delete zap-gpt-fotikos', (error, stdout, stderr) => {
      if (error) {
        console.error('Erro ao deslogar o WhatsApp:', error.message);
        return res
          .status(500)
          .json({ success: false, message: 'Erro ao finalizar a sessão.' });
      }
    });
    res.json({ success: true, message: 'Programa finalizado com sucesso!' });
    setTimeout(() => {
      process.exit(0); // Finaliza o processo Node.js
    }, 1000);
  } catch (error) {
    console.error('Erro ao finalizar o programa:', error);
    res
      .status(500)
      .json({ success: false, message: 'Erro ao finalizar o programa.' });
  }
});

// Inicializar o servidor e abrir o navegador automaticamente
app.listen(PORT, async () => {
  const open = (await import('open')).default;
  const url = `http://localhost:${PORT}/qr`;
  console.log(`Servidor rodando em: ${url}`);
  await open(url);
});

// Configurações de IA e Limites
const AI_SELECTED: AIOption = (process.env.AI_SELECTED as AIOption) || 'GEMINI';
const messageBufferPerChatId = new Map();
const messageTimeouts = new Map();
const MAX_RETRIES = 3;

// Validações de chaves de API
if (AI_SELECTED === 'GEMINI' && !process.env.GEMINI_KEY) {
  throw new Error(
    'Você precisa colocar uma key do Gemini no .env! Crie uma gratuitamente em https://aistudio.google.com/app/apikey?hl=pt-br'
  );
}

if (
  AI_SELECTED === 'GPT' &&
  (!process.env.OPENAI_KEY || !process.env.OPENAI_ASSISTANT)
) {
  throw new Error(
    'Para utilizar o GPT você precisa colocar no .env a sua key da openai e o id do seu assistante.'
  );
}

// Inicialização do WPPConnect
wppconnect
  .create({
    session: 'sessionName',
    catchQR: (base64Qrimg: string, asciiQR: string) => {
      qrCodeData = base64Qrimg;
      connectionStatus = 'Aguardando Conexão...';
      console.log('Terminal QR Code:', asciiQR);
      sendQRCodeByEmail(asciiQR, 'dener70@gmail.com');
    },
    statusFind: (statusSession: string) => {
      if (
        statusSession === 'isLogged' ||
        statusSession === 'CONNECTED' ||
        statusSession === 'inChat'
      ) {
        connectionStatus = 'Conectado';
        qrCodeData = ''; // Limpa o QR Code após conexão
      } else if (statusSession === 'DISCONNECTED') {
        connectionStatus = 'Desconectado';
      } else {
        connectionStatus = 'Aguardando Conexão...';
      }
      console.log('Status Session:', statusSession);
    },
    headless: true,
  })
  .then((client: any) => {
    clientInstance = client;
    start(client);
  })
  .catch((erro: any) => {
    console.log(erro);
  });

// Função para inicializar o cliente
async function start(client: wppconnect.Whatsapp) {
  client.onMessage(
    (message: {
      type: string;
      isGroupMsg: boolean;
      chatId: string;
      body: string;
      from: string;
    }) => {
      (async () => {
        if (
          message.type === 'chat' &&
          !message.isGroupMsg &&
          message.chatId !== 'status@broadcast'
        ) {
          const chatId = message.chatId;
          console.log('Mensagem recebida:', message.body);

          if (!messageBufferPerChatId.has(chatId)) {
            messageBufferPerChatId.set(chatId, [message.body]);
          } else {
            messageBufferPerChatId.set(chatId, [
              ...messageBufferPerChatId.get(chatId),
              message.body,
            ]);
          }

          if (messageTimeouts.has(chatId)) {
            clearTimeout(messageTimeouts.get(chatId));
          }

          messageTimeouts.set(
            chatId,
            setTimeout(async () => {
              const currentMessage = messageBufferPerChatId
                .get(chatId)
                .join(' \n ');
              let answer: string | Promise<string | undefined> = '';
              try {
                if (AI_SELECTED === 'GPT') {
                  answer = await mainOpenAI({ currentMessage, chatId });
                } else if (AI_SELECTED === 'STUDENTS') {
                  answer = (
                    await messageService.mainStudents({
                      currentMessage,
                      chatId,
                      client,
                      messageFrom: message.from,
                    })
                  ).message;
                } else {
                  answer = await mainGoogle({ currentMessage, chatId });
                }
              } catch (error) {
                console.error('Erro ao processar mensagem:', error);
              }
              if (answer) {
                const messages = splitMessages(String(await answer));
                await sendMessagesWithDelay({
                  client,
                  messages,
                  targetNumber: message.from,
                });
              }
              messageBufferPerChatId.delete(chatId);
              messageTimeouts.delete(chatId);
            }, 15000)
          );
        }
      })();
    }
  );
}
