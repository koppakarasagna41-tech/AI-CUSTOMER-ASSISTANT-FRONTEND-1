import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiExclamationTriangle,
    HiMagnifyingGlass,
    HiArrowPath,
    HiTicket,
    HiClock,
    HiUser,
    HiCheckCircle,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import escalationService from '@/services/escalationService';

export default function EscalationPage() {
    const { isAdmin } = useAuth();
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [stateFilter, setStateFilter] = useState('');
    const [triggerFilter, setTriggerFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [search, setSearch] = useState('');
    const [assignment, setAssignment] = useState('');
    const [resolutionNote, setResolutionNote] = useState('');

    useEffect(() => {
        let mounted = true;

        async function loadQueue() {
            try {
                setLoading(true);
                const [queueResponse, summaryResponse] = await Promise.all([
                    escalationService.listEscalations({ page: 1, page_size: 50, state: stateFilter || undefined, trigger: triggerFilter || undefined, priority: priorityFilter || undefined, conversation_id: search.trim() || undefined }),
                    escalationService.getEscalationSummary(),
                ]);

                if (!mounted) return;
                setItems(queueResponse?.items ?? []);
                setSummary(summaryResponse?.data ?? summaryResponse);
            } catch (error) {
                toast.error(error?.message || 'Unable to load the escalation queue.');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadQueue();
        return () => { mounted = false; };
    }, [priorityFilter, search, stateFilter, toast, triggerFilter]);

    const visibleItems = useMemo(() => items.filter((item) => {
        const q = search.trim().toLowerCase();
        return !q || [item.escalation_id, item.conversation_id, item.trigger, item.priority, item.state].some((value) => String(value || '').toLowerCase().includes(q));
    }), [items, search]);

    async function openDetail(item) {
        try {
            setSelected(item);
            setDetailLoading(true);
            const detail = await escalationService.getEscalation(item.escalation_id || item.id);
            setSelected(detail?.data ?? detail ?? item);
        } catch (error) {
            toast.error(error?.message || 'Unable to load escalation details.');
        } finally {
            setDetailLoading(false);
        }
    }

    async function handleAssign() {
        if (!selected) return;
        try {
            await escalationService.assignEscalation(selected.escalation_id || selected.id, { assigned_to: assignment });
            toast.success('Escalation assigned.');
        } catch (error) {
            toast.error(error?.message || 'Unable to assign escalation.');
        }
    }

    async function handleResolve() {
        if (!selected) return;
        try {
            await escalationService.resolveEscalation(selected.escalation_id || selected.id, { resolution_note: resolutionNote });
            toast.success('Escalation resolved.');
            setResolutionNote('');
        } catch (error) {
            toast.error(error?.message || 'Unable to resolve escalation.');
        }
    }

    if (!isAdmin) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                <div className="card p-6 text-sm text-gray-600 dark:text-gray-300">Escalation queue management is available to administrators.</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Escalation Queue</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Monitor conversation escalations, assign owners, and resolve cases.</p>
                </div>
                <Button variant="secondary" leftIcon={<HiArrowPath className="w-4 h-4" />} onClick={() => window.location.reload()}>
                    Refresh
                </Button>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryStat label="Total Escalations" value={summary?.total ?? summary?.count ?? visibleItems.length} />
                <SummaryStat label="Open" value={summary?.open ?? 0} />
                <SummaryStat label="High / Critical" value={summary?.high ?? summary?.critical ?? 0} />
                <SummaryStat label="Resolved" value={summary?.resolved ?? 0} />
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
                <div className="relative xl:col-span-1">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by escalation or conversation id" className="input pl-9" />
                </div>
                <SelectFilter value={stateFilter} onChange={setStateFilter} label="State" options={['', 'open', 'in_progress', 'resolved', 'closed']} />
                <SelectFilter value={triggerFilter} onChange={setTriggerFilter} label="Trigger" options={['', 'negative_sentiment', 'very_negative', 'human_request', 'bounced', 'manual']} />
                <SelectFilter value={priorityFilter} onChange={setPriorityFilter} label="Priority" options={['', 'low', 'medium', 'high', 'critical']} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            <HiExclamationTriangle className="w-4 h-4" />
                            Active escalations
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{visibleItems.length} shown</div>
                    </div>

                    {loading ? <div className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">Loading escalations…</div> : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {visibleItems.map((item) => (
                                <button key={item.escalation_id || item.id} type="button" onClick={() => openDetail(item)} className={`w-full px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selected?.escalation_id === item.escalation_id ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.conversation_id || item.escalation_id}</p>
                                                <Badge variant={item.state === 'resolved' ? 'green' : item.state === 'closed' ? 'gray' : 'yellow'} dot>{item.state || 'open'}</Badge>
                                                <Badge variant="purple">{item.priority || 'medium'}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Trigger: {item.trigger || 'unknown'}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1"><HiTicket className="w-3.5 h-3.5" />{item.ticket_id || 'No ticket yet'}</span>
                                                <span className="flex items-center gap-1"><HiClock className="w-3.5 h-3.5" />{item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            {item.assigned_to ? <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 dark:border-gray-700"><HiUser className="w-3.5 h-3.5" />{item.assigned_to}</span> : null}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="space-y-4">
                    <div className="card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Escalation detail</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Assign or resolve the selected escalation.</p>
                            </div>
                            {detailLoading ? <span className="text-xs text-gray-400">Loading…</span> : null}
                        </div>

                        {!selected ? (
                            <div className="mt-5 rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Select an escalation to inspect it.</div>
                        ) : (
                            <div className="mt-5 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SummaryPill label="Conversation" value={selected.conversation_id || 'Unavailable'} />
                                    <SummaryPill label="Ticket" value={selected.ticket_id || 'Unavailable'} />
                                    <SummaryPill label="Trigger" value={selected.trigger || 'Unknown'} />
                                    <SummaryPill label="Priority" value={selected.priority || 'medium'} />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Evidence</p>
                                    <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{JSON.stringify(selected.evidence || selected.signal || selected, null, 2)}</pre>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Assign escalation</p>
                                    <Input value={assignment} onChange={(event) => setAssignment(event.target.value)} placeholder="Agent id or email" />
                                    <Button variant="secondary" onClick={handleAssign}>Assign</Button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Resolve escalation</p>
                                    <textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} rows="3" className="input min-h-24" placeholder="Add a resolution note" />
                                    <Button variant="primary" leftIcon={<HiCheckCircle className="w-4 h-4" />} onClick={handleResolve}>Mark resolved</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

function SummaryStat({ label, value }) {
    return <div className="card p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p></div>;
}

function SelectFilter({ label, value, onChange, options }) {
    return (
        <div className="relative">
            <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select value={value} onChange={(event) => onChange(event.target.value)} className="input pl-9 pr-8 cursor-pointer appearance-none">
                {options.map((option) => <option key={option} value={option}>{option || `All ${label.toLowerCase()}`}</option>)}
            </select>
        </div>
    );
}

function SummaryPill({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>
        </div>
    );
}