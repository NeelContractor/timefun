// "use client"

// import { Dot, MessageCircleMoreIcon, Sparkles, Star, X } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useState } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";

// type TabsTypes = "about" | "market" | "activity";

// interface Tab {
//     id: TabsTypes;
//     name: string;
// }

// const tabs: Tab[] = [
//     {id: "about", name: "About Me"},
//     {id: "market", name: "Market"},
//     {id: "activity", name: "Activity"},
// ];

// export default function CreatorAbout() {
//     const [activeTab, setActiveTab] = useState<TabsTypes>("about");
//     const { publicKey } = useWallet();
//     const [amount, setAmount] = useState(0);

//     const handleBuy = async() => {
//         if (!publicKey) return;
//         // buyTokensHandler.mutateAsync({ buyerPubkey: publicKey, amount: new BN(amount), creatorPubkey })
//     }

//     return <div>
//         <div className="flex my-10 px-10">
//             <div className="flex">
//                 <Image src={"/kashImage.webp"} alt="Image" width={200} height={200} className="rounded-lg" />
//                 <div className="px-5">
//                     <div className="flex gap-5">
//                         <h1 className="font-semibold text-2xl">Kash</h1>
//                         <div className="p-1 rounded-full bg-[#1c1719] self-center">
//                             <p className="text-xs p-0.5 font-light text-center">Media & Marketing</p>
//                         </div>
//                     </div>
//                     <div>
//                         <p className="text-sm py-2 text-pink-100">advice for builders on growth, fundraising, and community design</p>
//                         <div className="flex gap-2">
//                             <Star />
//                             <Star />
//                             <Star />
//                             <Star />
//                             <Star />
//                             <p>5</p>
//                             <Dot />
//                             <p>90% response rate</p>
//                         </div>
//                         <div className="flex">
//                             <div className="border ">
//                                 <Link href={"www.x.com/asdasd"}>
//                                     <X />
//                                 </Link>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="flex justify-end">
//                 <div className="bg-gradient-to-br from-pink-950/20 to-purple-950/20 rounded-3xl p-8 border border-pink-500/20">
//                     <h1 className="text-2xl font-bold">Buy Creator&apos;s Tokens</h1>
//                     <h3 className="py-3 text-center text-xl font-semibold">10 Chars for 0.1 SOL</h3>
//                     <Input 
//                         type="number"
//                         value={amount}
//                         onChange={(e) => {
//                             setAmount(Number(e.target.value))
//                         }}
//                         className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
//                     />
//                     <Button 
//                         type="button"
//                         onClick={handleBuy}
//                         className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 my-2"
//                     >
//                         <Sparkles className="w-5 h-5 mr-2" />
//                         Buy Tokens
//                     </Button>
//                 </div>
//             </div>

//         </div>
//         <div className="flex gap-5">
//             {tabs.map((tab) => (
//                 <div key={tab.id}>
//                     <button
//                         onClick={() => {
//                             setActiveTab(tab.id)
//                         }}
//                     >
//                         <h1 className={`text-xl font-bold ${activeTab === tab.id ? "text-white" : "text-gray-400"}`}>{tab.name}</h1>
//                     </button>
//                 </div>
//             ))}
//         </div>
//         {activeTab}

//         <div>
//             <h1 className="text-2xl font-bold">
//                 Get access to Kash 
//             </h1>
//             <p className="text-base text-gray-200">Use your purchased minutes to connect with Kash </p>
//             <div className="border py-1 px-3 rounded-lg bg-[#40263172] hover:border-pink-400 my-5">
//                 <div className="flex mt-5">
//                     <div className="flex p-2 border mx-5 self-center rounded-lg">
//                         <MessageCircleMoreIcon className="w-8 h-8 hover:text-pink-400" />
//                     </div>
//                     <div>
//                         <h1 className="text-xl font-bold">Direct Message</h1>
//                         <p className="text-gray-400 font-medium">Send a direct message for a quick connection. Kepp the conversation going with additional messages if needed</p>
//                     </div>
//                 </div>
//                 <div className="p-2 rounded-lg mt-5 bg-[#4026314a]">
//                     <p>Price 29.80 min 0.30</p>
//                 </div>
//             </div>
//         </div>
//     </div>
// }