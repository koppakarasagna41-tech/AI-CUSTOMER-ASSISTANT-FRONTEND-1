import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiUsers,
    HiPlus,
    HiMagnifyingGlass,
    HiArrowPath,
    HiPencil,
    HiKey,
    HiCheck,
    HiXMark,
    HiTrash,
    HiEye,
    HiClipboardDocumentList,
    HiCheckCircle,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import usersService from '@/services/usersService';
import { USER_ROLE } from '@/utils/constants';
import { formatDate, isValidEmail } from '@/utils/helpers';

const initialForm = {
    fullName: '',
    email: '',
    password: '',
    isActive: true,
};

export default function AgentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [passwordDraft, setPasswordDraft] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [createdAccount, setCreatedAccount] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const statusOptions = useMemo(() => [
        { value: 'all', label: 'All statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ], []);

    useEffect(() => {
        loadAgents(page, search, statusFilter);
    }, [page, statusFilter]);

    async function loadAgents(currentPage = 1, query = '', status = 'all') {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                page_size: pageSize,
            };
            if (query.trim()) {
                params.search = query.trim();
            }
            if (status === 'active') {
                params.status = true;
            } else if (status === 'inactive') {
                params.status = false;
            }
            const response = await usersService.listAgents(params);
            setAgents(response?.items ?? []);
            setTotalPages(Math.max(1, Math.ceil((response?.total ?? 0) / pageSize)));
        } catch (error) {
            toast.error(error?.message || 'Unable to load agents.');
        } finally {
            setLoading(false);
        }
    }

    function validateForm() {
        const nextErrors = {};
        if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
        if (!form.email.trim()) nextErrors.email = 'Email is required.';
        else if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email.';
        if (!isEditMode) {
            if (!form.password.trim()) nextErrors.password = 'Temporary password is required.';
            else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    function openCreateModal() {
        setIsEditMode(false);
        setForm(initialForm);
        setErrors({});
        setSelectedAgent(null);
        setIsModalOpen(true);
    }

    function openEditModal(agent) {
        setIsEditMode(true);
        setSelectedAgent(agent);
        setForm({
            fullName: agent.full_name,
            email: agent.email,
            password: '',
            isActive: agent.is_active,
        });
        setErrors({});
        setIsModalOpen(true);
    }

    function openDetailsModal(agent) {
        setSelectedAgent(agent);
        setIsDetailsOpen(true);
    }

    function openPasswordModal(agent) {
        setSelectedAgent(agent);
        setPasswordDraft('');
        setPasswordError('');
        setIsPasswordModalOpen(true);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            if (isEditMode && selectedAgent) {
                await usersService.updateAgent(selectedAgent.id, {
                    fullName: form.fullName.trim(),
                    isActive: form.isActive,
                });
                toast.success('Agent updated successfully.');
            } else {
                const response = await usersService.createAgent({
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                });
                const created = response?.data ?? response;
                setCreatedAccount({
                    fullName: created?.full_name || form.fullName.trim(),
                    email: created?.email || form.email.trim(),
                    password: form.password,
                });
                toast.success('Agent account created successfully.');
            }
            setIsModalOpen(false);
            setForm(initialForm);
            setErrors({});
            setPasswordDraft('');
            setSelectedAgent(null);
            setIsEditMode(false);
            await loadAgents(1, search, statusFilter);
            setPage(1);
        } catch (error) {
            toast.error(error?.message || 'Unable to complete the request.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResetPassword() {
        if (!passwordDraft.trim()) {
            setPasswordError('Password is required.');
            return;
        }
        if (passwordDraft.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            return;
        }

        try {
            await usersService.resetAgentPassword(selectedAgent.id, passwordDraft);
            toast.success('Password reset successfully.');
            setIsPasswordModalOpen(false);
            setPasswordDraft('');
            setPasswordError('');
            setSelectedAgent(null);
        } catch (error) {
            toast.error(error?.message || 'Unable to reset password.');
        }
    }

    async function handleToggleStatus(agent) {
        try {
            await usersService.updateAgent(agent.id, {
                fullName: agent.full_name,
                isActive: !agent.is_active,
            });
            toast.success(agent.is_active ? 'Agent deactivated.' : 'Agent activated.');
            await loadAgents(page, search, statusFilter);
        } catch (error) {
            toast.error(error?.message || 'Unable to update status.');
        }
    }

    async function handleDelete(agentId) {
        try {
            await usersService.deleteAgent(agentId);
            toast.success('Agent deleted.');
            await loadAgents(page, search, statusFilter);
        } catch (error) {
            toast.error(error?.message || 'Unable to delete agent.');
        }
    }

    function handleRefresh() {
        setRefreshing(true);
        loadAgents(page, search, statusFilter).finally(() => setRefreshing(false));
    }

    function copyPassword() {
        if (!createdAccount?.password) return;
        navigator.clipboard.writeText(createdAccount.password);
        toast.success('Temporary password copied to clipboard.');
    }

    function handleSearchChange(event) {
        setSearch(event.target.value);
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        setPage(1);
        loadAgents(1, search, statusFilter);
    }

    function handleStatusChange(event) {
        setStatusFilter(event.target.value);
        setPage(1);
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage support agents from the admin dashboard. Create accounts, edit status, reset passwords, and review details.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" leftIcon={<HiArrowPath className="h-4 w-4" />} onClick={handleRefresh} loading={refreshing}>
                        Refresh
                    </Button>
                    <Button variant="primary" leftIcon={<HiPlus className="h-4 w-4" />} onClick={openCreateModal}>
                        Create Agent
                    </Button>
                </div>
            </motion.div>

            <div className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            <HiClipboardDocumentList className="h-4 w-4" />
                            Agent accounts
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {agents.length} shown
                        </div>
                    </div>
                    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Input
                                label="Search"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search by name or email"
                                className="pr-10"
                            />
                            <HiMagnifyingGlass className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div>
                            <label className="sr-only" htmlFor="status">Status filter</label>
                            <select
                                id="status"
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-500/20"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">Loading agents…</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800/60">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Full Name</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Email</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Created</th>
                                    <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {agents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{agent.full_name}</div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{agent.email}</td>
                                        <td className="px-5 py-4">
                                            <Badge variant={agent.is_active ? 'green' : 'gray'}>{agent.is_active ? 'Active' : 'Inactive'}</Badge>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{formatDate(agent.created_at)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="ghost" size="sm" className="!px-2" onClick={() => openDetailsModal(agent)}>
                                                    <HiEye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="!px-2" onClick={() => openEditModal(agent)}>
                                                    <HiPencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="!px-2" onClick={() => openPasswordModal(agent)}>
                                                    <HiKey className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="!px-2" onClick={() => handleToggleStatus(agent)}>
                                                    {agent.is_active ? <HiXMark className="h-4 w-4" /> : <HiCheck className="h-4 w-4" />}
                                                </Button>
                                                <Button variant="danger" size="sm" className="!px-2" onClick={() => handleDelete(agent.id)}>
                                                    <HiTrash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {agents.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No agents found. Adjust your filters or create a new agent.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 sm:flex-row sm:items-center sm:justify-between">
                    <div>Page {page} of {totalPages}</div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                            Previous
                        </Button>
                        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditMode ? 'Edit Agent' : 'Create Agent'}</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {isEditMode ? 'Update agent details and status.' : 'Create a new support agent with a temporary password.'}
                                </p>
                            </div>
                            <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsModalOpen(false)}>
                                <HiXMark className="h-5 w-5" />
                            </button>
                        </div>

                        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
                            <Input
                                label="Full Name"
                                value={form.fullName}
                                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                                error={errors.fullName}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                                error={errors.email}
                                disabled={isEditMode}
                            />
                            {!isEditMode && (
                                <Input
                                    label="Temporary Password"
                                    type="text"
                                    value={form.password}
                                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                    error={errors.password}
                                />
                            )}
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                <div className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span>Role</span>
                                    <span className="font-semibold">Agent</span>
                                </div>
                            </div>
                            {isEditMode && (
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                    <div className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span>Status</span>
                                        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                            <input
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            Active
                                        </label>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" loading={submitting}>
                                    {isEditMode ? 'Save Changes' : 'Create Agent'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDetailsOpen && selectedAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Details</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review the profile and account status for this agent.</p>
                            </div>
                            <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsDetailsOpen(false)}>
                                <HiXMark className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Full name</p>
                                <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedAgent.full_name}</p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedAgent.email}</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                    <Badge variant={selectedAgent.is_active ? 'green' : 'gray'}>{selectedAgent.is_active ? 'Active' : 'Inactive'}</Badge>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{formatDate(selectedAgent.created_at)}</p>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                <p className="mt-1 font-medium text-gray-900 dark:text-white">Agent</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && selectedAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set a new temporary password for this agent.</p>
                            </div>
                            <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsPasswordModalOpen(false)}>
                                <HiXMark className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-5 space-y-4">
                            <Input
                                label="New Password"
                                type="text"
                                value={passwordDraft}
                                onChange={(event) => { setPasswordDraft(event.target.value); setPasswordError(''); }}
                                error={passwordError}
                            />
                            <div className="flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleResetPassword}>
                                    Reset Password
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {createdAccount && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 font-semibold">
                                <HiCheckCircle className="h-4 w-4" />
                                Agent created successfully
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                                <p>Name: {createdAccount.fullName}</p>
                                <p>Email: {createdAccount.email}</p>
                                <p>Temporary password: <span className="font-medium">{createdAccount.password}</span></p>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={copyPassword}>
                            Copy password
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
