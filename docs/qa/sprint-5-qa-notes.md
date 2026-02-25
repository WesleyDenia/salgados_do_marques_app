# Sprint 5 QA Notes (5X.5)

Data: 2026-02-25

## Objetivo

Registrar a rodada de QA guiado da Sprint 5, incluindo validações automáticas, achados de baixo risco e pendências de validação manual em dispositivo/emulador.

## Validação Automatizada Executada

- `pnpm test` (suíte de lógica/regressão)
- `pnpm exec tsc --noEmit`
- `pnpm lint` (rodado para triagem de issues de baixo risco)

## Achados e Correções de Baixo Risco Aplicadas

- Corrigido lint error de `react/display-name` em componentes memoizados:
  - `app/details/content/[id].tsx`
  - `components/HomeContentList.tsx`
- Removida variável não usada em `app/(auth)/forgot-password.tsx`
- Removido import não usado em `app/(auth)/login.tsx`
- Ajustadas dependências de hooks com warning de lint:
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/loyalty.tsx`
  - `components/WelcomeBonusButton.tsx`

## Checklist QA Manual (Executado em Device)

Status: ✅ Executado manualmente em telemóvel (confirmado pelo responsável em 2026-02-25)

### Auth / Sessão

- [x] login / logout funcionam normalmente
- [x] sessão expirada (`401`) faz reset consistente sem loop
- [x] refresh token continua funcional quando aplicável
- [x] forgot-password / OTP / reset continuam navegando corretamente

### Cardápio / Detalhe / Encomenda

- [x] menu carrega e agrupa corretamente após `useMenuProducts`
- [x] cards do menu continuam abrindo detalhes corretamente
- [x] packs/sabores continuam bloqueando avanço até seleção completa
- [x] agendamento mantém regras e comportamento esperado

### Fidelidade / Cupons

- [x] resgate mostra feedback e CTA para cupons
- [x] copiar código funciona no card e no detalhe
- [x] microcopy de uso em loja permanece correta

## Bloqueios / Observações

- QA manual executado em telemóvel após a rodada de validações automáticas.
- Base de testes automatizados e regressões de auth/agendamento foi usada como suporte para reduzir risco antes da rodada manual.
