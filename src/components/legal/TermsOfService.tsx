'use client'

import React from 'react'

export default function TermsOfService() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold mb-6">Termos de Uso</h1>

      <p className="text-sm text-gray-500 mb-4">
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
        <br />
        Versão: 1.0.0
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e usar o QSM-H (Questionário Semanal de Monitoramento de Humor),
          você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não
          concordar com qualquer parte destes termos, não deve usar nossos serviços.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
        <p className="mb-3">
          O QSM-H é uma aplicação web progressiva (PWA) para monitoramento de humor e
          saúde mental, que permite:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Registro e acompanhamento de questionários de humor (PHQ-9 e PMQ-9)</li>
          <li>Monitoramento de hábitos de saúde</li>
          <li>Compartilhamento seguro de dados com profissionais de saúde autorizados</li>
          <li>Visualização de progressão e histórico</li>
          <li>Notificações para lembretes de questionários</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Cadastro e Conta de Usuário</h2>

        <h3 className="text-lg font-semibold mb-2">3.1 Elegibilidade</h3>
        <p className="mb-3">
          Você deve ter pelo menos 18 anos de idade para usar este serviço. Ao se
          cadastrar, você declara que tem capacidade legal para aceitar estes termos.
        </p>

        <h3 className="text-lg font-semibold mb-2">3.2 Responsabilidades do Usuário</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
          <li>Manter a segurança e confidencialidade de sua senha</li>
          <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
          <li>Ser responsável por todas as atividades em sua conta</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Tipos de Usuários</h2>

        <h3 className="text-lg font-semibold mb-2">4.1 Pacientes</h3>
        <p className="mb-3">
          Usuários que registram e monitoram seus próprios dados de humor e saúde mental.
        </p>

        <h3 className="text-lg font-semibold mb-2">4.2 Médicos</h3>
        <p className="mb-3">
          Profissionais de saúde que podem visualizar dados de pacientes que os autorizaram.
          Médicos devem:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Possuir registro profissional válido</li>
          <li>Usar os dados exclusivamente para fins de cuidados de saúde</li>
          <li>Respeitar o sigilo profissional e a confidencialidade dos dados</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Uso Aceitável</h2>

        <h3 className="text-lg font-semibold mb-2">5.1 Você Concorda em:</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Usar o serviço apenas para fins legais e legítimos</li>
          <li>Fornecer respostas honestas nos questionários</li>
          <li>Respeitar a privacidade de outros usuários</li>
          <li>Cumprir todas as leis e regulamentos aplicáveis</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">5.2 Você NÃO Pode:</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Usar o serviço para fins fraudulentos ou ilegais</li>
          <li>Tentar acessar dados de outros usuários sem autorização</li>
          <li>Fazer engenharia reversa ou tentar comprometer a segurança do sistema</li>
          <li>Usar bots, scripts ou qualquer automação não autorizada</li>
          <li>Compartilhar sua conta com terceiros</li>
          <li>Copiar, modificar ou distribuir o conteúdo do serviço sem autorização</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Natureza Médica do Serviço</h2>

        <h3 className="text-lg font-semibold mb-2">6.1 Não Substitui Atendimento Médico</h3>
        <p className="mb-3">
          O QSM-H é uma ferramenta de monitoramento e NÃO substitui consultas médicas,
          diagnósticos ou tratamentos profissionais. Em caso de emergência médica ou
          pensamentos suicidas, procure ajuda imediatamente através do CVV (188) ou
          serviços de emergência.
        </p>

        <h3 className="text-lg font-semibold mb-2">6.2 Sem Garantias Médicas</h3>
        <p>
          Não garantimos que o uso do serviço resultará em melhoria da saúde mental.
          Os resultados dos questionários são ferramentas de triagem e não diagnósticos
          definitivos.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Propriedade Intelectual</h2>
        <p className="mb-3">
          Todo o conteúdo, design, código e funcionalidades do QSM-H são de propriedade
          exclusiva e protegidos por leis de direitos autorais e propriedade intelectual.
        </p>
        <p>
          Os questionários PHQ-9 e PMQ-9 são instrumentos validados cientificamente e
          seus direitos pertencem aos respectivos autores.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Privacidade e Proteção de Dados</h2>
        <p>
          O tratamento de seus dados pessoais está descrito em nossa Política de
          Privacidade, que faz parte integrante destes Termos de Uso. Ao aceitar estes
          termos, você também concorda com nossa Política de Privacidade.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">9. Modificações do Serviço</h2>
        <p>
          Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer
          parte do serviço a qualquer momento, com ou sem aviso prévio. Não seremos
          responsáveis perante você ou terceiros por qualquer modificação, suspensão
          ou descontinuação do serviço.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10. Exclusão de Conta</h2>
        <p className="mb-3">
          Você pode solicitar a exclusão de sua conta e dados a qualquer momento através
          das configurações de privacidade. A exclusão é irreversível.
        </p>
        <p>
          Reservamo-nos o direito de suspender ou encerrar sua conta se você violar
          estes Termos de Uso.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">11. Limitação de Responsabilidade</h2>
        <p className="mb-3">
          O serviço é fornecido "como está" e "conforme disponível". Na máxima extensão
          permitida por lei, não oferecemos garantias de qualquer tipo, expressas ou
          implícitas.
        </p>
        <p>
          Não seremos responsáveis por:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
          <li>Perda de dados, lucros ou oportunidades de negócio</li>
          <li>Interrupções ou erros no serviço</li>
          <li>Decisões tomadas com base nas informações do serviço</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">12. Indenização</h2>
        <p>
          Você concorda em indenizar e isentar o QSM-H, seus desenvolvedores e afiliados
          de quaisquer reclamações, danos, custos e despesas (incluindo honorários
          advocatícios) decorrentes do uso inadequado do serviço ou violação destes termos.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">13. Lei Aplicável e Jurisdição</h2>
        <p>
          Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
          Qualquer disputa será submetida à jurisdição dos tribunais brasileiros.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">14. Alterações nos Termos</h2>
        <p>
          Podemos atualizar estes Termos de Uso periodicamente. Alterações significativas
          serão notificadas por e-mail ou através de aviso no sistema. O uso continuado
          após as alterações constitui aceitação dos novos termos.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">15. Recursos de Emergência</h2>
        <p className="mb-3">
          Se você ou alguém que você conhece está em crise ou considerando suicídio,
          procure ajuda imediatamente:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>CVV (Centro de Valorização da Vida):</strong> 188 (24h, gratuito)</li>
          <li><strong>SAMU:</strong> 192</li>
          <li><strong>Bombeiros:</strong> 193</li>
          <li><strong>Polícia Militar:</strong> 190</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">16. Contato</h2>
        <p>
          Para questões sobre estes Termos de Uso, entre em contato:
        </p>
        <ul className="list-none mt-2">
          <li><strong>E-mail:</strong> suporte@qsm-h.com.br</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">17. Disposições Gerais</h2>
        <p className="mb-3">
          Se qualquer disposição destes termos for considerada inválida ou inexequível,
          as demais disposições permanecerão em pleno vigor e efeito.
        </p>
        <p>
          A falha em fazer cumprir qualquer direito ou disposição destes termos não
          constituirá renúncia de tal direito ou disposição.
        </p>
      </section>
    </div>
  )
}
