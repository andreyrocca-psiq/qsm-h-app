# QSM-H - MVP HTML

Questionário Semanal de Monitoramento de Humor - Versão Web em HTML Puro

## 📋 Sobre o Projeto

O QSM-H é uma aplicação web para monitoramento de saúde mental, permitindo que pacientes acompanhem seus sintomas de humor e compartilhem dados com médicos de forma segura e conforme a LGPD.

### ✨ Características Principais

- **100% HTML, CSS e JavaScript Vanilla** - Sem frameworks, fácil de hospedar
- **Integração com Supabase** - Backend serverless completo
- **Conformidade LGPD** - Total transparência e controle de dados
- **Questionários Validados** - Baseado em PHQ-9 e PMQ-9
- **Dashboards Interativos** - Para pacientes e médicos
- **Design Responsivo** - Funciona em desktop, tablet e mobile

## 🚀 Como Usar

### Opção 1: Servidor Local Simples

1. **Navegue até a pasta:**
```bash
cd html-mvp
```

2. **Inicie um servidor HTTP local:**

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

3. **Acesse no navegador:**
```
http://localhost:8000
```

### Opção 2: Hospedagem Web

Você pode hospedar gratuitamente em:

- **Netlify**: Arraste a pasta `html-mvp` para [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel**: `vercel --prod html-mvp`
- **GitHub Pages**: Faça commit e ative Pages nas configurações do repositório
- **Qualquer servidor web**: Apache, Nginx, etc.

## 📁 Estrutura de Arquivos

```
html-mvp/
├── index.html                  # Página inicial
├── cadastro.html              # Cadastro de usuários
├── login.html                 # Login
├── paciente-dashboard.html    # Dashboard do paciente
├── paciente-questionario.html # Questionário QSM-H
├── medico-dashboard.html      # Dashboard do médico
├── privacy-portal.html        # Portal de privacidade LGPD
├── termos.html               # Termos de uso
├── privacidade.html          # Política de privacidade
├── css/
│   └── styles.css            # Estilos completos
└── js/
    ├── supabase-client.js    # Cliente Supabase
    └── utils.js              # Funções utilitárias
```

## 🔧 Configuração do Supabase

O projeto já está configurado para usar o Supabase existente. As credenciais estão em:
- `js/supabase-client.js`

### Banco de Dados

O schema do banco de dados já está criado no Supabase com as seguintes tabelas:

- `profiles` - Perfis de usuários (pacientes e médicos)
- `questionnaires` - Respostas dos questionários
- `doctor_patients` - Relacionamentos médico-paciente
- `user_consents` - Consentimentos LGPD
- `audit_logs` - Logs de auditoria
- `data_deletion_requests` - Solicitações de exclusão

## 👥 Fluxos de Uso

### Para Pacientes

1. **Cadastro**: Acesse `/cadastro.html`
   - Escolha "Paciente"
   - Preencha os dados
   - Aceite os termos LGPD
   - Crie sua conta

2. **Responder Questionário**:
   - Faça login
   - Clique em "Responder Novo Questionário"
   - Responda as 3 partes (depressão, ativação, hábitos)
   - Veja os resultados instantaneamente

3. **Acompanhar Evolução**:
   - Visualize gráficos de tendência
   - Veja histórico completo
   - Compare avaliações anteriores

4. **Gerenciar Privacidade**:
   - Acesse o Portal de Privacidade
   - Exporte seus dados
   - Veja logs de acesso
   - Solicite exclusão da conta

### Para Médicos

1. **Cadastro**: Acesse `/cadastro.html`
   - Escolha "Médico"
   - Preencha os dados
   - Aceite os termos

2. **Adicionar Pacientes**:
   - Faça login
   - Clique em "Convidar Paciente"
   - Digite o email do paciente (já cadastrado)
   - O paciente será adicionado automaticamente

3. **Monitorar Pacientes**:
   - Veja lista de todos os pacientes
   - Clique em "Ver Detalhes" para análise completa
   - Visualize gráficos de evolução
   - Acompanhe últimas avaliações

## 🎨 Paleta de Cores

O design usa cores calmas e profissionais apropriadas para saúde mental:

- **Azul Primário**: `#4A90E2` - Calma e confiança
- **Verde Secundário**: `#52C4A1` - Esperança e crescimento
- **Vermelho Depressão**: `#E74C3C` - Sintomas depressivos
- **Laranja Ativação**: `#F39C12` - Sintomas de ativação

## 🔒 Segurança e LGPD

### Conformidade

- ✅ Consentimentos explícitos no cadastro
- ✅ Portal de privacidade completo
- ✅ Logs de auditoria de todos os acessos
- ✅ Exportação de dados em JSON
- ✅ Direito ao esquecimento (exclusão)
- ✅ Transparência total sobre uso de dados

### Segurança Técnica

- 🔐 Autenticação via Supabase Auth (JWT)
- 🔐 Row-Level Security (RLS) no banco de dados
- 🔐 HTTPS obrigatório em produção
- 🔐 Dados sensíveis nunca expostos no frontend
- 🔐 Validação de acessos em todas as operações

## 📊 Questionários

### Parte A: PHQ-9 (Sintomas Depressivos)
- 9 perguntas
- Escala 0-3 (Nenhuma vez / Vários dias / Mais da metade / Quase todos)
- Score total: 0-27
- Classificação: Mínima, Leve, Moderada, Moderadamente Grave, Grave

### Parte B: PMQ-9 (Sintomas de Ativação)
- 9 perguntas
- Escala 0-3
- Score total: 0-27
- Classificação: Remissão, Sublimiares, Elevados

### Parte C: Hábitos e Estilo de Vida
- Sono (horas, qualidade, rotina)
- Medicação (aderência)
- Atividade física
- Uso de álcool e substâncias

## 🌐 Compatibilidade

Testado e compatível com:
- ✅ Chrome/Edge (últimas 2 versões)
- ✅ Firefox (últimas 2 versões)
- ✅ Safari (últimas 2 versões)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 📱 Responsividade

O design é totalmente responsivo:
- 📱 Mobile: 320px - 767px
- 📱 Tablet: 768px - 1023px
- 💻 Desktop: 1024px+

## 🚨 Notas Importantes

### Este é um MVP (Minimum Viable Product)

Para uso em produção, considere:

1. **Configurar domínio próprio** com HTTPS
2. **Revisar políticas legais** com advogado especializado em saúde
3. **Implementar backup regular** dos dados
4. **Monitorar logs de erro** e performance
5. **Configurar email** para notificações (Supabase + SendGrid/Mailgun)
6. **Adicionar testes** automatizados
7. **Implementar rate limiting** para prevenir abuso
8. **Configurar monitoramento** (Sentry, LogRocket, etc.)

### Avisos Médicos

⚠️ **IMPORTANTE**:
- O QSM-H é uma ferramenta de MONITORAMENTO, não de diagnóstico
- NÃO substitui avaliação médica profissional
- Em caso de emergência ou pensamentos suicidas: **CVV 188** ou **SAMU 192**

## 📞 Suporte

Para dúvidas ou problemas:
- Email: contato@qsmh.com.br
- Website: [transtornobipolar.net](https://transtornobipolar.net)

## 📄 Licença

Este projeto utiliza escalas de domínio público (PHQ-9 e PMQ-9) para uso clínico e educacional.

## 🙏 Agradecimentos

Desenvolvido com ❤️ para auxiliar no cuidado com a saúde mental.

---

**Versão:** 1.0.0
**Data:** Janeiro 2025
**Status:** MVP pronto para testes
