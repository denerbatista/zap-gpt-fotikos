# Guia operacional EMEF Mário Leal Silva

Este documento centraliza instruções de uso, configuração e manutenção do sistema de presença.

## Backend (`src/nest-app`)
- **Variáveis**: utilize `API_PORT` para customizar a porta (padrão `4000`).
- **Execução local**:
  ```bash
  yarn api:dev
  ```
  O comando sobe a API em `http://localhost:4000/api` com hot reload via `tsx`.
- **Fluxo mínimo de teste**:
  1. `POST /api/students` cadastrando um estudante (use os campos descritos no README).
  2. `POST /api/attendance/check-in` para simular entrada.
  3. `POST /api/attendance/mark-absences` para fechar a chamada.
- **Reconhecimento facial (beta)**:
  1. `POST /api/attendance/face/register` com `imageBase64` (data URI) para atrelar o rosto a um estudante existente.
  2. `POST /api/attendance/face/check-in` enviando apenas a foto capturada e valide o evento no feed.
- **Swagger**: ao rodar `yarn api:dev`, abra `http://localhost:4000/api/docs` para testar requisições direto no navegador ou use `http://localhost:4000/api/docs/json` para importar nos clientes HTTP.
- **Logs**: ficam no terminal e indicam apenas erros críticos. Para rastrear notificações simuladas, consulte `GET /api/notifications`.
- **Seed oficial**: mantenha `file.xlsx` no padrão descrito no README e execute `npx tsx populate.ts` para importar turmas e alunos via Prisma.

## Mobile (`apps/mobile`)
- **Variáveis Expo**: configure `EXPO_PUBLIC_API_URL` apontando para `http://<host>:4000/api` em qualquer modo de execução.
- **Preview web (corrige o JSON em `localhost:8081`)**:
  ```bash
  cd apps/mobile
  yarn install
  EXPO_PUBLIC_API_URL="http://localhost:4000/api" yarn start:web
  ```
  Esse comando força o Expo a iniciar diretamente no modo web e fixa a porta 8081, evitando o retorno do manifesto JSON do Metro bundler.
  > Observação: o script usa `expo start --web --port 8081` porque o Expo CLI 51 removeu a flag `--web-port`.
  > Dica: com o workspace habilitado no `package.json` raiz, `yarn install` precisa ser executado na raiz para sincronizar também as dependências de `apps/mobile`.
- **Expo Go / dispositivo físico**:
  ```bash
  EXPO_PUBLIC_API_URL="http://<seu-host>:4000/api" expo start --tunnel
  ```
- Para evitar ngrok no modo LAN, descubra o IP da máquina (ex.: `192.168.0.10`) ou use `host.docker.internal` quando a API estiver em contêiner e exporte `EXPO_PUBLIC_API_URL` com esse host antes de rodar `expo start --lan`.
- **Docker Compose**: com a API local rodando (porta 4000), é possível iniciar apenas o preview web via container:
  ```bash
  docker compose up --build mobile-web
  ```
  O bundle responde em `http://localhost:8081` e as alterações feitas em `apps/mobile` são sincronizadas automaticamente.
- **Checklist visual**: após qualquer alteração visual capture telas da `Dashboard` e `Entrada Rápida`.
- **Changelog**: descreva mudanças na seção Mobile deste arquivo ao final da alteração.
- **Câmera/Galeria**: a captura de rosto usa `expo-image-picker` (Expo SDK 51). Mantenha `android.permissions = ["CAMERA"]` e `ios.infoPlist.NSCameraUsageDescription` em `app.json`.

### Mobile – Registro de alterações
- _20/11/2025_: a Entrada Rápida ganhou botões para cadastrar rosto/check-in facial e a documenção passou a orientar o uso do IP local em vez de ngrok.
- _19/11/2025_: os cards do painel exibem nome, ano/sala e continuam alinhados ao snapshot retornado pela API de presença.
- _18/11/2025_: criado o Docker Compose com serviços `api` e `mobile-web`, além do alias global `@/*` para os imports do app mobile.
- _17/11/2025_: script `yarn start:web` atualizado para usar `--port 8081`, evitando o erro `unknown or unexpected option: --web-port` nas versões atuais do Expo CLI.
- _16/11/2025_: criado o script `yarn start:web` para abrir a interface diretamente no navegador (porta 8081) e documentação explicando o manifesto JSON.
- _15/01/2025_: primeira versão disponibilizada com dashboard em tempo real e check-in rápido.

### Testes manuais atualizados
1. Rode `yarn api:dev` e confirme o log `Nest API listening...`.
2. Execute `POST /api/attendance/face/register` usando a mesma foto que será enviada no próximo passo.
3. Chame `POST /api/attendance/face/check-in` com a foto registrada, verifique o novo item em `GET /api/attendance/feed` e confirme o alerta positivo na tela “Check-in com rosto”.
