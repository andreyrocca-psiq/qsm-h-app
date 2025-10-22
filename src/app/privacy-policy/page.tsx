import PrivacyPolicy from '@/components/legal/PrivacyPolicy'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <PrivacyPolicy />
        </div>
      </div>
    </div>
  )
}
