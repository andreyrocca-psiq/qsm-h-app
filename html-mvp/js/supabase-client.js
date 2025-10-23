/**
 * Supabase Client - QSM-H
 * Cliente Supabase para JavaScript vanilla
 * LGPD Compliant
 */

const SUPABASE_URL = 'https://kzoalgpgsoiuvjxwobxb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b2FsZ3Bnc29pdXZqeHdvYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTU4MjYsImV4cCI6MjA3NjY5MTgyNn0.1cP13xNfD0YqP90EpeG92aRNKUeVLzfaZhTeJGO25vk';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Funções de Autenticação
 */
const auth = {
  // Registrar novo usuário
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role,
            phone: userData.phone || null,
          }
        }
      });

      if (error) throw error;

      // Aguardar trigger criar perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Registrar consentimentos LGPD
      if (data.user) {
        await Promise.all([
          db.recordConsent(data.user.id, 'terms_of_service', userData.termsVersion || '1.0'),
          db.recordConsent(data.user.id, 'privacy_policy', userData.privacyVersion || '1.0'),
          db.recordConsent(data.user.id, 'data_processing', '1.0'),
        ]);

        // Log de auditoria
        await db.logAudit(data.user.id, 'create', 'user', data.user.id, {
          action: 'signup',
          role: userData.role
        });
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Erro no signup:', error);
      return { user: null, session: null, error: error.message };
    }
  },

  // Login
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Log de auditoria
      if (data.user) {
        await db.logAudit(data.user.id, 'access', 'session', data.session.access_token, {
          action: 'login'
        });
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { user: null, session: null, error: error.message };
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.clear();
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error: error.message };
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  },

  // Obter sessão atual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
  },

  // Listener de mudanças de autenticação
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

/**
 * Funções de Banco de Dados
 */
const db = {
  // Obter perfil do usuário
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return null;
    }
  },

  // Atualizar perfil
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      await this.logAudit(userId, 'update', 'profile', userId, { updates });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error: error.message };
    }
  },

  // Registrar consentimento LGPD
  async recordConsent(userId, consentType, version) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .insert({
          user_id: userId,
          consent_type: consentType,
          consent_text: `Consent for ${consentType}`,
          consented: true,
          version: version,
          consented_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error);
      return { success: false, error: error.message };
    }
  },

  // Log de auditoria LGPD
  async logAudit(userId, action, resourceType, resourceId, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata: metadata,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
      return { success: false };
    }
  },

  // Obter IP do cliente (simplificado)
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  },

  // Salvar questionário
  async saveQuestionnaire(userId, answers) {
    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .insert({
          patient_id: userId,
          ...answers,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await this.logAudit(userId, 'create', 'questionnaire', data.id, {
        dep_total: answers.dep_total,
        act_total: answers.act_total
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao salvar questionário:', error);
      return { data: null, error: error.message };
    }
  },

  // Obter questionários do paciente
  async getQuestionnaires(patientId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('patient_id', patientId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      await this.logAudit(patientId, 'view', 'questionnaires', patientId, {
        count: data.length
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao obter questionários:', error);
      return { data: [], error: error.message };
    }
  },

  // Obter último questionário
  async getLatestQuestionnaire(patientId) {
    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('patient_id', patientId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return { data: data || null, error: null };
    } catch (error) {
      console.error('Erro ao obter último questionário:', error);
      return { data: null, error: error.message };
    }
  },

  // Obter pacientes do médico
  async getDoctorPatients(doctorId) {
    try {
      const { data, error } = await supabase
        .from('doctor_patients')
        .select(`
          id,
          patient_id,
          accepted_at,
          profiles:patient_id (
            id,
            full_name,
            email
          )
        `)
        .eq('doctor_id', doctorId)
        .not('accepted_at', 'is', null);

      if (error) throw error;

      await this.logAudit(doctorId, 'view', 'patients', doctorId, {
        count: data.length
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao obter pacientes:', error);
      return { data: [], error: error.message };
    }
  },

  // Obter dados do paciente para o médico
  async getPatientDataForDoctor(doctorId, patientId) {
    try {
      // Verificar se o médico tem acesso
      const { data: relationship, error: relError } = await supabase
        .from('doctor_patients')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('patient_id', patientId)
        .not('accepted_at', 'is', null)
        .single();

      if (relError || !relationship) {
        throw new Error('Acesso não autorizado');
      }

      // Obter perfil do paciente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('id', patientId)
        .single();

      if (profileError) throw profileError;

      // Obter questionários
      const { data: questionnaires, error: questError } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('patient_id', patientId)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (questError) throw questError;

      await this.logAudit(doctorId, 'view', 'patient_data', patientId, {
        questionnaire_count: questionnaires.length
      });

      return {
        profile,
        questionnaires,
        error: null
      };
    } catch (error) {
      console.error('Erro ao obter dados do paciente:', error);
      return { profile: null, questionnaires: [], error: error.message };
    }
  },

  // Convidar paciente
  async invitePatient(doctorId, patientEmail) {
    try {
      // Buscar paciente pelo email
      const { data: patient, error: searchError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', patientEmail)
        .eq('role', 'patient')
        .single();

      if (searchError || !patient) {
        throw new Error('Paciente não encontrado');
      }

      // Verificar se já existe relação
      const { data: existing } = await supabase
        .from('doctor_patients')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('patient_id', patient.id)
        .single();

      if (existing) {
        throw new Error('Paciente já está na sua lista');
      }

      // Criar relação
      const { data, error } = await supabase
        .from('doctor_patients')
        .insert({
          doctor_id: doctorId,
          patient_id: patient.id,
          accepted_at: new Date().toISOString() // Auto-aceito por enquanto
        })
        .select()
        .single();

      if (error) throw error;

      await this.logAudit(doctorId, 'create', 'doctor_patient', data.id, {
        patient_id: patient.id
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao convidar paciente:', error);
      return { data: null, error: error.message };
    }
  },

  // Obter logs de auditoria do usuário
  async getAuditLogs(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      return { data: [], error: error.message };
    }
  },

  // Exportar dados do usuário (LGPD)
  async exportUserData(userId) {
    try {
      const [profile, questionnaires, consents, auditLogs] = await Promise.all([
        this.getProfile(userId),
        supabase.from('questionnaires').select('*').eq('patient_id', userId),
        supabase.from('user_consents').select('*').eq('user_id', userId),
        supabase.from('audit_logs').select('*').eq('user_id', userId)
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        profile: profile,
        questionnaires: questionnaires.data || [],
        consents: consents.data || [],
        audit_logs: auditLogs.data || []
      };

      await this.logAudit(userId, 'export', 'user_data', userId, {
        items_exported: Object.keys(exportData).length
      });

      return { data: exportData, error: null };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return { data: null, error: error.message };
    }
  },

  // Solicitar exclusão de conta (LGPD)
  async requestAccountDeletion(userId) {
    try {
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 30); // 30 dias

      const { data, error } = await supabase
        .from('data_deletion_requests')
        .insert({
          user_id: userId,
          requested_at: new Date().toISOString(),
          scheduled_for: scheduledFor.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await this.logAudit(userId, 'delete', 'account', userId, {
        scheduled_for: scheduledFor.toISOString()
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao solicitar exclusão:', error);
      return { data: null, error: error.message };
    }
  }
};

// Exportar funções
window.supabaseAuth = auth;
window.supabaseDB = db;
