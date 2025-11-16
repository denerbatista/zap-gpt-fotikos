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
- **Logs**: ficam no terminal e indicam apenas erros críticos. Para rastrear notificações simuladas, consulte `GET /api/notifications`.

## Mobile (`apps/mobile`)
- **Variáveis Expo**: configure `EXPO_PUBLIC_API_URL` apontando para `http://<host>:4000/api` em qualquer modo de execução.
- **Preview web (corrige o JSON em `localhost:8081`)**:
  ```bash
  cd apps/mobile
  yarn install
  EXPO_PUBLIC_API_URL="http://localhost:4000/api" yarn start:web
  ```
  Esse comando força o Expo a iniciar diretamente no modo web e fixa a porta 8081, evitando o retorno do manifesto JSON do Metro bundler.
- **Expo Go / dispositivo físico**:
  ```bash
  EXPO_PUBLIC_API_URL="http://<seu-host>:4000/api" expo start --tunnel
  ```
- **Checklist visual**: após qualquer alteração visual capture telas da `Dashboard` e `Entrada Rápida`.
- **Changelog**: descreva mudanças na seção Mobile deste arquivo ao final da alteração.

### Mobile – Registro de alterações
- _16/11/2025_: criado o script `yarn start:web` para abrir a interface diretamente no navegador (porta 8081) e documentação explicando o manifesto JSON.
- _15/01/2025_: primeira versão disponibilizada com dashboard em tempo real e check-in rápido.
