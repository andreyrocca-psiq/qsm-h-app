# Conformidade com LGPD - QSM-H

Este documento descreve como o aplicativo QSM-H está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

## Índice

1. [Visão Geral](#visão-geral)
2. [Dados Coletados](#dados-coletados)
3. [Base Legal](#base-legal)
4. [Direitos dos Titulares](#direitos-dos-titulares)
5. [Segurança](#segurança)
6. [Retenção de Dados](#retenção-de-dados)
7. [Auditoria](#auditoria)
8. [Configuração](#configuração)

## Visão Geral

O QSM-H coleta e processa dados pessoais sensíveis (dados de saúde) e implementa todas as medidas necessárias para estar em conformidade com a LGPD.

### Princípios Seguidos

- **Finalidade**: Dados coletados apenas para monitoramento de saúde mental
- **Adequação**: Tratamento compatível com as finalidades informadas
- **Necessidade**: Limitação ao mínimo necessário
- **Transparência**: Informações claras e acessíveis aos titulares
- **Segurança**: Medidas técnicas e administrativas adequadas
- **Prevenção**: Adoção de medidas para prevenir danos
- **Não discriminação**: Impossibilidade de tratamento para fins discriminatórios
- **Responsabilização**: Demonstração da eficácia das medidas

## Dados Coletados

### Dados de Cadastro
- Nome completo
- E-mail
- Telefone (opcional)
- Função (paciente ou médico)
- Senha (criptografada)

### Dados de Saúde (Sensíveis - Art. 5º, II)
- Respostas aos questionários PHQ-9 e PMQ-9
- Informações sobre hábitos de sono
- Uso de medicamentos
- Prática de exercícios
- Consumo de álcool e substâncias

### Dados Técnicos
- Endereço IP (para logs de auditoria)
- Agente do usuário (navegador/dispositivo)
- Logs de acesso ao sistema

## Base Legal

### Consentimento (Art. 7º, I e Art. 11, I)

O tratamento de dados pessoais sensíveis é realizado mediante **consentimento expresso e específico** do titular:

- Consentimento para Termos de Uso
- Consentimento para Política de Privacidade
- Consentimento para Processamento de Dados de Saúde
- Consentimento para Compartilhamento com Médicos (quando aplicável)

Todos os consentimentos são:
- ✅ Informados (com acesso às políticas completas)
- ✅ Inequívocos (checkboxes explícitos)
- ✅ Registrados (tabela `consent_records`)
- ✅ Revogáveis (através do portal de privacidade)

### Outras Bases Legais

- **Tutela da saúde** (Art. 11, II) - Para profissionais de saúde
- **Cumprimento de obrigação legal** (Art. 7º, II) - Quando aplicável

## Direitos dos Titulares

O QSM-H implementa todos os direitos previstos no Art. 18 da LGPD:

### I - Confirmação e Acesso
- ✅ Portal de privacidade em `/privacy`
- ✅ Visualização de todos os dados pessoais
- ✅ Histórico de consentimentos

### II - Correção
- ✅ Atualização de perfil
- ✅ Edição de dados cadastrais

### III - Anonimização, Bloqueio ou Eliminação
- ✅ Solicitação de exclusão de conta
- ✅ Função `anonymize_user_data()` para anonimização
- ✅ Função `delete_user_data()` para exclusão completa

### V - Portabilidade
- ✅ Exportação de dados em JSON
- ✅ Endpoint `/api/lgpd/export-data`
- ✅ Formato estruturado e legível

### VI - Eliminação de Dados
- ✅ Solicitação de exclusão via portal
- ✅ Tabela `data_deletion_requests`
- ✅ Processo de exclusão documentado

### VII - Informação sobre Compartilhamento
- ✅ Logs de auditoria
- ✅ Registro de todos os acessos
- ✅ Transparência sobre médicos autorizados

### VIII - Revogação de Consentimento
- ✅ Gerenciamento de consentimentos
- ✅ Endpoint `/api/lgpd/consents`
- ✅ Histórico de revogações

## Segurança

### Medidas Técnicas Implementadas

#### Criptografia
- ✅ HTTPS/TLS para dados em trânsito
- ✅ Bcrypt para senhas (via Supabase Auth)
- ✅ Tokens JWT seguros

#### Controle de Acesso
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Autenticação obrigatória
- ✅ Role-Based Access Control (RBAC)
- ✅ Médicos só acessam pacientes autorizados

#### Auditoria
- ✅ Logs de todos os acessos a dados sensíveis
- ✅ Rastreamento de IP e user agent
- ✅ Tabela `audit_logs` com retenção de 5 anos

#### Backup e Recuperação
- ✅ Backups automáticos (Supabase)
- ✅ Recuperação de desastres

### Medidas Organizacionais

- 📋 Política de Privacidade documentada
- 📋 Termos de Uso claros
- 📋 Documentação de conformidade LGPD
- 📋 Treinamento de desenvolvedores

## Retenção de Dados

### Políticas de Retenção (Tabela: `data_retention_policies`)

| Tipo de Dado | Período | Justificativa |
|--------------|---------|---------------|
| Questionários | 5 anos | Requisitos de pesquisa médica |
| Logs de Auditoria | 5 anos | Conformidade LGPD |
| Notificações | 1 ano | Histórico operacional |
| Push Subscriptions | 2 anos | Manutenção do serviço |

### Aplicação Automática

Execute periodicamente (recomendado: mensalmente via cron):

```sql
SELECT apply_retention_policies();
```

Esta função:
1. Verifica todas as políticas ativas
2. Deleta dados mais antigos que o período de retenção
3. Registra a ação nos logs de auditoria

## Auditoria

### Eventos Auditados

Todos os seguintes eventos são registrados em `audit_logs`:

- **view**: Visualização de dados pessoais
- **create**: Criação de registros
- **update**: Atualização de dados
- **delete**: Exclusão de dados
- **export**: Exportação de dados
- **share**: Compartilhamento de dados
- **access_denied**: Tentativas de acesso não autorizado

### Consultar Logs

```typescript
import { getUserAuditLogs } from '@/lib/audit'

const logs = await getUserAuditLogs(userId, limit)
```

## Configuração

### 1. Executar Migrations

Execute os seguintes scripts SQL no Supabase:

```bash
# Schema principal
supabase/schema.sql

# Tabelas e funções LGPD
supabase/lgpd-compliance.sql
```

### 2. Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configurar Cron Job (Retenção)

Configure um cron job para executar mensalmente:

```sql
-- No Supabase SQL Editor ou via pg_cron
SELECT cron.schedule(
  'apply-retention-policies',
  '0 0 1 * *', -- Primeiro dia de cada mês à meia-noite
  'SELECT apply_retention_policies();'
);
```

### 4. Atualizar Contatos

Atualize os seguintes contatos nos arquivos:

- `src/components/legal/PrivacyPolicy.tsx` - E-mail de privacidade
- `src/components/legal/TermsOfService.tsx` - E-mail de suporte

### 5. Revisar Versões

Sempre que atualizar os termos ou políticas, incremente a versão em:

- `src/lib/consent.ts` (constantes `CURRENT_TERMS_VERSION` e `CURRENT_PRIVACY_VERSION`)

## Responsável pelo Tratamento de Dados

### Encarregado (DPO)

Para questões relacionadas à proteção de dados:

- **E-mail**: dpo@qsm-h.com.br
- **Função**: Encarregado de Proteção de Dados (DPO)

### Controlador

O controlador responsável pelo tratamento dos dados é o QSM-H.

## Direitos à ANPD

Os titulares têm o direito de apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD) caso considerem que o tratamento de seus dados viola a LGPD.

- **Site**: https://www.gov.br/anpd/pt-br
- **Canal de Atendimento**: https://www.gov.br/anpd/pt-br/canais_atendimento

## Checklist de Conformidade

Use este checklist para verificar a conformidade:

- [x] Consentimento explícito implementado
- [x] Política de Privacidade disponível
- [x] Termos de Uso disponíveis
- [x] Portal de direitos do titular
- [x] Exportação de dados (portabilidade)
- [x] Exclusão de dados (esquecimento)
- [x] Logs de auditoria
- [x] Políticas de retenção
- [x] Segurança (RLS, criptografia)
- [x] Anonimização de dados
- [ ] DPO designado (configurar contato real)
- [ ] Processos de resposta a incidentes
- [ ] Treinamento de equipe
- [ ] RIPD (Relatório de Impacto) quando aplicável

## Manutenção

### Revisão Periódica

Revise periodicamente:

1. **Mensal**: Logs de auditoria e solicitações de exclusão
2. **Trimestral**: Políticas de retenção e conformidade
3. **Anual**: Política de Privacidade e Termos de Uso
4. **Quando necessário**: Após mudanças na LGPD ou na aplicação

### Atualizações

Ao adicionar novos tipos de dados:

1. Atualizar Política de Privacidade
2. Adicionar consentimento específico se necessário
3. Implementar logs de auditoria
4. Configurar política de retenção
5. Atualizar função de exportação
6. Atualizar função de exclusão

## Recursos Adicionais

- [Lei Geral de Proteção de Dados (LGPD)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANPD - Guia de Boas Práticas](https://www.gov.br/anpd/pt-br)
- [Documentação Supabase sobre Segurança](https://supabase.com/docs/guides/auth)

---

**Última atualização**: 2025-10-22
**Versão**: 1.0.0
