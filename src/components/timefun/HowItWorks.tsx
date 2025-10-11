"use client"
import { MessageCircle, Search, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HowItWorks() {
    const router = useRouter();

    const steps = [
        {
            icon: <Search className="w-12 h-12" />,
            title: "FIND A CREATOR",
            description: "Discover verified creators across a variety of categories"
        },
        {
            icon: <Zap className="w-12 h-12" />,
            title: "BUY THEIR TIME",
            description: "Buy minutes of the creators you want to connect with or invest in"
        },
        {
            icon: <MessageCircle className="w-12 h-12" />,
            title: "CONNECT",
            description: "Connect with your favorite creators through direct messages, group chats, and voice or video calls."
        }
    ];

    return (
        <div className="bg-gradient-to-b from-black via-pink-950/10 to-black">
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-950/30 to-purple-950/30 border border-pink-500/30 rounded-full mb-6">
                        <span className="text-lg font-semibold text-pink-300">How it works</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                        Get Started in 3 Simple Steps
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            {/* Connection Line */} {/** TODO correct css */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-pink-500/50 to-transparent -translate-x-1/2 z-0"></div>
                            )}
                            
                            <div className="relative bg-gradient-to-br from-pink-950/10 to-purple-950/10 border border-pink-500/20 group-hover:border-pink-500/50 rounded-2xl p-8 transition-all duration-300 transform group-hover:scale-105 z-10">
                                {/* Step Number */}
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-pink-600 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-pink-500/50">
                                    {index + 1}
                                </div>

                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl text-pink-400 group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <button 
                        className="px-10 py-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl font-semibold text-lg text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                            router.push("/explore")
                        }}
                    >
                        Start Exploring Now
                    </button>
                </div>
            </div>
        </div>
    );
}