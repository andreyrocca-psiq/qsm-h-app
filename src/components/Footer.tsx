import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} QSM-H. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
            >
              <Shield className="w-4 h-4" />
              Meus Dados (LGPD)
            </Link>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            Este aplicativo está em conformidade com a LGPD (Lei nº 13.709/2018)
          </p>
        </div>
      </div>
    </footer>
  )
}
