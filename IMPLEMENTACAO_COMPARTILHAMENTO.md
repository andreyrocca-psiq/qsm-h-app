# 🎯 Implementação do Sistema de Compartilhamento Médico-Paciente

## ✅ O Que Já Foi Feito

### API Routes Criadas

1. **`/api/invites`** (POST, GET)
   - POST: Médico convida paciente por email
   - GET: Lista convites pendentes (médico vê enviados, paciente vê recebidos)

2. **`/api/invites/[inviteId]`** (PATCH, DELETE)
   - PATCH: Paciente aceita/recusa convite
   - DELETE: Médico cancela convite

3. **`/api/connections`** (GET)
   - Lista conexões aceitas (médicos do paciente ou pacientes do médico)

4. **`/api/connections/[connectionId]`** (DELETE)
   - Remove conexão (desvincula)

5. **`/api/doctors`** (GET)
   - Busca médicos por email (para paciente procurar)

## 🔧 O Que Falta Implementar

### 1. Atualizar Dashboard do Médico

Arquivo: `src/app/doctor/dashboard/page.tsx`

**Alterações necessárias:**

```typescript
// Adicionar states
const [inviting, setInviting] = useState(false);
const [inviteError, setInviteError] = useState('');
const [inviteSuccess, setInviteSuccess] = useState('');

// Substituir handleInvitePatient
const handleInvitePatient = async () => {
  if (!inviteEmail || !inviteEmail.includes('@')) {
    setInviteError('Por favor, insira um email válido');
    return;
  }

  setInviting(true);
  setInviteError('');
  setInviteSuccess('');

  try {
    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientEmail: inviteEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar convite');
    }

    setInviteSuccess(data.message);
    setInviteEmail('');

    setTimeout(() => {
      setShowInviteModal(false);
      setInviteSuccess('');
    }, 2000);
  } catch (error: any) {
    setInviteError(error.message);
  } finally {
    setInviting(false);
  }
};
```

**Atualizar Modal de Convite:**
- Mostrar mensagens de erro/sucesso
- Desabilitar inputs durante envio
- Adicionar loading state

### 2. Atualizar Dashboard do Paciente

Arquivo: `src/app/patient/dashboard/page.tsx`

**Adicionar novas funcionalidades:**

1. **Seção de Notificações de Convites**
   - Badge no header com número de convites pendentes
   - Modal para listar e aceitar/recusar convites

2. **Seção de Compartilhamento**
   - Botão "Compartilhar com Médico"
   - Modal para buscar médico por email
   - Enviar pedido de compartilhamento (inverte - paciente convida médico)

3. **Seção de Médicos Conectados**
   - Lista de médicos com acesso aos dados
   - Botão para desvincular

**Código sugerido:**

```typescript
// States adicionais
const [invites, setInvites] = useState([]);
const [connections, setConnections] = useState([]);
const [showInvitesModal, setShowInvitesModal] = useState(false);
const [showShareModal, setShowShareModal] = useState(false);

// Carregar convites
useEffect(() => {
  loadInvites();
  loadConnections();
}, [user]);

const loadInvites = async () => {
  const response = await fetch('/api/invites');
  const data = await response.json();
  setInvites(data.invites || []);
};

const loadConnections = async () => {
  const response = await fetch('/api/connections');
  const data = await response.json();
  setConnections(data.connections || []);
};

const handleAcceptInvite = async (inviteId: string) => {
  const response = await fetch(`/api/invites/${inviteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'accept' }),
  });

  if (response.ok) {
    loadInvites();
    loadConnections();
  }
};

const handleRejectInvite = async (inviteId: string) => {
  const response = await fetch(`/api/invites/${inviteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject' }),
  });

  if (response.ok) {
    loadInvites();
  }
};
```

## 📝 Componentes para Criar

### 1. Componente de Badge de Notificações

```typescript
// src/components/NotificationBadge.tsx
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}
```

### 2. Modal de Convites (Paciente)

```typescript
// Componente inline no dashboard do paciente
{showInvitesModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-semibold text-primary mb-4">
        Convites Pendentes ({invites.length})
      </h3>

      {invites.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          Nenhum convite pendente
        </p>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => (
            <div key={invite.id} className="border p-4 rounded-lg">
              <div className="font-semibold">{invite.doctor.full_name}</div>
              <div className="text-sm text-gray-600">{invite.doctor.email}</div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAcceptInvite(invite.id)}
                  className="btn-primary flex-1 text-sm py-2"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => handleRejectInvite(invite.id)}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowInvitesModal(false)}
        className="mt-4 w-full btn-secondary"
      >
        Fechar
      </button>
    </div>
  </div>
)}
```

### 3. Modal de Compartilhamento (Paciente busca médico)

```typescript
// Similar ao modal de convite do médico, mas busca médicos
const [searchEmail, setSearchEmail] = useState('');
const [searchResults, setSearchResults] = useState([]);

const handleSearchDoctor = async () => {
  const response = await fetch(`/api/doctors?email=${searchEmail}`);
  const data = await response.json();
  setSearchResults(data.doctors || []);
};

const handleShareWithDoctor = async (doctorId: string) => {
  // Usar mesma API de convites, mas invertido
  const response = await fetch('/api/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientEmail: searchEmail }),
  });
  // ...
};
```

## 🎨 UI/UX Sugerida

### Dashboard do Médico
- ✅ Botão "Convidar Paciente" já existe
- ✅ Modal de convite já existe
- 🔄 Atualizar para usar API real
- ➕ Adicionar seção "Convites Pendentes" (opcional)

### Dashboard do Paciente
- ➕ Badge de notificação no header (convites pendentes)
- ➕ Botão "Meus Médicos" ou "Compartilhamento"
- ➕ Modal com abas:
  - Tab 1: Convites Recebidos (aceitar/recusar)
  - Tab 2: Compartilhar com Médico (buscar e enviar)
  - Tab 3: Médicos Conectados (lista com opção de desvincular)

## 🔄 Fluxo Completo

### Fluxo 1: Médico Convida Paciente
1. Médico clica em "Convidar Paciente"
2. Digita email do paciente
3. Sistema verifica se paciente existe
4. Cria convite na tabela `doctor_patient`
5. Paciente vê notificação no dashboard
6. Paciente aceita ou recusa
7. Se aceitar, médico passa a ver dados do paciente

### Fluxo 2: Paciente Compartilha com Médico
1. Paciente clica em "Compartilhar com Médico"
2. Busca médico por email
3. Envia pedido (cria registro em `doctor_patient`)
4. Médico vê notificação (opcional)
5. Médico aceita/recusa (opcional) OU aceita automaticamente
6. Médico passa a ver dados do paciente

## 📦 Próximos Passos

1. ✅ Copiar código sugerido acima
2. ✅ Modificar `src/app/doctor/dashboard/page.tsx`
3. ✅ Modificar `src/app/patient/dashboard/page.tsx`
4. ✅ Testar localmente
5. ✅ Fazer deploy no Netlify
6. ✅ Testar em produção

## 🧪 Como Testar

### Teste 1: Médico Convida Paciente
1. Login como médico
2. Clicar em "Convidar Paciente"
3. Digitar email de um paciente cadastrado
4. Verificar mensagem de sucesso
5. Logout e login como paciente
6. Ver convite e aceitar
7. Logout e login como médico
8. Verificar que paciente aparece na lista

### Teste 2: Paciente Compartilha com Médico
1. Login como paciente
2. Clicar em "Compartilhar com Médico"
3. Buscar médico por email
4. Enviar convite
5. Logout e login como médico
6. Ver paciente na lista (ou aceitar convite se implementar aprovação)

## 🎯 Resultado Esperado

Após implementação completa:
- ✅ Médicos podem convidar pacientes
- ✅ Pacientes podem compartilhar com médicos
- ✅ Ambos recebem notificações
- ✅ Ambos podem gerenciar conexões
- ✅ Sistema totalmente funcional dentro da plataforma
- ✅ Sem necessidade de email externo

---

**Status**: API Routes prontas ✅ | Dashboards precisam ser atualizados 🔄
