import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowDownTray, HiDocumentText, HiCalendarDays, HiChartBarSquare } from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import reportsService from '@/services/reportsService';

const DEFAULT_PERIOD = 'last_30_days';

export default function ReportsPage() {
    const { isAdmin } = useAuth();
    const { toast } = useToast();
    const [period, setPeriod] = useState(DEFAULT_PERIOD);
    const [format, setFormat] = useState('pdf');
    const [reportInfo, setReportInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function loadReports() {
            try {
                const response = await reportsService.listReports();
                if (mounted) setReportInfo(response);
            } catch (error) {
                toast.error(error?.message || 'Unable to load report catalog.');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadReports();
        return () => { mounted = false; };
    }, [toast]);

    async function handleDownload(reportType) {
        try {
            setExporting(reportType);
            const response = await reportsService.exportReport(reportType, { period, format });
            const blob = response instanceof Blob ? response : new Blob([response]);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `${reportType}_${period}.${format}`;
            anchor.click();
            URL.revokeObjectURL(url);
            toast.success(`${reportType} report download started.`);
        } catch (error) {
            toast.error(error?.message || 'Unable to download report.');
        } finally {
            setExporting(null);
        }
    }

    if (!isAdmin) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                <div className="card p-6 text-sm text-gray-600 dark:text-gray-300">
                    Reports are available to administrators only.
                </div>
            </div>
        );
    }

    const reportTypes = reportInfo?.report_types ?? [];
    const periods = reportInfo?.periods ?? [DEFAULT_PERIOD];
    const formats = reportInfo?.formats ?? ['pdf', 'csv'];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Export analytics, conversations, and tickets as PDF or CSV.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="blue">PDF</Badge>
                    <Badge variant="green">CSV</Badge>
                </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SelectCard label="Period" value={period} onChange={setPeriod} options={periods} icon={<HiCalendarDays className="w-4 h-4" />} />
                <SelectCard label="Format" value={format} onChange={setFormat} options={formats} icon={<HiDocumentText className="w-4 h-4" />} />
                <InfoCard label="Available reports" value={reportTypes.length} icon={<HiChartBarSquare className="w-4 h-4" />} />
                <InfoCard label="Export format" value={format.toUpperCase()} icon={<HiArrowDownTray className="w-4 h-4" />} />
            </div>

            {loading ? (
                <div className="card p-6 text-sm text-gray-500 dark:text-gray-400">Loading report catalog…</div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                    {reportTypes.map((report) => (
                        <div key={report.type} className="card p-5 space-y-4">
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{report.label}</h2>
                                    <Badge variant="purple">{report.type}</Badge>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {report.formats.map((item) => <Badge key={item} variant={item === 'pdf' ? 'red' : 'green'}>{item.toUpperCase()}</Badge>)}
                            </div>

                            <Button loading={exporting === report.type} leftIcon={<HiArrowDownTray className="w-4 h-4" />} onClick={() => handleDownload(report.type)}>
                                Download {format.toUpperCase()}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SelectCard({ label, value, onChange, options, icon }) {
    return (
        <div className="card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">{icon}{label}</div>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="input">
                {options.map((option) => {
                    const nextValue = typeof option === 'string' ? option : option;
                    const optionLabel = typeof option === 'string' ? option : option.replace(/_/g, ' ');
                    return <option key={nextValue} value={nextValue}>{optionLabel}</option>;
                })}
            </select>
        </div>
    );
}

function InfoCard({ label, value, icon }) {
    return (
        <div className="card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">{icon}{label}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}