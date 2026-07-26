/**
 * useScrollToBottom.js
 *
 * Returns a ref that, when attached to a scrollable container,
 * scrolls it to the bottom whenever `dependency` changes.
 *
 * Usage (chat window — scroll on new message):
 *   const bottomRef = useScrollToBottom(messages);
 *   return (
 *     <div className="overflow-y-auto">
 *       {messages.map(...)}
 *       <div ref={bottomRef} />
 *     </div>
 *   );
 */

import { useRef, useEffect } from 'react';

export function useScrollToBottom(dependency) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dependency]);

  return ref;
}

export default useScrollToBottom;
