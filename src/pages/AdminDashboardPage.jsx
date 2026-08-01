import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiHome,
    HiUsers,
    HiUserGroup,
    HiBookOpen,
    HiChartBarSquare,
    HiClipboardDocumentList,
    HiCog6Tooth,
    HiArrowRight,
    HiSparkles,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import StatCard from '@/components/ui/StatCard';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: 'easeOut' },
});

const adminCards = [
    { to: ROUTES.USERS, label: 'Manage Users', description: 'Create and review customer and agent accounts.', icon: HiUsers, color: 'blue' },
    { to: ROUTES.KNOWLEDGE, label: 'Knowledge Base', description: 'Publish and maintain support content.', icon: HiBookOpen, color: 'green' },
    { to: ROUTES.ANALYTICS, label: 'Analytics', description: 'Review product and support trends.', icon: HiChartBarSquare, color: 'purple' },
    { to: ROUTES.REPORTS, label: 'Reports', description: 'Inspect operational and compliance reporting.', icon: HiClipboardDocumentList, color: 'amber' },
];

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const quickStats = useMemo(() => [
        { label: 'Admin Workspace', value: 'Ready', icon: HiHome, color: 'blue' },
        { label: 'Managed Users', value: 'All roles', icon: HiUserGroup, color: 'green' },
        { label: 'Knowledge Base', value: 'Live', icon: HiBookOpen, color: 'purple' },
        { label: 'Settings', value: 'Configured', icon: HiCog6Tooth, color: 'amber' },
    ], []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <motion.div {...fadeUp(0)} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                            <HiSparkles className="h-4 w-4" />
                            Admin Dashboard
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            Manage users, knowledge, analytics, and reports from one secure workspace.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {mounted ? 'System ready for administration' : 'Loading workspace'}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((card, index) => (
                    <motion.div key={card.label} {...fadeUp(index * 0.05)}>
                        <StatCard label={card.label} value={card.value} icon={card.icon} color={card.color} />
                    </motion.div>
                ))}
            </div>

            <motion.div {...fadeUp(0.1)} className="grid gap-4 lg:grid-cols-2">
                {adminCards.map((card, index) => (
                    <Link
                        key={card.to}
                        to={card.to}
                        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="inline-flex rounded-2xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{card.label}</h2>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                            </div>
                            <HiArrowRight className="mt-1 h-5 w-5 text-gray-400" />
                        </div>
                    </Link>
                ))}
            </motion.div>
        </div>
    );
}
