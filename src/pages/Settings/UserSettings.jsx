import React, { useState, useEffect } from 'react';
import {
  User, Bell, Moon, Sun, Target, Clock, Palette, Mail,
  Save, Globe, Camera, Check, AlertCircle, Key
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/firebase/firestore';

const UserSettings = () => {
  const { user, userProfile } = useAuth();
  const [settings, setSettings] = useState({
    profile: { name: '', email: '', bio: '' },
    goals: { endDate: '', dailyTarget: '8', weeklyTarget: '40', reminder: true },
    preferences: { workTime: 'morning', focusDuration: '50', breakDuration: '10' },
    notifications: { emailAlerts: true, dailyDigest: false, weeklyReport: true, achievementAlerts: true, reminderAlerts: true },
    appearance: { theme: 'light', colorAccent: 'indigo', fontSize: 'medium', compactView: false },
    ai: { apiKey: '' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Load from user profile
  useEffect(() => {
    if (user || userProfile) {
      const s = userProfile?.settings || {};
      setSettings(prev => ({
        ...prev,
        profile: {
          name: user?.displayName || userProfile?.displayName || '',
          email: user?.email || userProfile?.email || '',
          bio: userProfile?.bio || '',
        },
        goals: {
          endDate: s.goalEndDate || new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
          dailyTarget: String(s.dailyTarget || 8),
          weeklyTarget: String(s.weeklyTarget || 40),
          reminder: s.reminder !== false,
        },
        preferences: {
          workTime: s.workPreference || 'morning',
          focusDuration: String(s.focusDuration || 50),
          breakDuration: String(s.breakDuration || 10),
        },
        appearance: {
          theme: s.theme || 'light',
          colorAccent: s.colorAccent || 'indigo',
          fontSize: s.fontSize || 'medium',
          compactView: s.compactView || false,
        },
        ai: { apiKey: localStorage.getItem('gemini_api_key') || '' },
      }));
    }
  }, [user, userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await updateUserProfile(user.uid, {
          displayName: settings.profile.name,
          bio: settings.profile.bio,
          settings: {
            goalEndDate: settings.goals.endDate,
            dailyTarget: parseInt(settings.goals.dailyTarget) || 8,
            weeklyTarget: parseInt(settings.goals.weeklyTarget) || 40,
            reminder: settings.goals.reminder,
            workPreference: settings.preferences.workTime,
            focusDuration: parseInt(settings.preferences.focusDuration) || 50,
            breakDuration: parseInt(settings.preferences.breakDuration) || 10,
            theme: settings.appearance.theme,
            colorAccent: settings.appearance.colorAccent,
            fontSize: settings.appearance.fontSize,
            compactView: settings.appearance.compactView,
          },
        });
      }
      // Save API key to localStorage
      if (settings.ai.apiKey) {
        localStorage.setItem('gemini_api_key', settings.ai.apiKey);
      }
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (settings.profile.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const accentColors = [
    { name: 'indigo', class: 'bg-indigo-400', ring: 'ring-indigo-400' },
    { name: 'emerald', class: 'bg-emerald-400', ring: 'ring-emerald-400' },
    { name: 'amber', class: 'bg-amber-400', ring: 'ring-amber-400' },
    { name: 'rose', class: 'bg-rose-400', ring: 'ring-rose-400' },
    { name: 'violet', class: 'bg-violet-400', ring: 'ring-violet-400' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-700">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account preferences</p>
        </div>
        <div className="flex items-center gap-4">
          {showSaved && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
              <Check className="w-4 h-4" /><span className="text-sm">Saved!</span>
            </div>
          )}
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-50">
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Saving...</span></>
            ) : (
              <><Save className="w-4 h-4" /><span>Save Changes</span></>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile */}
          <SettingsCard icon={User} title="Profile" color="bg-indigo-50 text-indigo-400">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-light">
                  {initials}
                </div>
                <button className="absolute bottom-0 right-0 p-1 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <SettingsInput label="Full Name" value={settings.profile.name} onChange={v => setSettings({ ...settings, profile: { ...settings.profile, name: v } })} />
            <SettingsInput label="Bio" value={settings.profile.bio} onChange={v => setSettings({ ...settings, profile: { ...settings.profile, bio: v } })} textarea />
          </SettingsCard>

          {/* Goals */}
          <SettingsCard icon={Target} title="Goals" color="bg-amber-50 text-amber-400">
            <SettingsInput label="Target End Date" value={settings.goals.endDate} onChange={v => setSettings({ ...settings, goals: { ...settings.goals, endDate: v } })} type="date" />
            <div className="grid grid-cols-2 gap-3">
              <SettingsInput label="Daily Target" value={settings.goals.dailyTarget} onChange={v => setSettings({ ...settings, goals: { ...settings.goals, dailyTarget: v } })} type="number" suffix="hrs" />
              <SettingsInput label="Weekly" value={settings.goals.weeklyTarget} onChange={v => setSettings({ ...settings, goals: { ...settings.goals, weeklyTarget: v } })} type="number" suffix="hrs" />
            </div>
          </SettingsCard>

          {/* AI Configuration */}
          <SettingsCard icon={Key} title="AI Configuration" color="bg-violet-50 text-violet-400">
            <SettingsInput label="Gemini API Key" value={settings.ai.apiKey} onChange={v => setSettings({ ...settings, ai: { ...settings.ai, apiKey: v } })} type="password" placeholder="AIza..." />
            <p className="text-xs text-slate-400 mt-1">Optional. Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-500">Google AI Studio</a></p>
          </SettingsCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Preferences */}
          <SettingsCard icon={Clock} title="Work Preferences" color="bg-violet-50 text-violet-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">Peak Productivity</label>
                <div className="flex gap-2">
                  {['morning', 'night', 'flexible'].map(t => (
                    <button key={t} onClick={() => setSettings({ ...settings, preferences: { ...settings.preferences, workTime: t } })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-all ${settings.preferences.workTime === t ? 'bg-violet-400 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SettingsInput label="Focus Duration" value={settings.preferences.focusDuration}
                  onChange={v => setSettings({ ...settings, preferences: { ...settings.preferences, focusDuration: v } })} type="number" suffix="min" />
                <SettingsInput label="Break" value={settings.preferences.breakDuration}
                  onChange={v => setSettings({ ...settings, preferences: { ...settings.preferences, breakDuration: v } })} type="number" suffix="min" />
              </div>
            </div>
          </SettingsCard>

          {/* Notifications */}
          <SettingsCard icon={Bell} title="Notifications" color="bg-emerald-50 text-emerald-400">
            {[
              { key: 'emailAlerts', icon: Mail, label: 'Email Alerts', desc: 'Important updates via email' },
              { key: 'dailyDigest', icon: Bell, label: 'Daily Digest', desc: 'Summary of daily progress' },
              { key: 'weeklyReport', icon: Target, label: 'Weekly Report', desc: 'Weekly performance report' },
              { key: 'achievementAlerts', icon: AlertCircle, label: 'Achievements', desc: 'Milestone notifications' },
              { key: 'reminderAlerts', icon: Clock, label: 'Reminders', desc: 'Task and goal reminders' },
            ].map(item => (
              <ToggleRow key={item.key} icon={item.icon} label={item.label} desc={item.desc}
                enabled={settings.notifications[item.key]}
                onToggle={() => setSettings({ ...settings, notifications: { ...settings.notifications, [item.key]: !settings.notifications[item.key] } })} />
            ))}
          </SettingsCard>

          {/* Appearance */}
          <SettingsCard icon={Palette} title="Appearance" color="bg-indigo-50 text-indigo-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">Theme</label>
                <div className="flex gap-2">
                  {[{ id: 'light', icon: Sun }, { id: 'dark', icon: Moon }, { id: 'system', icon: Globe }].map(t => (
                    <button key={t.id} onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, theme: t.id } })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize flex items-center justify-center gap-1 transition-all ${settings.appearance.theme === t.id ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}>
                      <t.icon className="w-3 h-3" />{t.id}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">Accent Color</label>
                <div className="flex gap-2">
                  {accentColors.map(c => (
                    <button key={c.name} onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, colorAccent: c.name } })}
                      className={`w-8 h-8 rounded-lg ${c.class} ${settings.appearance.colorAccent === c.name ? 'ring-2 ring-offset-2 ' + c.ring : ''} transition-all`} />
                  ))}
                </div>
              </div>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const SettingsCard = ({ icon: Icon, title, color, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center gap-3 mb-5">
      <div className={`p-2 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
      <h2 className="text-lg font-medium text-slate-700">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const SettingsInput = ({ label, value, onChange, type = 'text', suffix, textarea, placeholder }) => (
  <div>
    <label className="text-xs text-slate-400 uppercase tracking-wider">{label}</label>
    <div className="flex items-center gap-2 mt-1">
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows="2" placeholder={placeholder}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors resize-none text-sm" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors text-sm" />
      )}
      {suffix && <span className="text-sm text-slate-500 flex-shrink-0">{suffix}</span>}
    </div>
  </div>
);

const ToggleRow = ({ icon: Icon, label, desc, enabled, onToggle }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-slate-100 rounded-lg"><Icon className="w-4 h-4 text-slate-500" /></div>
      <div>
        <p className="text-sm text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
    <button onClick={onToggle} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-400' : 'bg-slate-200'}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-6' : ''}`} />
    </button>
  </div>
);

export default UserSettings;