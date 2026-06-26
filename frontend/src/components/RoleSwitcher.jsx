import React, { useState } from 'react';
import { Heart, Users, Briefcase, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';

export const RoleSwitcher = ({ currentRole, onRoleSwitch, variant = 'dropdown' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const roles = [
    {
      role: UserRole.CAREGIVER,
      title: 'Caregiver',
      icon: Heart,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      activeBg: 'bg-teal-100',
      description: 'Manage tasks & documentation'
    },
    {
      role: UserRole.FAMILY,
      title: 'Family',
      icon: Users,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      activeBg: 'bg-rose-100',
      description: 'View timeline & updates'
    },
    {
      role: UserRole.ENTERPRISE,
      title: 'Agency',
      icon: Briefcase,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      activeBg: 'bg-indigo-100',
      description: 'Manage staff & compliance'
    }
  ];

  const currentRoleConfig = roles.find(r => r.role === currentRole) || roles[0];

  const handleRoleSwitch = (newRole) => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    
    // Brief animation then switch
    setTimeout(() => {
      onRoleSwitch(newRole);
      setIsSwitching(false);
      setIsOpen(false);
    }, 300);
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          data-testid="role-switcher-compact"
        >
          {isSwitching ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : (
            <currentRoleConfig.icon className="w-4 h-4 text-white" />
          )}
          <span className="text-white text-sm font-medium">{currentRoleConfig.title}</span>
          <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50">
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-bold text-[#ababab] uppercase">Switch View</p>
                {roles.map(({ role, title, icon: Icon, color, bg, activeBg, description }) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      role === currentRole ? activeBg : 'hover:bg-stone-50'
                    }`}
                    data-testid={`switch-to-${role}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-stone-900">{title}</p>
                      <p className="text-xs text-[#8e8e93]">{description}</p>
                    </div>
                    {role === currentRole && (
                      <Check className="w-4 h-4 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-stone-100 p-3 bg-stone-50">
                <p className="text-xs text-[#ababab] text-center">
                  All data is shared across views for testing
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full dropdown variant (default)
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors w-full"
        data-testid="role-switcher"
      >
        <div className={`w-10 h-10 rounded-lg ${currentRoleConfig.bg} flex items-center justify-center`}>
          {isSwitching ? (
            <RefreshCw className={`w-5 h-5 ${currentRoleConfig.color} animate-spin`} />
          ) : (
            <currentRoleConfig.icon className={`w-5 h-5 ${currentRoleConfig.color}`} />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-stone-900">Viewing as {currentRoleConfig.title}</p>
          <p className="text-xs text-[#8e8e93]">Click to switch role</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#ababab] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-bold text-[#ababab] uppercase">Switch Role</p>
              {roles.map(({ role, title, icon: Icon, color, bg, activeBg, description }) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    role === currentRole ? activeBg : 'hover:bg-stone-50'
                  }`}
                  data-testid={`switch-to-${role}`}
                >
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-stone-900">{title}</p>
                    <p className="text-xs text-[#8e8e93]">{description}</p>
                  </div>
                  {role === currentRole && (
                    <Check className="w-5 h-5 text-emerald-500" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-stone-100 p-3 bg-stone-50">
              <p className="text-xs text-[#8e8e93] text-center">
                Same data • Different views • Perfect for testing
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;
