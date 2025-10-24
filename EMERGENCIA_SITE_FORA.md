# 🚨 EMERGÊNCIA: Site Fora do Ar - Solução Rápida

## ❌ PROBLEMA
O site https://questionariodehumor.netlify.app está fora do ar.

**Causa**: Falta de variáveis de ambiente no Netlify.

## ✅ SOLUÇÃO URGENTE (5 minutos)

### PASSO 1: Adicionar Variáveis de Ambiente no Netlify

1. **Acesse**: https://app.netlify.com
2. **Clique** no seu site "questionariodehumor"
3. **Vá em**: Site configuration → Environment variables
4. **Clique em**: Add a variable

### PASSO 2: Adicione ESTAS 3 Variáveis

#### Variável 1: NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Pegue do Supabase → Settings → API → Project URL
  - Exemplo: `https://abcdefgh.supabase.co`
- **Scopes**: Marque "Production" e "Deploy previews"
- **Clique em**: Create variable

#### Variável 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Pegue do Supabase → Settings → API → anon/public key
  - É uma chave longa começando com "eyJ..."
- **Scopes**: Marque "Production" e "Deploy previews"
- **Clique em**: Create variable

#### Variável 3: NEXT_PUBLIC_APP_URL
- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://questionariodehumor.netlify.app`
- **Scopes**: Marque "Production" e "Deploy previews"
- **Clique em**: Create variable

### PASSO 3: Fazer Novo Deploy

1. Ainda no Netlify, **vá em**: Deploys
2. **Clique em**: Trigger deploy → Clear cache and deploy site
3. **Aguarde**: 2-5 minutos

### PASSO 4: Verificar

Acesse: https://questionariodehumor.netlify.app

O site deve estar funcionando!

---

## 📍 Como Pegar as Chaves do Supabase

1. **Acesse**: https://app.supabase.com
2. **Selecione** seu projeto
3. **Vá em**: Settings (ícone de engrenagem)
4. **Clique em**: API
5. **Você verá**:
   - **Project URL**: Esta é a `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: Esta é a `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clique em "Copy" ao lado)

---

## ⚠️ Se Ainda Não Funcionar

Se após adicionar as variáveis e fazer deploy ainda não funcionar:

1. **Verifique no Netlify**:
   - Vá em Deploys
   - Clique no deploy mais recente
   - Veja se tem erro (será destacado em vermelho)
   - **ME ENVIE** o erro que aparecer

2. **Verifique as Variáveis**:
   - Vá em Site configuration → Environment variables
   - Confirme que as 3 variáveis estão lá
   - Verifique se não tem espaços extras ou caracteres errados

---

## 🔍 Por Que Isso Aconteceu?

O Next.js precisa dessas variáveis para se conectar com o Supabase. Sem elas, o build no Netlify falha com erro:

```
@supabase/ssr: Your project's URL and API key are required
```

---

## 📞 Precisa de Ajuda Urgente?

Me envie:
1. Screenshot da página de Environment variables no Netlify
2. Screenshot do erro no último deploy (Deploys → clique no deploy mais recente)

Vou diagnosticar exatamente o que está acontecendo!

---

**TEMPO ESTIMADO**: 5 minutos para o site voltar ao ar após você adicionar as variáveis e fazer o deploy.
