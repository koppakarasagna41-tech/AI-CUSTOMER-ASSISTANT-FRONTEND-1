import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiMagnifyingGlass,
    HiUsers,
    HiTicket,
    HiChatBubbleLeftRight,
    HiEnvelope,
    HiArrowPath,
    HiArrowTopRightOnSquare,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import usersService from '@/services/usersService';
import ticketService from '@/services/ticketService';
import historyService from '@/services/historyService';
import { formatCount, timeAgo } from '@/utils/helpers';
import { ROUTES, USER_ROLE } from '@/utils/constants';

export default function CustomersPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectedConversations, setSelectedConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadUsers() {
            try {
                setLoading(true);
                const response = await usersService.listUsers({ page: 1, page_size: 100 });
                if (!mounted) return;
                setUsers((response?.items ?? []).map((item) => ({
                    ...item,
                    id: item.id || item.user_id,
                    name: item.full_name || item.name || item.email,
                })));
            } catch (error) {
                toast.error(error?.message || 'Unable to load customers.');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadUsers();
        return () => {
            mounted = false;
        };
    }, [toast]);

    const visibleUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return users.filter((item) => {
            const matchesSearch = !query || [item.name, item.email, item.role, item.company].filter(Boolean).some((value) => value.toLowerCase().includes(query));
            const matchesRole = !roleFilter || item.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [roleFilter, search, users]);

    async function openCustomerDetail(person) {
        try {
            setSelectedUser(person);
            setDetailLoading(true);
            const [ticketResponse, historyResponse] = await Promise.allSettled([
                ticketService.listTickets({ page: 1, page_size: 10, search: person.email || person.name }),
                historyService.listHistory({ page: 1, page_size: 10, search: person.email || person.name }),
            ]);

            const tickets = ticketResponse.status === 'fulfilled' ? (ticketResponse.value?.items ?? []) : [];
            const conversations = historyResponse.status === 'fulfilled' ? (historyResponse.value?.items ?? []) : [];
            setSelectedTickets(tickets);
            setSelectedConversations(conversations);
        } catch (error) {
            toast.error(error?.message || 'Unable to load customer details.');
        } finally {
            setDetailLoading(false);
        }
    }

    const totalCustomers = users.filter((item) => item.role === USER_ROLE.CUSTOMER).length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Search customer profiles, recent conversations, and ticket history.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" leftIcon={<HiArrowPath className="w-4 h-4" />} onClick={() => setSearch('')}>
                        Reset search
                    </Button>
                    <Button variant="primary" leftIcon={<HiUsers className="w-4 h-4" />} onClick={() => navigate(ROUTES.HOME)}>
                        Back to dashboard
                    </Button>
                </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Total Users" value={formatCount(users.length)} />
                <Stat label="Customers" value={formatCount(totalCustomers)} />
                <Stat label="Agents" value={formatCount(users.filter((item) => item.role === USER_ROLE.AGENT).length)} />
                <Stat label="Admins" value={formatCount(users.filter((item) => item.role === USER_ROLE.ADMIN).length)} />
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(1,minmax(0,1fr))]">
                <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, role, or company" className="input pl-9" />
                </div>
                <div className="relative">
                    <HiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="input pl-9 pr-8 appearance-none cursor-pointer">
                        <option value="">All roles</option>
                        <option value="customer">Customers</option>
                        <option value="agent">Agents</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            <HiUsers className="w-4 h-4" />
                            Customer directory
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{visibleUsers.length} shown</div>
                    </div>

                    {loading ? (
                        <div className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">Loading users…</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {visibleUsers.map((person) => (
                                <button key={person.id} type="button" onClick={() => openCustomerDetail(person)} className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedUser?.id === person.id ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                    <Avatar src={person.avatar} name={person.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">{person.name}</p>
                                            <Badge variant={person.role === USER_ROLE.ADMIN ? 'red' : person.role === USER_ROLE.AGENT ? 'purple' : 'blue'}>{person.role || 'customer'}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{person.email}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{timeAgo(person.updated_at || person.created_at)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="space-y-4">
                    <div className="card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer profile</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Previous activity and account details.</p>
                            </div>
                            {detailLoading ? <span className="text-xs text-gray-400">Loading…</span> : null}
                        </div>

                        {!selectedUser ? (
                            <div className="mt-5 rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Select a customer to review their profile.</div>
                        ) : (
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar src={selectedUser.avatar} name={selectedUser.name} size="lg" />
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Info label="Role" value={selectedUser.role || 'customer'} />
                                    <Info label="Plan" value={selectedUser.plan || 'Standard'} />
                                    <Info label="Joined" value={selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'Unavailable'} />
                                    <Info label="Last updated" value={selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : 'Unavailable'} />
                                </div>

                                <Section title="Recent Conversations" icon={<HiChatBubbleLeftRight className="w-4 h-4" />}>
                                    <div className="space-y-2">
                                        {selectedConversations.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No conversations found.</p> : selectedConversations.map((conversation) => (
                                            <button key={conversation.id || conversation.conversation_id} type="button" onClick={() => navigate(ROUTES.CONVERSATION_DETAIL.replace(':conversationId', conversation.conversation_id || conversation.id))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-sm transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{conversation.title || conversation.summary || conversation.conversation_id}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{conversation.messages_total || conversation.message_count || 0} messages</p>
                                            </button>
                                        ))}
                                    </div>
                                </Section>

                                <Section title="Recent Tickets" icon={<HiTicket className="w-4 h-4" />}>
                                    <div className="space-y-2">
                                        {selectedTickets.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No tickets found.</p> : selectedTickets.map((ticket) => (
                                            <button key={ticket.id || ticket.ticket_id} type="button" onClick={() => navigate(ROUTES.TICKETS)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-sm transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{ticket.subject || ticket.ticket_id}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.status || 'open'} · {ticket.priority || 'medium'}</p>
                                            </button>
                                        ))}
                                    </div>
                                </Section>

                                <Button variant="secondary" leftIcon={<HiArrowTopRightOnSquare className="w-4 h-4" />} onClick={() => navigate(ROUTES.TICKETS)}>
                                    Open tickets workspace
                                </Button>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {icon}
                {title}
            </div>
            {children}
        </div>
    );
}