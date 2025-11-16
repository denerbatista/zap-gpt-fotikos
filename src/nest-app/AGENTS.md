# Agente do backend escolar

Este diretório implementa a API de presença usando o framework simplificado descrito em `src/nest-app/framework`.

## Regras de código
- Mantenha os serviços puros e sincronizados (sem side effects externos além dos stubs de notificação).
- Controladores devem receber `unknown` no `@Body` e converter via funções `parse*Dto`.
- Sempre propague novos DTOs por meio de helpers em `src/nest-app/utils/validation.ts`.
- Evite dependências novas; reaproveite `express` e utilitários já presentes.

## Testes mínimos
- `yarn api:dev` deve subir em até 3 segundos e logar `Nest API listening...`.
- Use `curl` para validar um check-in completo antes de concluir uma alteração grande.
