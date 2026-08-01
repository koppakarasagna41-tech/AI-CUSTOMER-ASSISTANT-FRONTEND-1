/**
 * LoginPage.jsx
 *
 * Email + password login form.
 * - Client-side validation before submit
 * - Calls authService.login() (mock)
 * - Redirects to intended page or home on success
 * - Shows demo credentials hint
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import authService from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES, USER_ROLE } from '@/utils/constants';
import { isValidEmail } from '@/utils/helpers';
import { DEMO_CREDENTIALS } from '@/utils/placeholderData';

export default function LoginPage() {
  const { login, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.HOME;
  const isAdminLogin = location.pathname.startsWith(ROUTES.ADMIN_LOGIN);
  const isAgentLogin = location.pathname.startsWith(ROUTES.AGENT_LOGIN);
  const currentPortal = isAdminLogin ? USER_ROLE.ADMIN : isAgentLogin ? USER_ROLE.AGENT : USER_ROLE.CUSTOMER;
  const portalLabel = isAdminLogin ? 'Admin portal' : isAgentLogin ? 'Agent portal' : 'Customer portal';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { user, token, refreshToken } = await authService.login(form);
      login(user, token, refreshToken);
      toast.success(`Welcome back, ${user?.name?.split(' ')[0] || 'there'}!`);

      const role = user?.role;
      const destination = (() => {
        if (currentPortal === USER_ROLE.ADMIN) {
          if (role === USER_ROLE.ADMIN) {
            return from && from.startsWith(ROUTES.ADMIN) ? from : ROUTES.ADMIN_DASHBOARD;
          }
          return ROUTES.ADMIN_LOGIN;
        }

        if (currentPortal === USER_ROLE.AGENT) {
          if (role === USER_ROLE.AGENT) {
            return from && from.startsWith(ROUTES.AGENT) ? from : ROUTES.AGENT_DASHBOARD;
          }
          return role === USER_ROLE.ADMIN ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
        }

        if (role === USER_ROLE.CUSTOMER) {
          const isSafeCustomerRedirect = from && ![ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.ADMIN_LOGIN, ROUTES.AGENT_LOGIN].includes(from);
          return isSafeCustomerRedirect ? from : ROUTES.DASHBOARD;
        }

        return role === USER_ROLE.ADMIN ? ROUTES.ADMIN_LOGIN : ROUTES.AGENT_LOGIN;
      })();

      if (currentPortal === USER_ROLE.ADMIN && role !== USER_ROLE.ADMIN) {
        await logout();
        toast.error('Only admin accounts may sign in through this portal.');
      } else if (currentPortal === USER_ROLE.AGENT && role !== USER_ROLE.AGENT) {
        await logout();
        toast.error('Only agent accounts may sign in through this portal.');
      } else if (currentPortal === USER_ROLE.CUSTOMER && role !== USER_ROLE.CUSTOMER) {
        await logout();
        toast.error(`Please sign in through the ${role === USER_ROLE.ADMIN ? 'Admin' : 'Agent'} portal.`);
      }

      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setForm({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password });
    setErrors({});
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to the {portalLabel}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Create one free
          </Link>
        </p>
      </div>

      {/* Demo hint */}
      <div className="rounded-xl border border-primary-200 dark:border-primary-800
                      bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm">
        <p className="text-primary-700 dark:text-primary-300 font-medium mb-1">Demo account</p>
        <p className="text-primary-600 dark:text-primary-400 text-xs">
          {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-2 text-xs font-semibold text-primary-700 dark:text-primary-300
                     hover:underline"
        >
          Fill credentials →
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<HiEnvelope className="w-4 h-4" />}
          value={form.email}
          onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })); }}
          error={errors.email}
        />

        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<HiLockClosed className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPw ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          }
          value={form.password}
          onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: '' })); }}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600
                                              focus:ring-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <button type="button"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      {/* Divider + social placeholder */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-gray-950 px-3 text-gray-400">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {['Google', 'GitHub'].map((provider) => (
          <button
            key={provider}
            type="button"
            className="btn-secondary w-full justify-center text-sm"
            onClick={() => toast.info(`${provider} OAuth coming soon.`)}
          >
            {provider}
          </button>
        ))}
      </div>
    </div>
  );
}
