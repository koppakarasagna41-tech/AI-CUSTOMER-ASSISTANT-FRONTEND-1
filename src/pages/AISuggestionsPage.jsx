import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiArrowPath, HiExclamationTriangle, HiChartBarSquare, HiChatBubbleLeftRight } from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import analyticsService from '@/services/analyticsService';
import sentimentService from '@/services/sentimentService';
import intentService from '@/services/intentService';

export default function AISuggestionsPage() {
    const { isAdmin, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [intentSummary, setIntentSummary] = useState(null);
    const [sentimentSummary, setSentimentSummary] = useState(null);
    const [intentLogs, setIntentLogs] = useState([]);
    const [sentimentLogs, setSentimentLogs] = useState([]);

    useEffect(() => {
        let mounted = true;

        async function loadInsights() {
            try {
                setLoading(true);
                const [metricsResponse, intentSummaryResponse, sentimentSummaryResponse, intentLogsResponse, sentimentLogsResponse] = await Promise.all([
                    analyticsService.getMetrics('last_30_days'),
                    intentService.getIntentSummary(),
                    sentimentService.getSentimentSummary(),
                    intentService.listIntentLogs({ page: 1, page_size: 10 }),
                    sentimentService.listSentimentLogs({ page: 1, page_size: 10 }),
                ]);

                if (!mounted) return;

                setMetrics(metricsResponse?.data ?? metricsResponse);
                setIntentSummary(intentSummaryResponse?.data ?? intentSummaryResponse);
                setSentimentSummary(sentimentSummaryResponse?.data ?? sentimentSummaryResponse);
                setIntentLogs(intentLogsResponse?.items ?? []);
                setSentimentLogs(sentimentLogsResponse?.items ?? []);
            } catch (error) {
                toast.error(error?.message || 'Unable to load AI insights.');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadInsights();
        return () => { mounted = false; };
    }, [toast]);

    const suggestions = useMemo(() => {
        const items = [];
        const negative = sentimentSummary?.negative ?? sentimentSummary?.very_negative ?? 0;
        const fallback = intentSummary?.fallback ?? intentSummary?.fallback_count ?? 0;
        const highTickets = metrics?.escalated_tickets?.value ?? 0;

        if (negative > 0) {
            items.push({ title: 'Review negative conversations', description: `${negative} conversations were tagged negative or very negative.`, tone: 'red' });
        }
        if (fallback > 0) {
            items.push({ title: 'Improve knowledge coverage', description: `${fallback} intent fallback events suggest missing guidance.`, tone: 'yellow' });
        }
        if (highTickets > 0) {
            items.push({ title: 'Prioritize escalations', description: `${highTickets} escalated tickets need attention from human agents.`, tone: 'purple' });
        }
        if (items.length === 0) {
            items.push({ title: 'AI looks healthy', description: 'No strong warning signals surfaced in the latest telemetry.', tone: 'green' });
        }
        return items;
    }, [intentSummary, metrics, sentimentSummary]);

    if (!isAdmin && user?.role !== 'agent') {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                <div className="card p-6 text-sm text-gray-600 dark:text-gray-300">AI suggestions are available to support agents and administrators.</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Suggestions</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Intent, sentiment, and resolution telemetry from the support system.</p>
                </div>
                <Button variant="secondary" leftIcon={<HiArrowPath className="w-4 h-4" />} onClick={() => window.location.reload()}>Refresh</Button>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Total Conversations" value={metrics?.total_conversations?.value ?? 0} icon={<HiChatBubbleLeftRight className="w-4 h-4" />} />
                <Metric label="AI Resolution Rate" value={`${Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100)}%`} icon={<HiSparkles className="w-4 h-4" />} />
                <Metric label="Escalations" value={metrics?.escalated_tickets?.value ?? 0} icon={<HiExclamationTriangle className="w-4 h-4" />} />
                <Metric label="Intent Types" value={Object.keys(intentSummary || {}).length} icon={<HiChartBarSquare className="w-4 h-4" />} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="card p-5 space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended actions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Suggested areas to review based on the latest data.</p>
                    </div>
                    <div className="space-y-3">
                        {suggestions.map((item) => (
                            <div key={item.title} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <Badge variant={item.tone === 'red' ? 'red' : item.tone === 'yellow' ? 'yellow' : item.tone === 'purple' ? 'purple' : 'green'}>Insight</Badge>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="card p-5 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Intent summary</h2>
                        <LogList items={Object.entries(intentSummary || {}).map(([key, value]) => ({ label: key, value }))} />
                    </div>

                    <div className="card p-5 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment summary</h2>
                        <LogList items={Object.entries(sentimentSummary || {}).map(([key, value]) => ({ label: key, value }))} />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <DataPanel title="Recent intent logs" items={intentLogs} emptyMessage="No intent logs available." />
                <DataPanel title="Recent sentiment logs" items={sentimentLogs} emptyMessage="No sentiment logs available." />
            </div>
            {loading && <div className="text-sm text-gray-500 dark:text-gray-400">Loading AI insights…</div>}
        </div>
    );
}

function Metric({ label, value, icon }) {
    return (
        <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 flex items-center justify-center">{icon}</div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function LogList({ items }) {
    return (
        <div className="space-y-2">
            {items.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No data yet.</p> : items.slice(0, 10).map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{String(item.value)}</span>
                </div>
            ))}
        </div>
    );
}

function DataPanel({ title, items, emptyMessage }) {
    return (
        <div className="card p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            {items.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id || item.intent_id || item.sentiment_id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                            <p className="font-medium text-gray-900 dark:text-white">{item.intent || item.sentiment || item.label || item.message || item.text || 'Log entry'}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.confidence != null ? `Confidence: ${Math.round(Number(item.confidence) * 100)}%` : ''}
                                {item.polarity_score != null ? ` ${item.polarity_score}` : ''}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}