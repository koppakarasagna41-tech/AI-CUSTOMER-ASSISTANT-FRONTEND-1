/**
 * KnowledgePage.jsx
 *
 * Admin-facing knowledge-base management screen.
 * Supports uploading documents, browsing indexed items, and removing entries.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiDocumentText,
    HiCloudArrowUp,
    HiArrowPath,
    HiMagnifyingGlass,
    HiTag,
    HiTrash,
    HiCheckCircle,
    HiExclamationTriangle,
    HiClock,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import knowledgeService from '@/services/knowledgeService';
import { ROUTES } from '@/utils/constants';

const statusStyles = {
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    processing: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    pending: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
    failed: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
};

function StatusBadge({ status }) {
    const label = (status || 'pending').toLowerCase();
    const classes = statusStyles[label] || statusStyles.pending;

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
            {label === 'completed' ? <HiCheckCircle className="w-3.5 h-3.5" /> : null}
            {label === 'processing' ? <HiClock className="w-3.5 h-3.5" /> : null}
            {label === 'failed' ? <HiExclamationTriangle className="w-3.5 h-3.5" /> : null}
            {label === 'pending' ? <HiClock className="w-3.5 h-3.5" /> : null}
            {label}
        </span>
    );
}

export default function KnowledgePage() {
    const { isAdmin } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [form, setForm] = useState({
        file: null,
        category: 'general',
        description: '',
        tags: '',
    });

    async function loadDocuments() {
        try {
            const [docsResult, catsResult] = await Promise.all([
                knowledgeService.listDocuments({ page: 1, page_size: 20 }),
                knowledgeService.getCategories(),
            ]);

            const items = docsResult?.items ?? [];
            setDocuments(items);
            setCategories(catsResult?.data ?? catsResult ?? []);
        } catch (error) {
            toast.error(error?.message || 'Unable to load the knowledge base.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDocuments();
    }, []);

    const filteredDocuments = useMemo(() => {
        const query = search.trim().toLowerCase();
        return documents.filter((doc) => {
            const matchesSearch = !query || [doc.filename, doc.original_name, doc.description, doc.category].some((value) => (value || '').toLowerCase().includes(query));
            const matchesCategory = category === 'all' || doc.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [documents, search, category]);

    const summaryStats = useMemo(() => {
        const completed = documents.filter((doc) => (doc.status || '').toLowerCase() === 'completed').length;
        const processing = documents.filter((doc) => ['processing', 'pending'].includes((doc.status || '').toLowerCase())).length;
        return [
            { label: 'Documents', value: documents.length },
            { label: 'Ready for RAG', value: completed },
            { label: 'In progress', value: processing },
        ];
    }, [documents]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.file) {
            toast.error('Select a file to upload.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                category: form.category.trim() || 'general',
                description: form.description.trim() || undefined,
                tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
            };

            const result = await knowledgeService.uploadDocument(form.file, payload);
            toast.success(result?.message || 'Upload accepted. Processing will begin shortly.');
            setForm({ file: null, category: 'general', description: '', tags: '' });
            event.target.reset();
            await loadDocuments();
        } catch (error) {
            toast.error(error?.message || 'Upload failed.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(documentId) {
        try {
            await knowledgeService.deleteDocument(documentId);
            toast.success('Document removed from the knowledge base.');
            await loadDocuments();
        } catch (error) {
            toast.error(error?.message || 'Unable to delete this document.');
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-400">
                    <HiDocumentText className="w-4 h-4" />
                    Knowledge Base
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer knowledge center</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse the resources that power the AI assistant and continue the conversation when you need a human follow-up.</p>
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <HiDocumentText className="w-4 h-4 text-primary-600" />
                        Search the knowledge base
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use the filters below to find helpful articles, policies, and FAQs that the assistant can draw from.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Link to={ROUTES.CHAT} className="btn-primary">Ask the assistant</Link>
                        <button type="button" onClick={() => navigate(ROUTES.TICKETS)} className="btn-secondary">Create a ticket</button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        {summaryStats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/70">
                                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {isAdmin ? (
                <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <HiCloudArrowUp className="w-5 h-5 text-primary-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">Upload a document</h2>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            File
                            <input
                                type="file"
                                onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))}
                                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            />
                        </label>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                            <input
                                value={form.category}
                                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                                placeholder="general"
                                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            />
                        </label>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 lg:col-span-2">
                            Description
                            <textarea
                                value={form.description}
                                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                rows="3"
                                placeholder="Optional context for the document"
                                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            />
                        </label>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 lg:col-span-2">
                            Tags
                            <input
                                value={form.tags}
                                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                                placeholder="support, billing, faq"
                                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            />
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Supported formats: PDF, DOCX, TXT, CSV, JSON, and Markdown.</p>
                        <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-70">
                            <HiCloudArrowUp className="w-4 h-4" />
                            {submitting ? 'Uploading…' : 'Upload document'}
                        </button>
                    </div>
                </motion.form>
            ) : (
                <div className="card p-5 text-sm text-gray-600 dark:text-gray-400">Sign in with an admin account to upload content into the knowledge base.</div>
            )}

            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Indexed documents</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Browse documents currently available for retrieval.</p>
                    </div>

                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                            <HiMagnifyingGlass className="w-4 h-4" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search documents"
                                className="bg-transparent outline-none"
                            />
                        </label>

                        <select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                            <option value="all">All categories</option>
                            {categories.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>

                        <button type="button" onClick={() => loadDocuments()} className="btn-ghost flex items-center gap-2">
                            <HiArrowPath className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Loading knowledge documents…</div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="p-5 text-sm text-gray-500 dark:text-gray-400">No documents match the current filters yet.</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredDocuments.map((doc) => (
                            <div key={doc.document_id || doc.id} className="flex flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{doc.original_name || doc.filename}</h3>
                                        <StatusBadge status={doc.status} />
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">{doc.category || 'general'}</span>
                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">{doc.doc_type || 'document'}</span>
                                        {doc.total_chunks ? <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">{doc.total_chunks} chunks</span> : null}
                                    </div>

                                    {doc.description ? <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p> : null}

                                    {doc.tags?.length ? (
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <HiTag className="w-3.5 h-3.5" />
                                            {doc.tags.map((tag) => (
                                                <span key={tag} className="rounded-full border border-gray-200 px-2 py-0.5 dark:border-gray-700">{tag}</span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                {isAdmin ? (
                                    <button type="button" onClick={() => handleDelete(doc.document_id || doc.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-900/20">
                                        <HiTrash className="w-4 h-4" />
                                        Delete
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </motion.section>
        </div>
    );
}
