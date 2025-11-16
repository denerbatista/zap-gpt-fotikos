# Sistema de Presença EMEF Mário Leal Silva

Este documento consolida o diagnóstico, planejamento e encerramento previstos para a migração do serviço de comunicação via WhatsApp para uma plataforma composta por aplicativo mobile (React Native) e API RESTful (NestJS). O objetivo é detectar atrasos/ausências em tempo real e notificar imediatamente os responsáveis pelos estudantes da EMEF Mário Leal Silva.

## 1. Diagnóstico e teorização

### 1.1 Partes envolvidas e parceiros
- **Organização parceira:**
  - Nome: **EMEF Mário Leal Silva**
  - Natureza: Escola Municipal de Ensino Fundamental – Rede Municipal de Aracruz/ES
  - CNPJ (Conselho Escolar): **09.675.314/0001-69**
  - Endereço: Rua Leocádio Carlesso, s/n – Bairro Guaraná – Aracruz/ES – CEP 29195-433
  - Público atendido: estudantes do 1º ao 5º ano, famílias/responsáveis, equipe pedagógica e administrativa
  - Perfil resumido: turmas em turnos matutino/vespertino, responsáveis com níveis variados de acesso à internet/WhatsApp
- **Equipe do projeto**
  - Produto: Aplicativo mobile em React Native + API NestJS integrada a filas de notificação
  - Papéis: levantamento e análise de requisitos, desenvolvimento, implantação, treinamento, suporte e observabilidade

### 1.2 Situação-problema
- Comunicação manual e lenta entre portaria/coordenação e responsáveis sobre atrasos e ausências
- Conferência de presença manual gera erros de digitação, demora para disparar alertas e baixa confirmação de leitura
- Baixa previsibilidade para ações pedagógicas e de segurança

### 1.3 Demanda sociocomunitária e motivação acadêmica
- Necessidade de comunicação imediata em múltiplos canais (push, WhatsApp, SMS) quando o aluno atrasa ou falta
- Aplicativo registra entrada via QR/RFID/face/seleção rápida, cruza com horários oficiais e dispara alertas automatizados
- Geração de relatórios semanais para a equipe pedagógica
- Projeto permite aplicar técnicas de UX acessível, React Native + NestJS, filas/mensageria, LGPD, observabilidade e práticas DevOps em cenário real

### 1.4 Objetivos
1. Implantar o sistema em produção até **15/11/2025** com piloto em duas turmas.
2. Enviar alerta de atraso em até **2 minutos** após a detecção e alerta de falta em até **10 minutos** após o fechamento da chamada.
3. Alcançar taxa de confirmação de leitura ≥ **85%** em até 30 dias.
4. Reduzir em ≥ **60%** o tempo gasto pela coordenação com ligações/recados.
5. Disponibilizar relatórios semanais (CSV/PDF) para coordenação e direção.

## 2. Planejamento para desenvolvimento

### 2.1 Plano de trabalho e cronograma
| Ação | Período | Descrição |
| --- | --- | --- |
| 1 – Descoberta e regras da escola | 21–24/10/2025 | Mapear horários oficiais, tolerâncias, fluxo de entrada/saída, canais de contato, políticas de notificação e LGPD |
| 2 – Protótipo e validação | 27–31/10/2025 | Prototipar telas (Figma), validar com coordenação/porteiros, realizar testes rápidos |
| 3 – Desenvolvimento | 03–12/11/2025 | Implementar app React Native (autenticação, leitura QR/face, push), API NestJS (presença, regras de atraso/falta, filas BullMQ/Redis, templates), banco Postgres, integrações com WhatsApp/SMS/push |
| 4 – Piloto e ajustes | 13–20/11/2025 | Executar piloto em duas turmas, medir latência e acurácia, ajustar bugs/UX |
| 5 – Treinamento e expansão | 24–29/11/2025 | Treinar coordenação/porteiros/professores, liberar para demais turmas |

**Recursos necessários:** notebook de desenvolvimento, 2 celulares Android (>= 9), leitor QR opcional, internet estável, Redis para filas e Postgres para persistência.

### 2.2 Metodologia
- **Coleta:** entrevistas com direção, coordenação e porteiros; análise de registros de presença; observação do fluxo na portaria.
- **Desenho:** protótipos em Figma, testes de usabilidade (think-aloud) e revisão de acessibilidade.
- **Desenvolvimento:** React Native (Expo ou CLI) + NestJS em arquitetura limpa, TDD para regras de atraso/falta, testes e2e com Supertest, mensageria com BullMQ/Redis e canais configuráveis.
- **Segurança/LGPD:** minimização de dados, definição da base legal, registro de consentimento para WhatsApp/SMS, logs de acesso e termo de uso.
- **Implantação:** Docker Compose com Postgres/Redis/API, variáveis .env, monitoramento (logs estruturados + métricas), versionamento semântico.
- **Treinamento:** guia rápido de 1 página, vídeos curtos e sessão presencial.

### 2.3 Avaliação dos resultados
- **Quantitativos:** latência do alerta (detecção→envio→entrega), % de entrega por canal, % de confirmação de leitura, redução do tempo administrativo.
- **Qualitativos:** satisfação da equipe escolar (escala Likert 1–5), percepção das famílias e registro de incidentes críticos.
- **Critério de êxito:** metas da seção 1.4 atingidas e operação estável por 2 semanas sem incidentes.

## 3. Encerramento do projeto

### 3.1 Evidências
As evidências devem incluir: capturas de tela do app React Native (check-in, painel da coordenação, push notification), vídeos do piloto, relatórios exportados (CSV/PDF), prints de dashboards de observabilidade, atas/listas de presença de treinamentos e link público do repositório GitHub. Cada evidência deve citar data, local e relevância para o projeto.
