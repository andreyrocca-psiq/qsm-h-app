# Guia de Substituição: Médico → Profissional de Saúde

## Substituições de Texto (UI)

### Português
- "Médico" → "Profissional de Saúde"
- "médico" → "profissional de saúde"
- "MÉDICO" → "PROFISSIONAL DE SAÚDE"
- "Médicos" → "Profissionais de Saúde"
- "médicos" → "profissionais de saúde"
- "Dr(a)." → "" (remover ou trocar por "Profissional")
- "Dr(a)" → "Profissional"

### Inglês (labels internos)
- "Doctor" → "Health Professional"
- "doctor" → "health_professional"
- "doctors" → "health_professionals"

## Arquivos a Atualizar

### 1. Tipos e Interfaces
- `src/lib/supabase.ts` - Atualizar tipo `UserRole`
- Interfaces com `doctor` → `health_professional`

### 2. Páginas de Autenticação
- `src/app/auth/signup/page.tsx` - Labels do formulário
- `src/app/auth/login/page.tsx` - Textos

### 3. Dashboards
- `src/app/doctor/dashboard/page.tsx` → renomear para `src/app/professional/dashboard/page.tsx`
- `src/app/doctor/insights/[patientId]/page.tsx` → `src/app/professional/insights/[patientId]/page.tsx`
- `src/app/patient/dashboard/page.tsx` - Textos de compartilhamento
- `src/app/patient/insights/page.tsx` - Textos

### 4. APIs
- `src/app/api/invites/route.ts` - Lógica de convites
- `src/app/api/connections/route.ts` - Conexões
- `src/app/api/doctors/route.ts` → renomear para `src/app/api/professionals/route.ts`

### 5. Componentes
- `src/contexts/AuthContext.tsx` - Rotas e tipos
- `src/components/ProtectedRoute.tsx` - Validações de role

### 6. Banco de Dados
- Tabela `doctor_patient` → `professional_patient`
- Coluna `doctor_id` → `professional_id`
- Enum `user_role`: `'doctor'` → `'health_professional'`

## Ordem de Execução

1. ✅ Atualizar tipos e interfaces
2. ✅ Atualizar páginas de dashboard
3. ✅ Atualizar APIs
4. ✅ Atualizar componentes e contextos
5. ✅ Atualizar banco de dados (SQL)
6. ✅ Renomear pastas e arquivos
7. ✅ Testar e commitar

## Notas Importantes

- Manter compatibilidade com dados existentes
- Criar migração para o banco de dados
- Atualizar documentação
- Testar todos os fluxos após mudanças
