/**
 * RegisterPage.jsx
 *
 * New account registration form with:
 * - Full name, email, password, confirm password
 * - Password strength indicator
 * - Terms acceptance checkbox
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiUser, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiCheckCircle,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import authService from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ROUTES, USER_ROLE } from '@/utils/constants';
import { isValidEmail, isStrongPassword } from '@/utils/helpers';

// Simple strength meter
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const bar = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300
                        ${i < score ? bar[score - 1] : 'bg-gray-200 dark:bg-gray-700'}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {checks.map(({ label, ok }) => (
          <span key={label}
            className={`text-[11px] flex items-center gap-1
                           ${ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <HiCheckCircle className={`w-3 h-3 ${ok ? '' : 'opacity-30'}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [accountType, setAccountType] = useState(USER_ROLE.CUSTOMER);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      setErrors((p) => ({ ...p, [field]: '' }));
    };
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email) e.email = 'Email is required.';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (!isStrongPassword(form.password))
      e.password = 'Password is too weak.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    if (!agreed) e.terms = 'You must accept the terms.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const backendRole = accountType === USER_ROLE.AGENT ? 'agent' : 'customer';
      const { user, token, refreshToken } = await authService.register({
        name: form.name.trim(), email: form.email, password: form.password, role: backendRole,
      });
      login(user, token, refreshToken);
      toast.success('Account created! Welcome aboard.');
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      const roleValidationDetails = err?.raw?.response?.data?.details;
      const roleRejected = Array.isArray(roleValidationDetails)
        && roleValidationDetails.some((detail) => String(detail?.field || '').includes('role'));

      if (accountType === USER_ROLE.AGENT && roleRejected) {
        toast.error('Agent accounts must be created by an administrator.');
      } else {
        toast.error(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Already have one?{' '}
          <Link to={ROUTES.LOGIN}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          leftIcon={<HiUser className="w-4 h-4" />}
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<HiEnvelope className="w-4 h-4" />}
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account type
            <Badge variant="yellow" dot className="ml-2 align-middle">
              Admin-managed for agents
            </Badge>
          </label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value={USER_ROLE.CUSTOMER}>Customer</option>
            <option value={USER_ROLE.AGENT}>Agent - admin managed</option>
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Customer accounts can self-register. Agent accounts must be created by an administrator.
          </p>
        </div>

        <div>
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            leftIcon={<HiLockClosed className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPw((p) => !p)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {showPw ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            }
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
          <PasswordStrength password={form.password} />
        </div>

        <Input
          label="Confirm password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat password"
          leftIcon={<HiLockClosed className="w-4 h-4" />}
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />

        {/* Terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, terms: '' })); }}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Privacy Policy
              </button>.
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </div>
  );
}
