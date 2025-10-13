// // hooks/useChatPolling.ts
// import { useEffect, useState } from 'react';

// export function useChatPolling(userPubkey: string, creatorPubkey: string) {
//     const [messages, setMessages] = useState<any[]>([]);
//     const [lastMessageId, setLastMessageId] = useState('0');

//     useEffect(() => {
//         // Poll every 2 seconds (adjust based on your needs)
//         const interval = setInterval(async () => {
//             try {
//                 const response = await fetch(
//                     `/api/chat/messages?user=${userPubkey}&creator=${creatorPubkey}&lastMessageId=${lastMessageId}`
//                 );
//                 const data = await response.json();
                
//                 if (data.messages.length > 0) {
//                     setMessages(prev => [...prev, ...data.messages]);
//                     setLastMessageId(data.messages[data.messages.length - 1].id);
//                 }
//             } catch (error) {
//                 console.error('Error polling messages:', error);
//             }
//         }, 2000);

//         return () => clearInterval(interval);
//     }, [userPubkey, creatorPubkey, lastMessageId]);

//     return messages;
// }