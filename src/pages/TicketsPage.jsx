import { useEffect, useMemo, useState } from 'react';
import { HiPlus, HiTicket, HiExclamationTriangle, HiCheckCircle, HiClock, HiArrowPath } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import Badge, { statusVariant } from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import ticketService from '@/services/ticketService';

const CATEGORY_OPTIONS = ['technical', 'billing', 'refund', 'account', 'general_inquiry', 'complaint', 'feature_request'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

function formatStatus(value) {
    return String(value || 'open').replace(/_/g, ' ');
}

export default function TicketsPage() {
    const { user, isAdmin } = useAuth();
    const { toast } = useToast();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        subject: '',
        description: '',
        category: 'general_inquiry',
        priority: 'medium',
    });

    const loadTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketService.listTickets({ page: 1, page_size: 50 });
            setTickets(response?.items || []);
        } catch (error) {
            toast.error(error?.message || 'Unable to load tickets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const visibleTickets = useMemo(() => tickets.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)), [tickets]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.subject.trim()) {
            toast.error('Please enter a ticket title.');
            return;
        }

        try {
            setSubmitting(true);
            await ticketService.createTicket({
                subject: form.subject.trim(),
                description: form.description.trim(),
                category: form.category,
                priority: form.priority,
            });
            toast.success('Ticket created successfully.');
            setForm({ subject: '', description: '', category: 'general_inquiry', priority: 'medium' });
            setShowForm(false);
            await loadTickets();
        } catch (error) {
            toast.error(error?.message || 'Unable to create ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (ticket, nextStatus) => {
        try {
            await ticketService.updateTicket(ticket.id, { status: nextStatus });
            await loadTickets();
            toast.success('Ticket updated.');
        } catch (error) {
            toast.error(error?.message || 'Unable to update ticket.');
        }
    };

    const handlePriorityChange = async (ticket, nextPriority) => {
        try {
            await ticketService.updateTicket(ticket.id, { priority: nextPriority });
            await loadTickets();
            toast.success('Priority updated.');
        } catch (error) {
            toast.error(error?.message || 'Unable to update priority.');
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tickets</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track support requests, monitor status, and keep your conversations moving.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" leftIcon={<HiArrowPath className="w-4 h-4" />} onClick={loadTickets}>
                        Refresh
                    </Button>
                    <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
                        Create Ticket
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New support ticket</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Describe the issue and we will route it to the right team.</p>
                        </div>
                        <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                    </div>

                    <form onSubmit={handleCreate} className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Input label="Title" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Brief summary of the issue" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                rows="4"
                                className="input min-h-28"
                                placeholder="Share the context, symptoms, and any error details"
                            />
                        </div>
                        <div>
                            <label className="label">Category</label>
                            <select className="input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                                {CATEGORY_OPTIONS.map((value) => (
                                    <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Priority</label>
                            <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                                {PRIORITY_OPTIONS.map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" loading={submitting}>Create ticket</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between px-1 pb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                        <HiTicket className="w-4 h-4" />
                        Your tickets
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{visibleTickets.length} total</div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        Loading tickets...
                    </div>
                ) : visibleTickets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        No tickets yet. Create one above to get started.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visibleTickets.map((ticket) => (
                            <div key={ticket.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                                            <Badge variant={statusVariant(ticket.status)} dot>{formatStatus(ticket.status)}</Badge>
                                            <Badge variant="purple">{ticket.category?.replace(/_/g, ' ')}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{ticket.description || 'No additional details provided.'}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><HiTicket className="w-3.5 h-3.5" />{ticket.ticket_id}</span>
                                            <span className="flex items-center gap-1"><HiClock className="w-3.5 h-3.5" />{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Just now'}</span>
                                            {ticket.priority && <span className="flex items-center gap-1"><HiExclamationTriangle className="w-3.5 h-3.5" />{ticket.priority}</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {(isAdmin || user?.role === 'agent') && (
                                            <>
                                                <select className="input min-w-[140px] py-2" value={ticket.status || 'open'} onChange={(e) => handleStatusChange(ticket, e.target.value)}>
                                                    {STATUS_OPTIONS.map((value) => (<option key={value} value={value}>{formatStatus(value)}</option>))}
                                                </select>
                                                <select className="input min-w-[120px] py-2" value={ticket.priority || 'medium'} onChange={(e) => handlePriorityChange(ticket, e.target.value)}>
                                                    {PRIORITY_OPTIONS.map((value) => (<option key={value} value={value}>{value}</option>))}
                                                </select>
                                            </>
                                        )}
                                        {ticket.status === 'resolved' && <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400"><HiCheckCircle className="w-4 h-4" />Resolved</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
