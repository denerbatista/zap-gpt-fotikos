# Agente do aplicativo React Native

- O app precisa continuar compatível com Expo Go; não adicione módulos nativos sem documentar a necessidade em `docs/guia-operacional.md`.
- Configurações externas entram em `app.json` usando a chave `extra`. Documente novas chaves no README.
- A paleta e tokens estão em `src/theme`; reutilize-os antes de criar novas cores.
- Se alterar chamadas à API, atualize `src/services/api.ts` e deixe exemplos de payload no README.
