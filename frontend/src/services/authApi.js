import axios from 'axios';

const BACKEND = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api`;

const api = axios.create({ baseURL: BACKEND });

// The desk's own calendar day, so planned tasks follow the property's date, not UTC.
export const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function classifyAuthError(error) {
  if (!error?.response) return { kind: 'network', message: 'We could not reach Noted. Check your connection and try again.' };
  const status = error.response.status;
  const detail = error.response.data?.detail;
  const detailMessage = typeof detail === 'string' ? detail : detail?.message;
  if (status === 401) return { kind: 'credentials', message: detailMessage || 'The email, password, or selected role is not correct.' };
  if (status === 403) return { kind: 'account', message: detailMessage || 'This account does not have access to the selected workspace.' };
  if (status === 409) return { kind: 'account', message: detailMessage || 'This account already exists or cannot be updated.' };
  if (status === 429) return { kind: 'rate_limited', message: detailMessage || 'Too many attempts. Please wait a few minutes and try again.' };
  if (status === 410) return { kind: detail?.status || 'gone', message: detailMessage || 'This link is no longer valid.' };
  if (status === 404 && detail?.status) return { kind: detail.status, message: detailMessage || 'This link is not valid.' };
  return { kind: 'server', message: detailMessage || 'Something went wrong. Please try again.' };
}

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('op_token');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

function saveToken(data) {
  if (data?.token) localStorage.setItem('op_token', data.token);
}

// ── Field normalizers ─────────────────────────────────────────────────────────

export const CONTACT_GROUPS = ['Emergency services', 'Staff', 'Building & vendors'];
const normalizeContact = c => ({ id: c.contact_id, label: c.label, number: c.number, category: c.category || 'Building & vendors', role: c.role || '' });
const contactBody = c => ({ label: c.label, number: c.number, category: c.category || 'Building & vendors', role: c.role || '' });

const fmtTs = (iso) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

export function normalizeTask(t) {
  return {
    id:              t.task_id,
    task_id:         t.task_id,
    title:           t.title || '',
    notes:           t.notes || t.description || '',
    category:        t.category || 'Other',
    priority:        t.priority || 'Standard',
    assignedTo:      t.assigned_to || '',
    toId:            t.assigned_to_id || '',
    dueTime:         t.due_time || t.scheduled_time || 'ASAP',
    status:          t.status || 'pending',
    createdAt:       fmtTs(t.created_at),
    completedAt:     fmtTs(t.completed_at),
    completedByName: t.completed_by_name || '',
    completedAtRaw:  t.completed_at || '',
    declinedAt:      fmtTs(t.declined_at),
    declinedByName:  t.declined_by_name || '',
    createdBy:       t.created_by_name || '',
    createdByType:   t.created_by_type || 'concierge',
    sourceSection:   t.source_section || '',
    completionNote:  t.completion_note || '',
    evidenceUrl:     t.evidence_url || '',
    evidenceUrls:    Array.isArray(t.evidence_urls) ? t.evidence_urls : (t.evidence_url ? [t.evidence_url] : []),
  };
}

export function normalizeIncident(i) {
  return {
    id:              i.incident_id,
    incident_id:     i.incident_id,
    title:           i.description || i.title || '',
    type:            i.type || '',
    location:        i.location || '',
    severity:        i.severity || 'medium',
    filedBy:         i.created_by || '',
    filedAt:         i.created_at ? new Date(i.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
    note:            i.notes || '',
    status:          i.status || 'new',
    unit_number:     i.unit_number || '',
    person_involved: i.person_involved || '',
    evidenceUrls:    Array.isArray(i.evidence_urls) ? i.evidence_urls : [],
    createdAtMs:     i.created_at ? new Date(i.created_at).getTime() : 0,
    shiftId:         i.shift_id || '',
    resolvedAt:      fmtTs(i.resolved_at),
  };
}

function normalizeConcierge(c) {
  // handle both add response shape (has `name`) and list shape (has `first_name`/`last_name`)
  const name = c.name || [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Concierge';
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'C';
  return {
    id:           c.concierge_id || c.invitation_id,
    concierge_id: c.concierge_id,
    invitation_id: c.invitation_id,
    name,
    init:         initials,
    title:        c.title || 'Concierge',
    co:           '',
    status:       c.status || 'active',
    phone:        c.phone || '',
    email:        c.email || '',
    sectionAccess: c.section_access || {},
    shifts:       c.shift_count || 0,
    onShiftSince: c.on_shift_since ? new Date(c.on_shift_since).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
    rating:       null,
    since:        c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null,
  };
}

// ── API methods ───────────────────────────────────────────────────────────────

export const authApi = {
  // Auth
  async signUpManager(form) {
    const { data } = await api.post('/auth/manager/signup', {
      first_name:    form.firstName,
      last_name:     form.lastName,
      email:         form.email,
      phone:         form.phone,
      job_title:     form.jobTitle,
      property_name: form.propertyName,
      address:       form.address,
      city:          form.city,
      state:         form.state,
      units:         parseInt(form.units, 10),
      password:      form.password,
    });
    saveToken(data);
    return data;
  },

  async signIn(role, email, password) {
    const { data } = await api.post('/auth/signin', { role, email, password });
    saveToken(data);
    return data;
  },

  async signOut() {
    try { await api.post('/auth/signout'); } catch {}
    localStorage.removeItem('op_token');
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password:     newPassword,
    });
    return data;
  },

  async updateProfile(fields) {
    const { data } = await api.put('/auth/me', fields);
    return data;
  },

  async getMe() {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch {
      return null;
    }
  },

  async requestPasswordReset(email) {
    const { data } = await api.post('/auth/password/forgot', { email });
    return data;
  },

  async resetPassword(token, password) {
    const { data } = await api.post('/auth/password/reset', { token, password });
    return data;
  },

  async verifyInvitation(token) {
    const { data } = await api.get(`/auth/invitations/${token}`);
    return data;
  },

  async acceptInvitation(token, password) {
    const { data } = await api.post(`/auth/invitations/${token}/accept`, { password });
    return data;
  },

  // Team (concierges)
  async addConcierge(payload) {
    const { data } = await api.post('/manager/concierge', payload);
    return normalizeConcierge(data);
  },

  async inviteConcierge(payload) {
    const { data } = await api.post('/manager/concierge/invitations', payload);
    return {
      ...normalizeConcierge({ ...data, status: 'invited' }),
      emailSent:  data.email_sent !== false,
      emailError: data.email_error || '',
      inviteLink: data.invite_link || '',
    };
  },

  async getConcierges() {
    const { data } = await api.get('/manager/concierges');
    return (data.concierges || []).map(normalizeConcierge);
  },

  // Shift Sections: which parts of the desk each concierge can see
  async saveConciergeSections(conciergeId, sections) {
    const { data } = await api.put(`/manager/concierge/${conciergeId}/sections`, { sections });
    return data.sections || {};
  },

  async getCustomSections() {
    const { data } = await api.get('/manager/shift-sections');
    return data.custom_sections || [];
  },

  async saveCustomSections(customSections) {
    const { data } = await api.put('/manager/shift-sections', {
      custom_sections: customSections.map(({ id, label, desc }) => ({ id, label, desc: desc || '' })),
    });
    return data.custom_sections || [];
  },

  async getMySections() {
    const { data } = await api.get('/concierge/sections');
    return { sections: data.sections || {}, customSections: data.custom_sections || [] };
  },

  async removeConcierge(conciergeId) {
    await api.delete(`/manager/concierge/${conciergeId}`);
  },

  async cancelInvitation(invitationId) {
    await api.delete(`/manager/concierge/invitations/${invitationId}`);
  },

  async resendCredentials(conciergeId) {
    const { data } = await api.post(`/manager/concierge/${conciergeId}/resend-credentials`);
    return data;
  },

  // Shifts
  async startShift() {
    const { data } = await api.post('/shifts/start', {}, { params: { day: localDay() } });
    return data; // { shift_id, concierge_name, clock_in, status }
  },

  async endShift() {
    const { data } = await api.post('/shifts/end', {});
    return data;
  },

  async getActiveShift() {
    try {
      const { data } = await api.get('/shifts/active');
      return data; // { shift } for concierge, { shifts } for manager
    } catch { return null; }
  },

  async getPreviousShift() {
    try {
      const { data } = await api.get('/shifts/previous');
      return data; // { shift } or { shift: null }
    } catch { return null; }
  },

  async getShiftHistory() {
    try {
      const { data } = await api.get('/shifts/history');
      return data; // { shifts: [...] }
    } catch { return { shifts: [] }; }
  },

  // Tasks
  async getTasks() {
    const { data } = await api.get('/tasks', { params: { day: localDay() } });
    return (data.tasks || []).map(normalizeTask);
  },

  async createTask(form) {
    const { data } = await api.post('/tasks', {
      title:          form.title,
      notes:          form.notes || '',
      category:       form.category || 'Other',
      priority:       form.priority || 'Standard',
      assigned_to:    form.assignedTo || null,
      assigned_to_id: form.toId || null,
      due_time:       form.dueTime || 'ASAP',
      source_section: form.sourceSection || null,
      evidence_urls:  (form.evidenceUrls || []).filter(url => typeof url === 'string' && url),
    });
    return normalizeTask(data);
  },

  async updateTask(taskId, update) {
    const { data } = await api.put(`/tasks/${taskId}`, update);
    return normalizeTask(data);
  },

  // Shift handover (replaces plain endShift when notes are provided)
  async handoverShift(handoverNotes = '', openItems = []) {
    const { data } = await api.post('/shifts/handover', { handover_notes: handoverNotes, open_items: openItems });
    return data;
  },

  // Residents directory
  // The property's own contact directory, plus the manager so the desk always has a real person to call.
  async getContacts() {
    const { data } = await api.get('/contacts');
    return { contacts: (data.contacts || []).map(normalizeContact), manager: data.manager || null };
  },
  async addContact(contact) {
    const { data } = await api.post('/contacts', contactBody(contact));
    return normalizeContact(data);
  },
  async updateContact(id, contact) {
    const { data } = await api.put(`/contacts/${encodeURIComponent(id)}`, contactBody(contact));
    return normalizeContact(data);
  },
  async deleteContact(id) { await api.delete(`/contacts/${id}`); },

  async getResidents() {
    try {
      const { data } = await api.get('/residents');
      return data.residents || [];
    } catch { return []; }
  },

  async createResident(form) {
    const { data } = await api.post('/residents', form);
    return data;
  },

  async updateResident(residentId, patch) {
    const { data } = await api.put(`/residents/${residentId}`, patch);
    return data;
  },

  async deleteResident(residentId) {
    await api.delete(`/residents/${residentId}`);
  },

  // Analytics
  async getAnalytics(fromDate = null, toDate = null) {
    try {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate)   params.to_date   = toDate;
      const { data } = await api.get('/analytics', { params });
      return data;
    } catch { return null; }
  },

  // Package notifications
  async notifyPackage({ unit, carrier, count, residentName, photoUrl }) {
    try {
      const { data } = await api.post('/notify/package', {
        unit, carrier: carrier || '', count: count || 1,
        resident_name: residentName || '', photo_url: photoUrl || null,
      });
      return data;
    } catch { return { sent: false }; }
  },

  // Audit trail
  async getAuditLog(limit = 200) {
    try {
      const { data } = await api.get('/audit', { params: { limit } });
      return data.logs || [];
    } catch { return []; }
  },

  // Scheduled tasks
  async getScheduledTasks() {
    try {
      const { data } = await api.get('/scheduled-tasks');
      return data.scheduled_tasks || [];
    } catch (e) {
      if (e?.response?.status === 403) return [];
      throw e;
    }
  },

  // Planned tasks: the body is already in the server's shape (see PlannedTasksPage)
  async createPlannedTask(body) {
    const { data } = await api.post('/scheduled-tasks', body);
    return data;
  },

  async updateScheduledTask(taskId, patch) {
    const { data } = await api.put(`/scheduled-tasks/${taskId}`, patch);
    return data;
  },

  async deleteScheduledTask(taskId) {
    await api.delete(`/scheduled-tasks/${taskId}`);
  },

  // Team messages: one thread per property, shared by the manager and the desk
  async getMessages() {
    const { data } = await api.get('/messages');
    return data.messages || [];
  },

  async sendMessage(content) {
    const { data } = await api.post('/messages', { content, message_type: 'text' });
    return data;
  },

  // Assistant: only what the app can't understand by itself is sent here (see assistant/engine.js).
  // Resolves to { answer, reason }; answer is null when the AI is off, busy or unreachable.
  async askAssistant(messages, name = '') {
    try {
      const now = new Date(), pad = n => String(n).padStart(2, '0');
      const { data } = await api.post('/assistant', {
        messages,
        name,
        today:   `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
        now:     `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      }, { timeout: 35000 });
      return data;
    } catch { return { answer: null, reason: 'failed' }; }
  },

  // SSE — returns an EventSource; caller must close it on unmount
  openEventStream(onUpdate) {
    const token = localStorage.getItem('op_token');
    const BACKEND = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api`;
    const url = `${BACKEND}/events${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const es = new EventSource(url);
    es.addEventListener('update', (e) => {
      try { onUpdate(JSON.parse(e.data)); } catch {}
    });
    return es;
  },

  // SOPs and training: uploaded by the manager, read by the desk
  async getKnowledge() {
    const { data } = await api.get('/knowledge');
    return data.items || [];
  },
  async saveKnowledge(kind, item, { fileToFollow = false, removeFile = false } = {}) {
    const { data } = await api.put(`/knowledge/${encodeURIComponent(item.id)}`, {
      kind, title: item.title || item.fileName || 'Untitled', category: item.category || '',
      body: item.body || '', status: item.status || undefined,
      file_name: item.fileName || '', file_type: item.fileType || '', data_url: item.dataURL || '',
      file_to_follow: fileToFollow, remove_file: removeFile,
    });
    return data;
  },
  // A document, photo or video for an SOP or training item, sent as a file rather than inline.
  async uploadKnowledgeFile(id, file, fileName, onProgress) {
    const form = new FormData();
    form.append('file', file, fileName || file.name || 'file');
    const { data } = await api.post(`/knowledge/${encodeURIComponent(id)}/file`, form, {
      timeout: 0,
      onUploadProgress: e => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100)); },
    });
    return data;
  },
  async getKnowledgeFile(id) {
    const { data } = await api.get(`/knowledge/${encodeURIComponent(id)}/file`, { responseType: 'blob', timeout: 0 });
    return data;
  },
  async setKnowledgeStatus(id, status) { await api.put(`/knowledge/${encodeURIComponent(id)}/status`, { status }); },
  async deleteKnowledge(id) { await api.delete(`/knowledge/${encodeURIComponent(id)}`); },
  async setTrainingCompleted(id, completed) { await api.put(`/knowledge/${encodeURIComponent(id)}/completed`, { completed }); },

  // Desk state: what is on site right now (packages on hand, guests in the lobby, …)
  async getDeskState() {
    const { data } = await api.get('/desk-state');
    return data.sections || {};
  },
  async saveDeskState(section, value) { await api.put(`/desk-state/${section}`, { data: value }); },

  // Incidents
  async getIncidents() {
    const { data } = await api.get('/incidents');
    return (data.incidents || []).map(normalizeIncident);
  },

  async resolveIncident(incidentId) {
    const { data } = await api.put(`/incidents/${incidentId}`, { status: 'resolved' });
    return normalizeIncident(data);
  },

  async createIncident(form) {
    const { data } = await api.post('/incidents', {
      type:             form.type || 'Other',
      location:         form.location || (form.unitNumber ? `Unit ${form.unitNumber}` : ''),
      description:      form.description || form.title || '',
      severity:         form.severity || 'medium',
      notes:            form.notes || form.actionsTaken || '',
      unit_number:      form.unitNumber || '',
      person_involved:  form.personInvolved || '',
      evidence_urls:    (form.photos || []).map(photo => photo?.url).filter(Boolean),
    });
    return normalizeIncident(data);
  },
};
