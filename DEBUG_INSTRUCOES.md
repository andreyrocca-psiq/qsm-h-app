# 🔍 Debug: Como Me Enviar Informações para Corrigir "Não Autenticado"

Adicionei logs detalhados no código. Agora preciso que você siga estes passos para eu poder diagnosticar o problema exato.

## PASSO 1: Fazer Deploy no Netlify

1. Acesse: https://app.netlify.com
2. Selecione seu site "questionariodehumor"
3. Vá em **Deploys**
4. Clique em **Trigger deploy** → **Deploy site**
5. Aguarde o deploy completar (2-5 minutos)

## PASSO 2: Testar Autenticação

1. Abra o site: https://questionariodehumor.netlify.app
2. Faça login com sua conta (médico ou paciente)
3. Após o login, abra uma NOVA ABA e cole esta URL:
   ```
   https://questionariodehumor.netlify.app/api/test-auth
   ```
4. Você verá um JSON com informações. **COPIE TODO O CONTEÚDO** e me envie.

Exemplo do que você vai ver:
```json
{
  "authenticated": true,
  "user": { ... },
  "cookies": { ... }
}
```

## PASSO 3: Tentar Fazer Convite

1. Volte para o dashboard (médico ou paciente)
2. Tente convidar paciente OU compartilhar com médico
3. Quando aparecer o erro "Não autenticado", abra o **Console do Navegador**:
   - **Windows/Linux**: Pressione `F12` ou `Ctrl+Shift+I`
   - **Mac**: Pressione `Cmd+Option+I`
4. Vá na aba **Console**
5. Tire um PRINT/SCREENSHOT de todas as mensagens em vermelho
6. Me envie

## PASSO 4: Ver Logs do Netlify (IMPORTANTE)

1. No painel do Netlify, vá em **Functions** (no menu lateral)
2. Você verá uma lista de functions (deve ter uma chamada "next")
3. Clique nela
4. No topo, clique em **Function logs** ou **Logs**
5. Agora, COM A PÁGINA DE LOGS ABERTA:
   - Volte no site
   - Tente fazer um convite novamente
   - Volte para a página de logs do Netlify
6. Você verá logs aparecendo. Procure por linhas com:
   - `=== POST /api/invites START ===`
   - `AUTH FAILED`
   - `Cookies received:`
7. **COPIE TODOS** esses logs e me envie

Exemplo do que procurar:
```
=== POST /api/invites START ===
Cookies received: ['sb-xxx', 'sb-yyy']
Auth result: { hasUser: false, ... }
AUTH FAILED - Error details: ...
```

## O Que Eu Preciso Receber de Você

Para eu conseguir corrigir, me envie:

✅ 1. O JSON completo de `/api/test-auth`
✅ 2. Screenshot do console do navegador com o erro
✅ 3. Os logs do Netlify Functions quando você tenta fazer convite

## Alternativa: Se Não Conseguir Acessar Logs do Netlify

Se você não conseguir acessar os logs do Netlify Functions, me envie pelo menos:

1. O resultado de `/api/test-auth`
2. Screenshot do erro no console do navegador

Com essas informações, consigo identificar se é:
- Problema de cookies
- Problema de configuração do Supabase
- Problema de variáveis de ambiente
- Problema específico do Netlify

## Observação

Os logs que adicionei mostram:
- Quais cookies estão chegando na API
- Se o Supabase está conseguindo ler a sessão
- Qual erro exato está acontecendo
- Se está no ambiente Netlify ou não

Isso vai me permitir criar uma solução específica para o seu caso!
