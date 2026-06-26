// Mock data for initial development

export const mockPatient = {
  id: 'patient_1',
  name: 'Johnathan Doe',
  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
  age: 78,
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Dementia'],
  allergies: ['Penicillin', 'Shellfish'],
  medications: [
    'Metformin 500mg - Twice daily',
    'Lisinopril 10mg - Once daily',
    'Donepezil 5mg - Once daily',
  ],
  emergencyContact: {
    name: 'Mary Doe',
    phone: '(555) 123-4567',
    relationship: 'Daughter',
  },
};

export const mockCaregiver = {
  id: 'caregiver_1',
  name: 'Sarah Jenkins',
  photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
  title: 'Certified Home Health Aide',
  role: 'caregiver',
};

export const mockTasks = [
  {
    task_id: 'task_1',
    title: 'Morning Medication',
    description: 'Administer morning medications with breakfast',
    instructions: '1. Verify patient identity\n2. Check medication against care plan\n3. Give Metformin 500mg with food\n4. Give Lisinopril 10mg\n5. Document in medication log',
    scheduled_time: '8:00 AM',
    time_window: '30 min',
    priority: 'critical',
    status: 'pending',
    requires_photo: true,
  },
  {
    task_id: 'task_2',
    title: 'Blood Pressure Check',
    description: 'Record morning blood pressure reading',
    instructions: '1. Have patient sit quietly for 5 minutes\n2. Position arm at heart level\n3. Take reading\n4. Record in vitals log',
    scheduled_time: '8:30 AM',
    time_window: '15 min',
    priority: 'critical',
    status: 'pending',
    requires_photo: false,
  },
  {
    task_id: 'task_3',
    title: 'Breakfast Assistance',
    description: 'Assist with breakfast preparation and feeding if needed',
    instructions: 'Prepare diabetic-friendly breakfast. Monitor food intake.',
    scheduled_time: '9:00 AM',
    time_window: '45 min',
    priority: 'standard',
    status: 'pending',
    requires_photo: true,
  },
  {
    task_id: 'task_4',
    title: 'Morning Hygiene',
    description: 'Assist with personal hygiene routine',
    instructions: 'Help with washing, dressing, and grooming as needed.',
    scheduled_time: '10:00 AM',
    time_window: '60 min',
    priority: 'standard',
    status: 'pending',
    requires_photo: false,
  },
  {
    task_id: 'task_5',
    title: 'Physical Therapy Exercises',
    description: 'Guide through prescribed PT exercises',
    instructions: 'Follow exercise sheet from physical therapist. Monitor for fatigue.',
    scheduled_time: '11:00 AM',
    time_window: '30 min',
    priority: 'standard',
    status: 'pending',
    requires_photo: true,
  },
];

export const mockVitals = {
  bloodPressure: [
    { systolic: 128, diastolic: 82, time: '8:00 AM', date: 'Today' },
    { systolic: 132, diastolic: 84, time: '2:00 PM', date: 'Yesterday' },
    { systolic: 125, diastolic: 78, time: '8:00 AM', date: 'Yesterday' },
  ],
  heartRate: [
    { value: 72, time: '8:00 AM', date: 'Today' },
    { value: 76, time: '2:00 PM', date: 'Yesterday' },
    { value: 70, time: '8:00 AM', date: 'Yesterday' },
  ],
  temperature: [
    { value: 98.4, time: '8:00 AM', date: 'Today' },
    { value: 98.6, time: '2:00 PM', date: 'Yesterday' },
    { value: 98.2, time: '8:00 AM', date: 'Yesterday' },
  ],
  pain: [
    { value: 2, time: '8:00 AM', date: 'Today' },
    { value: 3, time: '2:00 PM', date: 'Yesterday' },
    { value: 1, time: '8:00 AM', date: 'Yesterday' },
  ],
};

export const mockIncidents = [
  {
    id: 1,
    type: 'fall',
    title: 'Minor Fall in Bathroom',
    description: 'Patient slipped while getting out of shower. No visible injuries. Patient reports no pain.',
    photos: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400'],
    status: 'resolved',
    notifyEmergency: false,
    createdAt: '2025-01-15T14:30:00Z',
    createdBy: 'Sarah Jenkins',
  },
  {
    id: 2,
    type: 'behavior',
    title: 'Increased Confusion',
    description: 'Patient showed signs of confusion about time and location this afternoon. Lasted about 30 minutes.',
    photos: [],
    status: 'open',
    notifyEmergency: true,
    createdAt: '2025-01-16T16:45:00Z',
    createdBy: 'Sarah Jenkins',
  },
];

export const mockRequests = [
  {
    id: 'req_1',
    title: 'Extra Hydration Reminder',
    description: 'Please remind dad to drink water every 2 hours',
    priority: 'standard',
    status: 'pending',
    createdAt: '2025-01-16T10:00:00Z',
    createdBy: 'Mary Doe',
  },
  {
    id: 'req_2',
    title: 'Evening Walk',
    description: 'If weather permits, please take dad for a short walk in the garden',
    priority: 'low',
    status: 'completed',
    createdAt: '2025-01-15T09:00:00Z',
    createdBy: 'Mary Doe',
  },
];

export const mockActivities = [
  {
    activity_id: 'act_1',
    activity_type: 'task_completed',
    title: 'Morning Medication Administered',
    description: 'All medications given with breakfast. Patient tolerated well.',
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    created_by_name: 'Sarah Jenkins',
    created_by_role: 'caregiver',
    created_at: '2025-01-16T08:15:00Z',
  },
  {
    activity_id: 'act_2',
    activity_type: 'vital_recorded',
    title: 'Blood Pressure: 128/82',
    description: 'Morning reading within normal range.',
    image_url: null,
    created_by_name: 'Sarah Jenkins',
    created_by_role: 'caregiver',
    created_at: '2025-01-16T08:30:00Z',
  },
  {
    activity_id: 'act_3',
    activity_type: 'photo_uploaded',
    title: 'Breakfast Complete',
    description: 'Patient finished 80% of diabetic breakfast. Good appetite today.',
    image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
    created_by_name: 'Sarah Jenkins',
    created_by_role: 'caregiver',
    created_at: '2025-01-16T09:30:00Z',
  },
];

export const incidentTypes = [
  { id: 'fall', label: 'Fall', icon: 'alert-triangle' },
  { id: 'injury', label: 'Injury', icon: 'bandage' },
  { id: 'behavior', label: 'Behavior Change', icon: 'brain' },
  { id: 'medication', label: 'Medication Issue', icon: 'pill' },
  { id: 'health', label: 'Health Concern', icon: 'heart-pulse' },
  { id: 'other', label: 'Other', icon: 'more-horizontal' },
];
