import Link from 'next/link';
import { Activity, TrendingUp, Bell, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Questionário Semanal de<br />Monitoramento de Humor
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Acompanhe sua saúde mental de forma simples e eficaz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="btn-primary bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
            >
              Criar Conta
            </Link>
            <Link
              href="/auth/login"
              className="btn-primary bg-transparent border-2 border-white hover:bg-white/10 text-lg px-8 py-4"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Funcionalidades
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Questionário Validado</h3>
              <p className="text-gray-600">
                Baseado nas escalas PHQ-9 e PMQ-9, amplamente utilizadas por profissionais
              </p>
            </div>

            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gráficos Interativos</h3>
              <p className="text-gray-600">
                Visualize sua evolução ao longo do tempo com gráficos claros e intuitivos
              </p>
            </div>

            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lembretes Semanais</h3>
              <p className="text-gray-600">
                Receba notificações para não esquecer de preencher o questionário
              </p>
            </div>

            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacidade Total</h3>
              <p className="text-gray-600">
                Seus dados são criptografados e protegidos. Compartilhe apenas com seu médico
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Como Funciona
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Crie sua conta</h3>
                <p className="text-gray-600">
                  Cadastre-se como paciente ou médico em menos de 1 minuto
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Responda semanalmente</h3>
                <p className="text-gray-600">
                  Preencha o questionário uma vez por semana, leva apenas 5 minutos
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Acompanhe sua evolução</h3>
                <p className="text-gray-600">
                  Visualize gráficos e relatórios detalhados do seu progresso
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Compartilhe com seu médico</h3>
                <p className="text-gray-600">
                  Permita que seu psiquiatra ou psicólogo acompanhe seus dados em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece Agora a Monitorar Seu Humor
          </h2>
          <p className="text-xl mb-8 opacity-90">
            É gratuito e leva menos de 1 minuto para criar sua conta
          </p>
          <Link
            href="/auth/signup"
            className="btn-primary bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 inline-block"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm opacity-75">
            Questionário de autoria do Dr. Andrey Rocca, com base em escalas de domínio público.
          </p>
          <p className="text-sm opacity-75 mt-2">
            Publicado em{' '}
            <a
              href="https://transtornobipolar.net"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-light"
            >
              transtornobipolar.net
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
