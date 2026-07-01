import React from 'react';
import {
  Clock, Camera, XCircle, AlertCircle, CheckCircle,
  Home, Package, Shield, Waves, Users, Mail, ClipboardList,
  User, Wrench, Sparkles, Building2, HelpCircle, FileText,
} from 'lucide-react';
import { TaskStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_ICONS = {
  opening:       Home,
  packages:      Package,
  patrol:        Shield,
  amenity:       Waves,
  coverage:      Users,
  mail:          Mail,
  documentation: FileText,
  'Resident Assist':     User,
  'Maintenance':         Wrench,
  'Cleaning':            Sparkles,
  'Vendor / Contractor': Building2,
  'Administrative':      ClipboardList,
  'Safety / Security':   Shield,
  'Amenity':             Waves,
  'Delivery':            Package,
  'Other':               HelpCircle,
};

export const TaskCard = ({ task, onStartTask, readOnly = false }) => {
  const { colors } = useTheme();
  const { CARD, BORDER, TEXT, MUTED, BLUE, GREEN, RED, INTER } = colors;

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed    = task.status === TaskStatus.MISSED;
  const isPending   = !isCompleted && !isMissed;

  const iconColor = isCompleted ? GREEN : isMissed ? RED : BLUE;
  const CatIcon   = CATEGORY_ICONS[task.category] || ClipboardList;

  return (
    <div style={{
      borderRadius: 16,
      fontFamily: INTER,
      background: CARD,
      border: isCompleted
        ? '1.5px solid rgba(52,199,89,0.22)'
        : isMissed
        ? '1.5px solid rgba(255,59,48,0.28)'
        : `1px solid ${BORDER}`,
      boxShadow: isCompleted
        ? '0 4px 16px rgba(52,199,89,0.06)'
        : isMissed
        ? '0 4px 16px rgba(255,59,48,0.08)'
        : '0 2px 8px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 14, color: isCompleted ? MUTED : TEXT, margin: '0 0 3px', textDecoration: isCompleted ? 'line-through' : 'none', lineHeight: 1.3 }}>
            {task.title}
          </p>
          <p style={{ fontFamily: INTER, fontSize: 12, color: isMissed ? RED : MUTED, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} color={isMissed ? RED : MUTED} />
            {isCompleted && task.completedAt ? `Completed ${task.completedAt}` : task.scheduledTime || ''}
          </p>
          {isMissed && task.missedReason && (
            <p style={{ fontFamily: INTER, fontSize: 12, color: RED, margin: '3px 0 0' }}>{task.missedReason}</p>
          )}
        </div>

        {isPending && !readOnly && (
          <button
            onClick={e => { e.stopPropagation(); onStartTask && onStartTask(task); }}
            data-testid={`start-task-${task.id}`}
            style={{ flexShrink: 0, padding: '7px 13px', background: 'rgba(255,56,92,0.10)', border: 'none', borderRadius: 10, fontFamily: INTER, fontSize: 12, fontWeight: 700, color: BLUE, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Start Task
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
