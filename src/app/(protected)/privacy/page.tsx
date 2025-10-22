'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Download,
  Trash2,
  Shield,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  table_name: string
  created_at: string
  details: any
}

interface Consent {
  id: string
  consent_type: string
  granted: boolean
  version: string
  created_at: string
  granted_at: string | null
  revoked_at: string | null
}

export default function PrivacyPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [consents, setConsents] = useState<Consent[]>([])
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    if (activeTab === 'audit-logs') {
      loadAuditLogs()
    } else if (activeTab === 'consents') {
      loadConsents()
    }
  }, [activeTab])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/lgpd/audit-logs')
      const data = await response.json()
      if (data.logs) {
        setAuditLogs(data.logs)
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConsents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/lgpd/consents')
      const data = await response.json()
      if (data.consents) {
        setConsents(data.consents)
      }
    } catch (error) {
      console.error('Error loading consents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lgpd/export-data')

      if (!response.ok) {
        throw new Error('Erro ao exportar dados')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qsmh-meus-dados-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lgpd/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deleteReason,
          deleteType: 'request', // or 'immediate' for hard delete
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        setShowDeleteModal(false)
      } else {
        alert(data.error || 'Erro ao solicitar exclusão')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Erro ao solicitar exclusão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatConsentType = (type: string) => {
    const types: Record<string, string> = {
      terms_of_service: 'Termos de Uso',
      privacy_policy: 'Política de Privacidade',
      data_processing: 'Processamento de Dados',
      data_sharing: 'Compartilhamento de Dados',
      marketing: 'Marketing',
      push_notifications: 'Notificações Push',
    }
    return types[type] || type
  }

  const formatAction = (action: string) => {
    const actions: Record<string, string> = {
      view: 'Visualização',
      create: 'Criação',
      update: 'Atualização',
      delete: 'Exclusão',
      export: 'Exportação',
      share: 'Compartilhamento',
      access_denied: 'Acesso Negado',
    }
    return actions[action] || action
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacidade e Dados (LGPD)
          </h1>
          <p className="text-gray-600">
            Gerencie seus dados pessoais e exerça seus direitos conforme a Lei
            Geral de Proteção de Dados
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="inline-block w-4 h-4 mr-2" />
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('audit-logs')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'audit-logs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="inline-block w-4 h-4 mr-2" />
                Logs de Acesso
              </button>
              <button
                onClick={() => setActiveTab('consents')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'consents'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                Consentimentos
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Seus Direitos LGPD
                  </h2>
                  <p className="text-gray-600 mb-6">
                    A Lei Geral de Proteção de Dados garante os seguintes
                    direitos aos titulares de dados:
                  </p>
                </div>

                {/* Data Export */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-primary" />
                        Portabilidade de Dados
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Você tem o direito de receber uma cópia de todos os
                        seus dados pessoais em formato estruturado e legível
                        (JSON).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Exportando...' : 'Exportar Meus Dados'}
                  </button>
                </div>

                {/* Account Deletion */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 flex items-center text-red-900">
                        <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                        Direito ao Esquecimento
                      </h3>
                      <p className="text-red-800 mb-4">
                        Você pode solicitar a exclusão permanente de todos os
                        seus dados pessoais. Esta ação é irreversível.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Solicitar Exclusão de Conta
                  </button>
                </div>

                {/* Data Access */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-primary" />
                    Transparência e Acesso
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Visualize o histórico completo de acessos aos seus dados
                    pessoais, incluindo quem acessou e quando.
                  </p>
                  <button
                    onClick={() => setActiveTab('audit-logs')}
                    className="btn-secondary"
                  >
                    Ver Logs de Acesso
                  </button>
                </div>

                {/* Consents Management */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Gerenciar Consentimentos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Visualize e gerencie todos os consentimentos que você
                    concedeu para o processamento de seus dados.
                  </p>
                  <button
                    onClick={() => setActiveTab('consents')}
                    className="btn-secondary"
                  >
                    Ver Consentimentos
                  </button>
                </div>
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit-logs' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Histórico de Acesso aos Dados
                </h2>
                <p className="text-gray-600 mb-6">
                  Registro de todos os acessos aos seus dados pessoais para
                  garantir transparência e segurança.
                </p>

                {loading ? (
                  <p className="text-center py-8">Carregando...</p>
                ) : auditLogs.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    Nenhum log de acesso registrado ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold">
                              {formatAction(log.action)}
                            </span>
                            <span className="text-gray-600 ml-2">
                              em {log.table_name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                        {log.details && (
                          <div className="text-sm text-gray-600 mt-2">
                            <pre className="bg-gray-50 p-2 rounded">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Consents Tab */}
            {activeTab === 'consents' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Meus Consentimentos
                </h2>
                <p className="text-gray-600 mb-6">
                  Histórico de todos os consentimentos concedidos ou revogados.
                </p>

                {loading ? (
                  <p className="text-center py-8">Carregando...</p>
                ) : consents.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    Nenhum consentimento registrado.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {consents.map((consent) => (
                      <div
                        key={consent.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {formatConsentType(consent.consent_type)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Versão: {consent.version}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status:{' '}
                              <span
                                className={
                                  consent.granted
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {consent.granted ? 'Concedido' : 'Revogado'}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {consent.granted && consent.granted_at && (
                              <p>Concedido: {formatDate(consent.granted_at)}</p>
                            )}
                            {!consent.granted && consent.revoked_at && (
                              <p>Revogado: {formatDate(consent.revoked_at)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Confirmar Exclusão de Conta</h2>
            </div>

            <p className="text-gray-700 mb-4">
              Esta ação é irreversível. Todos os seus dados serão permanentemente
              excluídos, incluindo:
            </p>

            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Dados de perfil</li>
              <li>Questionários e histórico de humor</li>
              <li>Relacionamentos com médicos</li>
              <li>Consentimentos e preferências</li>
            </ul>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da exclusão (opcional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Conte-nos por que está saindo..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
