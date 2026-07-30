/**
 * SettingsPage.jsx
 *
 * Tabbed settings page:
 *  - Profile  : name, email, avatar update
 *  - Security : change password
 *  - Appearance: theme toggle, font size
 *  - Notifications: toggles
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUser,
  HiLockClosed,
  HiPaintBrush,
  HiBell,
  HiCamera,
  HiCheckCircle,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import userService from '@/services/userService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Profile', icon: HiUser },
  { id: 'security', label: 'Security', icon: HiLockClosed },
  { id: 'appearance', label: 'Appearance', icon: HiPaintBrush },
  { id: 'notifications', label: 'Notifications', icon: HiBell },
];

// ── Toggle component ──────────────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-3
                      border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200
                    focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
                    ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm
                          transform transition-transform duration-200 mt-0.5
                          ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );
}

// ── Profile tab ───────────────────────────────────────────────
function ProfileTab() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateProfile(form);
      updateUser(updated);
      setSaved(true);
      toast.success('Profile updated successfully.');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={user?.avatar} name={user?.name} size="xl" />
          <button
            type="button"
            aria-label="Change avatar"
            onClick={() => toast.info('Avatar upload coming soon.')}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600
                       flex items-center justify-center text-white shadow-md
                       hover:bg-primary-700 transition-colors"
          >
            <HiCamera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role} · {user?.plan} plan</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving}>Save changes</Button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400"
          >
            <HiCheckCircle className="w-4 h-4" /> Saved
          </motion.span>
        )}
      </div>
    </form>
  );
}

// ── Security tab ──────────────────────────────────────────────
function SecurityTab() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast.error('New passwords do not match.'); return;
    }
    setSaving(true);
    try {
      await userService.changePassword({ currentPassword: form.current, newPassword: form.next });
      toast.success('Password changed successfully.');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input label="Current password" type="password" value={form.current}
        onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))} />
      <Input label="New password" type="password" value={form.next}
        onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))} />
      <Input label="Confirm new password" type="password" value={form.confirm}
        onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} />
      <Button type="submit" loading={saving}>Update password</Button>
    </form>
  );
}

// ── Appearance tab ────────────────────────────────────────────
function AppearanceTab() {
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Color theme</p>
        <div className="flex gap-3 mt-2">
          {[
            { id: 'light', label: 'Light', bg: 'bg-white border-2', active: theme === 'light' },
            { id: 'dark', label: 'Dark', bg: 'bg-gray-900 border-2', active: theme === 'dark' },
          ].map(({ id, label, bg, active }) => (
            <button
              key={id}
              onClick={() => id === 'light' ? setLightTheme() : setDarkTheme()}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                          ${bg} ${active
                  ? 'border-primary-500 shadow-glow'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
            >
              <div className={`w-16 h-10 rounded-lg ${id === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`} />
              <span className={`text-xs font-medium ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {label}
              </span>
              {active && <HiCheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notifications tab ─────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newConversation: true,
    resolvedTicket: true,
    weeklyReport: false,
    aiAlerts: true,
    emailDigest: false,
  });
  const { toast } = useToast();

  function toggle(key) {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      toast.info(`Notification preference saved.`);
      return next;
    });
  }

  const items = [
    { key: 'newConversation', label: 'New conversation assigned', desc: 'Alert when a conversation is assigned to you.' },
    { key: 'resolvedTicket', label: 'Ticket resolved', desc: 'Notify when AI resolves a ticket.' },
    { key: 'weeklyReport', label: 'Weekly performance report', desc: 'Get a summary email every Monday.' },
    { key: 'aiAlerts', label: 'AI confidence alerts', desc: 'Alert when AI confidence drops below 70%.' },
    { key: 'emailDigest', label: 'Daily email digest', desc: 'Receive a daily email with support stats.' },
  ];

  return (
    <div>
      {items.map(({ key, label, desc }) => (
        <Toggle key={key} checked={prefs[key]} onChange={() => toggle(key)}
          label={label} description={desc} />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
const TAB_CONTENT = {
  profile: <ProfileTab />,
  security: <SecurityTab />,
  appearance: <AppearanceTab />,
  notifications: <NotificationsTab />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account preferences
        </p>
      </motion.div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab list */}
        <nav className="lg:w-52 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible
                        pb-2 lg:pb-0 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                          whitespace-nowrap transition-colors w-full text-left
                          ${activeTab === id
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 card p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 capitalize">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
              {TAB_CONTENT[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
