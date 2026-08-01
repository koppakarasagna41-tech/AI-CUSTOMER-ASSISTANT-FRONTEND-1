import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiUsers,
    HiPlus,
    HiClipboardDocument,
    HiCheckCircle,
    HiXCircle,
    HiEnvelope,
    HiShieldCheck,
    HiKey,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import usersService from '@/services/usersService';
import { USER_ROLE } from '@/utils/constants';
import { isValidEmail } from '@/utils/helpers';

const initialForm = {
    fullName: '',
    email: '',
    password: '',
};

export default function UsersPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [createdAccount, setCreatedAccount] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            const response = await usersService.listUsers({ page: 1, page_size: 100 });
            setUsers((response?.items ?? []).map((item) => ({
                ...item,
                id: item.id || item.user_id,
                name: item.full_name || item.name || item.email,
            })));
        } catch (error) {
            toast.error(error?.message || 'Unable to load users.');
        } finally {
            setLoading(false);
        }
    }

    function validateForm() {
        const nextErrors = {};
        if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
        if (!form.email.trim()) nextErrors.email = 'Email is required.';
        else if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email.';
        if (!form.password.trim()) nextErrors.password = 'Temporary password is required.';
        else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            const response = await usersService.createAgent({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            const createdUser = response?.data ?? response;
            const tempPassword = form.password;
            setCreatedAccount({
                fullName: createdUser?.full_name || form.fullName.trim(),
                email: createdUser?.email || form.email.trim(),
                password: tempPassword,
            });
            setForm(initialForm);
            setErrors({});
            await loadUsers();
            toast.success('Agent account created successfully.');
        } catch (error) {
            toast.error(error?.message || 'Unable to create agent account.');
        } finally {
            setSubmitting(false);
        }
    }

    function copyPassword() {
        if (!createdAccount?.password) return;
        navigator.clipboard.writeText(createdAccount.password);
        toast.success('Temporary password copied to clipboard.');
    }

    const agentCount = useMemo(() => users.filter((item) => item.role === USER_ROLE.AGENT).length, [users]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage administrator-created agent accounts and review current user access.</p>
                </div>
            </motion.div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            <HiUsers className="h-4 w-4" />
                            All users
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{users.length} total</div>
                    </div>

                    {loading ? (
                        <div className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">Loading users…</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.map((person) => (
                                <div key={person.id} className="flex items-center gap-3 px-5 py-4">
                                    <Avatar name={person.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">{person.name}</p>
                                            <Badge variant={person.role === USER_ROLE.ADMIN ? 'red' : person.role === USER_ROLE.AGENT ? 'purple' : 'blue'}>{person.role || 'customer'}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{person.email}</p>
                                    </div>
                                    <div className="text-right text-xs text-gray-400">
                                        <div>{person.is_active ? 'Active' : 'Inactive'}</div>
                                        <div>{person.created_at ? new Date(person.created_at).toLocaleDateString() : '—'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Agent</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Create administrator-managed agent accounts without exposing the public registration flow.</p>
                            </div>
                            <div className="rounded-full bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                <HiPlus className="h-5 w-5" />
                            </div>
                        </div>

                        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
                            <Input
                                label="Full Name"
                                value={form.fullName}
                                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                                error={errors.fullName}
                                leftIcon={<HiUsers className="h-4 w-4" />}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                                error={errors.email}
                                leftIcon={<HiEnvelope className="h-4 w-4" />}
                            />
                            <Input
                                label="Temporary Password"
                                type="text"
                                value={form.password}
                                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                error={errors.password}
                                leftIcon={<HiKey className="h-4 w-4" />}
                            />
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                                <div className="flex items-center gap-2 font-medium">
                                    <HiShieldCheck className="h-4 w-4 text-primary-600" />
                                    Role: Agent
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The account will be created as an agent and can sign in after the admin shares the temporary password.</p>
                            </div>
                            <Button type="submit" variant="primary" loading={submitting} leftIcon={<HiPlus className="h-4 w-4" />}>
                                Create Agent
                            </Button>
                        </form>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <HiClipboardDocument className="h-4 w-4" />
                            Account summary
                        </div>
                        <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                                <span>Agents</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{agentCount}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                                <span>Current user</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{user?.name || user?.email || 'Admin'}</span>
                            </div>
                        </div>
                        {createdAccount && (
                            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                                <div className="flex items-center gap-2 font-semibold">
                                    <HiCheckCircle className="h-4 w-4" />
                                    Account created successfully
                                </div>
                                <p className="mt-2">Name: {createdAccount.fullName}</p>
                                <p>Email: {createdAccount.email}</p>
                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="font-medium">Temporary password: {createdAccount.password}</span>
                                    <Button variant="secondary" size="sm" onClick={copyPassword}>
                                        Copy password
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
