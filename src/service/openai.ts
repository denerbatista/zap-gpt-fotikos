import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

let assistant: OpenAI.Beta.Assistants.Assistant;

let openai: OpenAI;
const activeChats = new Map<string, OpenAI.Beta.Threads.Thread>();

// Inicializa uma nova sessão de chat com o OpenAI
export async function initializeNewAIChatSession(chatId: string): Promise<void> {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  // Carrega o assistente configurado na OpenAI
  assistant = await openai.beta.assistants.retrieve(process.env.OPENAI_ASSISTANT!);

  // Verifica se o chat já está ativo
  if (activeChats.has(chatId)) return;

  // Cria um novo thread para o chat
  const thread = await openai.beta.threads.create();
  activeChats.set(chatId, thread);
}

// Envia uma mensagem para o OpenAI e retorna a resposta
export async function mainOpenAI({
  currentMessage,
  chatId,
}: {
  currentMessage: string;
  chatId: string;
}): Promise<string> {
  // Recupera o thread ativo para o chatId
  const thread = activeChats.get(chatId) as OpenAI.Beta.Threads.Thread;

  // Cria uma nova mensagem no thread como 'user'
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: currentMessage,
  });

  // Inicia uma nova execução no thread
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions: assistant.instructions,
  });

  // Obtém as mensagens após a execução
  const messages = await checkRunStatus({ threadId: thread.id, runId: run.id });
  
  // Verifica se a resposta contém o campo `text`
  const responseMessage = messages.data[0].content[0] as OpenAI.Beta.Threads.Messages.MessageContent;
  
  // Valida o tipo de conteúdo para acessar o `text` de forma segura
  if ('text' in responseMessage && responseMessage.text?.value) {
    return responseMessage.text.value;
  } else {
    throw new Error("Resposta da OpenAI não contém texto.");
  }
}

// Função para verificar o status da execução até ser concluída
async function checkRunStatus({
  threadId,
  runId,
}: {
  threadId: string;
  runId: string;
}): Promise<OpenAI.Beta.Threads.Messages.MessagesPage> { // Ajustado para MessagesPage
  return await new Promise((resolve, _reject) => {
    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

      if (runStatus.status === 'completed') {
        // Lista todas as mensagens no thread após a execução
        const messages = await openai.beta.threads.messages.list(threadId);
        resolve(messages);
      } else {
        console.log('Aguardando resposta da OpenAI...');
        setTimeout(verify, 3000);
      }
    };

    verify();
  });
}
