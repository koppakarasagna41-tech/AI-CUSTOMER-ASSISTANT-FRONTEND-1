import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiPlus,
    HiTicket,
    HiExclamationTriangle,
    HiCheckCircle,
    HiClock,
    HiArrowPath,
    HiMagnifyingGlass,
    HiFunnel,
    HiArrowTopRightOnSquare,
    HiSparkles,
    HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import Badge, { statusVariant } from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import ticketService from '@/services/ticketService';
import chatService from '@/services/chatService';
import useDebounce from '@/hooks/useDebounce';

const CATEGORY_OPTIONS = ['technical', 'billing', 'refund', 'account', 'general_inquiry', 'complaint', 'feature_request'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

function formatStatus(value) {
    return String(value || 'open').replace(/_/g, ' ');
}

export default function TicketsPage() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { toast } = useToast();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [form, setForm] = useState({
        subject: '',
        description: '',
        category: 'general_inquiry',
        priority: 'medium',
    });
    const debouncedSearch = useDebounce(search, 300);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketService.listTickets({
                page: 1,
                page_size: 50,
                search: debouncedSearch.trim() || undefined,
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                category: categoryFilter || undefined,
            });
            setTickets(response?.items || []);
        } catch (error) {
            toast.error(error?.message || 'Unable to load tickets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, [debouncedSearch, statusFilter, priorityFilter, categoryFilter]);

    const visibleTickets = useMemo(() => tickets.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)), [tickets]);

    const ticketCategories = useMemo(() => {
        return Array.from(new Set(tickets.map((ticket) => ticket.category).filter(Boolean)));
    }, [tickets]);

    async function openTicketDetail(ticket) {
        try {
            setDetailLoading(true);
            const detail = await ticketService.getTicket(ticket.id || ticket.ticket_id);
            setSelectedTicket({ ...ticket, ...(detail?.data ?? detail ?? {}) });
        } catch (error) {
            setSelectedTicket(ticket);
            toast.error(error?.message || 'Unable to load ticket details.');
        } finally {
            setDetailLoading(false);
        }
    }

    async function refreshSelectedTicket() {
        if (!selectedTicket?.id && !selectedTicket?.ticket_id) return;
        await openTicketDetail(selectedTicket);
    }

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
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tickets</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track support requests, monitor status, and keep your conversations moving.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button variant="secondary" leftIcon={<HiArrowPath className="w-4 h-4" />} onClick={loadTickets}>
                        Refresh
                    </Button>
                    <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
                        Create Ticket
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
                <div className="relative lg:col-span-1">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search tickets, subjects, or IDs"
                        className="input pl-9"
                    />
                </div>

                <div className="relative">
                    <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="input pl-9 pr-8 appearance-none cursor-pointer"
                    >
                        <option value="">All statuses</option>
                        {STATUS_OPTIONS.map((value) => (
                            <option key={value} value={value}>{formatStatus(value)}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value)}
                        className="input pl-9 pr-8 appearance-none cursor-pointer"
                    >
                        <option value="">All priorities</option>
                        {PRIORITY_OPTIONS.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        className="input pl-9 pr-8 appearance-none cursor-pointer"
                    >
                        <option value="">All categories</option>
                        {ticketCategories.map((value) => (
                            <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
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

                    <form onSubmit={handleCreate} className="mt-6 grid gap-4 lg:grid-cols-2">
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
                        <div className="lg:col-span-2 flex justify-end">
                            <Button type="submit" loading={submitting}>Create ticket</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
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
                                <button
                                    key={ticket.id}
                                    type="button"
                                    onClick={() => openTicketDetail(ticket)}
                                    className={`w-full rounded-xl border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedTicket?.id === ticket.id ? 'border-primary-300 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
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

                                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket details</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">AI classification, timeline, and conversation links.</p>
                            </div>
                            {selectedTicket && (
                                <Button variant="secondary" size="sm" onClick={refreshSelectedTicket} loading={detailLoading}>
                                    Refresh
                                </Button>
                            )}
                        </div>

                        {!selectedTicket ? (
                            <div className="mt-5 rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                Select a ticket to inspect its details.
                            </div>
                        ) : (
                            <div className="mt-5 space-y-4">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{selectedTicket.subject}</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedTicket.description || 'No additional details provided.'}</p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <InfoPill label="Status" value={formatStatus(selectedTicket.status)} />
                                    <InfoPill label="Priority" value={selectedTicket.priority || 'medium'} />
                                    <InfoPill label="Category" value={(selectedTicket.category || 'general_inquiry').replace(/_/g, ' ')} />
                                    <InfoPill label="Assigned Agent" value={selectedTicket.assigned_agent?.name || selectedTicket.assigned_to?.name || selectedTicket.assigned_agent_name || 'Unassigned'} />
                                </div>

                                <div className="space-y-2">
                                    <SectionLabel label="AI Classification" />
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <InfoPill label="Intent" value={selectedTicket.intent || selectedTicket.ai_intent || selectedTicket.classification?.intent || 'Unavailable'} />
                                        <InfoPill label="Sentiment" value={selectedTicket.sentiment || selectedTicket.ai_sentiment || selectedTicket.classification?.sentiment || 'Unavailable'} />
                                        <InfoPill label="Confidence" value={selectedTicket.confidence != null ? `${Math.round(Number(selectedTicket.confidence) * 100)}%` : selectedTicket.classification?.confidence != null ? `${Math.round(Number(selectedTicket.classification.confidence) * 100)}%` : 'Unavailable'} />
                                        <InfoPill label="Priority Prediction" value={selectedTicket.priority_prediction || selectedTicket.predicted_priority || 'Unavailable'} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <SectionLabel label="Knowledge Sources" />
                                    {(selectedTicket.knowledge_sources || selectedTicket.sources || []).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {(selectedTicket.knowledge_sources || selectedTicket.sources || []).map((source, index) => (
                                                <span key={`${source?.title || source}-${index}`} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                    {source?.title || source?.name || source?.filename || source?.url || source}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No sources attached yet.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <SectionLabel label="Timeline & Comments" />
                                    {(selectedTicket.timeline || selectedTicket.history || selectedTicket.events || selectedTicket.comments) ? (
                                        <div className="space-y-3">
                                            {(selectedTicket.timeline || selectedTicket.history || selectedTicket.events || selectedTicket.comments || []).map((entry, index) => (
                                                <div key={entry.id || index} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.title || entry.status || entry.type || `Event ${index + 1}`}</p>
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{entry.message || entry.comment || entry.note || entry.description || String(entry)}</p>
                                                    <p className="mt-1 text-xs text-gray-400">{entry.created_at ? new Date(entry.created_at).toLocaleString() : entry.timestamp || ''}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Timeline data is not available from the current ticket payload.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <SectionLabel label="Conversation History" />
                                    {selectedTicket.conversation_id ? (
                                        <Button variant="secondary" leftIcon={<HiChatBubbleLeftRight className="w-4 h-4" />} onClick={() => navigate(`/history/${selectedTicket.conversation_id}`)}>
                                            View Conversation
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No linked conversation available.</p>
                                    )}
                                </div>

                                {(isAdmin || user?.role === 'agent') && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Button variant="secondary" size="sm" leftIcon={<HiSparkles className="w-4 h-4" />} onClick={() => ticketService.classifyTicket(selectedTicket.id || selectedTicket.ticket_id).then(refreshSelectedTicket)}>
                                            Re-classify
                                        </Button>
                                        {selectedTicket.conversation_id && (
                                            <Button variant="primary" size="sm" leftIcon={<HiArrowTopRightOnSquare className="w-4 h-4" />} onClick={() => navigate(`/chat?conversationId=${selectedTicket.conversation_id}`)}>
                                                Continue Chat
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

function InfoPill({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>
        </div>
    );
}

function SectionLabel({ label }) {
    return <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>;
}
