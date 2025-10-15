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
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Clock, Circle, Loader2, ArrowLeft, Info, User } from "lucide-react";
import { WalletButton } from "@/components/solana/solana-provider";
import { ProfileType } from "@/lib/types";

type SenderType = { user: Record<string, never> } | { creator: Record<string, never> };

export default function Page() {
    const { conversationAccounts, creatorProfileAccounts, sendMessageHandler, creatorReplyBackHandler, messageAccounts } = useTimeFunProgram();
    const { publicKey } = useWallet();
    const [creatorProfile, setCreatorProfile] = useState<ProfileType>();
    const [userProfile, setUserProfile] = useState<ProfileType | null>(null);
    const [message, setMessage] = useState("");
    const [conversationPubkey, setConversationPubkey] = useState<PublicKey>();
    const [isCreatorMode, setIsCreatorMode] = useState(false);
    const [otherPersonKey, setOtherPersonKey] = useState<PublicKey>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const params = useParams()
    const address = useMemo(() => {
        console.log('Raw params:', params);
        console.log('params.address:', params.address);
        
        if (!params.address) {
            console.log('No address in params');
            return undefined;
        }
        
        try {
            const addressString = Array.isArray(params.address) ? params.address[0] : params.address;
            
            console.log('Extracted addressString:', addressString);
            
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

    // Fetch profiles and determine conversation participants
    useEffect(() => {
        const fetchProfiles = async () => {
            if (!address || !creatorProfileAccounts.data || !conversationAccounts.data || !publicKey) return;
            
            // Find if there's an existing conversation
            const conversation = conversationAccounts.data.find(
                (convo) => 
                    (convo.account.creator.equals(address) && convo.account.user.equals(publicKey)) ||
                    (convo.account.user.equals(address) && convo.account.creator.equals(publicKey))
            );
            
            if (conversation) {
                // Get the creator's profile
                const creator = creatorProfileAccounts.data.find(
                    (prof) => prof.account.creator.equals(conversation.account.creator)
                );
                
                if (creator) {
                    console.log('Found creator profile:', creator.account.name);
                    setCreatorProfile(creator.account);
                }

                // Check if the user also has a creator profile
                const user = creatorProfileAccounts.data.find(
                    (prof) => prof.account.creator.equals(conversation.account.user)
                );
                
                if (user) {
                    console.log('Found user creator profile:', user.account.name);
                    setUserProfile(user.account);
                } else {
                    setUserProfile(null);
                }

                // Determine if current user is in creator mode
                const amICreator = conversation.account.creator.equals(publicKey);
                setIsCreatorMode(amICreator);
                
                return;
            }
            
            // No conversation yet - check if the address is a creator
            const targetProfile = creatorProfileAccounts.data.find(
                (profile) => profile.account.creator.equals(address)
            );
            
            if (targetProfile) {
                console.log('Found target profile:', targetProfile.account.name);
                setCreatorProfile(targetProfile.account);
                setIsCreatorMode(false); // User mode by default when no conversation
            }

            // Check if address has a creator profile (for user info)
            const addressProfile = creatorProfileAccounts.data.find(
                (prof) => prof.account.creator.equals(address)
            );
            setUserProfile(addressProfile ? addressProfile.account : null);
        };
        
        fetchProfiles();
    }, [address, creatorProfileAccounts.data, conversationAccounts.data, publicKey]);

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
            } else if (creatorProfile) {
                // User sending message to creator
                await sendMessageHandler.mutateAsync({ 
                    creatorPubkey: creatorProfile.creator, 
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

    const isUserMessage = (senderType: SenderType) => {
        return 'user' in senderType;
    }

    // Get display info for the other person in conversation
    const getOtherPersonInfo = () => {
        if (isCreatorMode) {
            // I'm the creator, show user info
            if (userProfile) {
                return {
                    name: userProfile.name,
                    image: userProfile.image,
                    isCreator: true
                };
            } else if (otherPersonKey) {
                return {
                    name: otherPersonKey.toBase58().substring(0, 8) + "...",
                    image: null,
                    isCreator: false
                };
            }
        } else {
            // I'm the user, show creator info
            if (creatorProfile) {
                return {
                    name: creatorProfile.name,
                    image: creatorProfile.image,
                    isCreator: true
                };
            }
        }
        return {
            name: "Unknown",
            image: null,
            isCreator: false
        };
    };

    const otherPersonInfo = getOtherPersonInfo();

    // Calculate cost for current message (only for non-creators)
    const calculateMessageCost = useMemo(() => {
        if (!creatorProfile || !message.trim() || isCreatorMode) return null;
        
        const messageLength = message.length;
        const tokensRequired = Math.ceil(messageLength / creatorProfile.charsPerToken.toNumber());
        const costInSOL = (tokensRequired * creatorProfile.basePerToken.toNumber()) / 1e9;
        
        return { tokens: tokensRequired, sol: costInSOL };
    }, [message, creatorProfile, isCreatorMode]);

    // Early return after all hooks
    if (!address) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-pink-400">Error loading account</p>
                </div>
            </div>
        )
    }
        
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
                        <Link href={otherPersonInfo.isCreator ? `/profile/${address.toBase58()}` : "#"}>
                            <div className="relative cursor-pointer group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative">
                                    {otherPersonInfo.image ? (
                                        <Image 
                                            src={otherPersonInfo.image}
                                            alt={otherPersonInfo.name}
                                            width={56}
                                            height={56}
                                            className="rounded-full border-2 border-pink-500/50 object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full border-2 border-pink-500/50 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                                            <User className="w-8 h-8 text-pink-400" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                                </div>
                            </div>
                        </Link>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <Link href={otherPersonInfo.isCreator ? `/profile/${address.toBase58()}` : "#"}>
                                <h1 className="text-2xl font-bold text-white hover:text-pink-400 transition-colors cursor-pointer">
                                    {otherPersonInfo.name}
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

                        {/* Info Badge - Only show for creator profiles */}
                        {creatorProfile && !isCreatorMode && (
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                                <Clock className="w-4 h-4 text-pink-400" />
                                <div className="text-sm">
                                    <div className="text-gray-300 font-medium">
                                        {(creatorProfile.basePerToken.toNumber() / 1e9).toFixed(4)} SOL
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        per {creatorProfile.charsPerToken.toString()} chars
                                    </div>
                                </div>
                            </div>
                        )}
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
                                
                                // Determine avatar and name for the message
                                let messageAvatar = null;
                                let messageName = "";
                                
                                if (isMyMessage) {
                                    // My message - check if I'm a creator
                                    const myProfile = creatorProfileAccounts.data?.find(
                                        (prof) => prof.account.creator.equals(publicKey!)
                                    );
                                    if (myProfile) {
                                        messageAvatar = myProfile.account.image;
                                        messageName = myProfile.account.name;
                                    }
                                } else {
                                    // Other person's message
                                    if (isUser && userProfile) {
                                        messageAvatar = userProfile.image;
                                        messageName = userProfile.name;
                                    } else if (!isUser && creatorProfile) {
                                        messageAvatar = creatorProfile.image;
                                        messageName = creatorProfile.name;
                                    }
                                }
                                
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
                                                <div className="flex-shrink-0">
                                                    {messageAvatar ? (
                                                        <Image 
                                                            src={messageAvatar}
                                                            alt={messageName || "User"}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full border border-pink-500/30 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {isMyMessage 
                                                                ? (publicKey?.toBase58().substring(0, 2).toUpperCase() || "ME")
                                                                : <User className="w-6 h-6" />
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                
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
                                    Send your first message to {otherPersonInfo.name} and start connecting!
                                </p>
                                {creatorProfile && !isCreatorMode && (
                                    <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4 text-left">
                                        <div className="flex items-start gap-2 text-sm text-gray-400">
                                            <Info className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p>Messages cost <span className="text-pink-400 font-semibold">{creatorProfile.charsPerToken.toString()} characters</span> per token</p>
                                                <p className="mt-1">Each token costs <span className="text-pink-400 font-semibold">{(creatorProfile.basePerToken.toNumber() / 1e9).toFixed(4)} SOL</span></p>
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
                                (isCreatorMode && !conversationPubkey)
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
                            <div className="flex justify-center mt-2">
                                <WalletButton />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
