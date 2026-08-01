import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export default function AdminLayout() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <MobileNav
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setMobileNavOpen(true)} />

                <motion.main
                    key="admin-content"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex-1 overflow-y-auto overflow-x-hidden"
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    );
}
