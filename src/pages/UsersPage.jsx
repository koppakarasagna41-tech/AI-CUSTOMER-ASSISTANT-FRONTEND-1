import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiUsers,
    HiPlus,
    HiPencil,
    HiKey,
    HiCheck,
    HiXMark,
    HiTrash,
    HiEye,
    HiClipboardDocument,
    HiCheckCircle,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [passwordDraft, setPasswordDraft] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
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
        if (!editingUser && !form.password.trim()) nextErrors.password = 'Temporary password is required.';
        else if (!editingUser && form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            if (editingUser) {
                await usersService.updateUser(editingUser.id, { fullName: form.fullName.trim() });
                toast.success('Agent updated successfully.');
            } else {
                const response = await usersService.createAgent({
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                });
                const createdUser = response?.data ?? response;
                setCreatedAccount({
                    fullName: createdUser?.full_name || form.fullName.trim(),
                    email: createdUser?.email || form.email.trim(),
                    password: form.password,
                });
                toast.success('Agent account created successfully.');
            }
            setForm(initialForm);
            setErrors({});
            setPasswordDraft('');
            setEditingUser(null);
            setIsModalOpen(false);
            await loadUsers();
        } catch (error) {
            toast.error(error?.message || 'Unable to complete the request.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResetPassword(userId) {
        if (!passwordDraft.trim()) {
            setPasswordError('Password is required.');
            return;
        }
        if (passwordDraft.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            return;
        }

        try {
            await usersService.resetPassword(userId, passwordDraft);
            toast.success('Password reset successfully.');
            setPasswordDraft('');
            setPasswordError('');
            setPendingAction(null);
        } catch (error) {
            toast.error(error?.message || 'Unable to reset password.');
        }
    }

    async function handleToggleStatus(userId, isActive) {
        try {
            await usersService.updateUser(userId, { isActive: !isActive });
            toast.success(isActive ? 'Agent deactivated.' : 'Agent activated.');
            await loadUsers();
        } catch (error) {
            toast.error(error?.message || 'Unable to update status.');
        }
    }

    async function handleDelete(userId) {
        try {
            await usersService.deleteUser(userId);
            toast.success('User deleted.');
            await loadUsers();
        } catch (error) {
            toast.error(error?.message || 'Unable to delete user.');
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User And Agent</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Administrators can create, edit, and manage agent accounts while preserving customer self-registration.</p>
                </div>
                <Button variant="primary" leftIcon={<HiPlus className="h-4 w-4" />} onClick={() => { setEditingUser(null); setForm(initialForm); setErrors({}); setIsModalOpen(true); }}>
                    Create Agent
                </Button>
            </motion.div>

            <div className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                        <HiUsers className="h-4 w-4" />
                        Agent accounts
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{users.length} total · {agentCount} agents</div>
                </div>

                {loading ? (
                    <div className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">Loading users…</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800/60">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Full Name</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Email</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Role</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Created Date</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map((person) => (
                                    <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{person.name}</div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{person.email}</td>
                                        <td className="px-5 py-4"><Badge variant={person.role === USER_ROLE.ADMIN ? 'red' : person.role === USER_ROLE.AGENT ? 'purple' : 'blue'}>{person.role || 'customer'}</Badge></td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${person.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {person.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{person.created_at ? new Date(person.created_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button type="button" className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" title="Edit" onClick={() => { setEditingUser(person); setForm({ fullName: person.name, email: person.email, password: '' }); setErrors({}); setIsModalOpen(true); }}>
                                                    <HiPencil className="h-4 w-4" />
                                                </button>
                                                <button type="button" className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" title="Reset Password" onClick={() => { setPendingAction(person.id); setPasswordDraft(''); setPasswordError(''); }}>
                                                    <HiKey className="h-4 w-4" />
                                                </button>
                                                <button type="button" className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" title={person.is_active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(person.id, person.is_active)}>
                                                    {person.is_active ? <HiXMark className="h-4 w-4" /> : <HiCheck className="h-4 w-4" />}
                                                </button>
                                                <button type="button" className="rounded-md p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" title="Delete" onClick={() => handleDelete(person.id)}>
                                                    <HiTrash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingUser ? 'Edit Agent' : 'Create Agent'}</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{editingUser ? 'Update the selected agent profile.' : 'Create a new agent account for the support team.'}</p>
                            </div>
                            <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { setIsModalOpen(false); setEditingUser(null); setForm(initialForm); setErrors({}); }}>
                                <HiXMark className="h-5 w-5" />
                            </button>
                        </div>

                        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
                            <Input label="Full Name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} error={errors.fullName} />
                            <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} error={errors.email} />
                            {!editingUser && (
                                <Input label="Temporary Password" type="text" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} error={errors.password} />
                            )}
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-medium">Active / Inactive</span>
                                    <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{editingUser?.is_active ?? true ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                                <div className="flex items-center gap-2 font-medium">
                                    <HiUsers className="h-4 w-4 text-primary-600" />
                                    Role: Agent
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setEditingUser(null); setForm(initialForm); setErrors({}); }}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" loading={submitting}>
                                    {editingUser ? 'Save Changes' : 'Create Agent'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {pendingAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set a new temporary password for the selected account.</p>
                            </div>
                            <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { setPendingAction(null); setPasswordDraft(''); setPasswordError(''); }}>
                                <HiXMark className="h-5 w-4" />
                            </button>
                        </div>
                        <div className="mt-5 space-y-4">
                            <Input label="New Password" type="text" value={passwordDraft} onChange={(event) => { setPasswordDraft(event.target.value); setPasswordError(''); }} error={passwordError} />
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => { setPendingAction(null); setPasswordDraft(''); setPasswordError(''); }}>
                                    Cancel
                                </Button>
                                <Button type="button" variant="primary" onClick={() => handleResetPassword(pendingAction)}>
                                    Reset Password
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {createdAccount && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                    <div className="flex items-center gap-2 font-semibold">
                        <HiCheckCircle className="h-4 w-4" />
                        Agent created successfully
                    </div>
                    <p className="mt-2">Name: {createdAccount.fullName}</p>
                    <p>Email: {createdAccount.email}</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium">Temporary password: {createdAccount.password}</span>
                        <Button variant="secondary" size="sm" onClick={copyPassword}>
                            Copy password
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
