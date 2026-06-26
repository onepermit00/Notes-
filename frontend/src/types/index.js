// User Roles
export const UserRole = {
  CONCIERGE:       'concierge',       // Head concierge (George) — full access
  SHIFT_STAFF:     'shift_staff',     // Third-party / rotating staff (Maverick)
  MANAGER:         'manager',         // Property manager — read-only oversight
  CAREGIVER:       'concierge',       // legacy alias
  FAMILY:          'manager',         // legacy alias
  ENTERPRISE:      'enterprise'
};

// Task / round status
export const TaskStatus = {
  PENDING:     'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  MISSED:      'missed',
  PROPOSED:    'proposed'
};

// Priority levels
export const Priority = {
  CRITICAL:        'critical',
  HIGH:            'high',
  STANDARD:        'standard',
  LOW:             'low',
  QUALITY_OF_LIFE: 'quality_of_life'
};

// Task categories (concierge-specific)
export const TaskCategory = {
  PATROL:        'patrol',
  INSPECTION:    'inspection',
  PACKAGES:      'packages',
  OPENING:       'opening',
  CLOSING:       'closing',
  COVERAGE:      'coverage',
  DOCUMENTATION: 'documentation',
  VENDOR:        'vendor',
  MAIL:          'mail',
  AMENITY:       'amenity',
};

// Incident severity
export const IncidentSeverity = {
  LOW:      'low',
  MEDIUM:   'medium',
  HIGH:     'high',
  CRITICAL: 'critical'
};

// Message types
export const MessageType = {
  TEXT:   'text',
  IMAGE:  'image',
  SYSTEM: 'system'
};
