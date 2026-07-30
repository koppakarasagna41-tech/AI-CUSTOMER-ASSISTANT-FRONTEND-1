import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiChatBubbleLeftRight, HiClock, HiExclamationTriangle, HiPaperAirplane } from 'react-icons/hi2';

import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import Badge, { statusVariant } from '@/components/ui/Badge';
import historyService from '@/services/historyService';
import chatService from '@/services/chatService';
import { ROUTES } from '@/utils/constants';

function formatTimestamp(value) {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function ConversationDetailPage() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);

    const loadConversation = useCallback(async () => {
        if (!conversationId) return;

        try {
            setLoading(true);
            const data = await historyService.getHistory(conversationId);
            setConversation(data || null);
        } catch (error) {
            toast.error(error?.message || 'Unable to load conversation details.');
        } finally {
            setLoading(false);
        }
    }, [conversationId, toast]);

    useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    const groupedMessages = useMemo(() => {
        const messages = conversation?.messages ?? [];
        return {
            customer: messages.filter((message) => message.role === 'user'),
            ai: messages.filter((message) => message.role === 'assistant'),
            other: messages.filter((message) => message.role !== 'user' && message.role !== 'assistant'),
        };
    }, [conversation]);

    async function handleContinueChat(event) {
        event.preventDefault();
        const content = draft.trim();
        if (!content || !conversationId || sending) return;

        try {
            setSending(true);
            await chatService.sendMessage({ conversationId, content });
            setDraft('');
            await loadConversation();
            toast.success('Message sent.');
        } catch (error) {
            toast.error(error?.message || 'Unable to send the message.');
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        leftIcon={<HiArrowLeft className="w-4 h-4" />}
                        onClick={() => navigate(ROUTES.HISTORY)}
                    >
                        Back to history
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {conversation?.title || 'Conversation details'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {conversation?.conversation_id || conversationId}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Loading conversation…
                </div>
            ) : !conversation ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Conversation not found.
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center gap-2">
                                <HiChatBubbleLeftRight className="w-5 h-5 text-primary-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation transcript</h2>
                            </div>

                            <div className="mt-6 space-y-4">
                                <section>
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Customer messages</h3>
                                    {groupedMessages.customer.length === 0 ? (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No customer messages yet.</p>
                                    ) : (
                                        <div className="mt-3 space-y-3">
                                            {groupedMessages.customer.map((message) => (
                                                <div key={message.id} className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{message.content}</div>
                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(message.created_at)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AI responses</h3>
                                    {groupedMessages.ai.length === 0 ? (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No AI responses recorded yet.</p>
                                    ) : (
                                        <div className="mt-3 space-y-3">
                                            {groupedMessages.ai.map((message) => (
                                                <div key={message.id} className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{message.content}</div>
                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(message.created_at)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {groupedMessages.other.length > 0 && (
                                    <section>
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Other messages</h3>
                                        <div className="mt-3 space-y-3">
                                            {groupedMessages.other.map((message) => (
                                                <div key={message.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{message.content}</div>
                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(message.created_at)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation overview</h2>
                            <div className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                                    <Badge variant={statusVariant(conversation.status)} dot>
                                        {conversation.status || 'open'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Created</span>
                                    <span className="flex items-center gap-2">
                                        <HiClock className="w-4 h-4" />
                                        {formatTimestamp(conversation.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Messages</span>
                                    <span className="flex items-center gap-2">
                                        <HiChatBubbleLeftRight className="w-4 h-4" />
                                        {conversation.message_count ?? conversation.messages?.length ?? 0}
                                    </span>
                                </div>
                                {conversation.linked_tickets?.length > 0 && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                            <HiExclamationTriangle className="w-4 h-4" />
                                            <span className="font-medium">Linked tickets</span>
                                        </div>
                                        <ul className="mt-2 space-y-1 text-sm">
                                            {conversation.linked_tickets.map((ticket) => (
                                                <li key={ticket.ticket_id}>{ticket.subject}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Continue chatting</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Send a follow-up message in the same conversation.</p>
                            <form className="mt-4 space-y-3" onSubmit={handleContinueChat}>
                                <textarea
                                    rows={4}
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    placeholder="Ask a follow-up question..."
                                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                                <div className="flex items-center justify-end">
                                    <Button type="submit" loading={sending} leftIcon={<HiPaperAirplane className="w-4 h-4" />}>
                                        Send message
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
