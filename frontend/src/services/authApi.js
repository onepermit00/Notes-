import axios from 'axios';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

const api = axios.create({ baseURL: BACKEND });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('op_token');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

function saveToken(data) {
  if (data?.token) localStorage.setItem('op_token', data.token);
}

// ── Field normalizers ─────────────────────────────────────────────────────────

const fmtTs = (iso) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

function normalizeTask(t) {
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
    createdBy:       t.created_by_name || '',
    createdByType:   t.created_by_type || 'concierge',
  };
}

function normalizeIncident(i) {
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
  };
}

function normalizeConcierge(c) {
  // handle both add response shape (has `name`) and list shape (has `first_name`/`last_name`)
  const name = c.name || [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Concierge';
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'C';
  return {
    id:           c.concierge_id,
    concierge_id: c.concierge_id,
    name,
    init:         initials,
    title:        c.title || 'Concierge',
    co:           '',
    status:       'active',
    phone:        c.phone || '',
    email:        c.email || '',
    shifts:       0,
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

  // Team (concierges)
  async addConcierge(payload) {
    const { data } = await api.post('/manager/concierge', payload);
    return normalizeConcierge(data);
  },

  async getConcierges() {
    const { data } = await api.get('/manager/concierges');
    return (data.concierges || []).map(normalizeConcierge);
  },

  async removeConcierge(conciergeId) {
    await api.delete(`/manager/concierge/${conciergeId}`);
  },

  async resendCredentials(conciergeId) {
    const { data } = await api.post(`/manager/concierge/${conciergeId}/resend-credentials`);
    return data;
  },

  // Shifts
  async startShift() {
    const { data } = await api.post('/shifts/start', {});
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
    const { data } = await api.get('/tasks');
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
  async getAnalytics() {
    try {
      const { data } = await api.get('/analytics');
      return data;
    } catch { return null; }
  },

  // SSE — returns an EventSource; caller must close it on unmount
  openEventStream(onUpdate) {
    const token = localStorage.getItem('op_token');
    const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';
    const url = `${BACKEND}/events${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const es = new EventSource(url);
    es.addEventListener('update', (e) => {
      try { onUpdate(JSON.parse(e.data)); } catch {}
    });
    return es;
  },

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
    });
    return normalizeIncident(data);
  },
};
