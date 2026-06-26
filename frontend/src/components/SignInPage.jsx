import React from 'react';
import { Activity, Heart, Users, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { UserRole } from '../types';

export const SignInPage = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-stone-50 font-['Manrope',sans-serif] flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-stone-900">ADLTrack</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Welcome back</h1>
            <p className="text-[#8e8e93] font-medium">Select your account type to continue</p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4">
            {/* Caregiver Option */}
            <button
              onClick={() => onSelectRole(UserRole.CAREGIVER)}
              className="w-full p-5 bg-white border-2 border-stone-100 rounded-2xl hover:border-teal-400 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 group text-left"
              data-testid="signin-caregiver-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <Heart className="w-7 h-7 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900">I'm a Caregiver</h3>
                  <p className="text-sm text-[#8e8e93] font-medium">Manage shifts, tasks & documentation</p>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Family Option */}
            <button
              onClick={() => onSelectRole(UserRole.FAMILY)}
              className="w-full p-5 bg-white border-2 border-stone-100 rounded-2xl hover:border-rose-400 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 group text-left"
              data-testid="signin-family-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                  <Users className="w-7 h-7 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900">I'm a Family Member</h3>
                  <p className="text-sm text-[#8e8e93] font-medium">Monitor care & stay connected</p>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Enterprise Option */}
            <button
              onClick={() => onSelectRole(UserRole.ENTERPRISE)}
              className="w-full p-5 bg-white border-2 border-stone-100 rounded-2xl hover:border-indigo-400 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 group text-left"
              data-testid="signin-enterprise-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Briefcase className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900">I'm an Agency</h3>
                  <p className="text-sm text-[#8e8e93] font-medium">Manage staff & compliance</p>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>

          {/* Demo Notice */}
          <div className="pt-4 text-center">
            <p className="text-xs text-[#ababab] font-medium">
              This is a demo environment. Select any role to explore.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-[#ababab] font-medium">
          © {new Date().getFullYear()} ADLTrack. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SignInPage;
