"use client"
import { SecondaryAppbar } from "@/components/timefun/Appbar";
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Send, Clock, CheckCheck, Circle } from "lucide-react";

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

export default function Page() {
    const { conversationAccounts, creatorProfileAccounts, sendMessageHandler } = useTimeFunProgram();
    const { publicKey } = useWallet();
    const [profile, setProfile] = useState<ProfileType>();
    const [message, setMessage] = useState("");

    const params = useParams()
    const address = useMemo(() => {
        if (!params.address) {
            return
        }
        try {
            return new PublicKey(params.address)
        } catch (e) {
            console.log(`Invalid public key`, e)
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
        const fetchProfile = async () => {
            const matchingProfile = creatorProfileAccounts.data?.find(
                (profile) => profile.account.creator.equals(address)
            );
            
            if (matchingProfile) {
                setProfile(matchingProfile.account);
                console.log('Found profile:', matchingProfile.account);
            } else {
                console.log('Profile not found for address:', address.toBase58());
            }
        };
        
        if (address && creatorProfileAccounts.data) {
            fetchProfile();
        }
    }, [address, creatorProfileAccounts.data]);

    const handleSend = async() => {
        if (publicKey && profile && message.trim()) {
            await sendMessageHandler.mutateAsync({ 
                creatorPubkey: profile?.creator, 
                userPubkey: publicKey, 
                messageContent: message 
            });
            setMessage("");
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }
        
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <SecondaryAppbar />
            
            {/* Chat Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-pink-950/20 to-black border-b border-pink-500/20 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        {/* Profile Image with Status */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-50"></div>
                            <div className="relative">
                                <Image 
                                    src={profile?.image ?? "/timefunImage.png"}
                                    alt={profile?.name ?? "Creator"}
                                    width={60}
                                    height={60}
                                    className="rounded-full border-2 border-pink-500/50 object-cover"
                                />
                                {/* Online Status */}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">{profile?.name ?? "Loading..."}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                                <span>Active now</span>
                            </div>
                        </div>

                        {/* Info Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                            <Clock className="w-4 h-4 text-pink-400" />
                            <span className="text-sm text-gray-300">
                                {profile?.basePerToken ? `${(profile.basePerToken.toNumber() / 1e9).toFixed(2)} SOL/msg` : "Loading..."}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    {conversationAccounts.data?.
                        filter((convo) => 
                            convo.account.creator.equals(profile?.creator ?? PublicKey.default) && 
                            convo.account.user.equals(publicKey ?? PublicKey.default)
                        )
                        .map((convo) => (
                            <div key={convo.publicKey.toString()} className="space-y-4">
                                {/* This is where messages would be displayed */}
                                {/* Message bubbles will go here */}
                            </div>
                        ))
                    }

                    {/* Empty State */}
                    {(!conversationAccounts.data || conversationAccounts.data.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-12 border border-pink-500/20 text-center max-w-md">
                                <div className="w-20 h-20 mx-auto mb-6 bg-pink-500/10 rounded-full flex items-center justify-center">
                                    <Send className="w-10 h-10 text-pink-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Start the Conversation</h3>
                                <p className="text-gray-400 mb-6">
                                    Send your first message to {profile?.name} and start connecting!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Input Area - Fixed at Bottom */}
            <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent border-t border-pink-500/20 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    {/* Character Counter / Info */}
                    {message.length > 0 && (
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                                {message.length} characters
                            </span>
                            <span className="text-pink-400">
                                Cost: {profile?.basePerToken ? `${(profile.basePerToken.toNumber() / 1e9).toFixed(4)} SOL` : "..."}
                            </span>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Input 
                                id="message"
                                type="text" 
                                placeholder="Type your message..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-14 px-6 text-base transition-all duration-300 focus:ring-2 focus:ring-pink-500/50"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleSend}
                            disabled={!message.trim() || !publicKey}
                            className="h-14 px-8 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            <span className="hidden sm:inline">Send</span>
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
// // /message/[address]/page.tsx


// // import { ProfileType } from "@/app/profile/[address]/page";
// // import { CategoryType, useTimeFunProgram } from "@/components/timefun/timefun-data-access";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { PublicKey } from "@solana/web3.js";
// import BN from "bn.js";
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";

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

// export default function Page() {
//     const { conversationAccounts, creatorProfileAccounts, sendMessageHandler } = useTimeFunProgram();
//     const { publicKey } = useWallet();
//     const [profile, setProfile] = useState<ProfileType>();
//     const [message, setMessage] = useState("");

//     const params = useParams()
//     const address = useMemo(() => {
//         if (!params.address) {
//             return
//         }
//         try {
//             return new PublicKey(params.address)
//         } catch (e) {
//             console.log(`Invalid public key`, e)
//         }
//     }, [params])
    
//     if (!address) {
//         return <div>Error loading account</div>
//     }

//     useEffect(() => {
//         const fetchProfile = async () => {
//             // Find the matching profile
//             const matchingProfile = creatorProfileAccounts.data?.find(
//                 (profile) => profile.account.creator.equals(address) // Use .equals() to compare PublicKeys
//             );
            
//             if (matchingProfile) {
//                 setProfile(matchingProfile.account);
//                 console.log('Found profile:', matchingProfile.account);
//             } else {
//                 console.log('Profile not found for address:', address.toBase58());
//             }
//         };
        
//         if (address && creatorProfileAccounts.data) {
//             fetchProfile();
//         }
//     }, [address, creatorProfileAccounts.data]);

//     const handleSend = async() => {
//         // if (!publicKey && !profile?.creator) return;
//         if (publicKey && profile) {
//             await sendMessageHandler.mutateAsync({ creatorPubkey: profile?.creator, userPubkey: publicKey, messageContent: message });
//             setMessage("");
//         }
//     }
        
//     return (
//         <div>
//             {/* <p>particular message page</p> */}
//             <SecondaryAppbar />
//             <div >
//                 <div className="flex border-b border-pink-100 p-2 gap-5 px-10">
//                     <Image 
//                         src={profile?.image ?? "/timefunImage.png"}
//                         alt={"Image"}
//                         width={50}
//                         height={50}
//                         className="rounded-full"
//                     />
//                     <h1 className="text-xl font-bold text-center self-center">{profile?.name}</h1>
//                 </div>
//             </div>

//                 {/* Conversation below */}
//             <div className="h-full w-full">
//                 {conversationAccounts.data?.
//                     filter((convo) => convo.account.creator == profile?.creator && convo.account.user == publicKey)
//                     .map((convo) => (
//                         <div key={convo.publicKey.toString()}>
//                             {/* <div>{convo.account.}</div> */}
//                         </div>
//                     ))
//                 }
//             </div>

//             {/* // TODO bottom of the page */}
//             <div className="flex grid-cols-12 gap-2 max-h-screen"> 
//                 <Input 
//                     id="message"
//                     type="text" 
//                     placeholder="Message" 
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     className="bg-black/40 border-pink-500/30 col-span-10 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
//                 />
//                 <Button
//                     type="button"
//                     onClick={handleSend}
//                     className=" h-12 bg-gradient-to-r col-span-2 from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105"
//                 >
//                     Send
//                 </Button>
//             </div>
//         </div>
//     )
// }