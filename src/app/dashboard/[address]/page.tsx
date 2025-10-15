"use client"
// import { ProfileType } from "@/app/profile/[address]/page";
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { Sparkles, Wallet, TrendingUp, Users, DollarSign, ArrowDownRight, MessageCircle, Coins } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { SecondaryAppbar } from "@/components/timefun/Appbar";
import { WalletButton } from "@/components/solana/solana-provider";
import { ProfileType, TokenHolding } from "@/lib/types";

export default function Dashboard() {
    const { creatorProfileAccounts, withdrawFromVaultHandler, sellTokensHandler, getVaultBalance } = useTimeFunProgram(); // getTokenAccount
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileType>();
    const [sellAmount, setSellAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [selectedCreator, setSelectedCreator] = useState<PublicKey | null>(null);
    const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreator, setIsCreator] = useState(false);
    const [vaultBalance, setVaultBalance] = useState(0);
    // const [totalWithdrawAmount, setTotalWithdrawAmount] = useState(0);

    // const params = useParams()
    // const address = useMemo(() => {
    //     if (!params.address) {
    //         return
    //     }
    //     try {
    //         return new PublicKey(params.address)
    //     } catch (e) {
    //         console.log(`Invalid public key`, e)
    //     }
    // }, [params])

    // Check if the current user is a creator
    useEffect(() => {
        (async() => {
            if (!publicKey || !creatorProfileAccounts?.data) return;
            
            const userCreatorProfile = creatorProfileAccounts.data.find(
                (filterProfile) => filterProfile.account.creator.equals(publicKey)
            );
            
            if (userCreatorProfile) {
                setIsCreator(true);
                setProfile(userCreatorProfile.account);
            }
        })()
    }, [publicKey, creatorProfileAccounts]);

    // Fetch vault balance for creators
    useEffect(() => {
        (async() => {
            if (isCreator && publicKey && getVaultBalance) {
                try {
                    const balance = await getVaultBalance(publicKey);
                    setVaultBalance(balance / LAMPORTS_PER_SOL);
                } catch (error) {
                    console.error("Error fetching vault balance:", error);
                    setVaultBalance(0);
                }
            }
        })()
    }, [isCreator, publicKey, getVaultBalance]);

    // Fetch all token holdings for the user
    useEffect(() => {
        const fetchTokenHoldings = async () => {
            if (!publicKey || !creatorProfileAccounts.data) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const holdings: TokenHolding[] = [];

            for (const profileAccount of creatorProfileAccounts.data) {
                try {
                    // Get user's token account for this creator
                    const tokenAccount = await getAssociatedTokenAddress(
                        profileAccount.account.creatorTokenMint, 
                        publicKey
                    );
                    
                    const acc = await connection.getTokenAccountBalance(tokenAccount);
                    const balance = acc.value.uiAmount;
                    
                    if (balance && balance > 0) {
                        const value = (profileAccount.account.basePerToken.toNumber() / LAMPORTS_PER_SOL) * balance;
                        
                        holdings.push({
                            creator: profileAccount.account.creator,
                            profile: profileAccount.account,
                            balance,
                            value
                        });
                    }
                } catch {
                    console.log(`No tokens for ${profileAccount.account.name}`);
                }
            }

            setTokenHoldings(holdings);
            setLoading(false);
        };

        fetchTokenHoldings();
    }, [publicKey, creatorProfileAccounts.data, connection]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!selectedCreator) return;
            
            const matchingProfile = creatorProfileAccounts.data?.find(
                (profile) => profile.account.creator.equals(selectedCreator)
            );
            
            if (matchingProfile) {
                setProfile(matchingProfile.account);
            }
        };
        
        if (selectedCreator && creatorProfileAccounts.data) {
            fetchProfile();
        }
    }, [selectedCreator, creatorProfileAccounts.data]);

    const handleSell = async() => {
        if (!publicKey || !selectedCreator || sellAmount <= 0) return;
        
        try {
            await sellTokensHandler.mutateAsync({ 
                sellerPubkey: publicKey, 
                creatorPubkey: selectedCreator, 
                amount: new BN(sellAmount) 
            });
            setSellAmount(0);
            setSelectedCreator(null);
        } catch (error) {
            console.error("Error selling tokens:", error);
        }
    };

    const handleWithdraw = async() => {
        if (!publicKey || withdrawAmount <= 0) return;
        
        try {
            await withdrawFromVaultHandler.mutateAsync({ 
                creatorPubkey: publicKey, 
                withdrawAmount: new BN(withdrawAmount * LAMPORTS_PER_SOL) 
            });
            setWithdrawAmount(0);
            
            // Refresh vault balance
            if (getVaultBalance) {
                const balance = await getVaultBalance(publicKey);
                setVaultBalance(balance / LAMPORTS_PER_SOL);
            }
        } catch (error) {
            console.error("Error withdrawing from vault:", error);
        }
    };
    
    const totalPortfolioValue = tokenHoldings.reduce((sum, holding) => sum + holding.value, 0);
    const totalTokens = tokenHoldings.reduce((sum, holding) => sum + holding.balance, 0);

    if (!publicKey) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Wallet className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                    <p className="text-gray-400">Please connect your wallet to view your dashboard</p>
                    <div className="flex justify-center">
                        <WalletButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <SecondaryAppbar />
            {/* Header */}
            <div className="bg-gradient-to-b from-pink-950/20 via-black to-black border-b border-pink-500/10">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-8 h-8 text-pink-400" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                            My Dashboard
                        </h1>
                    </div>

                    {/* Portfolio Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 border border-pink-500/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-pink-500/20 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-pink-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Total Value</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{totalPortfolioValue.toFixed(4)} SOL</p>
                            <p className="text-sm text-gray-500 mt-1">Portfolio worth</p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 border border-pink-500/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-pink-500/20 rounded-lg">
                                    <Users className="w-5 h-5 text-pink-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Creators</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{tokenHoldings.length}</p>
                            <p className="text-sm text-gray-500 mt-1">Following</p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 border border-pink-500/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-pink-500/20 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-pink-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Total Tokens</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{totalTokens.toFixed(0)}</p>
                            <p className="text-sm text-gray-500 mt-1">Owned</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Token Holdings List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-6 text-white">My Creator Tokens</h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
                            </div>
                        ) : tokenHoldings.length === 0 ? (
                            <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-12 border border-pink-500/20 text-center">
                                <Wallet className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold mb-2">No Tokens Yet</h3>
                                <p className="text-gray-400 mb-6">Start buying creator tokens to connect with your favorites!</p>
                                <button 
                                    onClick={() => router.push('/explore')}
                                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl font-semibold text-white shadow-lg shadow-pink-500/50 transition-all duration-300 transform hover:scale-105"
                                >
                                    Explore Creators
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tokenHoldings.map((holding) => (
                                    <div 
                                        key={holding.creator.toString()}
                                        className={`bg-gradient-to-br from-pink-950/10 to-purple-950/10 rounded-2xl border transition-all duration-300 cursor-pointer ${
                                            selectedCreator?.equals(holding.creator)
                                                ? 'border-pink-500 shadow-lg shadow-pink-500/50'
                                                : 'border-pink-500/20 hover:border-pink-500/40'
                                        }`}
                                        onClick={() => {
                                            setSelectedCreator(holding.creator);
                                            setProfile(holding.profile);
                                        }}
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-50"></div>
                                                    <Image 
                                                        src={holding.profile.image}
                                                        alt={holding.profile.name}
                                                        width={64}
                                                        height={64}
                                                        className="relative rounded-full border-2 border-pink-500/50 object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-1">{holding.profile.name}</h3>
                                                    <p className="text-sm text-gray-400 line-clamp-1">{holding.profile.bio}</p>
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 justify-end mb-1">
                                                        <Sparkles className="w-4 h-4 text-pink-400" />
                                                        <span className="text-2xl font-bold text-white">{holding.balance}</span>
                                                    </div>
                                                    <p className="text-sm text-pink-400 font-semibold">{holding.value.toFixed(4)} SOL</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/message/${holding.creator.toBase58()}`);
                                                    }}
                                                    className="flex-1 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    Message
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/profile/${holding.creator.toBase58()}`);
                                                    }}
                                                    className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-white font-medium transition-all duration-300"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side Panel - Sell Tokens or Withdraw */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Sell Tokens Panel */}
                            <div className="bg-gradient-to-br from-pink-950/30 to-purple-950/30 rounded-2xl p-6 border border-pink-500/30 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-pink-500/20 rounded-lg">
                                        <ArrowDownRight className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Sell Tokens</h2>
                                </div>

                                {!selectedCreator ? (
                                    <div className="text-center py-8">
                                        <TrendingUp className="w-12 h-12 text-pink-400 mx-auto mb-3 opacity-50" />
                                        <p className="text-gray-400 text-sm">Select a creator from your holdings to sell tokens</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-black/40 rounded-xl p-4 mb-4 border border-pink-500/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Image 
                                                    src={profile?.image ?? "/timefunImage.png"}
                                                    alt={profile?.name ?? ""}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <p className="font-semibold text-white">{profile?.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        You own: {tokenHoldings.find(h => h.creator.equals(selectedCreator))?.balance ?? 0} tokens
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-400">Price per token</span>
                                                <span className="text-lg font-bold text-white">
                                                    {profile?.basePerToken ? (profile.basePerToken.toNumber() / LAMPORTS_PER_SOL).toFixed(4) : "0"} SOL
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm text-gray-400 mb-2 block">Amount of tokens</label>
                                                <Input 
                                                    type="number"
                                                    value={sellAmount || ''}
                                                    onChange={(e) => setSellAmount(Number(e.target.value))}
                                                    placeholder="Enter amount..."
                                                    min="1"
                                                    max={tokenHoldings.find(h => h.creator.equals(selectedCreator))?.balance ?? 0}
                                                    className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12 text-lg"
                                                />
                                            </div>

                                            {sellAmount > 0 && profile && (
                                                <div className="bg-pink-500/10 rounded-lg p-3 border border-pink-500/20">
                                                    <div className="flex justify-between items-center text-sm mb-2">
                                                        <span className="text-gray-300">You&apos;ll receive:</span>
                                                        <span className="text-xl font-bold text-pink-400">
                                                            {((profile.basePerToken.toNumber() / LAMPORTS_PER_SOL) * sellAmount * 0.95).toFixed(4)} SOL
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        * 5% fee applied for selling tokens
                                                    </p>
                                                </div>
                                            )}

                                            <Button 
                                                type="button"
                                                onClick={handleSell}
                                                disabled={!publicKey || !selectedCreator || sellAmount <= 0}
                                                className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                                            >
                                                <ArrowDownRight className="w-5 h-5 mr-2" />
                                                {sellAmount <= 0 ? "Enter Amount" : "Sell Tokens"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Withdraw Panel - Only for Creators */}
                            {isCreator && (
                                <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-purple-500/20 rounded-lg">
                                            <Coins className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Withdraw Earnings</h2>
                                    </div>

                                    <div className="bg-black/40 rounded-xl p-4 mb-4 border border-purple-500/20">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Available Balance</span>
                                            <span className="text-2xl font-bold text-purple-400">
                                                {vaultBalance.toFixed(4)} SOL
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-gray-400 mb-2 block">Withdraw Amount (SOL)</label>
                                            <Input 
                                                type="number"
                                                value={withdrawAmount || ''}
                                                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                                                placeholder="Enter amount..."
                                                min="0"
                                                max={vaultBalance}
                                                step="0.01"
                                                className="bg-black/40 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-gray-500 rounded-xl h-12 text-lg"
                                            />
                                        </div>

                                        <Button 
                                            type="button"
                                            onClick={handleWithdraw}
                                            disabled={!publicKey || withdrawAmount <= 0 || withdrawAmount > vaultBalance}
                                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                                        >
                                            <Coins className="w-5 h-5 mr-2" />
                                            {withdrawAmount <= 0 ? "Enter Amount" : "Withdraw"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}