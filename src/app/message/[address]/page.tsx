"use client"
import { SecondaryAppbar } from "@/components/timefun/Appbar";
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Clock, Circle, Loader2, ArrowLeft, Info } from "lucide-react";

export type LastMessageFrom = { user: {} } | { creator: {} };

export interface ConversationAccountType {
    user: PublicKey;
    creator: PublicKey;
    lastMessageFrom: LastMessageFrom;
    lastMessageTime: BN;
    totalMessages: BN;
    bump: number;
}

export type CategoryType = 
  | { timeFunTeam: {} } 
  | { founders: {} } 
  | { influencers: {} } 
  | { investors: {} } 
  | { designer: {} } 
  | { athletes: {} } 
  | { solana: {} } 
  | { musicians: {} } 
  | { media: {} } 
  | { companies: {} } 
  | { other: {} };

export interface ProfileType {
    creator: PublicKey;
    name: string;
    bio: string;
    category: CategoryType;
    image: string;
    socialLink: string;
    creatorTokenMint: PublicKey;
    basePerToken: BN;
    charsPerToken: BN;
    totalSupply: BN;
    bump: number;
}

export interface MessageType {
    conversation: PublicKey;
    sender: PublicKey;
    messageContent: string;
    timestamp: BN;
    tokensBurned: BN;
    messageIndex: BN;
    senderType: { user: {} } | { creator: {} };
    bump: number;
}

export default function Page() {
    const { conversationAccounts, creatorProfileAccounts, sendMessageHandler, creatorReplyBackHandler, messageAccounts, getVaultBalance } = useTimeFunProgram();
    const { publicKey } = useWallet();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileType>();
    const [message, setMessage] = useState("");
    const [conversationPubkey, setConversationPubkey] = useState<PublicKey>();
    const [isCreatorMode, setIsCreatorMode] = useState(false);
    const [otherPersonKey, setOtherPersonKey] = useState<PublicKey>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [totalWithdrawAmount, setTotalWithdrawAmount] = useState(0);
    const [isCreator, setIsCreator] = useState(false);

    const params = useParams()
    const address = useMemo(() => {
        console.log('Raw params:', params);
        console.log('params.address:', params.address);
        console.log('Type of params.address:', typeof params.address);
        
        if (!params.address) {
            console.log('No address in params');
            return undefined;
        }
        
        try {
            // Handle both string and array cases
            const addressString = Array.isArray(params.address) ? params.address[0] : params.address;
            
            console.log('Extracted addressString:', addressString);
            console.log('Type of addressString:', typeof addressString);
            
            // Additional validation
            if (!addressString || typeof addressString !== 'string') {
                console.log('Invalid address format:', addressString);
                return undefined;
            }
            
            const pubkey = new PublicKey(addressString);
            console.log('Successfully created PublicKey:', pubkey.toBase58());
            return pubkey;
        } catch (e) {
            console.error('Error creating PublicKey:', e);
            return undefined;
        }
    }, [params])
    
    if (!address) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-pink-400">Error loading account</p>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (!publicKey || !creatorProfileAccounts.data) {
            setIsCreator(false);
            return;
        }

        const userProfile = creatorProfileAccounts.data.find(
            (prof) => prof.account.creator.equals(publicKey)
        );

        setIsCreator(!!userProfile);
        if (userProfile) {
            setProfile(userProfile.account);
        }
    }, [publicKey, creatorProfileAccounts.data]);

    // Fetch vault balance for creators
    useEffect(() => {
        const fetchVaultBalance = async () => {
            if (!publicKey || !isCreator || !getVaultBalance) return;

            try {
                const balance = await getVaultBalance(publicKey);
                setTotalWithdrawAmount(balance);
            } catch (error) {
                console.error("Error fetching vault balance:", error);
                setTotalWithdrawAmount(0);
            }
        };

        fetchVaultBalance();
    }, [publicKey, isCreator, getVaultBalance]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!address || !creatorProfileAccounts.data || !conversationAccounts.data || !publicKey) return;
            
            // First, check if there's a conversation
            const conversation = conversationAccounts.data.find(
                (convo) => 
                    (convo.account.creator.equals(address) && convo.account.user.equals(publicKey)) ||
                    (convo.account.user.equals(address) && convo.account.creator.equals(publicKey))
            );
            
            if (conversation) {
                // If conversation exists, find the creator's profile
                const creatorProfile = creatorProfileAccounts.data.find(
                    (prof) => prof.account.creator.equals(conversation.account.creator)
                );
                
                if (creatorProfile) {
                    console.log('Found creator profile from conversation:', creatorProfile.account.name);
                    setProfile(creatorProfile.account);
                    return;
                }
            }
            
            // Fallback: Try to find profile by address
            const matchingProfile = creatorProfileAccounts.data.find(
                (profile) => profile.account.creator.equals(address)
            );
            
            if (matchingProfile) {
                console.log('Found profile by address:', matchingProfile.account.name);
                setProfile(matchingProfile.account);
            } else {
                console.log('No profile found for address:', address.toBase58());
            }
        };
        
        fetchProfile();
    }, [address, creatorProfileAccounts.data, conversationAccounts.data, publicKey]);

    // Determine if current user is creator or regular user
    useEffect(() => {
        if (publicKey && profile) {
            const isCreator = publicKey.equals(profile.creator);
            setIsCreatorMode(isCreator);
        }
    }, [publicKey, profile]);

    // Find the conversation and determine the other person
    useEffect(() => {
        if (conversationAccounts.data && publicKey && address) {
            const conversation = conversationAccounts.data.find(
                (convo) => 
                    (convo.account.creator.equals(address) && convo.account.user.equals(publicKey)) ||
                    (convo.account.user.equals(address) && convo.account.creator.equals(publicKey))
            );
            
            if (conversation) {
                setConversationPubkey(conversation.publicKey);
                
                // Determine who the other person is
                const other = conversation.account.creator.equals(publicKey) 
                    ? conversation.account.user 
                    : conversation.account.creator;
                setOtherPersonKey(other);
            } else {
                // No conversation yet, the address param is the other person
                setOtherPersonKey(address);
            }
        }
    }, [conversationAccounts.data, publicKey, address]);

    // Filter messages for this conversation
    const conversationMessages = useMemo(() => {
        if (!messageAccounts.data || !conversationPubkey) return [];
        
        return messageAccounts.data
            .filter((msg) => msg.account.conversation.equals(conversationPubkey))
            .sort((a, b) => a.account.messageIndex.toNumber() - b.account.messageIndex.toNumber());
    }, [messageAccounts.data, conversationPubkey]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationMessages]);

    // Focus input after sending
    useEffect(() => {
        if (!sendMessageHandler.isPending && !creatorReplyBackHandler.isPending) {
            inputRef.current?.focus();
        }
    }, [sendMessageHandler.isPending, creatorReplyBackHandler.isPending]);

    const handleSend = async() => {
        if (!publicKey || !message.trim()) return;

        try {
            if (isCreatorMode && otherPersonKey) {
                // Creator replying to user
                await creatorReplyBackHandler.mutateAsync({
                    creatorPubkey: publicKey,
                    userPubkey: otherPersonKey,
                    messageContent: message
                });
            } else if (profile) {
                // User sending message to creator
                await sendMessageHandler.mutateAsync({ 
                    creatorPubkey: profile.creator, 
                    userPubkey: publicKey, 
                    messageContent: message 
                });
            }
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    const formatTimestamp = (timestamp: BN) => {
        const date = new Date(timestamp.toNumber() * 1000);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    const isUserMessage = (senderType: { user: {} } | { creator: {} }) => {
        return 'user' in senderType;
    }

    // Calculate cost for current message (only for non-creators)
    const calculateMessageCost = useMemo(() => {
        if (!profile || !message.trim() || isCreatorMode) return null;
        
        const messageLength = message.length;
        const tokensRequired = Math.ceil(messageLength / profile.charsPerToken.toNumber());
        const costInSOL = (tokensRequired * profile.basePerToken.toNumber()) / 1e9;
        
        return { tokens: tokensRequired, sol: costInSOL };
    }, [message, profile, isCreatorMode]);
        
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <SecondaryAppbar />
            
            {/* Chat Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-pink-950/20 to-black border-b border-pink-500/20 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <Link href="/message" className="group">
                            <div className="p-2 hover:bg-pink-500/10 rounded-xl transition-colors">
                                <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-pink-400 transition-colors" />
                            </div>
                        </Link>

                        {/* Profile Image with Status */}
                        <Link href={`/profile/${address.toBase58()}`}>
                            <div className="relative cursor-pointer group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative">
                                    <Image 
                                        src={profile?.image ?? "/timefunImage.png"}
                                        alt={profile?.name ?? "Creator"}
                                        width={56}
                                        height={56}
                                        className="rounded-full border-2 border-pink-500/50 object-cover"
                                    />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                                </div>
                            </div>
                        </Link>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <Link href={`/profile/${address.toBase58()}`}>
                                <h1 className="text-2xl font-bold text-white hover:text-pink-400 transition-colors cursor-pointer">
                                    {profile?.name ?? "Loading..."}
                                </h1>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                                <span>Active now</span>
                                {conversationMessages.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <span>{conversationMessages.length} messages</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Info Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                            <Clock className="w-4 h-4 text-pink-400" />
                            <div className="text-sm">
                                <div className="text-gray-300 font-medium">
                                    {profile?.basePerToken ? `${(profile.basePerToken.toNumber() / 1e9).toFixed(4)} SOL` : "..."}
                                </div>
                                <div className="text-xs text-gray-500">
                                    per {profile?.charsPerToken.toString()} chars
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent via-black/50 to-black">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    {conversationMessages.length > 0 ? (
                        <div className="space-y-6">
                            {conversationMessages.map((msg, index) => {
                                const isUser = isUserMessage(msg.account.senderType);
                                const isMyMessage = msg.account.sender.equals(publicKey ?? PublicKey.default);
                                
                                // Show date separator
                                const showDateSeparator = index === 0 || 
                                    new Date(msg.account.timestamp.toNumber() * 1000).toDateString() !== 
                                    new Date(conversationMessages[index - 1].account.timestamp.toNumber() * 1000).toDateString();

                                return (
                                    <div key={msg.publicKey.toString()}>
                                        {showDateSeparator && (
                                            <div className="flex items-center justify-center my-6">
                                                <div className="bg-pink-500/10 border border-pink-500/30 rounded-full px-4 py-1">
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(msg.account.timestamp.toNumber() * 1000).toLocaleDateString('en-US', { 
                                                            weekday: 'short', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex gap-3 max-w-[70%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Avatar */}
                                                {!isMyMessage && (
                                                    <div className="flex-shrink-0">
                                                        <Image 
                                                            src={profile?.image ?? "/timefunImage.png"}
                                                            alt={profile?.name ?? "Creator"}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full border border-pink-500/30"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Message Bubble */}
                                                <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                    <div 
                                                        className={`px-5 py-3 rounded-2xl shadow-lg ${
                                                            isMyMessage
                                                                ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-pink-500/30' 
                                                                : 'bg-gradient-to-br from-pink-950/40 to-purple-950/40 border border-pink-500/20 text-white shadow-purple-500/20'
                                                        }`}
                                                    >
                                                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                            {msg.account.messageContent}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Timestamp & Token Info */}
                                                    <div className={`flex items-center gap-2 mt-1 px-2 text-xs text-gray-500 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <span>{formatTimestamp(msg.account.timestamp)}</span>
                                                        {msg.account.tokensBurned.toNumber() > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-pink-400">
                                                                    {msg.account.tokensBurned.toNumber()} tokens
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* User Avatar */}
                                                {isMyMessage && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {publicKey?.toBase58().substring(0, 2).toUpperCase()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-12 border border-pink-500/20 text-center max-w-md">
                                <div className="w-20 h-20 mx-auto mb-6 bg-pink-500/10 rounded-full flex items-center justify-center">
                                    <Send className="w-10 h-10 text-pink-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Start the Conversation</h3>
                                <p className="text-gray-400 mb-6">
                                    Send your first message to {profile?.name} and start connecting!
                                </p>
                                {profile && (
                                    <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4 text-left">
                                        <div className="flex items-start gap-2 text-sm text-gray-400">
                                            <Info className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p>Messages cost <span className="text-pink-400 font-semibold">{profile.charsPerToken.toString()} characters</span> per token</p>
                                                <p className="mt-1">Each token costs <span className="text-pink-400 font-semibold">{(profile.basePerToken.toNumber() / 1e9).toFixed(4)} SOL</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Input Area - Fixed at Bottom */}
            <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent border-t border-pink-500/20 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    {/* Creator Mode Indicator */}
                    {isCreatorMode && (
                        <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-green-400">
                                <Circle className="w-2 h-2 fill-green-400" />
                                <span className="font-semibold">Creator Mode</span>
                                <span className="text-gray-400">
                                    {conversationPubkey 
                                        ? "- Replies are FREE (no tokens needed)" 
                                        : "- Waiting for user to send first message"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Message Cost Info (only for users, not creators) */}
                    {!isCreatorMode && message.length > 0 && calculateMessageCost && (
                        <div className="mb-3 p-3 bg-pink-500/5 border border-pink-500/20 rounded-xl">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400">
                                        <span className="text-pink-400 font-semibold">{message.length}</span> characters
                                    </span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-400">
                                        <span className="text-pink-400 font-semibold">{calculateMessageCost.tokens}</span> tokens required
                                    </span>
                                </div>
                                <span className="text-pink-400 font-semibold">
                                    {calculateMessageCost.sol.toFixed(4)} SOL
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Input 
                                ref={inputRef}
                                id="message"
                                type="text" 
                                placeholder="Type your message..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={sendMessageHandler.isPending || creatorReplyBackHandler.isPending}
                                className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-14 px-6 text-base transition-all duration-300 focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleSend}
                            disabled={
                                !message.trim() || 
                                !publicKey || 
                                sendMessageHandler.isPending || 
                                creatorReplyBackHandler.isPending ||
                                (isCreatorMode && !conversationPubkey) // Disable if creator and no conversation
                            }
                            className="h-14 px-8 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {(sendMessageHandler.isPending || creatorReplyBackHandler.isPending) ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="hidden sm:inline">Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span className="hidden sm:inline">{isCreatorMode ? 'Reply' : 'Send'}</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Wallet Connection Warning */}
                    {!publicKey && (
                        <div className="mt-3 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                            <p className="text-sm text-pink-400 text-center">
                                Please connect your wallet to send messages
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// "use client"
// import { SecondaryAppbar } from "@/components/timefun/Appbar";
// import { useTimeFunProgram } from "@/components/timefun/timefun-data-access";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { Connection, PublicKey } from "@solana/web3.js";
// import BN from "bn.js";
// import Image from "next/image";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { Send, Clock, Circle, Loader2, ArrowLeft, Info } from "lucide-react";
// import { getAssociatedTokenAddressSync } from "@solana/spl-token";

// export type LastMessageFrom = { user: {} } | { creator: {} };

// export interface ConversationAccountType {
//     user: PublicKey;
//     creator: PublicKey;
//     lastMessageFrom: LastMessageFrom;
//     lastMessageTime: BN;
//     totalMessages: BN;
//     bump: number;
// }

// export type CategoryType = 
//   | { timeFunTeam: {} } 
//   | { founders: {} } 
//   | { influencers: {} } 
//   | { investors: {} } 
//   | { designer: {} } 
//   | { athletes: {} } 
//   | { solana: {} } 
//   | { musicians: {} } 
//   | { media: {} } 
//   | { companies: {} } 
//   | { other: {} };

// export interface ProfileType {
//     creator: PublicKey;
//     name: string;
//     bio: string;
//     category: CategoryType;
//     image: string;
//     socialLink: string;
//     creatorTokenMint: PublicKey;
//     basePerToken: BN;
//     charsPerToken: BN;
//     totalSupply: BN;
//     bump: number;
// }

// export interface MessageType {
//     conversation: PublicKey;
//     sender: PublicKey;
//     messageContent: string;
//     timestamp: BN;
//     tokensBurned: BN;
//     messageIndex: BN;
//     senderType: { user: {} } | { creator: {} };
//     bump: number;
// }

// export const getTokenBalance = async (
//     connection: Connection,
//     mint: PublicKey,
//     owner: PublicKey
// ): Promise<number> => {
//     try {
//         const ata = getAssociatedTokenAddressSync(mint, owner);
//         const accountInfo = await connection.getAccountInfo(ata);
        
//         if (!accountInfo) {
//             return 0;
//         }

//         const balance = await connection.getTokenAccountBalance(ata);
//         return Number(balance.value.amount) / Math.pow(10, balance.value.decimals);
//     } catch (error) {
//         console.error("Error getting token balance:", error);
//         return 0;
//     }
// };

// export default function Page() {
//     const { conversationAccounts, creatorProfileAccounts, sendMessageHandler, messageAccounts, creatorReplyBackHandler } = useTimeFunProgram();
//     const { publicKey } = useWallet();
//     const router = useRouter();
//     const [profile, setProfile] = useState<ProfileType>();
//     const [message, setMessage] = useState("");
//     const [conversationPubkey, setConversationPubkey] = useState<PublicKey>();
//     const [isCreatorMode, setIsCreatorMode] = useState(false);
//     const [otherPersonKey, setOtherPersonKey] = useState<PublicKey>();
//     const messagesEndRef = useRef<HTMLDivElement>(null);
//     const inputRef = useRef<HTMLInputElement>(null);

//     const { connection } = useConnection();
//     const [userTokenBalance, setUserTokenBalance] = useState<number>(0);
//     const [isLoadingBalance, setIsLoadingBalance] = useState(false);

//     const params = useParams()
//     const address = useMemo(() => {
//         if (!params.address) {
//             return
//         }
//         try {
//             // Handle both string and array cases
//             const addressString = Array.isArray(params.address) ? params.address[0] : params.address;
//             return new PublicKey(addressString)
//         } catch (e) {
//             console.log(`Invalid public key`, e)
//         }
//     }, [params])
    
//     if (!address) {
//         return (
//             <div className="min-h-screen bg-black flex items-center justify-center">
//                 <div className="text-center">
//                     <p className="text-xl text-pink-400">Error loading account</p>
//                 </div>
//             </div>
//         )
//     }

//     useEffect(() => {
//         const fetchProfile = async () => {
//             const matchingProfile = creatorProfileAccounts.data?.find(
//                 (profile) => profile.account.creator.equals(address)
//             );
            
//             if (matchingProfile) {
//                 setProfile(matchingProfile.account);
//             }
//         };
        
//         if (address && creatorProfileAccounts.data) {
//             fetchProfile();
//         }
//     }, [address, creatorProfileAccounts.data]);

//     // Determine if current user is creator or regular user
//     useEffect(() => {
//         if (publicKey && profile) {
//             setIsCreatorMode(publicKey.equals(profile.creator));
//         }
//     }, [publicKey, profile]);

//     // Find the conversation
//     useEffect(() => {
//         if (conversationAccounts.data && publicKey && address) {
//             const conversation = conversationAccounts.data.find(
//                 (convo) => 
//                     (convo.account.creator.equals(address) && convo.account.user.equals(publicKey)) ||
//                     (convo.account.user.equals(address) && convo.account.creator.equals(publicKey))
//             );
            
//             if (conversation) {
//                 setConversationPubkey(conversation.publicKey);
                
//                 // Determine who the other person is
//                 const other = conversation.account.creator.equals(publicKey) 
//                     ? conversation.account.user 
//                     : conversation.account.creator;
//                 setOtherPersonKey(other);
//             } else {
//                 // No conversation yet, the address param is the other person
//                 setOtherPersonKey(address);
//             }
//         }
//     }, [conversationAccounts.data, publicKey, address]);

//     // Filter messages for this conversation
//     const conversationMessages = useMemo(() => {
//         if (!messageAccounts.data || !conversationPubkey) return [];
        
//         return messageAccounts.data
//             .filter((msg) => msg.account.conversation.equals(conversationPubkey))
//             .sort((a, b) => a.account.messageIndex.toNumber() - b.account.messageIndex.toNumber());
//     }, [messageAccounts.data, conversationPubkey]);

//     // Auto-scroll to bottom when new messages arrive
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [conversationMessages]);

//     // Focus input after sending
//     useEffect(() => {
//         if (!sendMessageHandler.isPending && !creatorReplyBackHandler.isPending) {
//             inputRef.current?.focus();
//         }
//     }, [sendMessageHandler.isPending]);

//     const handleSend = async() => {
//         if (!publicKey || !message.trim()) return;

//         console.log("isCreatorMode: ", isCreatorMode);
//         console.log("otherPersonKey: ", otherPersonKey?.toBase58());
//         try {
//             if (isCreatorMode && otherPersonKey) {
//                 // Creator replying to user
//                 await creatorReplyBackHandler.mutateAsync({
//                     creatorPubkey: publicKey,
//                     userPubkey: otherPersonKey,
//                     messageContent: message
//                 });
//             } else if (profile) {
//                 // User sending message to creator
//                 await sendMessageHandler.mutateAsync({ 
//                     creatorPubkey: profile.creator, 
//                     userPubkey: publicKey, 
//                     messageContent: message 
//                 });
//             }
//             setMessage("");
//         } catch (error) {
//             console.error("Error sending message:", error);
//         }
//     }

//     const handleKeyPress = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             handleSend();
//         }
//     }

//     const formatTimestamp = (timestamp: BN) => {
//         const date = new Date(timestamp.toNumber() * 1000);
//         const now = new Date();
//         const diffMs = now.getTime() - date.getTime();
//         const diffMins = Math.floor(diffMs / 60000);
//         const diffHours = Math.floor(diffMs / 3600000);
//         const diffDays = Math.floor(diffMs / 86400000);

//         if (diffMins < 1) return "Just now";
//         if (diffMins < 60) return `${diffMins}m ago`;
//         if (diffHours < 24) return `${diffHours}h ago`;
//         if (diffDays < 7) return `${diffDays}d ago`;
        
//         return date.toLocaleDateString();
//     }

//     const isUserMessage = (senderType: { user: {} } | { creator: {} }) => {
//         return 'user' in senderType;
//     }

//     // Calculate cost for current message
//     const calculateMessageCost = useMemo(() => {
//         if (!profile || !message.trim() || isCreatorMode) return null;
        
//         const messageLength = message.length;
//         const tokensRequired = Math.ceil(messageLength / profile.charsPerToken.toNumber());
//         const costInSOL = (tokensRequired * profile.basePerToken.toNumber()) / 1e9;
        
//         return { tokens: tokensRequired, sol: costInSOL };
//     }, [message, profile, isCreatorMode]);

//     useEffect(() => {
//         const fetchUserTokenAccount = async () => {
//             if (!publicKey || !profile?.creatorTokenMint) {
//                 setUserTokenBalance(0);
//                 return;
//             }
            
//             setIsLoadingBalance(true);
            
//             try {
//                 const ata = getAssociatedTokenAddressSync(
//                     profile.creatorTokenMint,
//                     publicKey
//                 );
    
//                 // First check if account exists
//                 const accountInfo = await connection.getAccountInfo(ata);
                
//                 if (!accountInfo) {
//                     // Account doesn't exist, user hasn't bought tokens yet
//                     setUserTokenBalance(0);
//                     setIsLoadingBalance(false);
//                     return;
//                 }
    
//                 // Account exists, fetch balance
//                 const tokenBalance = await connection.getTokenAccountBalance(ata);
//                 const balance = Number(tokenBalance.value.amount) / Math.pow(10, tokenBalance.value.decimals);
//                 setUserTokenBalance(balance);
                
//             } catch (error: any) {
//                 console.error("Error fetching token balance:", error);
                
//                 // Handle specific error types
//                 if (error?.message?.includes('could not find account') || 
//                     error?.message?.includes('Invalid param')) {
//                     // Token account not created yet
//                     setUserTokenBalance(0);
//                 } else {
//                     // Other errors, still set to 0 but log
//                     console.error("Unexpected error:", error);
//                     setUserTokenBalance(0);
//                 }
//             } finally {
//                 setIsLoadingBalance(false);
//             }
//         };
    
//         fetchUserTokenAccount();
//     }, [publicKey, profile?.creatorTokenMint, connection]);
        
//     return (
//         <div className="min-h-screen bg-black text-white flex flex-col">
//             <SecondaryAppbar />
            
//             {/* Chat Header */}
//             <div className="sticky top-0 z-10 bg-gradient-to-b from-pink-950/20 to-black border-b border-pink-500/20 backdrop-blur-md">
//                 <div className="max-w-5xl mx-auto px-6 py-4">
//                     <div className="flex items-center gap-4">
//                         {/* Back Button */}
//                         <Link href="/message" className="group">
//                             <div className="p-2 hover:bg-pink-500/10 rounded-xl transition-colors">
//                                 <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-pink-400 transition-colors" />
//                             </div>
//                         </Link>

//                         {/* Profile Image with Status */}
//                         <Link href={`/profile/${address.toBase58()}`}>
//                             <div className="relative cursor-pointer group">
//                                 <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
//                                 <div className="relative">
//                                     <Image 
//                                         src={profile?.image ?? "/timefunImage.png"}
//                                         alt={profile?.name ?? "Creator"}
//                                         width={56}
//                                         height={56}
//                                         className="rounded-full border-2 border-pink-500/50 object-cover"
//                                     />
//                                     <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
//                                 </div>
//                             </div>
//                         </Link>

//                         {/* Profile Info */}
//                         <div className="flex-1">
//                             <Link href={`/profile/${address.toBase58()}`}>
//                                 <h1 className="text-2xl font-bold text-white hover:text-pink-400 transition-colors cursor-pointer">
//                                     {profile?.name ?? "Loading..."}
//                                 </h1>
//                             </Link>
//                             <div className="flex items-center gap-2 text-sm text-gray-400">
//                                 <Circle className="w-2 h-2 fill-green-500 text-green-500" />
//                                 <span>Active now</span>
//                                 {conversationMessages.length > 0 && (
//                                     <>
//                                         <span>•</span>
//                                         <span>{conversationMessages.length} messages</span>
//                                     </>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Info Badge */}
//                         <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-xl">
//                             <Clock className="w-4 h-4 text-pink-400" />
//                             <div className="text-sm">
//                                 <div className="text-gray-300 font-medium">
//                                     {profile?.basePerToken ? `${(profile.basePerToken.toNumber() / 1e9).toFixed(4)} SOL` : "..."}
//                                 </div>
//                                 <div className="text-xs text-gray-500">
//                                     per {profile?.charsPerToken.toString()} chars
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Chat Messages Area */}
//             <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent via-black/50 to-black">
//                 <div className="max-w-5xl mx-auto px-6 py-8">
//                     {conversationMessages.length > 0 ? (
//                         <div className="space-y-6">
//                             {conversationMessages.map((msg, index) => {
//                                 const isUser = isUserMessage(msg.account.senderType);
//                                 const isMyMessage = msg.account.sender.equals(publicKey ?? PublicKey.default);
                                
//                                 // Show date separator
//                                 const showDateSeparator = index === 0 || 
//                                     new Date(msg.account.timestamp.toNumber() * 1000).toDateString() !== 
//                                     new Date(conversationMessages[index - 1].account.timestamp.toNumber() * 1000).toDateString();

//                                 return (
//                                     <div key={msg.publicKey.toString()}>
//                                         {showDateSeparator && (
//                                             <div className="flex items-center justify-center my-6">
//                                                 <div className="bg-pink-500/10 border border-pink-500/30 rounded-full px-4 py-1">
//                                                     <span className="text-xs text-gray-400">
//                                                         {new Date(msg.account.timestamp.toNumber() * 1000).toLocaleDateString('en-US', { 
//                                                             weekday: 'short', 
//                                                             month: 'short', 
//                                                             day: 'numeric' 
//                                                         })}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         )}
                                        
//                                         <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
//                                             <div className={`flex gap-3 max-w-[70%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
//                                                 {/* Avatar */}
//                                                 {!isMyMessage && (
//                                                     <div className="flex-shrink-0">
//                                                         <Image 
//                                                             src={profile?.image ?? "/timefunImage.png"}
//                                                             alt={profile?.name ?? "Creator"}
//                                                             width={40}
//                                                             height={40}
//                                                             className="rounded-full border border-pink-500/30"
//                                                         />
//                                                     </div>
//                                                 )}
                                                
//                                                 {/* Message Bubble */}
//                                                 <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
//                                                     <div 
//                                                         className={`px-5 py-3 rounded-2xl shadow-lg ${
//                                                             isMyMessage
//                                                                 ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-pink-500/30' 
//                                                                 : 'bg-gradient-to-br from-pink-950/40 to-purple-950/40 border border-pink-500/20 text-white shadow-purple-500/20'
//                                                         }`}
//                                                     >
//                                                         <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
//                                                             {msg.account.messageContent}
//                                                         </p>
//                                                     </div>
                                                    
//                                                     {/* Timestamp & Token Info */}
//                                                     <div className={`flex items-center gap-2 mt-1 px-2 text-xs text-gray-500 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
//                                                         <span>{formatTimestamp(msg.account.timestamp)}</span>
//                                                         {msg.account.tokensBurned.toNumber() > 0 && (
//                                                             <>
//                                                                 <span>•</span>
//                                                                 <span className="text-pink-400">
//                                                                     {msg.account.tokensBurned.toNumber()} tokens
//                                                                 </span>
//                                                             </>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 {/* User Avatar */}
//                                                 {isMyMessage && (
//                                                     <div className="flex-shrink-0">
//                                                         <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
//                                                             {publicKey?.toBase58().substring(0, 2).toUpperCase()}
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                             <div ref={messagesEndRef} />
//                         </div>
//                     ) : (
//                         /* Empty State */
//                         <div className="flex flex-col items-center justify-center py-20">
//                             <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-12 border border-pink-500/20 text-center max-w-md">
//                                 <div className="w-20 h-20 mx-auto mb-6 bg-pink-500/10 rounded-full flex items-center justify-center">
//                                     <Send className="w-10 h-10 text-pink-400" />
//                                 </div>
//                                 <h3 className="text-2xl font-bold mb-3">Start the Conversation</h3>
//                                 <p className="text-gray-400 mb-6">
//                                     Send your first message to {profile?.name} and start connecting!
//                                 </p>
//                                 {profile && (
//                                     <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4 text-left">
//                                         <div className="flex items-start gap-2 text-sm text-gray-400">
//                                             <Info className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
//                                             <div>
//                                                 <p>Messages cost <span className="text-pink-400 font-semibold">{profile.charsPerToken.toString()} characters</span> per token</p>
//                                                 <p className="mt-1">Each token costs <span className="text-pink-400 font-semibold">{(profile.basePerToken.toNumber() / 1e9).toFixed(4)} SOL</span></p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Message Input Area - Fixed at Bottom */}
//             <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent border-t border-pink-500/20 backdrop-blur-md">
//                 <div className="max-w-5xl mx-auto px-6 py-4">
//                     {/* Creator Mode Indicator */}
//                     {isCreatorMode && (
//                         <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
//                             <div className="flex items-center gap-2 text-sm text-green-400">
//                                 <Circle className="w-2 h-2 fill-green-400" />
//                                 <span className="font-semibold">Creator Mode</span>
//                                 <span className="text-gray-400">- Replies are FREE (no tokens needed)</span>
//                             </div>
//                         </div>
//                     )}

//                     {/* Message Cost Info (only for users, not creators) */}
//                     {!isCreatorMode && message.length > 0 && calculateMessageCost && (
//                         <div className="mb-3 p-3 bg-pink-500/5 border border-pink-500/20 rounded-xl">
//                             <div className="flex items-center justify-between text-sm">
//                                 <div className="flex items-center gap-4">
//                                     <span className="text-gray-400">
//                                         <span className="text-pink-400 font-semibold">{message.length}</span> characters
//                                     </span>
//                                     <span className="text-gray-600">•</span>
//                                     <span className="text-gray-400">
//                                         <span className="text-pink-400 font-semibold">{calculateMessageCost.tokens}</span> tokens required
//                                     </span>
//                                 </div>
//                                 <span className="text-pink-400 font-semibold">
//                                     {calculateMessageCost.sol.toFixed(4)} SOL
//                                 </span>
//                             </div>
//                         </div>
//                     )}

//                     <div className="flex gap-3">
//                         <div className="flex-1 relative">
//                             <Input 
//                                 ref={inputRef}
//                                 id="message"
//                                 type="text" 
//                                 placeholder="Type your message..." 
//                                 value={message}
//                                 onChange={(e) => setMessage(e.target.value)}
//                                 onKeyPress={handleKeyPress}
//                                 disabled={sendMessageHandler.isPending || creatorReplyBackHandler.isPending}
//                                 className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-14 px-6 text-base transition-all duration-300 focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50"
//                             />
//                         </div>
//                         <Button
//                             type="button"
//                             onClick={handleSend}
//                             disabled={!message.trim() || !publicKey || sendMessageHandler.isPending || creatorReplyBackHandler.isPending}
//                             className="h-14 px-8 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                         >
//                             {(sendMessageHandler.isPending || creatorReplyBackHandler.isPending) ? (
//                                 <>
//                                     <Loader2 className="w-5 h-5 animate-spin" />
//                                     <span className="hidden sm:inline">Sending...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <Send className="w-5 h-5" />
//                                     <span className="hidden sm:inline">{isCreatorMode ? 'Reply' : 'Send'}</span>
//                                 </>
//                             )}
//                         </Button>
//                     </div>

//                     {/* Wallet Connection Warning */}
//                     {!publicKey && (
//                         <div className="mt-3 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
//                             <p className="text-sm text-pink-400 text-center">
//                                 Please connect your wallet to send messages
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }
