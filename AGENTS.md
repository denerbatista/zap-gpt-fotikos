# Instruções gerais para agentes

Este repositório atende à EMEF Mário Leal Silva e toda a comunicação oficial deve permanecer em **português-brasileiro**.

## Convenções
- Priorize documentação clara em `docs/`. Sempre que adicionar uma feature, explique o impacto no README e, quando for processo operacional, detalhe em `docs/guia-operacional.md`.
- Exemplos de uso da API devem usar `curl` apontando para `http://localhost:4000/api`.
- Scripts que sobem serviços precisam ser descritos na seção "Como rodar" do README.
- Antes de alterar o app mobile (`apps/mobile`), atualize também o changelog interno (`docs/guia-operacional.md#mobile`).

## Testes
- Para o backend, sempre valide com `yarn api:dev` e cite o comando em qualquer relatório.
- Se criar testes manuais, descreva os passos mínimos no final do arquivo tocado.

## Pull Requests
- Resumos devem listar backend e mobile separadamente quando ambos forem alterados.
- Nunca deixe referências a WhatsApp-only flows; a API + app mobile são o caminho oficial.
