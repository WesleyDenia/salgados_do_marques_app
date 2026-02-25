# Sprint 5 Release Readiness (5X.6)

Data: 2026-02-25

## Objetivo

Executar a revisão de readiness para release Android (Expo/EAS) sem disparar build de produção nesta etapa, registrando o que está validado localmente e eventuais pendências/bloqueios.

## Configuração Validada

- `eas.json`
  - `cli.appVersionSource = "remote"` ✅
  - `build.production.autoIncrement = true` ✅
  - `build.production.android.buildType = "app-bundle"` ✅
- `app.json`
  - `expo.version = "1.0.2"` ✅
  - `expo.android.versionCode = 3` (presente; **ignorado pelo EAS** com version source remoto)
- `package.json`
  - `version = "1.0.2"` ✅ (coerente com `app.json`)

## EAS / Conta / Projeto

- `pnpm exec eas --version` -> `eas-cli/16.27.0` ✅ (compatível com `eas.json`)
- `pnpm exec eas whoami` -> `salgadosmarques` ✅
- Projeto EAS no `app.json > expo.extra.eas.projectId` presente ✅

## Checagem de Versão Remota (EAS)

Comando executado:

```bash
pnpm exec eas build:version:get --platform android
```

Resultado:

- `Android versionCode - 15` ✅

Observação:

- O EAS informou que `android.versionCode` local (`app.json`) é ignorado quando `appVersionSource = "remote"`.
- Isso está coerente com a estratégia do projeto (`remote + autoIncrement`).

## Identificação do Commit (para rastreabilidade)

- `git rev-parse --short HEAD` -> `79aa64a`

## Dry Run de Build/Submit

Status: **não executado** nesta etapa.

Motivo:

- `eas build` não possui modo `--dry-run`.
- Disparar `eas build --platform android --profile production` iniciaria um build real (custo/tempo), melhor tratado como ação manual controlada na preparação de publicação.

## Pendências para execução manual (antes da release real)

- [ ] Rodar `eas build --platform android --profile production`
- [ ] Confirmar artefato `.aab` no EAS dashboard
- [ ] Validar commit/versão do build gerado
- [ ] Executar `eas submit -p android --profile production` (ou upload manual no Play Console)

## Observações / Recomendação

- Considerar remover `expo.android.versionCode` de `app.json` no futuro para evitar confusão, já que produção usa `appVersionSource: remote`.
- Antes do build real, concluir checklist de QA manual da Sprint 5 (`docs/qa/sprint-5-qa-notes.md`).
