"use client"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useParams } from "next/navigation"
import { useEffect, useMemo } from "react"
import { Clock, Link2, MessageCircleMore, MessageCircleMoreIcon, Sparkles, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CategoryType, useTimeFunProgram } from "@/components/timefun/timefun-data-access";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import BN from "bn.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TabsTypes = "about" | "market" | "activity";

interface Tab {
    id: TabsTypes;
    name: string;
}

const tabs: Tab[] = [
    {id: "about", name: "About Me"},
    {id: "market", name: "Market"},
    {id: "activity", name: "Activity"},
];

export interface ProfileType {
    creator: PublicKey;
    name: string;
    bio: string;
    // longBio: string;
    category: CategoryType;
    image: string;
    socialLink: string;
    creatorTokenMint: PublicKey;
    basePerToken: BN;
    charsPerToken: BN;
    totalSupply: BN;
    bump: number;
}

// const getCategoryType = (category: any) => {
//     const typeKey = Object.keys(category)[0];
    
//     switch (typeKey) {
//       case 'timeFunTeam': return "TimeFunTeam";
//       case 'founders': return "Founders";
//       case 'influencers': return "Influencers";
//       case 'investors': return "Investors";
//       case 'designer': return "Designer";
//       case 'athletes': return "Athletes";
//       case 'solana': return "Solana";
//       case 'musicians': return "Musicians";
//       case 'media': return "Media";
//       case 'other': return "Other";
//       default: return "Other";
//     }
// };

export default function Profile() {
    const { creatorProfileAccounts } = useTimeFunProgram();
    // const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [profile, setProfile] = useState<ProfileType>();
    const params = useParams()
    const address = useMemo(() => {
        if (!params.address) {
            return
        }
        try {
            // console.log(params);
            // console.log(params.address);
            return new PublicKey(params.address)
        } catch (e) {
            console.log(`Invalid public key`, e)
        }
    }, [params])
    if (!address) {
        return <div>Error loading account</div>
    }

    // useEffect(() => {
    //     const fetchProfile = async() => {
    //         await creatorProfileAccounts.data
    //             ?.filter((filteredProfile) => filteredProfile.publicKey === address)
    //             .map((profile) => {
    //                 console.log(profile)
    //                 setProfile(profile.account)
    //             });
    //     }
    //     fetchProfile();
    // }, [])
    const [transactions, setTransaction] = useState<any>(); // fix type

    useEffect(() => {
        const fetchProfile = async () => {
            // Find the matching profile
            const matchingProfile = creatorProfileAccounts.data?.find(
                (profile) => profile.publicKey.equals(address) // Use .equals() to compare PublicKeys
            );
            
            if (matchingProfile) {
                setProfile(matchingProfile.account);
                // connection
                await getTransactions(matchingProfile.account.creatorTokenMint, 10);
                console.log('Found profile:', matchingProfile.account);
            } else {
                console.log('Profile not found for address:', address.toBase58());
            }
        };
        
        if (address && creatorProfileAccounts.data) {
            fetchProfile();
        }
    }, [address, creatorProfileAccounts.data]);

    // TODO: test this functionality
    const getTransactions = async(address: PublicKey, numTx: number) => {
        const pubKey = new PublicKey(address);
        let transactionList = await connection.getSignaturesForAddress(pubKey, {limit:numTx});
        transactionList.forEach((transaction, i) => {
            // const date = new Date(transaction.blockTime*1000);
            console.log(`Full data: ${transaction}`);
            console.log(`Transaction No: ${i+1}`);
            console.log(`Signature: ${transaction.signature}`);
            // console.log(`Time: ${date}`);
            console.log(`Status: ${transaction.confirmationStatus}`);
            console.log(("-").repeat(20));
        })
    }

    const [activeTab, setActiveTab] = useState<TabsTypes>("about");

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section with Gradient */}
            <div className="relative bg-gradient-to-b from-pink-950/20 via-black to-black">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Image with Glow Effect */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
                            <div className="relative">
                                <Image 
                                    src={profile?.image ?? "/timefunImage.png"} 
                                    alt={profile?.name ?? "Profile"} 
                                    width={220} 
                                    height={220} 
                                    className="rounded-2xl border-2 border-pink-500/50 object-cover"
                                />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                                    {profile?.name ?? "Loading..."}
                                </h1>
                                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/50">
                                    {/* {getCategoryType(profile?.category)} */}
                                </span>
                            </div>

                            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                                {profile?.bio ?? "No bio available"}
                            </p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap gap-6 pt-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-pink-950/30 rounded-lg border border-pink-500/20">
                                    <Users className="w-5 h-5 text-pink-400" />
                                    <span className="text-sm text-gray-300">
                                        <span className="font-bold text-white">{profile?.totalSupply.toNumber() ?? 0}</span> tokens
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-pink-950/30 rounded-lg border border-pink-500/20">
                                    <TrendingUp className="w-5 h-5 text-pink-400" />
                                    <span className="text-sm text-gray-300">
                                        <span className="font-bold text-white">{profile?.basePerToken ? (profile.basePerToken.toNumber() / LAMPORTS_PER_SOL).toFixed(3) : "0"}</span> SOL
                                    </span>
                                </div>
                            </div>

                            {/* Social Link */}
                            {profile?.socialLink && (
                                <Link 
                                    target="_blank" 
                                    href={profile.socialLink} 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500 rounded-lg transition-all duration-300 group"
                                >
                                    <Link2 className="w-4 h-4 text-pink-400 group-hover:text-pink-300" />
                                    <span className="text-sm text-pink-400 group-hover:text-pink-300">Social Link</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/** TODO: add buy tokens to other users */}
                    {/* <div className="flex justify-end">
                        <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-8 border border-pink-500/20">
                            <h1 className="text-2xl font-bold">Buy Creator's Tokens</h1>
                            <h3 className="py-3 text-center text-xl font-semibold">10 Chars for 0.1 SOL</h3>
                            <Input 
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(Number(e.target.value))
                                }}
                                className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
                            />
                            <Button 
                                type="button"
                                onClick={handleBuy}
                                className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 my-2"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Buy Tokens
                            </Button>
                        </div>
                    </div> */}

                    {/* Tabs */}
                    <div className="flex gap-2 mt-12 border-b border-gray-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-6 py-3 text-lg font-semibold transition-all duration-300 ${
                                    activeTab === tab.id 
                                        ? "text-white" 
                                        : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                {tab.name}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-600 to-pink-400"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-8 min-h-[200px]">
                        {activeTab === "about" && (
                            <div className="bg-gradient-to-br from-pink-950/10 to-purple-950/10 rounded-2xl p-8 border border-pink-500/10">
                                <h3 className="text-2xl font-bold mb-4 text-pink-100">About</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {profile?.bio ?? "No information available"}
                                </p>
                            </div>
                        )}

                        {activeTab === "market" && (
                            <div className="bg-gradient-to-br from-pink-950/10 to-purple-950/10 rounded-2xl p-8 border border-pink-500/10">
                                <h3 className="text-2xl font-bold mb-6 text-pink-100">Market Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-black/40 rounded-xl p-6 border border-pink-500/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-pink-500/20 rounded-lg">
                                                <TrendingUp className="w-6 h-6 text-pink-400" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-gray-300">Base Token Price</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-white">
                                            {profile?.basePerToken ? (profile.basePerToken.toNumber() / LAMPORTS_PER_SOL).toFixed(4) : "0"} SOL
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            per {profile?.charsPerToken.toNumber() ?? 0} characters
                                        </p>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-6 border border-pink-500/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-pink-500/20 rounded-lg">
                                                <Clock className="w-6 h-6 text-pink-400" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-gray-300">Characters per Token</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-white">
                                            {profile?.charsPerToken.toNumber() ?? 0}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">characters available</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "activity" && (
                            <div className="bg-gradient-to-br from-pink-950/10 to-purple-950/10 rounded-2xl p-8 border border-pink-500/10">
                                <h3 className="text-2xl font-bold mb-6 text-pink-100">Activity</h3>
                                <div className="bg-black/40 rounded-xl p-6 border border-pink-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-500/20 rounded-lg">
                                            <Users className="w-6 h-6 text-pink-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-300">Total Token Supply</h4>
                                            <p className="text-3xl font-bold text-white mt-2">
                                                {profile?.totalSupply.toNumber() ?? 0}
                                                {transactions}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-8 border border-pink-500/20">
                    <h2 className="text-3xl font-bold mb-2">
                        Get access to <span className="text-pink-400">{profile?.name}</span>
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Use your purchased tokens to connect with {profile?.name}
                    </p>

                    <div className="bg-black/40 rounded-2xl border border-pink-500/30 hover:border-pink-500 transition-all duration-300 overflow-hidden group">
                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <MessageCircleMore className="w-10 h-10 text-pink-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-2">Direct Message</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        Send a direct message for a quick connection. Keep the conversation going with additional messages if needed
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-pink-950/40 to-purple-950/40 px-8 py-6 border-t border-pink-500/20">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Message Price</p>
                                    <p className="text-2xl font-bold text-white">
                                        {profile?.basePerToken ? (profile.basePerToken.toNumber() / LAMPORTS_PER_SOL).toFixed(4) : "0"} SOL
                                    </p>
                                    <p className="text-sm text-pink-400">
                                        for {profile?.charsPerToken.toNumber() ?? 0} characters
                                    </p>
                                </div>
                                <button className="px-8 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl font-semibold text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}