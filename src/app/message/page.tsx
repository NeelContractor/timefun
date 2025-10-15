"use client"
import { SecondaryAppbar } from "@/components/timefun/Appbar";
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, ChevronRight, Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BN from "bn.js";
import { WalletButton } from "@/components/solana/solana-provider";

type SenderType = { user: Record<string, never> } | { creator: Record<string, never> };

interface ConversationWithProfile {
    conversationPubkey: PublicKey;
    userPubkey: PublicKey;
    creatorPubkey: PublicKey;
    lastMessageTime: BN;
    totalMessages: BN;
    lastMessageFrom: SenderType;
    creatorProfile?: {
        name: string;
        image: string;
        bio: string;
    };
    lastMessage?: string;
}

export default function Page() {
    const { conversationAccounts, creatorProfileAccounts, messageAccounts } = useTimeFunProgram();
    const { publicKey } = useWallet();
    const [searchQuery, setSearchQuery] = useState("");
    const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);

    // Build conversations with profile data
    useEffect(() => {
        if (!conversationAccounts.data || !creatorProfileAccounts.data || !publicKey) return;

        const enrichedConversations: ConversationWithProfile[] = conversationAccounts.data
            .filter((convo) => 
                convo.account.user.equals(publicKey) || 
                convo.account.creator.equals(publicKey)
            )
            .map((convo) => {
                // Determine if current user is the creator or user
                const isCreator = convo.account.creator.equals(publicKey);
                const otherPersonKey = isCreator ? convo.account.user : convo.account.creator;

                // Find the other person's profile
                const otherProfile = creatorProfileAccounts.data?.find(
                    (profile) => profile.account.creator.equals(otherPersonKey)
                );

                // Find last message
                const conversationMessages = messageAccounts.data
                    ?.filter((msg) => msg.account.conversation.equals(convo.publicKey))
                    .sort((a, b) => b.account.messageIndex.toNumber() - a.account.messageIndex.toNumber());

                const lastMessage = conversationMessages?.[0]?.account.messageContent;

                return {
                    conversationPubkey: convo.publicKey,
                    userPubkey: convo.account.user,
                    creatorPubkey: convo.account.creator,
                    lastMessageTime: convo.account.lastMessageTime,
                    totalMessages: convo.account.totalMessages,
                    lastMessageFrom: convo.account.lastMessageFrom,
                    creatorProfile: otherProfile ? {
                        name: otherProfile.account.name,
                        image: otherProfile.account.image,
                        bio: otherProfile.account.bio,
                    } : undefined,
                    lastMessage,
                };
            })
            .sort((a, b) => b.lastMessageTime.toNumber() - a.lastMessageTime.toNumber());

        setConversations(enrichedConversations);
    }, [conversationAccounts.data, creatorProfileAccounts.data, messageAccounts.data, publicKey]);

    // Filter conversations by search
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        
        return conversations.filter((convo) => 
            convo.creatorProfile?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            convo.creatorProfile?.bio.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const formatTimestamp = (timestamp: BN) => {
        const date = new Date(timestamp.toNumber() * 1000);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const truncateMessage = (message: string, maxLength: number = 50) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    }

    if (!publicKey) {
        return (
            <div className="min-h-screen bg-black text-white">
                <SecondaryAppbar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                        <p className="text-gray-400">Please connect your wallet to view messages</p>
                        <div className="flex justify-center">
                            <WalletButton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <SecondaryAppbar />
            
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                        Messages
                    </h1>
                    <p className="text-gray-400">Your conversations with creators</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input 
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 bg-gradient-to-br from-pink-950/20 to-purple-950/20 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
                    />
                </div>

                {/* Conversations List */}
                {filteredConversations.length > 0 ? (
                    <div className="space-y-3">
                        {filteredConversations.map((convo) => {
                            const otherPersonKey = convo.creatorPubkey.equals(publicKey) 
                                ? convo.userPubkey 
                                : convo.creatorPubkey;
                            
                            const isLastFromMe = ('user' in convo.lastMessageFrom && convo.userPubkey.equals(publicKey)) ||
                                                ('creator' in convo.lastMessageFrom && convo.creatorPubkey.equals(publicKey));

                            return (
                                <Link
                                    key={convo.conversationPubkey.toString()}
                                    href={`/message/${otherPersonKey.toBase58()}`}
                                    className="block group"
                                >
                                    <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 border border-pink-500/20 rounded-2xl p-4 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                                        <div className="flex items-center gap-4">
                                            {/* Profile Image */}
                                            <div className="relative flex-shrink-0">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                                <div className="relative">
                                                    <Image 
                                                        src={convo.creatorProfile?.image ?? "/timefunImage.png"}
                                                        alt={convo.creatorProfile?.name ?? "User"}
                                                        width={56}
                                                        height={56}
                                                        className="rounded-full border-2 border-pink-500/30 object-cover"
                                                    />
                                                </div>
                                            </div>

                                            {/* Conversation Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="text-lg font-semibold text-white truncate">
                                                        {convo.creatorProfile?.name ?? otherPersonKey.toBase58().substring(0, 8)}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                        {formatTimestamp(convo.lastMessageTime)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-400 truncate flex-1">
                                                        {isLastFromMe && <span className="text-pink-400">You: </span>}
                                                        {convo.lastMessage ? truncateMessage(convo.lastMessage) : "Start a conversation..."}
                                                    </p>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded-full">
                                                            {convo.totalMessages.toString()} msgs
                                                        </span>
                                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-pink-400 transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-12 border border-pink-500/20 text-center max-w-md">
                            <div className="w-20 h-20 mx-auto mb-6 bg-pink-500/10 rounded-full flex items-center justify-center">
                                <Inbox className="w-10 h-10 text-pink-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">No Messages Yet</h3>
                            <p className="text-gray-400 mb-6">
                                {searchQuery 
                                    ? "No conversations match your search."
                                    : "Start connecting with creators to see your messages here!"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}