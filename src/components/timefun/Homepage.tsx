"use client"
import Image from "next/image";
import { Button } from "../ui/button";
import CreatorCard from "./CreatorCard";
import CategorySelector from "./CategorySelector";
import HowItWorks from "./HowItWorks";
import { Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Homepage() {
    const router = useRouter();

    return (
        <div className="relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-pink-950/30 via-black to-black"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/20 via-black to-black"></div>
            
            <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-white via-pink-100 to-pink-300 bg-clip-text text-transparent leading-tight">
                                    TIME IS MONEY.
                                </h1>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600/20 to-pink-500/20 border border-pink-500/30 rounded-full backdrop-blur-sm">
                                    <TrendingUp className="w-5 h-5 text-pink-400" />
                                    <span className="font-bold text-white text-lg">36%</span>
                                </div>
                            </div>
                            
                            <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                                Get instant access to and invest in your favorite creators & experts.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => {
                                    router.push("/explore")
                                }}
                                className="group px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl font-semibold text-lg text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Explore creators
                                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button 
                                onClick={() => {
                                    router.push("/createCreator")
                                }}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-pink-500/30 hover:border-pink-500 rounded-xl font-semibold text-lg text-white backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                            >
                                Get paid for your time
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 pt-8 border-t border-pink-500/10">
                            <div>
                                <div className="text-3xl font-bold text-white">1,000+</div>
                                <div className="text-sm text-gray-400">Creators</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">50K+</div>
                                <div className="text-sm text-gray-400">Connections</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">$2M+</div>
                                <div className="text-sm text-gray-400">Earned</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Content - Creator Card */}
                    <div className="flex justify-center lg:justify-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                            <CreatorCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // return <div className="grid grid-cols-2">
    //     <div className="flex justify-center items-center">
    //         <div className="">
    //             <div className="grid justify-center gap-5">
    //                 <div className="flex gap-5">
    //                     <h1 className="text-elements-highem tracking-tight font-[Libre Franklin] text-5xl font-black leading-[48px] text-center md:text-left">TIME IS MONEY.</h1>
    //                     <div className="flex border-none rounded-4xl self-center bg-pink-900 p-2 font-bold">
    //                         <Image src={"/arrow.png"} alt="Up Arrow" height={25} width={25} />
    //                         36%
    //                     </div>
    //                 </div>
    //                 <p>Get instant access to and invest in your favorite creators & experts.</p>
    //                 <div className="flex  gap-5">
    //                     <Button     
    //                         className="bg-pink-300 hover:bg-pink-200 py-6 px-7 font-semibold text-lg"
    //                     >
    //                         Explore creators
    //                     </Button>
    //                     <Button
    //                         className="bg-[#1c1719] text-white hover:bg-[#1c17199c] py-6 px-7 font-semibold text-lg"
    //                     >
    //                         Get paid for your time
    //                     </Button>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    //     <div className="flex ">
    //         <CreatorCard />
    //     </div>

    // </div>
}