import {
    HiHome,
    HiChatBubbleLeftRight,
    HiClipboardDocumentList,
    HiTicket,
    HiBookOpen,
    HiChartBarSquare,
    HiCog6Tooth,
    HiSparkles,
    HiUsers,
    HiUserGroup,
    HiExclamationTriangle,
    HiArrowRightOnRectangle,
} from 'react-icons/hi2';

import { ROUTES, USER_ROLE } from './constants';

export function isStaffRole(role) {
    return role === USER_ROLE.ADMIN || role === USER_ROLE.AGENT;
}

export function getNavigationItems(role) {
    const baseItems = [
        { to: ROUTES.HOME, label: 'Home Dashboard', icon: HiHome },
        { to: ROUTES.CHAT, label: 'AI Chat', icon: HiChatBubbleLeftRight },
        { to: ROUTES.HISTORY, label: 'Conversation History', icon: HiClipboardDocumentList },
        { to: ROUTES.TICKETS, label: 'My Tickets', icon: HiTicket },
        { to: ROUTES.KNOWLEDGE, label: 'Knowledge Base', icon: HiBookOpen },
        { to: ROUTES.SETTINGS, label: 'Profile / Settings', icon: HiCog6Tooth },
    ];

    if (role === USER_ROLE.ADMIN) {
        return [
            { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: HiHome },
            { to: ROUTES.USERS, label: 'Users', icon: HiUsers },
            { to: ROUTES.AGENTS, label: 'Agents', icon: HiUserGroup },
            { to: ROUTES.ADMIN_KNOWLEDGE, label: 'Knowledge Base', icon: HiBookOpen },
            { to: ROUTES.ADMIN_ANALYTICS, label: 'Analytics', icon: HiChartBarSquare },
            { to: ROUTES.ADMIN_REPORTS, label: 'Reports', icon: HiChartBarSquare },
            { to: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: HiCog6Tooth },
        ];
    }

    if (role === USER_ROLE.AGENT) {
        return [
            { to: ROUTES.AGENT_DASHBOARD, label: 'Dashboard', icon: HiHome },
            { to: ROUTES.AGENT_TICKETS, label: 'Incoming Tickets', icon: HiTicket },
            { to: ROUTES.AGENT_ASSIGNED_TICKETS, label: 'Assigned Tickets', icon: HiUsers },
            { to: ROUTES.AGENT_HISTORY, label: 'Customer History', icon: HiClipboardDocumentList },
            { to: ROUTES.AI_SUGGESTIONS, label: 'AI Suggestions', icon: HiSparkles },
            { to: ROUTES.AGENT_ESCALATIONS, label: 'Escalation Queue', icon: HiExclamationTriangle },
            { to: ROUTES.AGENT_KNOWLEDGE, label: 'Knowledge Base', icon: HiBookOpen },
            { to: ROUTES.AGENT_ANALYTICS, label: 'Analytics', icon: HiChartBarSquare },
            { to: ROUTES.AGENT_REPORTS, label: 'Reports', icon: HiChartBarSquare },
            { to: ROUTES.AGENT_SETTINGS, label: 'Settings', icon: HiCog6Tooth },
        ];
    }

    return baseItems;
}

export const LOGOUT_NAV_ITEM = {
    label: 'Logout',
    icon: HiArrowRightOnRectangle,
};