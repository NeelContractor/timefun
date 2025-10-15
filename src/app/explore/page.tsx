"use client"
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, Users } from "lucide-react";
// import { ProfileType } from "../profile/[address]/page";
import { CategoryType, ProfileType } from "@/lib/types";

export default function Explore() {
    const { creatorProfileAccounts } = useTimeFunProgram();

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-pink-950/30 via-black to-black border-b border-pink-500/10">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full mb-4">
                            <Sparkles className="w-4 h-4 text-pink-400" />
                            <span className="text-sm text-pink-400 font-semibold">Discover Creators</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
                            Explore TimeFun
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Connect with amazing creators and unlock exclusive access to their time
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {creatorProfileAccounts.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                        </div>
                        <p className="mt-6 text-gray-400 text-lg">Loading creators...</p>
                    </div>
                ) : creatorProfileAccounts.data?.length ? (
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-200">
                                All Creators <span className="text-pink-400">({creatorProfileAccounts.data.length})</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {creatorProfileAccounts.data?.map((profile) => (
                                <CreatorCard 
                                    key={profile.publicKey.toString()} 
                                    account={profile.publicKey} 
                                    profile={profile.account} 
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-12 border border-pink-500/20 text-center max-w-md">
                            <div className="w-20 h-20 mx-auto mb-6 bg-pink-500/10 rounded-full flex items-center justify-center">
                                <Users className="w-10 h-10 text-pink-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-3">No Creators Yet</h2>
                            <p className="text-gray-400 mb-6">
                                No profile accounts found. Be the first to create a profile and join the TimeFun community!
                            </p>
                            <button className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl font-semibold text-white shadow-lg shadow-pink-500/50 transition-all duration-300 transform hover:scale-105">
                                Create Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CreatorCard({ account, profile }: { account: PublicKey, profile: ProfileType }) {
    const router = useRouter();

    const getCategoryDisplayName = (category: CategoryType): string => {
        if (!category || typeof category !== 'object') return "Other";
    
        const typeKey = Object.keys(category)[0];
        
        const categoryNames: Record<string, string> = {
            'timeFunTeam': 'TimeFun Team',
            'founders': 'Founders',
            'influencers': 'Influencers',
            'investors': 'Investors',
            'designer': 'Designers',
            'athletes': 'Athletes',
            'solana': 'Solana',
            'musicians': 'Musicians',
            'media': 'Media',
            'companies': 'Companies',
            'other': 'Other'
        };
        
        return categoryNames[typeKey] || "Other";
    };
    
   
    return (
        <div className="group relative bg-gradient-to-br from-pink-950/10 to-purple-950/10 rounded-2xl border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 overflow-hidden">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
            
            <div className="relative p-4 flex flex-col h-full">
                {/* Profile Image */}
                <div className="relative mb-4">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-pink-500/30 group-hover:border-pink-500/60 transition-colors duration-300">
                        <Image 
                            src={profile.image ?? "/timefunImage.png"} 
                            alt={profile.name} 
                            fill
                            // width={100}
                            // height={100}
                            className="object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                    </div>
                    {/* Creator Badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-pink-600 to-pink-500 rounded-full text-xs font-semibold text-white shadow-lg shadow-pink-500/50 whitespace-nowrap">
                        {getCategoryDisplayName(profile.category)}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 flex flex-col mt-2">
                    <h3 className="text-lg font-bold text-white mb-2 text-center line-clamp-1 group-hover:text-pink-300 transition-colors duration-300">
                        {profile.name}
                    </h3>
                    
                    {/* Bio Preview */}
                    {profile.bio && (
                        <p className="text-sm text-gray-400 text-center line-clamp-2 mb-3 flex-1">
                            {profile.bio}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 mb-4 text-xs">
                        {/* <div className="flex items-center gap-1 text-gray-400">
                            <Users className="w-3 h-3 text-pink-400" />
                            <span className="font-semibold text-white">{profile.totalSupply.toNumber()}</span>
                        </div> */}
                        {/* <div className="w-1 h-1 bg-gray-600 rounded-full"></div> */}
                        {/* <div className="flex items-center gap-1 text-gray-400">
                            <TrendingUp className="w-3 h-3 text-pink-400" />
                            <span className="font-semibold text-white">{profile.charsPerToken.toNumber()}</span> chars
                        </div> */}
                    </div>

                    {/* Explore Button */}
                    <button
                        onClick={() => router.push(`/profile/${account.toBase58()}`)}
                        className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl font-semibold text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105"
                    >
                        Explore
                    </button>
                </div>
            </div>
        </div>
    );
}
  