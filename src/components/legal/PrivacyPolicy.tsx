'use client'

import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold mb-6">Política de Privacidade</h1>

      <p className="text-sm text-gray-500 mb-4">
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
        <br />
        Versão: 1.0.0
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
        <p className="mb-3">
          Esta Política de Privacidade descreve como o QSM-H (Questionário Semanal de
          Monitoramento de Humor) coleta, usa, armazena e protege suas informações pessoais,
          em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
        </p>
        <p>
          Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Controlador de Dados</h2>
        <p>
          O controlador responsável pelo tratamento de seus dados pessoais é o QSM-H.
          Para questões relacionadas à privacidade, entre em contato através do e-mail:
          privacidade@qsm-h.com.br
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Dados Coletados</h2>

        <h3 className="text-lg font-semibold mb-2">3.1 Dados de Cadastro</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Nome completo</li>
          <li>Endereço de e-mail</li>
          <li>Telefone (opcional)</li>
          <li>Função (paciente ou médico)</li>
          <li>Senha (armazenada de forma criptografada)</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">3.2 Dados de Saúde</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Respostas aos questionários PHQ-9 e PMQ-9</li>
          <li>Informações sobre hábitos de sono</li>
          <li>Informações sobre uso de medicamentos</li>
          <li>Informações sobre exercícios físicos</li>
          <li>Informações sobre consumo de álcool e substâncias</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">3.3 Dados de Uso</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Logs de acesso ao sistema</li>
          <li>Endereço IP</li>
          <li>Tipo de navegador e dispositivo</li>
          <li>Data e hora de acesso</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Base Legal e Finalidade do Tratamento</h2>

        <h3 className="text-lg font-semibold mb-2">4.1 Consentimento</h3>
        <p className="mb-3">
          O tratamento de dados pessoais sensíveis (dados de saúde) é realizado mediante
          seu consentimento expresso e informado.
        </p>

        <h3 className="text-lg font-semibold mb-2">4.2 Finalidades</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Prestação dos serviços de monitoramento de humor</li>
          <li>Comunicação com usuários</li>
          <li>Compartilhamento de dados entre pacientes e médicos autorizados</li>
          <li>Análises estatísticas para melhoria dos serviços</li>
          <li>Cumprimento de obrigações legais</li>
          <li>Proteção ao crédito e prevenção à fraude</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Compartilhamento de Dados</h2>
        <p className="mb-3">
          Seus dados de saúde são compartilhados apenas com médicos que você autorizar
          expressamente através do sistema de convites. Nenhum dado é compartilhado com
          terceiros sem seu consentimento, exceto:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Quando exigido por lei ou ordem judicial</li>
          <li>Para proteger nossos direitos legais</li>
          <li>Em caso de reestruturação empresarial (fusão, aquisição, etc.)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Segurança dos Dados</h2>
        <p className="mb-3">
          Implementamos medidas técnicas e organizacionais apropriadas para proteger
          seus dados pessoais:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
          <li>Criptografia de senhas</li>
          <li>Controle de acesso baseado em funções (RBAC)</li>
          <li>Políticas de segurança em nível de linha (RLS)</li>
          <li>Logs de auditoria de acesso</li>
          <li>Backups regulares</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Seus Direitos (Art. 18 da LGPD)</h2>
        <p className="mb-3">Você tem os seguintes direitos em relação aos seus dados:</p>

        <ul className="list-disc pl-6 mb-4">
          <li><strong>Confirmação e Acesso:</strong> Verificar se tratamos seus dados e acessá-los</li>
          <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li><strong>Anonimização, bloqueio ou eliminação:</strong> De dados desnecessários ou excessivos</li>
          <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
          <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
          <li><strong>Revogação do consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
          <li><strong>Oposição:</strong> Opor-se ao tratamento em determinadas situações</li>
        </ul>

        <p>
          Para exercer seus direitos, acesse a seção "Privacidade e Dados" no seu perfil
          ou entre em contato através do e-mail: privacidade@qsm-h.com.br
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Retenção de Dados</h2>
        <p className="mb-3">
          Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades
          descritas nesta política, exceto quando um período de retenção maior for
          exigido ou permitido por lei:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Dados de questionários: 5 anos (requisitos de pesquisa médica)</li>
          <li>Logs de auditoria: 5 anos (conformidade LGPD)</li>
          <li>Dados de notificações: 1 ano</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">9. Cookies e Tecnologias Similares</h2>
        <p>
          Utilizamos cookies essenciais para o funcionamento do sistema, principalmente
          para autenticação e manutenção de sessão. Não utilizamos cookies de rastreamento
          ou publicidade.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10. Transferência Internacional</h2>
        <p>
          Seus dados são armazenados em servidores localizados no Brasil ou em países que
          oferecem nível adequado de proteção de dados conforme LGPD.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">11. Menores de Idade</h2>
        <p>
          Nossos serviços não são direcionados a menores de 18 anos. Se tomarmos
          conhecimento de que coletamos dados de menores sem consentimento parental,
          tomaremos medidas para excluir essas informações.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">12. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Notificaremos você sobre
          alterações significativas por e-mail ou através de aviso em nosso sistema.
          O uso continuado dos serviços após as alterações constitui aceitação da
          política revisada.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">13. Contato</h2>
        <p className="mb-2">
          Para questões sobre esta Política de Privacidade ou sobre o tratamento de
          seus dados pessoais, entre em contato:
        </p>
        <ul className="list-none mb-4">
          <li><strong>E-mail:</strong> privacidade@qsm-h.com.br</li>
          <li><strong>Encarregado de Dados (DPO):</strong> dpo@qsm-h.com.br</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">14. Autoridade Nacional</h2>
        <p>
          Sem prejuízo de qualquer outra via de recurso administrativo ou judicial, você
          tem o direito de apresentar reclamação à Autoridade Nacional de Proteção de
          Dados (ANPD) se considerar que o tratamento de seus dados pessoais viola a LGPD.
        </p>
      </section>
    </div>
  )
}
