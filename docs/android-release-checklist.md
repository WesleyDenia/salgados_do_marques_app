# Checklist de Release Android (Google Play)

Checklist operacional para gerar e publicar uma nova versão do `salgados-app` na Google Play usando **Expo + EAS**.

## Contexto atual do projeto

- Build Android de produção via `EAS` (`eas.json` -> `build.production`)
- `buildType`: `app-bundle` (gera `.aab`)
- `appVersionSource`: `remote`
- `production.autoIncrement: true` (EAS incrementa `versionCode` remotamente)

## Pré-check (antes de versionar)

- [ ] Confirmar que a branch correta está selecionada (`pedidos` ou branch de release)
- [ ] `git status` sem mudanças não intencionais
- [ ] Validar TypeScript:
  - [ ] `npx tsc --noEmit -p tsconfig.json`
- [ ] Validar lint (quando aplicável):
  - [ ] `pnpm lint`
- [ ] Smoke test dos fluxos críticos:
  - [ ] Login / logout / sessão expirada
  - [ ] Menu + detalhe do produto (incluindo packs/sabores)
  - [ ] Encomenda (loja + agendamento + confirmação)
  - [ ] Fidelidade / cupons

## Versionamento (App)

### 1) Atualizar versão semântica visível ao usuário

Atualizar nos dois arquivos:

- [ ] `app.json` -> `expo.version`
- [ ] `package.json` -> `version`

Exemplo:

- `1.0.2` -> `1.0.3`

## Versionamento Android (`versionCode`)

### Regra do projeto (importante)

Este projeto usa:

- `eas.json` -> `cli.appVersionSource = "remote"`
- `eas.json` -> `build.production.autoIncrement = true`

Isso significa:

- O **EAS gerencia o incremento do `versionCode` remotamente** no build de produção.
- O valor em `app.json > expo.android.versionCode` deve permanecer coerente, mas o incremento efetivo de produção pode ocorrer no servidor do EAS.

Checklist:

- [ ] Confirmar que `production.autoIncrement` continua ativo em `eas.json`
- [ ] Confirmar que `app.json > expo.android.versionCode` não foi reduzido/manualmente quebrado

## Build de produção (AAB)

- [ ] Login no Expo/EAS (se necessário):
  - [ ] `eas whoami`
- [ ] Rodar build Android produção:
  - [ ] `eas build --platform android --profile production`
- [ ] Confirmar que o artefato gerado é **AAB** (`app-bundle`)

## Pós-build (validação de release)

- [ ] Conferir versão exibida e build gerado no EAS dashboard
- [ ] Validar release notes internas (o que mudou)
- [ ] Confirmar que o build corresponde ao commit esperado
- [ ] Registrar hash/commit da release (ex.: `git rev-parse --short HEAD`)

## Publicação (Google Play)

### Opção A: via EAS Submit

- [ ] `eas submit -p android --profile production`

### Opção B: upload manual no Google Play Console

- [ ] Baixar `.aab` do EAS
- [ ] Enviar para a trilha correta (internal / closed / production)
- [ ] Preencher notas da versão
- [ ] Revisar rollout (%), se aplicável

## Checklist final (antes de apertar publicar)

- [ ] Versão (`app.json` / `package.json`) atualizada
- [ ] Build gerado sem erro
- [ ] Fluxos críticos testados
- [ ] Notas de release preparadas
- [ ] Commit e push realizados

## Comandos úteis (referência rápida)

```bash
cd /home/oem/Workspace/salgados-app

git status
npx tsc --noEmit -p tsconfig.json
pnpm lint

eas whoami
eas build --platform android --profile production
eas submit -p android --profile production
```

## Observações

- Como o pagamento é **em loja**, mudanças de cupons devem validar a comunicação de uso do código (apresentar na loja) antes da publicação.
- Em caso de dúvida sobre `versionCode`, priorizar a configuração do `EAS` (`remote + autoIncrement`) para produção.
