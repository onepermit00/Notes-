// ============ INCIDENT SCREEN ============
const IncidentScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [incidents, setIncidents] = useState(INCIDENTS);
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

  const resetForm = () => {
    setStep(1);
    setIncidentType(null);
    setSeverity(null);
    setDescription('');
    setActionsTaken('');
    setNotifyFamily(true);
    setSubmitted(false);
    setShowNewIncident(false);
  };

  const handleSubmit = () => {
    const newIncident = {
      id: Date.now(),
      type: incidentType,
      severity,
      title: INCIDENT_TYPES.find(t => t.id === incidentType)?.label + ' Incident',
      description,
      actionsTaken,
      photos: [],
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy: CAREGIVER.name,
      notifyFamily,
    };
    setIncidents([newIncident, ...incidents]);
    setSubmitted(true);
  };

  const getTypeIcon = (type) => {
    const found = INCIDENT_TYPES.find(t => t.id === type);
    return found?.icon || 'alert-circle';
  };

  const getTypeColor = (type) => {
    const found = INCIDENT_TYPES.find(t => t.id === type);
    return found?.color || '#f43f5e';
  };

  const getSeverityColor = (sev) => {
    const found = SEVERITY_LEVELS.find(s => s.id === sev);
    return found?.color || '#f43f5e';
  };

  // Success screen
  if (submitted) {
    return (
      <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successCard, { backgroundColor: theme.card }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color={theme.primary} />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>Report Submitted</Text>
            <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
              {notifyFamily 
                ? "Incident documented and family has been notified."
                : "Incident documented successfully."}
            </Text>
            <TouchableOpacity style={styles.successBtn} onPress={resetForm}>
              <Text style={styles.successBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // New Incident Form
  if (showNewIncident) {
    return (
      <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.incidentFormHeader, { borderBottomColor: theme.border }]}>
          <View style={styles.incidentFormHeaderLeft}>
            <View style={styles.incidentFormIcon}>
              <Ionicons name="alert-triangle" size={20} color="#f43f5e" />
            </View>
            <View>
              <Text style={[styles.incidentFormTitle, { color: theme.text }]}>New Incident Report</Text>
              <Text style={[styles.incidentFormStep, { color: theme.textMuted }]}>Step {step} of 4</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.cancelBtn, { backgroundColor: theme.cardHover }]}
            onPress={() => setShowNewIncident(false)}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.stepProgress}>
          {[1, 2, 3, 4].map((s) => (
            <View 
              key={s} 
              style={[
                styles.stepDot, 
                { backgroundColor: s <= step ? '#f43f5e' : theme.border }
              ]} 
            />
          ))}
        </View>

        <ScrollView style={styles.incidentFormContent}>
          {/* Step 1: Incident Type */}
          {step === 1 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>What type of incident?</Text>
              <View style={styles.typeGrid}>
                {INCIDENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      { backgroundColor: theme.card, borderColor: incidentType === type.id ? type.color : theme.border },
                      incidentType === type.id && { borderWidth: 2 }
                    ]}
                    onPress={() => setIncidentType(type.id)}
                  >
                    <View style={[styles.typeIconContainer, { backgroundColor: `${type.color}20` }]}>
                      <Ionicons name={type.icon} size={28} color={type.color} />
                    </View>
                    <Text style={[styles.typeLabel, { color: theme.text }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {incidentType && (
                <TouchableOpacity 
                  style={styles.nextBtn}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.nextBtnText}>Continue</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Step 2: Severity */}
          {step === 2 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Severity level?</Text>
              <View style={styles.severityList}>
                {SEVERITY_LEVELS.map((sev) => (
                  <TouchableOpacity
                    key={sev.id}
                    style={[
                      styles.severityCard,
                      { backgroundColor: theme.card, borderColor: severity === sev.id ? sev.color : theme.border },
                      severity === sev.id && { borderWidth: 2 }
                    ]}
                    onPress={() => setSeverity(sev.id)}
                  >
                    <View style={[styles.severityDot, { backgroundColor: sev.color }]} />
                    <Text style={[styles.severityLabel, { color: theme.text }]}>{sev.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.stepNav}>
                <TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(1)}>
                  <Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                {severity && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Describe what happened</Text>
              
              <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="What happened? Be specific..."
                placeholderTextColor={theme.textMuted}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />

              <Text style={[styles.inputLabel, { color: theme.text }]}>Actions Taken</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="What actions did you take?"
                placeholderTextColor={theme.textMuted}
                multiline
                textAlignVertical="top"
                value={actionsTaken}
                onChangeText={setActionsTaken}
              />

              <View style={styles.stepNav}>
                <TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(2)}>
                  <Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                {description.trim() && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(4)}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Review & Submit</Text>
              
              {/* Summary Card */}
              <View style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Type</Text>
                  <View style={styles.reviewValue}>
                    <Ionicons name={getTypeIcon(incidentType)} size={16} color={getTypeColor(incidentType)} />
                    <Text style={[styles.reviewValueText, { color: theme.text }]}>
                      {INCIDENT_TYPES.find(t => t.id === incidentType)?.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Severity</Text>
                  <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(severity)}20` }]}>
                    <Text style={[styles.severityBadgeText, { color: getSeverityColor(severity) }]}>
                      {SEVERITY_LEVELS.find(s => s.id === severity)?.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewRowFull}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Description</Text>
                  <Text style={[styles.reviewDesc, { color: theme.text }]}>{description}</Text>
                </View>
                {actionsTaken && (
                  <View style={styles.reviewRowFull}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Actions Taken</Text>
                    <Text style={[styles.reviewDesc, { color: theme.text }]}>{actionsTaken}</Text>
                  </View>
                )}
              </View>

              {/* Notify Family Toggle */}
              <View style={[styles.toggleCard, { backgroundColor: theme.card }]}>
                <View style={styles.toggleContent}>
                  <Ionicons name="people" size={24} color={theme.primary} />
                  <View style={styles.toggleText}>
                    <Text style={[styles.toggleTitle, { color: theme.text }]}>Notify Family</Text>
                    <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                      Send alert to {PATIENT.emergencyContact.name}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifyFamily}
                  onValueChange={setNotifyFamily}
                  trackColor={{ false: theme.border, true: `${theme.primary}50` }}
                  thumbColor={notifyFamily ? theme.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.stepNav}>
                <TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(3)}>
                  <Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Incident History View
  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.incidentScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Incidents</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          Report and track incidents for {PATIENT.name}
        </Text>

        {/* New Incident Button */}
        <TouchableOpacity
          style={styles.newIncidentBtn}
          onPress={() => setShowNewIncident(true)}
        >
          <View style={styles.newIncidentContent}>
            <View style={styles.newIncidentIcon}>
              <Ionicons name="add-circle" size={28} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.newIncidentTitle}>New Incident Report</Text>
              <Text style={styles.newIncidentSubtitle}>Document and report an incident</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.text }]}>{incidents.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.danger }]}>{openIncidents}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Open</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.primary }]}>{resolvedIncidents}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Resolved</Text>
          </View>
        </View>

        {/* Incidents List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Reports</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{incidents.length}</Text>
          </View>
        </View>

        {incidents.map((incident) => (
          <View key={incident.id} style={[styles.incidentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.incidentCardHeader}>
              <View style={styles.incidentCardLeft}>
                <View style={[styles.incidentTypeIcon, { backgroundColor: `${getTypeColor(incident.type)}20` }]}>
                  <Ionicons name={getTypeIcon(incident.type)} size={20} color={getTypeColor(incident.type)} />
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: incident.status === 'open' ? theme.danger : theme.primary }
                ]}>
                  <Text style={styles.statusBadgeText}>{incident.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[styles.incidentDate, { color: theme.textSecondary }]}>
                {new Date(incident.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.incidentCardTitle, { color: theme.text }]}>{incident.title}</Text>
            <Text style={[styles.incidentCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
              {incident.description}
            </Text>
            <Text style={[styles.incidentCardBy, { color: theme.textMuted }]}>
              Reported by {incident.createdBy}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ MESSAGE SCREEN ============
const MessageScreen = () => {
  const { theme } = useTheme();
  
  const conversations = [
    { id: '1', name: 'Mary Smith', role: 'Family Guardian (Daughter)', message: 'Thank you for the update on dad!', time: '10:30 AM', unread: 2, avatar: 'MS' },
    { id: '2', name: 'Dr. Rebecca Johnson', role: 'Primary Care Physician', message: 'Please monitor the blood pressure closely', time: 'Yesterday', unread: 0, avatar: 'RJ' },
    { id: '3', name: 'Tom Smith', role: 'Family Member (Son)', message: 'Can you help dad video call us today?', time: 'Yesterday', unread: 1, avatar: 'TS' },
    { id: '4', name: 'CareFirst Agency', role: 'Agency', message: 'Your schedule for next week is ready', time: 'Jan 15', unread: 0, avatar: 'CF' },
  ];

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <View style={styles.messageHeader}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Messages</Text>
        <TouchableOpacity style={[styles.newMessageBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="create-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Patient Context */}
      <View style={[styles.patientContext, { backgroundColor: theme.card }]}>
        <Ionicons name="person" size={16} color={theme.textSecondary} />
        <Text style={[styles.patientContextText, { color: theme.textSecondary }]}>
          Messages regarding {PATIENT.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.messageList}>
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={[styles.conversationCard, { backgroundColor: theme.card }]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{conv.avatar}</Text>
            </View>
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={[styles.conversationName, { color: theme.text }]}>{conv.name}</Text>
                <Text style={[styles.conversationTime, { color: theme.textSecondary }]}>{conv.time}</Text>
              </View>
              <Text style={[styles.conversationRole, { color: theme.textMuted }]}>{conv.role}</Text>
              <Text style={[styles.conversationMessage, { color: theme.textSecondary }]} numberOfLines={1}>
                {conv.message}
              </Text>
            </View>
            {conv.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.unreadText}>{conv.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ SHIFTS SCREEN ============
const ShiftsScreen = () => {
  const { theme } = useTheme();
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState('8:00 AM');

  const recentShifts = [
    { date: 'Today', hours: '4.5h', status: 'In Progress', earnings: '$67.50' },
    { date: 'Yesterday', hours: '8h', status: 'Completed', earnings: '$120.00' },
    { date: 'Jan 15', hours: '6h', status: 'Completed', earnings: '$90.00' },
    { date: 'Jan 14', hours: '8h', status: 'Completed', earnings: '$120.00' },
    { date: 'Jan 13', hours: '7.5h', status: 'Completed', earnings: '$112.50' },
  ];

  const quickActions = [
    { id: 'earnings', label: 'View Earnings', icon: 'cash', color: theme.primary },
    { id: 'history', label: 'Shift History', icon: 'time', color: theme.blue },
    { id: 'schedule', label: 'My Schedule', icon: 'calendar', color: theme.purple },
  ];

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.shiftScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Shifts</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          Manage your work schedule
        </Text>

        {/* Current Shift Card */}
        <View style={[
          styles.shiftCard, 
          { backgroundColor: isActive ? theme.primary : theme.card, borderColor: isActive ? theme.primaryHover : theme.border }
        ]}>
          <View style={styles.shiftCardHeader}>
            <View style={styles.shiftStatus}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? '#ffffff' : theme.textSecondary }]} />
              <Text style={[styles.shiftStatusText, { color: isActive ? '#ffffff' : theme.text }]}>
                {isActive ? 'Shift Active' : 'No Active Shift'}
              </Text>
            </View>
            {isActive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {isActive && (
            <View style={styles.shiftDetails}>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Started at</Text>
                  <Text style={styles.shiftDetailValue}>{startTime}</Text>
                </View>
              </View>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Patient</Text>
                  <Text style={styles.shiftDetailValue}>{PATIENT.name}</Text>
                </View>
              </View>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Tasks Done</Text>
                  <Text style={styles.shiftDetailValue}>3/12</Text>
                </View>
              </View>
              <View style={styles.shiftDetailRow}>
                <Ionicons name="hourglass-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.shiftDetailText}>
                  <Text style={styles.shiftDetailLabel}>Elapsed</Text>
                  <Text style={styles.shiftDetailValue}>4h 30m</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.shiftToggleBtn,
              { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.danger }
            ]}
            onPress={() => setIsActive(!isActive)}
          >
            <Ionicons name={isActive ? 'stop' : 'play'} size={20} color="#ffffff" />
            <Text style={styles.shiftToggleBtnText}>
              {isActive ? 'End Shift' : 'Start Shift'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: theme.card }]}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Shifts */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Recent Shifts</Text>
        <View style={[styles.recentShiftsCard, { backgroundColor: theme.card }]}>
          {recentShifts.map((shift, index) => (
            <View
              key={index}
              style={[
                styles.shiftRow,
                index < recentShifts.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}
            >
              <View>
                <Text style={[styles.shiftDate, { color: theme.text }]}>{shift.date}</Text>
                <Text style={[styles.shiftHours, { color: theme.textSecondary }]}>
                  {shift.hours} • {shift.status}
                </Text>
              </View>
              <Text style={[styles.shiftEarnings, { color: theme.primary }]}>{shift.earnings}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Earnings */}
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <View style={styles.earningsHeader}>
            <Ionicons name="wallet" size={24} color={theme.primary} />
            <Text style={[styles.earningsTitle, { color: theme.text }]}>This Week</Text>
          </View>
          <Text style={[styles.earningsAmount, { color: theme.primary }]}>$510.00</Text>
          <Text style={[styles.earningsSubtext, { color: theme.textSecondary }]}>34 hours worked</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ MENU SCREEN ============
const MenuScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'earnings', label: 'Earnings', icon: 'cash-outline', color: theme.primary },
    { id: 'history', label: 'Shift History', icon: 'time-outline', color: theme.blue },
    { id: 'settings', label: 'Settings', icon: 'settings-outline', color: theme.purple },
    { id: 'support', label: 'Support', icon: 'help-circle-outline', color: theme.amber },
  ];

  const handleSignOut = () => {
    logout();
  };

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.menuScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Menu</Text>

        {/* Profile Card */}
        <TouchableOpacity style={[styles.profileCardMenu, { backgroundColor: theme.card }]}>
          <Image source={{ uri: CAREGIVER.photo }} style={styles.profilePhotoMenu} />
          <View style={styles.profileInfoMenu}>
            <Text style={[styles.profileNameMenu, { color: theme.text }]}>{CAREGIVER.name}</Text>
            <Text style={[styles.profileRoleMenu, { color: theme.textSecondary }]}>{CAREGIVER.role}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <View style={[styles.themeToggle, { backgroundColor: theme.card }]}>
          <View style={styles.themeToggleLeft}>
            <View style={[styles.themeIcon, { backgroundColor: `${theme.primary}20` }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.themeLabel, { color: theme.text }]}>Appearance</Text>
              <Text style={[styles.themeValue, { color: theme.textSecondary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={isDark ? theme.primary : '#f4f3f4'}
          />
        </View>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: `${theme.danger}15` }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          <Text style={[styles.signOutText, { color: theme.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.appVersion, { color: theme.textMuted }]}>ADLTrack v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ AI COPILOT SCREEN ============
const AICopilotScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: "Hello Julia! I'm your AI Care Assistant. I can help you with:\n\n• Task guidance and instructions\n• Medication information\n• Vital signs interpretation\n• Care plan questions\n• Documentation help\n\nHow can I assist you today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    'Log vital signs',
    'View care plan',
    'Report concern',
    'Medication help',
  ];

  const sendMessage = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand you need help with that. Based on David's care plan, here's what I recommend:\n\n1. Check the scheduled time for this task\n2. Review any special instructions\n3. Document completion with notes\n\nWould you like me to provide more specific guidance?",
        "That's a great question! For medication administration, always verify:\n\n• Right patient\n• Right medication\n• Right dose\n• Right time\n• Right route\n\nDavid's current medications are listed in his profile. Need me to pull those up?",
        "I'm here to help! For vital signs, David's normal ranges are:\n\n• BP: 110-130/70-85 mmHg\n• Heart Rate: 60-80 bpm\n• Temperature: 97.8-99.1°F\n\nIf readings are outside these ranges, please document and notify the family.",
      ];
      
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.copilotContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.copilotHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.copilotBackBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.copilotHeaderTitle}>
          <View style={styles.copilotIcon}>
            <Ionicons name="sparkles" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.copilotTitle, { color: theme.text }]}>AI Care Assistant</Text>
            <Text style={[styles.copilotSubtitle, { color: theme.textSecondary }]}>Always here to help</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' 
              ? [styles.userBubble, { backgroundColor: theme.primary }]
              : [styles.aiBubble, { backgroundColor: theme.card }]
          ]}>
            {item.role === 'assistant' && (
              <View style={styles.aiAvatarSmall}>
                <Ionicons name="sparkles" size={12} color="#ffffff" />
              </View>
            )}
            <Text style={[styles.messageText, { color: item.role === 'user' ? '#ffffff' : theme.text }]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={[styles.loadingBubble, { backgroundColor: theme.card }]}>
          <View style={styles.loadingDots}>
            <View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} />
            <View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} />
            <View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} />
          </View>
        </View>
      )}

      {/* Suggestions */}
      <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionChip, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => sendMessage(suggestion)}
            >
              <Text style={[styles.suggestionText, { color: theme.text }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.chatInput, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Ask me anything about caregiving..."
          placeholderTextColor={theme.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.primary : theme.border }]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============ NAVIGATION ============
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CaregiverTabs = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: route.name === 'Incident' ? theme.danger : theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Incident: focused ? 'alert-circle' : 'alert-circle-outline',
            Message: focused ? 'chatbubble' : 'chatbubble-outline',
            Shifts: focused ? 'time' : 'time-outline',
            Menu: focused ? 'menu' : 'menu-outline',
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Incident" component={IncidentScreen} />
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="Shifts" component={ShiftsScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={CaregiverTabs} />
            <Stack.Screen name="AICopilot" component={AICopilotScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
