/**
 * ChatPage.jsx
 *
 * Full-screen AI chat interface.
 * Wraps ChatWindow with ChatProvider so the conversation
 * state is scoped to this page only.
 */

import { ChatProvider } from '@/context/ChatContext';
import ChatWindow       from '@/components/chat/ChatWindow';

export default function ChatPage() {
  return (
    <ChatProvider>
      {/* 
        Use calc to fill the remaining viewport height minus the 
        sticky Navbar (h-16 = 4rem).
      */}
      <div className="h-[calc(100vh-4rem)]">
        <ChatWindow className="h-full" />
      </div>
    </ChatProvider>
  );
}
