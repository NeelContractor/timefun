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
                            {/* Connection Line */}
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

    // return <div className="flex justify-center gap-4 py-10">
    //     <div>
    //         <div className="py-10">
    //             <div className="flex justify-center">
    //                 <h1 className="border-none p-3 rounded-full bg-[#1c1719]">How it works</h1>
    //             </div>
    //         </div>
    //         <div className="grid grid-cols-3 gap-5">
    //             <div>
    //                 <div className="text-pink-300 flex justify-center">
    //                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 256 256" className="fill-elements-accent"><path d="M192,112a80,80,0,1,1-80-80A80,80,0,0,1,192,112Z" opacity="0.2"></path><path d="M229.66,218.34,179.6,168.28a88.21,88.21,0,1,0-11.32,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
    //                 </div>
    //                 <h1 className="text-elements-highem tracking-tight font-[Passion One] font-black text-center mt-3 text-2xl">FIND A CREATOR</h1>
    //                 <p className="text-pink-100 text-center text-sm">Discover verified creators across a variety of categories</p>
    //             </div>
    //             <div>
    //                 <div className="text-pink-300 flex justify-center">
    //                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 256 256" className="fill-elements-accent"><path d="M205.64,53.66,128,128,50.36,53.66A8,8,0,0,1,56,40H200A8,8,0,0,1,205.64,53.66ZM128,128,50.36,202.34A8,8,0,0,0,56,216H200a8,8,0,0,0,5.66-13.66Z" opacity="0.2"></path><path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.69,59.31a1.59,1.59,0,0,1,.13.13L116.43,128,44.82,196.56a1.59,1.59,0,0,1-.13.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0Zm144,0-72,68.92L56,48ZM56,208l72-68.92L200,208Z"></path></svg>
    //                 </div>
    //                 <h1 className="text-elements-highem tracking-tight font-[Passion One] font-black text-center mt-3 text-2xl">BUY THEIR TIME</h1>
    //                 <p className="text-pink-100 text-center text-sm">Buy minutes of the creators you want to connect with or invest in</p>
    //             </div>
    //             <div>
    //                 <div className="text-pink-300 flex justify-center">
    //                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 256 256" className="fill-elements-accent"><path d="M184,213.27A80,80,0,0,1,74.7,184l-40-69.32a20,20,0,0,1,34.64-20L55.08,70A20,20,0,0,1,89.73,50l6.92,12h0a20,20,0,0,1,34.64-20l30,52A20,20,0,0,1,196,74l17.31,30A80,80,0,0,1,184,213.27Z" opacity="0.2"></path><path d="M220.17,100,202.86,70a28,28,0,0,0-38.24-10.25,27.69,27.69,0,0,0-9,8.34L138.2,38a28,28,0,0,0-48.48,0A28,28,0,0,0,48.15,74l1.59,2.76A27.67,27.67,0,0,0,38,80.41a28,28,0,0,0-10.24,38.25l40,69.32a87.47,87.47,0,0,0,53.43,41,88.56,88.56,0,0,0,22.92,3,88,88,0,0,0,76.06-132Zm-6.66,62.64A72,72,0,0,1,81.62,180l-40-69.32a12,12,0,0,1,20.78-12L81.63,132a8,8,0,1,0,13.85-8L62,66A12,12,0,1,1,82.78,54L114,108a8,8,0,1,0,13.85-8L103.57,58h0a12,12,0,1,1,20.78-12l33.42,57.9a48,48,0,0,0-5.54,60.6,8,8,0,0,0,13.24-9A32,32,0,0,1,172.78,112a8,8,0,0,0,2.13-10.4L168.23,90A12,12,0,1,1,189,78l17.31,30A71.56,71.56,0,0,1,213.51,162.62ZM184.25,31.71A8,8,0,0,1,194,26a59.62,59.62,0,0,1,36.53,28l.33.57a8,8,0,1,1-13.85,8l-.33-.57a43.67,43.67,0,0,0-26.8-20.5A8,8,0,0,1,184.25,31.71ZM80.89,237a8,8,0,0,1-11.23,1.33A119.56,119.56,0,0,1,40.06,204a8,8,0,0,1,13.86-8,103.67,103.67,0,0,0,25.64,29.72A8,8,0,0,1,80.89,237Z"></path></svg>
    //                 </div>
    //                 <h1 className="text-elements-highem tracking-tight font-[Passion One] font-black text-center mt-3 text-2xl">CONNECT</h1>
    //                 <p className="text-pink-100 text-center text-sm">Connect with your favorite creators through direct messages, group chats, and voice or video calls.</p>
    //             </div>
    //         </div>
    //     </div>
    // </div>
}