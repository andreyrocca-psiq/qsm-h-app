/**
 * Utilidades Gerais - QSM-H
 * Funções auxiliares para o MVP HTML
 */

// Verificar autenticação e redirecionar se necessário
async function checkAuth(requiredRole = null) {
  const session = await supabaseAuth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  const user = await supabaseAuth.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }

  const profile = await supabaseDB.getProfile(user.id);

  if (!profile) {
    await supabaseAuth.signOut();
    window.location.href = 'login.html';
    return null;
  }

  // Verificar role se especificado
  if (requiredRole && profile.role !== requiredRole) {
    showError('Acesso não autorizado para esta página.');
    window.location.href = profile.role === 'patient' ? 'paciente-dashboard.html' : 'medico-dashboard.html';
    return null;
  }

  return { user, profile };
}

// Mostrar mensagem de sucesso
function showSuccess(message) {
  showAlert(message, 'success');
}

// Mostrar mensagem de erro
function showError(message) {
  showAlert(message, 'error');
}

// Mostrar mensagem de aviso
function showWarning(message) {
  showAlert(message, 'warning');
}

// Mostrar mensagem de informação
function showInfo(message) {
  showAlert(message, 'info');
}

// Sistema de alertas
function showAlert(message, type = 'info') {
  // Remover alertas existentes
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());

  // Criar novo alerta
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    ${getAlertIcon(type)}
    <span>${message}</span>
  `;

  // Inserir no início do container principal
  const container = document.querySelector('.container, .container-sm');
  if (container) {
    container.insertBefore(alert, container.firstChild);

    // Auto-remover após 5 segundos
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }
}

// Ícones para alertas
function getAlertIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return `<strong>${icons[type] || icons.info}</strong>`;
}

// Mostrar loading overlay
function showLoading(message = 'Carregando...') {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';
  overlay.innerHTML = `
    <div style="text-align: center;">
      <div class="spinner"></div>
      <p style="margin-top: 1rem; color: var(--text-dark);">${message}</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

// Esconder loading overlay
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

// Formatar data
function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleDateString('pt-BR', options);
}

// Formatar data curta
function formatDateShort(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  return date.toLocaleDateString('pt-BR', options);
}

// Calcular severidade depressão
function getDepressionSeverity(score) {
  if (score <= 4) return { label: 'Mínima', class: 'success' };
  if (score <= 9) return { label: 'Leve', class: 'info' };
  if (score <= 14) return { label: 'Moderada', class: 'warning' };
  if (score <= 19) return { label: 'Moderadamente Grave', class: 'danger' };
  return { label: 'Grave', class: 'danger' };
}

// Calcular severidade ativação
function getActivationSeverity(score) {
  if (score <= 8) return { label: 'Normal', class: 'success' };
  if (score <= 12) return { label: 'Leve', class: 'info' };
  if (score <= 17) return { label: 'Moderada', class: 'warning' };
  return { label: 'Grave', class: 'danger' };
}

// Validar email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar senha
function isValidPassword(password) {
  return password.length >= 6;
}

// Desabilitar botão com loading
function setButtonLoading(button, loading = true) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px; display: inline-block; vertical-align: middle;"></span> Carregando...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

// Logout
async function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    showLoading('Saindo...');
    await supabaseAuth.signOut();
    hideLoading();
    window.location.href = 'index.html';
  }
}

// Abrir modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

// Fechar modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Download JSON
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Calcular tendência
function calculateTrend(current, previous) {
  if (!previous) return { icon: '', text: 'Primeira avaliação', class: '' };

  const diff = current - previous;

  if (diff > 0) {
    return { icon: '↑', text: `+${diff} pontos`, class: 'danger' };
  } else if (diff < 0) {
    return { icon: '↓', text: `${diff} pontos`, class: 'success' };
  } else {
    return { icon: '→', text: 'Sem alteração', class: 'info' };
  }
}

// Criar gráfico simples com Canvas
function createLineChart(canvasId, data, labels) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  // Limpar canvas
  ctx.clearRect(0, 0, width, height);

  if (!data || data.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sem dados para exibir', width / 2, height / 2);
    return;
  }

  // Encontrar valores máximo e mínimo
  const maxValue = Math.max(...data.dep, ...data.act, 27);
  const minValue = 0;

  // Função para mapear valores para coordenadas
  const mapX = (index) => padding + (index * (width - 2 * padding) / (data.dep.length - 1));
  const mapY = (value) => height - padding - ((value - minValue) / (maxValue - minValue) * (height - 2 * padding));

  // Desenhar eixos
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Desenhar linha de depressão (vermelho)
  ctx.strokeStyle = '#E74C3C';
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.dep.forEach((value, index) => {
    const x = mapX(index);
    const y = mapY(value);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Desenhar pontos de depressão
  ctx.fillStyle = '#E74C3C';
  data.dep.forEach((value, index) => {
    const x = mapX(index);
    const y = mapY(value);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Desenhar linha de ativação (laranja)
  ctx.strokeStyle = '#F39C12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.act.forEach((value, index) => {
    const x = mapX(index);
    const y = mapY(value);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Desenhar pontos de ativação
  ctx.fillStyle = '#F39C12';
  data.act.forEach((value, index) => {
    const x = mapX(index);
    const y = mapY(value);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Legenda
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#E74C3C';
  ctx.fillRect(width - 180, 20, 20, 4);
  ctx.fillText('Depressão', width - 150, 25);

  ctx.fillStyle = '#F39C12';
  ctx.fillRect(width - 180, 40, 20, 4);
  ctx.fillText('Ativação', width - 150, 45);
}

// Validar formulário
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--danger-red)';
      isValid = false;
    } else {
      input.style.borderColor = 'var(--border-gray)';
    }
  });

  if (!isValid) {
    showError('Por favor, preencha todos os campos obrigatórios.');
  }

  return isValid;
}

// Formatar telefone brasileiro
function formatPhone(value) {
  value = value.replace(/\D/g, '');

  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return value;
}

// Auto-aplicar máscara de telefone
function applyPhoneMask(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
  });
}

// Copiar para clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showSuccess('Copiado para a área de transferência!');
  } catch (err) {
    showError('Erro ao copiar para a área de transferência.');
  }
}

// Debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Fechar modal ao clicar fora
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });

  // ESC para fechar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal.active');
      if (activeModal) {
        activeModal.classList.remove('active');
      }
    }
  });
});
