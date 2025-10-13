// // hooks/useChatSSE
// import { useEffect, useState } from "react";

// export function useChatSSE(userPubkey: string, creatorPubkey: string) {
//     const [messages, setMessages] = useState<any[]>([]);
  
//     useEffect(() => {
//         const eventSource = new EventSource(
//             `/api/chat/stream?user=${userPubkey}&creator=${creatorPubkey}`
//         );
    
//         eventSource.onmessage = (event) => {
//             const newMessages = JSON.parse(event.data);
//             setMessages(prev => [...prev, ...newMessages]);
//         };
    
//         eventSource.onerror = (error) => {
//             console.error('SSE error:', error);
//             eventSource.close();
//         };
    
//         return () => eventSource.close();
//     }, [userPubkey, creatorPubkey]);
  
//     return messages;
// }