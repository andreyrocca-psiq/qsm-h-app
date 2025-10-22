'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, Stethoscope } from 'lucide-react';
import { recordSignupConsents } from '@/lib/consent';
import PrivacyPolicy from '@/components/legal/PrivacyPolicy';
import TermsOfService from '@/components/legal/TermsOfService';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'doctor',
  });
  const [consents, setConsents] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    dataProcessingAccepted: false,
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // LGPD Consent Validation
    if (!consents.termsAccepted) {
      setError('Você deve aceitar os Termos de Uso para continuar');
      return;
    }

    if (!consents.privacyAccepted) {
      setError('Você deve aceitar a Política de Privacidade para continuar');
      return;
    }

    if (!consents.dataProcessingAccepted) {
      setError('Você deve consentir com o processamento de dados para continuar');
      return;
    }

    setLoading(true);

    try {
      const { user } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role,
        formData.phone || undefined
      );

      // Record LGPD consents
      if (user) {
        await recordSignupConsents(user.id, consents);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-white/80">Comece a monitorar seu humor hoje</p>
        </div>

        <div className="card">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'patient' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.role === 'patient'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className={`w-8 h-8 mx-auto mb-2 ${formData.role === 'patient' ? 'text-primary' : 'text-gray-400'}`} />
              <div className="text-sm font-semibold">Paciente</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'doctor' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.role === 'doctor'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Stethoscope className={`w-8 h-8 mx-auto mb-2 ${formData.role === 'doctor' ? 'text-primary' : 'text-gray-400'}`} />
              <div className="text-sm font-semibold">Médico</div>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone (opcional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Digite a senha novamente"
              />
            </div>

            {/* LGPD Consents */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                Consentimentos Necessários (LGPD)
              </p>

              <div className="space-y-2">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.termsAccepted}
                    onChange={(e) =>
                      setConsents({ ...consents, termsAccepted: e.target.checked })
                    }
                    className="mt-1 mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Li e aceito os{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-primary font-semibold hover:underline"
                    >
                      Termos de Uso
                    </button>{' '}
                    *
                  </span>
                </label>

                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.privacyAccepted}
                    onChange={(e) =>
                      setConsents({ ...consents, privacyAccepted: e.target.checked })
                    }
                    className="mt-1 mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Li e aceito a{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-primary font-semibold hover:underline"
                    >
                      Política de Privacidade
                    </button>{' '}
                    *
                  </span>
                </label>

                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.dataProcessingAccepted}
                    onChange={(e) =>
                      setConsents({
                        ...consents,
                        dataProcessingAccepted: e.target.checked,
                      })
                    }
                    className="mt-1 mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Autorizo o processamento dos meus dados pessoais e de saúde
                    para os fins descritos na Política de Privacidade *
                  </span>
                </label>
              </div>

              <p className="text-xs text-gray-500 italic">
                Seus dados serão tratados conforme a LGPD (Lei nº 13.709/2018).
                Você pode revogar seus consentimentos a qualquer momento através
                das configurações de privacidade.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </div>

        {/* Terms of Service Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold">Termos de Uso</h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <TermsOfService />
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setConsents({ ...consents, termsAccepted: true });
                    setShowTermsModal(false);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Aceitar Termos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold">Política de Privacidade</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <PrivacyPolicy />
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setConsents({ ...consents, privacyAccepted: true });
                    setShowPrivacyModal(false);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Aceitar Política
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
