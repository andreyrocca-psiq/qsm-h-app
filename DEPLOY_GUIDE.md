# Guia de Deploy no Netlify - QSM-H

## Como Fazer um Novo Deploy com Nome Personalizado

### Opção 1: Via Interface Web do Netlify (Mais Simples)

#### Passo 1: Acessar o Netlify
1. Acesse https://app.netlify.com
2. Faça login com sua conta

#### Passo 2: Criar Novo Site
1. Clique em **"Add new site"** > **"Import an existing project"**
2. Escolha **"GitHub"** como provedor
3. Autorize o Netlify a acessar seu repositório (se ainda não autorizou)
4. Selecione o repositório **`andreyrocca-psiq/qsm-h-app`**

#### Passo 3: Configurar o Build
1. **Branch to deploy**: `main` ou a branch que você quer
2. **Build command**: `npm run build`
3. **Publish directory**: `.next`
4. Clique em **"Show advanced"** e adicione as variáveis de ambiente (veja seção abaixo)
5. Clique em **"Deploy site"**

#### Passo 4: Personalizar o Nome do Site
1. Após o deploy, vá em **"Site settings"**
2. Em **"Site details"** > **"Site information"**
3. Clique em **"Change site name"**
4. Digite o novo nome (ex: `qsm-h-andrey`, `monitoramento-humor`, etc.)
5. O site ficará disponível em: `https://seu-nome.netlify.app`

#### Passo 5: (Opcional) Configurar Domínio Customizado
1. Vá em **"Domain management"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `qsm-h.com.br`)
4. Siga as instruções para configurar o DNS

---

### Opção 2: Via Netlify CLI (Para Desenvolvedores)

#### Passo 1: Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

#### Passo 2: Login no Netlify
```bash
netlify login
```

#### Passo 3: Criar Novo Site
```bash
# Na raiz do projeto
netlify init
```

Responda as perguntas:
- **Create & configure a new site**: Sim
- **Team**: Escolha seu time
- **Site name**: Digite o nome desejado (ex: `qsm-h-andrey`)
- **Build command**: `npm run build`
- **Directory to deploy**: `.next`

#### Passo 4: Configurar Variáveis de Ambiente
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://sua-url.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "sua_chave_anon"
netlify env:set NEXT_PUBLIC_APP_URL "https://seu-site.netlify.app"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "sua_chave_service"

# Gerar chaves VAPID (se ainda não tiver)
npx web-push generate-vapid-keys

# Adicionar chaves VAPID
netlify env:set NEXT_PUBLIC_VAPID_PUBLIC_KEY "sua_chave_publica"
netlify env:set VAPID_PRIVATE_KEY "sua_chave_privada"
```

#### Passo 5: Deploy Manual (Opcional)
```bash
netlify deploy --prod
```

---

## Variáveis de Ambiente Necessárias

**IMPORTANTE**: Configure TODAS essas variáveis no Netlify antes do deploy.

### Via Interface Web
1. Vá em **"Site settings"** > **"Environment variables"**
2. Clique em **"Add a variable"** para cada uma:

```
NEXT_PUBLIC_SUPABASE_URL = https://kzoalgpgsoiuvjxwobxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b2FsZ3Bnc29pdXZqeHdvYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTU4MjYsImV4cCI6MjA3NjY5MTgyNn0.1cP13xNfD0YqP90EpeG92aRNKUeVLzfaZhTeJGO25vk
NEXT_PUBLIC_APP_URL = https://seu-site.netlify.app
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b2FsZ3Bnc29pdXZqeHdvYnhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNTgyNiwiZXhwIjoyMDc2NjkxODI2fQ.ivcap2f0EhbxL3vURqd67Sxg_opEnk2VesB_0qOek7M
```

### Chaves VAPID (Gerar Novas)

**IMPORTANTE**: Você PRECISA gerar suas próprias chaves VAPID.

```bash
npx web-push generate-vapid-keys
```

Depois, adicione no Netlify:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY = sua_chave_publica_gerada
VAPID_PRIVATE_KEY = sua_chave_privada_gerada
```

---

## Como Deletar ou Renomear um Deploy Existente

### Renomear Site Existente
1. Acesse https://app.netlify.com
2. Selecione o site
3. Vá em **"Site settings"** > **"Site information"**
4. Clique em **"Change site name"**
5. Digite o novo nome

### Deletar Site
1. Acesse https://app.netlify.com
2. Selecione o site
3. Vá em **"Site settings"** > **"General"**
4. Role até o final e clique em **"Delete site"**
5. Digite o nome do site para confirmar
6. Clique em **"Delete"**

---

## Verificação Pós-Deploy

### 1. Verificar Build
1. Vá em **"Deploys"**
2. Clique no último deploy
3. Verifique se não há erros nos logs

### 2. Testar Funcionalidades
1. Acesse seu site: `https://seu-site.netlify.app`
2. Teste criar uma conta
3. Teste fazer login
4. Teste preencher questionário

### 3. Verificar Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba Console
3. Verifique se não há erros de JavaScript
4. Erros comuns:
   - ❌ `NEXT_PUBLIC_SUPABASE_URL is undefined` → Variável de ambiente não configurada
   - ❌ `Database error` → Problema com Supabase (verifique se executou o schema.sql)

---

## Troubleshooting

### Build Falhando

**Erro**: `Module not found`
```bash
# Solução: Verifique se todas as dependências estão no package.json
npm install
git add package.json package-lock.json
git commit -m "fix: Update dependencies"
git push
```

**Erro**: `Build exceeded maximum time`
```bash
# Solução: Otimize o build ou aumente o limite no plano pago
```

### Erro "Database error saving new user"

**Causa**: O trigger do Supabase não está configurado corretamente.

**Solução**:
1. Abra o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo `supabase/schema.sql` completo
4. Verifique se o trigger `on_auth_user_created` existe

### Site Deploy mas Tela em Branco

**Causa**: Erro de JavaScript ou variáveis de ambiente faltando.

**Solução**:
1. Abra o DevTools (F12)
2. Verifique a aba Console
3. Configure as variáveis de ambiente que estão faltando
4. Faça um novo deploy

---

## Melhores Práticas

1. ✅ **Sempre configure as variáveis de ambiente ANTES do primeiro deploy**
2. ✅ **Use nomes descritivos para o site** (ex: `qsm-h-producao`, `qsm-h-dev`)
3. ✅ **Configure domínio customizado para produção**
4. ✅ **Habilite HTTPS** (o Netlify faz isso automaticamente)
5. ✅ **Configure branch deploys** (ex: `main` = produção, `develop` = staging)
6. ✅ **Monitore os logs de build** para identificar problemas cedo

---

## Deploy Contínuo (CI/CD)

O Netlify automaticamente faz deploy quando você faz push para a branch configurada:

```bash
# Fazer alterações
git add .
git commit -m "feat: Nova funcionalidade"
git push origin main

# O Netlify detecta o push e inicia o build automaticamente
```

Para desabilitar deploy automático:
1. Vá em **"Site settings"** > **"Build & deploy"**
2. Em **"Build settings"** clique em **"Edit settings"**
3. Desmarque **"Auto deploy"**

---

## Suporte

- Netlify Docs: https://docs.netlify.com
- Netlify Status: https://www.netlifystatus.com
- Community: https://answers.netlify.com

---

**Pronto!** Seu site estará disponível em `https://seu-nome.netlify.app`
