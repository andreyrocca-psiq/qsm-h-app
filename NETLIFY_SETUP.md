# Configuração de Variáveis de Ambiente no Netlify

## Variáveis Necessárias

Configure as seguintes variáveis de ambiente no Netlify:

### 1. Via Interface do Netlify (Recomendado)

1. Acesse: [Netlify Dashboard](https://app.netlify.com)
2. Selecione seu site
3. Vá em **Site settings** > **Environment variables**
4. Clique em **Add a variable** para cada uma das variáveis abaixo:

#### Variáveis Públicas (Build time)
```
NEXT_PUBLIC_SUPABASE_URL=https://kzoalgpgsoiuvjxwobxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b2FsZ3Bnc29pdXZqeHdvYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTU4MjYsImV4cCI6MjA3NjY5MTgyNn0.1cP13xNfD0YqP90EpeG92aRNKUeVLzfaZhTeJGO25vk
NEXT_PUBLIC_APP_URL=https://qsm-h-app.netlify.app
```

#### Variáveis Privadas (Não expostas no cliente)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b2FsZ3Bnc29pdXZqeHdvYnhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNTgyNiwiZXhwIjoyMDc2NjkxODI2fQ.ivcap2f0EhbxL3vURqd67Sxg_opEnk2VesB_0qOek7M
```

#### Variáveis VAPID (Web Push Notifications)
**IMPORTANTE:** Você precisa gerar suas próprias chaves VAPID. Execute:

```bash
npx web-push generate-vapid-keys
```

Depois, adicione as chaves geradas:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<sua_chave_pública>
VAPID_PRIVATE_KEY=<sua_chave_privada>
```

### 2. Via Netlify CLI (Alternativa)

Se preferir usar a CLI do Netlify:

```bash
# Instalar Netlify CLI (se ainda não tiver)
npm install -g netlify-cli

# Login no Netlify
netlify login

# Link do site (se ainda não estiver linkado)
netlify link

# Configurar variáveis
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://kzoalgpgsoiuvjxwobxb.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b2FsZ3Bnc29pdXZqeHdvYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTU4MjYsImV4cCI6MjA3NjY5MTgyNn0.1cP13xNfD0YqP90EpeG92aRNKUeVLzfaZhTeJGO25vk"
netlify env:set NEXT_PUBLIC_APP_URL "https://qsm-h-app.netlify.app"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b2FsZ3Bnc29pdXZqeHdvYnhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNTgyNiwiZXhwIjoyMDc2NjkxODI2fQ.ivcap2f0EhbxL3vURqd67Sxg_opEnk2VesB_0qOek7M"

# Gerar e configurar chaves VAPID
npx web-push generate-vapid-keys
# Copie as chaves geradas e execute:
netlify env:set NEXT_PUBLIC_VAPID_PUBLIC_KEY "<sua_chave_pública>"
netlify env:set VAPID_PRIVATE_KEY "<sua_chave_privada>"
```

## Verificação

Após configurar todas as variáveis:

1. Faça um novo deploy (ou trigger rebuild)
2. Verifique os logs de build no Netlify
3. Teste a aplicação no ambiente de produção

## Notas Importantes

- As variáveis que começam com `NEXT_PUBLIC_` são expostas no cliente
- `SUPABASE_SERVICE_ROLE_KEY` e `VAPID_PRIVATE_KEY` são privadas e só devem ser usadas no servidor
- Sempre gere suas próprias chaves VAPID para notificações push
- Atualize `NEXT_PUBLIC_APP_URL` com a URL real do seu site no Netlify
