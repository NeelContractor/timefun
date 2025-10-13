// 'use client';

// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { useChatPolling } from '@/hooks/useChatPolling';
// import { useState } from 'react';
// import { useTimeFunProgram } from './timefun-data-access';
// import { PublicKey } from '@solana/web3.js';
// import { BN } from 'bn.js';

// export function ChatComponent({ creatorPubkey }: { creatorPubkey: string }) {
//     const wallet = useWallet();
//     const { connection } = useConnection();
//     const { program } = useTimeFunProgram();
//     const [message, setMessage] = useState('');
//     const messages = useChatPolling(wallet.publicKey?.toString() || '', creatorPubkey);

//     // Helper function to get PDAs
//     const getCreatorProfilePDA = (creatorPubkey: string) => {
//         const [pda] = PublicKey.findProgramAddressSync(
//             [Buffer.from('creator_profile'), new PublicKey(creatorPubkey).toBuffer()],
//             program.programId
//         );
//         return pda;
//     };

//     const getUserBalancePDA = (userPubkey: PublicKey, creatorPubkey: string) => {
//         const [pda] = PublicKey.findProgramAddressSync(
//             [
//                 Buffer.from('user_balance'),
//                 userPubkey.toBuffer(),
//                 new PublicKey(creatorPubkey).toBuffer()
//             ],
//             program.programId
//         );
//         return pda;
//     };

//     const sendMessage = async () => {
//         if (!wallet.publicKey || !wallet.signTransaction) {
//             alert('Please connect your wallet');
//             return;
//         }
    
//         if (!message.trim()) {
//             alert('Message cannot be empty');
//             return;
//         }
    
//         const wordCount = new BN(message.trim().split(/\s+/).filter(Boolean).length);
    
//         try {
//             // First verify sufficient balance
//             const verifyResponse = await fetch('/api/chat/verify', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     userPubkey: wallet.publicKey.toString(),
//                     creatorPubkey,
//                     wordCount: wordCount.toNumber(),
//                 }),
//             });
    
//             const verifyData = await verifyResponse.json();
            
//             if (!verifyData.canChat) {
//                 alert(`Insufficient words: need ${wordCount.toNumber()}, have ${verifyData.wordsAvailable || 0}`);
//                 return;
//             }
    
//             // Create and sign transaction
//             const tx = await program.methods
//                 .consumeWords(wordCount)
//                 .accountsPartial({
//                     creatorProfile: getCreatorProfilePDA(creatorPubkey),
//                     userBalance: getUserBalancePDA(wallet.publicKey, creatorPubkey),
//                     user: wallet.publicKey,
//                 })
//                 .transaction();
    
//             const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
//             tx.recentBlockhash = blockhash;
//             tx.feePayer = wallet.publicKey;
//             tx.lastValidBlockHeight = lastValidBlockHeight;
            
//             const signedTx = await wallet.signTransaction(tx);
//             const serializedTx = signedTx.serialize().toString('base64');
    
//             // Send to backend
//             const response = await fetch('/api/chat/send', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     userPubkey: wallet.publicKey.toString(),
//                     creatorPubkey,
//                     message: message.trim(),
//                     signedTransaction: serializedTx,
//                 }),
//             });
    
//             const data = await response.json();
    
//             if (response.ok && data.success) {
//                 setMessage('');
//             } else {
//                 alert(`Failed: ${data.error || 'Unknown error'}`);
//             }
//         } catch (error: any) {
//             console.error('Error sending message:', error);
//             alert(`Failed to send message: ${error.message || 'Unknown error'}`);
//         }
//     };

//     return (
//         <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
//             {/* Messages Display */}
//             <div className="flex-1 overflow-y-auto space-y-2 mb-4">
//                 {messages.length === 0 ? (
//                     <p className="text-gray-500">No messages yet. Start chatting!</p>
//                 ) : (
//                     messages.map((msg, i) => (
//                         <div
//                             key={i}
//                             className={`p-3 rounded-lg ${
//                                 msg.from === wallet.publicKey?.toString()
//                                     ? 'bg-blue-500 text-white ml-auto'
//                                     : 'bg-gray-200 text-black'
//                             } max-w-[70%]`}
//                         >
//                             <p className="text-xs opacity-70 mb-1">
//                                 {msg.from.slice(0, 4)}...{msg.from.slice(-4)}
//                             </p>
//                             <p>{msg.message}</p>
//                         </div>
//                     ))
//                 )}
//             </div>
            
//             {/* Input Area */}
//             <div className="flex gap-2">
//                 <input
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                     placeholder="Type your message..."
//                     className="flex-1 border rounded-lg px-4 py-2"
//                 />
//                 <button
//                     onClick={sendMessage}
//                     disabled={!message.trim()}
//                     className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
//                 >
//                     Send
//                 </button>
//             </div>

//             {/* Word Count Preview */}
//             <p className="text-sm text-gray-500 mt-2">
//                 Words: {message.trim().split(/\s+/).filter(Boolean).length}
//             </p>
//         </div>
//     );
// }

// // "use client"
// // import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// // import { Program } from '@coral-xyz/anchor';
// // import { useChatPolling } from '@/hooks/useChatPolling';
// // import { useState } from 'react';
// // import { useTimeFunProgram } from './timefun-data-access';

// // export function ChatComponent({ creatorPubkey }: { creatorPubkey: string }) {
// //     const wallet = useWallet();
// //     const { connection } = useConnection();
// //     const [message, setMessage] = useState('');
// //     const messages = useChatPolling(wallet.publicKey?.toString() || '', creatorPubkey);

// //     const sendMessage = async () => {
// //         if (!wallet.publicKey || !wallet.signTransaction) return;

// //         // Count words in message
// //         const wordCount = message.trim().split(/\s+/).length;

// //         // 1. Create consume_words transaction
// //         // const program = getProgram(); // Your Anchor program instance
// //         const { program } = useTimeFunProgram(); // Your Anchor program instance
// //         const tx = await program.methods
// //             .consumeWords(wordCount)
// //             .accounts({
// //                 creatorProfile: getCreatorProfilePDA(creatorPubkey),
// //                 userBalance: getUserBalancePDA(wallet.publicKey, creatorPubkey),
// //                 user: wallet.publicKey,
// //             })
// //             .transaction();

// //         // 2. Sign transaction with wallet
// //         const { blockhash } = await connection.getLatestBlockhash();
// //         tx.recentBlockhash = blockhash;
// //         tx.feePayer = wallet.publicKey;
        
// //         const signedTx = await wallet.signTransaction(tx);
// //         const serializedTx = signedTx.serialize().toString('base64');

// //         // 3. Send to backend API
// //         const response = await fetch('/api/chat/send', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify({
// //                 userPubkey: wallet.publicKey.toString(),
// //                 creatorPubkey,
// //                 message,
// //                 signedTransaction: serializedTx,
// //             }),
// //         });

// //         if (response.ok) {
// //             setMessage('');
// //             alert('Message sent!');
// //         } else {
// //             alert('Failed to send message');
// //         }
// //     };

// //     return (
// //         <div>
// //             <div className="messages">
// //                 {messages.map((msg, i) => (
// //                     <div key={i}>
// //                         <strong>{msg.from}:</strong> {msg.message}
// //                     </div>
// //                 ))}
// //             </div>
            
// //             <input
// //                 value={message}
// //                 onChange={(e) => setMessage(e.target.value)}
// //                 placeholder="Type your message..."
// //             />
// //             <button onClick={sendMessage}>Send</button>
// //         </div>
// //     );
// // }