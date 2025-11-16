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

O serviço "students" agora é atendido por uma **API RESTful inspirada no NestJS** (framework próprio em TypeScript) e por um **aplicativo mobile em React Native (Expo)**, deixando a dependência do WhatsApp opcional.

### Componentes

| Camada | Pasta | Tecnologias | Objetivo |
| --- | --- | --- | --- |
| API | `src/nest-app` | Express + decorators customizados | Endpoints para estudantes, presença, notificações e relatórios |
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
- Integração com `EXPO_PUBLIC_API_URL` para apontar para a API.

### Como rodar

#### Execução manual

```
# API
yarn api:dev

# Aplicativo mobile (dentro de apps/mobile)
cd apps/mobile
yarn install
EXPO_PUBLIC_API_URL="http://localhost:4000/api" yarn start:web
```

Isso abre a versão web em `http://localhost:8081` (a mesma porta citada no relato do bug). Caso você rode apenas `expo start`, o endereço `:8081` retorna o manifesto JSON do Metro bundler — comportamento esperado do Expo Go —, portanto use sempre `yarn start:web` quando quiser testar direto no navegador.

> Nota: o script `yarn start:web` usa `expo start --web --port 8081`, já que a flag `--web-port` foi removida nas versões recentes do Expo CLI e causava o erro `unknown or unexpected option`.

Para depurar com um dispositivo físico via Expo Go, mantenha a variável `EXPO_PUBLIC_API_URL` e rode:

```
expo start --tunnel
```

> Dica: personalize a porta da API exportando `API_PORT`. O padrão é `4000`.

#### Docker Compose (API + preview web)

Para evitar conflitos de dependências locais, o repositório agora possui imagens específicas para a API (`docker/api.Dockerfile`) e para o aplicativo (`apps/mobile/Dockerfile`). Suba tudo com:

```
docker compose up --build api mobile-web
```

- A API ficará disponível em `http://localhost:4000/api`.
- O preview web do Expo responde em `http://localhost:8081`.
- Ajuste `EXPO_PUBLIC_API_URL` no serviço `mobile-web` (arquivo `docker-compose.yml`) caso a API rode fora da máquina local.

> Para trabalhar apenas com o app, use `docker compose up mobile-web`. O container recompila automaticamente sempre que você altera arquivos em `apps/mobile`.

### Documentação Swagger

Ao subir a API você pode inspecionar e testar todos os endpoints pela UI do Swagger disponível em `http://localhost:4000/api/docs`. O JSON da especificação fica exposto em `http://localhost:4000/api/docs/json`, permitindo importar no Postman/Insomnia.

### Teste rápido da API

1. Cadastre um estudante:

```bash
curl -X POST http://localhost:4000/api/students \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Aluno Piloto",
        "grade": "3º ano",
        "room": "3A",
        "classStartTime": "07:30",
        "gracePeriodMinutes": 5,
        "guardians": [
          { "name": "Carla", "channel": "whatsapp", "value": "+55 27 99999-1111", "preferred": true }
        ]
      }'
```

2. Registre o check-in:

```bash
curl -X POST http://localhost:4000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{ "studentId": "stu-001" }'
```

3. Feche a chamada (marca faltas restantes):

```bash
curl -X POST http://localhost:4000/api/attendance/mark-absences -H "Content-Type: application/json" -d '{}'
```

Consulte `docs/plano-projeto.md` para o diagnóstico completo e `docs/guia-operacional.md` para o passo a passo de configuração.
