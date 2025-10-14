"use client"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { Clock, Link2, MessageCircleMore, Sparkles, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CategoryType, useTimeFunProgram } from "@/components/timefun/timefun-data-access";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import BN from "bn.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAssociatedTokenAddress, Mint } from "@solana/spl-token";
import { SecondaryAppbar } from "@/components/timefun/Appbar";

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

interface TransactionData {
    signature: string;
    timestamp: number;
    amount: number | undefined;
    type: string;
}

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

// TODO: check if the type is correct
const getCategoryType = (category: Record<string, unknown> | null | undefined): String => {
    if (!category) return "Other";

    const typeKey = Object.keys(category)[0];
    
    switch (typeKey) {
      case 'timeFunTeam': return "TimeFunTeam";
      case 'founders': return "Founders";
      case 'influencers': return "Influencers";
      case 'investors': return "Investors";
      case 'designer': return "Designer";
      case 'athletes': return "Athletes";
      case 'solana': return "Solana";
      case 'musicians': return "Musicians";
      case 'media': return "Media";
      case 'other': return "Other";
      default: return "Other";
    }
};

export default function Profile() {
    const { creatorProfileAccounts, buyTokensHandler } = useTimeFunProgram();
    const { publicKey } = useWallet();
    const router = useRouter();
    const { connection } = useConnection();
    const [profile, setProfile] = useState<ProfileType>();
    const [activeTab, setActiveTab] = useState<TabsTypes>("about");  
    const [userATA, setUserATA] = useState<{address: string, balance: number} | null>(null);
    // const [transactions, setTransaction] = useState<any>(); // fix type
    const [amount, setAmount] = useState(0);
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    // const [creatorsMint, setCreatorsMint] = useState<Mint | null>(null);
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
        return <div>Error loading account</div>
    }

    useEffect(() => {
        const fetchProfile = async () => {
            // Find the matching profile
            const matchingProfile = creatorProfileAccounts.data?.find(
                (profile) => profile.publicKey.equals(address) // Use .equals() to compare PublicKeys
            );
            
            if (matchingProfile && publicKey) {
                setProfile(matchingProfile.account);
                // connection
                // await getTransactions(matchingProfile.account.creatorTokenMint, 10);
                console.log('Found profile:', matchingProfile.account);
            } else {
                console.log('Profile not found for address:', address.toBase58());
            }
        };
        
        if (address && creatorProfileAccounts.data) {
            fetchProfile();
        }
    }, [address, creatorProfileAccounts.data, publicKey]);

    useEffect(() => {
        const fetchProfile = async () => {
            // Find the matching profile
            const matchingProfile = creatorProfileAccounts.data?.find(
                (profile) => profile.publicKey.equals(address)
            );
            
            if (matchingProfile) {
                setProfile(matchingProfile.account);
                await getTransactions(matchingProfile.account.creatorTokenMint, 5);
                console.log('Found profile:', matchingProfile.account);
            } else {
                console.log('Profile not found for address:', address.toBase58());
            }
        };
        
        if (address && creatorProfileAccounts.data) {
            fetchProfile();
        }
    }, [address, creatorProfileAccounts.data]);

    const getTransactions = async(mintAddress: PublicKey, numTx: number) => {
        setLoadingTransactions(true);
        try {
            const signatures = await connection.getSignaturesForAddress(mintAddress, { limit: numTx });
            
            const transactionDetails = await Promise.all(
                signatures.map(async (sig) => {
                    try {
                        const tx = await connection.getParsedTransaction(sig.signature, {
                            maxSupportedTransactionVersion: 0
                        });
                        
                        if (!tx || !tx.meta || !tx.blockTime) return null;

                        // Parse token transfer information
                        let amount: number | undefined;
                        const postTokenBalances = tx.meta.postTokenBalances || [];
                        const preTokenBalances = tx.meta.preTokenBalances || [];
                        
                        // Calculate amount from balance changes
                        if (postTokenBalances.length > 0 && preTokenBalances.length > 0) {
                            const post = postTokenBalances[0]?.uiTokenAmount?.uiAmount || 0;
                            const pre = preTokenBalances[0]?.uiTokenAmount?.uiAmount || 0;
                            amount = Math.abs(post - pre);
                        }

                        return {
                            signature: sig.signature,
                            timestamp: tx.blockTime,
                            amount,
                            type: amount ? 'Token Purchase' : 'Transaction'
                        };
                    } catch (error) {
                        console.error(`Error fetching transaction ${sig.signature}:`, error);
                        return null;
                    }
                })
            );

            const validTransactions = transactionDetails.filter((tx): tx is TransactionData => tx !== null);
            setTransactions(validTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    }

    const fetchUserTokenAccount = async() => {
        if (!profile?.creatorTokenMint || !publicKey) return;
        
        try {
            const ata = await getAssociatedTokenAddress(
                profile.creatorTokenMint,
                publicKey
            );
            
            const accountInfo = await connection.getTokenAccountBalance(ata);
            
            setUserATA({
                address: ata.toBase58(),
                balance: accountInfo.value.uiAmount || 0
            });
        } catch (error) {
            console.error('Error fetching user ATA:', error);
            setUserATA({ address: '', balance: 0 });
        }
    };

    // useEffect(() => {
    //     const fetchProfile = async () => {
    //         const matchingProfile = creatorProfileAccounts.data?.find(
    //             (profile) => profile.publicKey.equals(address)
    //         );
            
    //         if (matchingProfile) {
    //             setProfile(matchingProfile.account);
    //             await getTransactions(matchingProfile.account.creatorTokenMint, 5);
    //             const mint = await getMint(connection, matchingProfile.account.creatorTokenMint);
    //             setCreatorsMint(mint);
    //             console.log('Found profile:', matchingProfile.account);
    //         }
    //     };
        
    //     if (address && creatorProfileAccounts.data) {
    //         fetchProfile();
    //     }
    // }, [address, creatorProfileAccounts.data]);
    
    useEffect(() => {
        if (profile?.creatorTokenMint && publicKey) {
            fetchUserTokenAccount();
        }
    }, [profile?.creatorTokenMint, publicKey]);
    

    // const getCreatorTokenBalance = async() => {
    //     if (!profile?.creatorTokenMint ) return;
    //     getAssociatedTokenAddress(profile?.creatorTokenMint, publicKey);
    // }

    const handleBuy = async () => {
        if (!publicKey || !profile?.creator || amount <= 0) {
            console.error('Missing required data for purchase');
            return;
        }
        try {
            await buyTokensHandler.mutateAsync({ 
                buyerPubkey: publicKey, 
                creatorPubkey: profile.creator, 
                amount: new BN(amount) 
            });
        } catch (error) {
            console.error('Error buying tokens:', error);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <SecondaryAppbar />
            {/* Hero Section with Gradient */}
            <div className="relative bg-gradient-to-b from-pink-950/20 via-black to-black">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    {/* Profile Header */}
                    <div className="flex justify-between">
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
                                        {getCategoryType(profile?.category)}
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

                        {/* Buy Tokens Section */}
                        <div className="flex">
                            <div className="w-full md:w-96 bg-gradient-to-br from-pink-950/30 to-purple-950/30 rounded-2xl p-6 border border-pink-500/30 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-pink-500/20 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Buy Creator Tokens</h2>
                                </div>
                                
                                <div className="bg-black/40 rounded-xl p-4 mb-4 border border-pink-500/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-400">Price per token</span>
                                        <span className="text-lg font-bold text-white">
                                            {profile?.basePerToken ? (profile.basePerToken.toNumber() / LAMPORTS_PER_SOL).toFixed(4) : "0"} SOL
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">You'll receive</span>
                                        <span className="text-sm font-semibold text-pink-400">
                                            {profile?.charsPerToken.toNumber() ?? 0} characters
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Amount of tokens</label>
                                        <Input 
                                            type="number"
                                            value={amount || ''}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            placeholder="Enter amount..."
                                            min="1"
                                            className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12 text-lg"
                                        />
                                    </div>

                                    {amount > 0 && (
                                        <div className="bg-pink-500/10 rounded-lg p-3 border border-pink-500/20">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">Total cost:</span>
                                                <span className="text-xl font-bold text-pink-400">
                                                    {profile?.basePerToken ? ((profile.basePerToken.toNumber() / LAMPORTS_PER_SOL) * amount).toFixed(4) : "0"} SOL
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm mt-1">
                                                <span className="text-gray-400">Characters:</span>
                                                <span className="text-white font-semibold">
                                                    {(profile?.charsPerToken.toNumber() ?? 0) * amount}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <Button 
                                        type="button"
                                        onClick={handleBuy}
                                        disabled={!publicKey || !profile || amount <= 0}
                                        className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                                    >
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        {!publicKey ? "Connect Wallet" : amount <= 0 ? "Enter Amount" : "Buy Tokens"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                            <div className="text-3xl font-bold text-white mt-2">
                                                <p>{profile?.totalSupply.toNumber() ?? 0}</p>
                                                {/* {JSON.stringify(transactions)} */}

                                                <div className="bg-black/40 rounded-xl p-6 border border-pink-500/20">
                                                    <h4 className="text-lg font-semibold text-gray-300 mb-4">Recent Transactions</h4>
                                                    {transactions && transactions.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {transactions.map((tx, i) => (
                                                                <div key={i} className="flex justify-between items-center p-3 bg-pink-950/20 rounded-lg">
                                                                    <div>
                                                                        <span className={`font-semibold ${tx.type === 'Token Purchase' ? 'text-green-400' : 'text-red-400'}`}>
                                                                            {tx.type}
                                                                        </span>
                                                                        <p className="text-sm text-gray-400">{tx.amount} tokens</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm text-gray-400">
                                                                            {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString() : 'N/A'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">{tx.signature.slice(0, 8)}...</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-400">No transactions found</p>
                                                    )}
                                                </div>

                                            </div>
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
                                <div>
                                    <button 
                                        className="px-8 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl font-semibold text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105"
                                        onClick={() => {
                                            router.push(`/message/${profile?.creator}`)
                                        }}
                                    >
                                        Send Message
                                    </button>
                                    <p className="text-sm py-1 text-center text-gray-500">your balance: {userATA ? userATA?.balance : 0}</p> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
