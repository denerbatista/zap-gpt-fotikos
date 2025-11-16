# Zap-GPT

Este projeto explora a integração do ChatGPT com o WhatsApp, transformando o chatbot em um assistente virtual capaz de realizar tarefas como falar com amigos, responder a perguntas de clientes, e muito mais, com um toque de humanização nas conversas.

## 📚 Como funciona

A integração começa com o [wpconnect](https://github.com/wppconnect-team/wppconnect), que estabelece a conexão com o WhatsApp. <br/>
As mensagens recebidas são então processadas pela API do ChatGPT ou Gemini, que gera respostas coerentes e personalizadas.<br/>
Utilizamos um [assistant](https://platform.openai.com/docs/assistants/overview) da OpenAI, que é um do modelo OpenAI que foi pré-configurado com prompts detalhados. </br>
No caso do Gemini usamos um prompt pronto para instruções do modelo. </br>
Esses prompts orientam o assistente sobre como responder de maneira coerente e personalizada, assegurando que as interações não só se mantenham relevantes e engajantes, mas também reflitam uma abordagem humana e natural na conversação.

## 🚀 Como rodar o projeto
[Vídeo mostrando como rodar](https://youtu.be/Sh94c6yn5aQ)

## 🧪 Informações

Você pode testar o zap-gpt que está ativo neste [WhatsAop](https://wa.me/5551981995600)  </br>
Confira mais detalhes do projeto no meu [Instagram](https://www.instagram.com/marcusdev_)

---

## 🏗️ Nova arquitetura para controle de estudantes

O serviço "students" agora é atendido por uma **API RESTful em NestJS** e por um **aplicativo mobile em React Native (Expo)**, deixando a dependência do WhatsApp opcional.

### Componentes

| Camada | Pasta | Tecnologias | Objetivo |
| --- | --- | --- | --- |
| API | `src/nest-app` | NestJS, Class Validator | Endpoints para estudantes, presença, notificações e relatórios |
| Mobile | `apps/mobile` | React Native, Expo, React Navigation | Check-in rápido, painel em tempo real, disparo de fechamento da chamada |
| Planejamento | `docs/plano-projeto.md` | Markdown | Diagnóstico, cronograma e métricas exigidas pela escola |

### Principais endpoints

- `POST /api/students` – cadastra um estudante e contatos responsáveis.
- `POST /api/attendance/check-in` – registra entrada, detecta atraso (<=2 min) e dispara notificação.
- `POST /api/attendance/mark-absences` – fecha a chamada e marca quem ainda não chegou, notificando responsáveis.
- `GET /api/attendance/reports/daily` – devolve totais e atrasos para CSV/PDF.

### Aplicativo React Native

- Tela **Painel**: métricas, feed em tempo real e cards de atraso/ausência.
- Tela **Entrada rápida**: leitura de QR/RFID (ou digitação manual) e botão para fechar a chamada.
- Integração com `EXPO_PUBLIC_API_URL` para apontar para a Nest API.

### Como rodar

```
# API NestJS
yarn install  # necessário para instalar as dependências novas (NestJS)
yarn api:dev

# Aplicativo mobile (dentro de apps/mobile)
cd apps/mobile
yarn install
expo start --tunnel
```

Consulte `docs/plano-projeto.md` para o diagnóstico completo, cronograma detalhado e critérios de sucesso acordados com a EMEF Mário Leal Silva.
