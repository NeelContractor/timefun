"use client"
import { WalletButton } from "@/components/solana/solana-provider"
import { CategoryType, useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@solana/wallet-adapter-react"
import { CheckCircle2, FileText, Link2, Sparkles, User } from "lucide-react"
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

const categoryOptions = [
    { key: 'timeFunTeam', label: 'TimeFunTeam'},
    { key: 'founders', label: 'Founders'},
    { key: 'influencers', label: 'Influencers'},
    { key: 'investors', label: 'Investors'},
    { key: 'designer', label: 'Designer'},
    { key: 'athletes', label: 'Athletes'},
    { key: 'solana', label: 'Solana'},
    { key: 'musicians', label: 'Musicians'},
    { key: 'media', label: 'Media'},
    { key: 'companies', label: 'Companies'},
    { key: 'other', label: 'Other'}
];

export default function CreateCreator() {
    const [name, setName] = useState("");
    const [shortBio, setShortBio] = useState("");
    const [category, setCategory] = useState<CategoryType>({ other: {} });
    const [selectedCategory, setSelectedCategory] = useState<string>("other");
    const [imageUrl, setImageUrl] = useState<File>();
    const [imagePreview, setImagePreview] = useState<string>("");
    const [socialLink, setSocialLink] = useState("");
    const { initializeCreatorHandler } = useTimeFunProgram();
    const { publicKey } = useWallet();

    const mapCategoryToType = (key: string): CategoryType => {
        return { [key]: {} } as CategoryType;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageUrl(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            toast.loading("Uploading image to IPFS...");
        
            let ipfsUrl;
        
            // Case 1: imageUrl is a File
            if (imageUrl instanceof File) {
                const data = new FormData();
                data.set("file", imageUrl);
            
                const uploadRequest = await fetch("/api/files", {
                    method: "POST",
                    body: data,
                });
            
                const response = await uploadRequest.json();
                if (response.error) {
                    toast.error("IPFS upload failed");
                    return;
                }
            
                ipfsUrl = response.url;
                toast.success("Image uploaded to IPFS!");
                console.log("IPFS URL:", ipfsUrl);
            }
        
            if (!publicKey) {
                toast.error("Please connect your wallet first.");
                return;
            }
        
            toast.loading("Creating creator profile on-chain...");
        
            await initializeCreatorHandler.mutateAsync({
                creatorPubkey: publicKey,
                name,
                shortBio,
                category,
                image: ipfsUrl,
                socialLink,
            });
        
            toast.success("Creator profile created successfully!");
            
            // Reset form
            setName("");
            setShortBio("");
            setCategory({ other: {} });
            setSelectedCategory("other");
            setImageUrl(undefined);
            setImagePreview("");
            setSocialLink("");
        } catch (error) {
            console.error("Error creating creator profile:", error);
            toast.error("Failed to create profile.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-pink-950/20 via-black to-black border-b border-pink-500/10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full mb-4">
                                <Sparkles className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-pink-400 font-semibold">Become a Creator</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                                Create Your Profile
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">
                                Start earning by sharing your time and expertise
                            </p>
                        </div>
                        <div>
                            <WalletButton />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side - Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">
                                Why become a <span className="text-pink-400">TimeFun Creator?</span>
                            </h2>
                            <div className="space-y-6">
                                {[
                                    {
                                        icon: <CheckCircle2 className="w-6 h-6 text-pink-400" />,
                                        title: "Monetize Your Time",
                                        description: "Set your own rates and earn money by connecting with your audience"
                                    },
                                    {
                                        icon: <CheckCircle2 className="w-6 h-6 text-pink-400" />,
                                        title: "Direct Communication",
                                        description: "Engage with fans and clients through messages, calls, and more"
                                    },
                                    {
                                        icon: <CheckCircle2 className="w-6 h-6 text-pink-400" />,
                                        title: "Build Your Brand",
                                        description: "Grow your personal brand and reach on the Solana blockchain"
                                    },
                                    {
                                        icon: <CheckCircle2 className="w-6 h-6 text-pink-400" />,
                                        title: "Flexible Schedule",
                                        description: "Work on your own terms and manage your availability"
                                    }
                                ].map((benefit, index) => (
                                    <div key={index} className="flex gap-4 p-4 bg-gradient-to-br from-pink-950/10 to-purple-950/10 border border-pink-500/20 rounded-xl hover:border-pink-500/40 transition-colors">
                                        <div className="flex-shrink-0 p-2 bg-pink-500/20 rounded-lg h-fit">
                                            {benefit.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                                            <p className="text-gray-400 text-sm">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-pink-950/20 to-purple-950/20 border border-pink-500/30 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Creator Profile</h3>
                                <p className="text-gray-400">Fill in your details to get started</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-300 font-medium flex items-center gap-2">
                                        <User className="w-4 h-4 text-pink-400" />
                                        Name
                                    </Label>
                                    <Input 
                                        id="name"
                                        type="text" 
                                        placeholder="Enter your name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        maxLength={32}
                                        className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
                                    />
                                </div>

                                {/* Short Bio Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-gray-300 font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-pink-400" />
                                        Bio
                                    </Label>
                                    <div className="relative w-full">
                                        <textarea
                                            id="bio"
                                            maxLength={50}
                                            placeholder="Tell people about yourself..."
                                            value={shortBio}
                                            onChange={(e) => setShortBio(e.target.value)}
                                            required
                                            rows={2}
                                            className="w-full bg-black/40 border border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                                        />
                                        <p className="absolute bottom-2 right-3 text-xs text-gray-400">
                                            {50 - shortBio.length} characters left
                                        </p>
                                    </div>
                                </div>

                                {/* Category Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-gray-300 font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-pink-400" />
                                        Category
                                    </Label>
                                    <Select
                                        value={selectedCategory}
                                        onValueChange={(val) => {
                                            setSelectedCategory(val);
                                            setCategory(mapCategoryToType(val));
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-12 bg-black/40 border-pink-500/30 focus:border-pink-500 text-white rounded-xl">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map((option) => (
                                                <SelectItem key={option.key} value={option.key}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Image Upload Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl" className="text-gray-300 font-medium flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-pink-400" />
                                        Profile Image
                                    </Label>
                                    <Input 
                                        id="imageUrl"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        required
                                        className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500/20 file:text-pink-400 hover:file:bg-pink-500/30"
                                    />
                                    {imagePreview && (
                                        <div className="mt-3 p-4 bg-black/40 border border-pink-500/20 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-2">Preview:</p>
                                            <div className="relative w-24 h-24">
                                                <Image 
                                                    src={imagePreview} 
                                                    alt="Profile preview" 
                                                    fill
                                                    className="rounded-lg object-cover border-2 border-pink-500/30"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Social Link Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="social" className="text-gray-300 font-medium flex items-center gap-2">
                                        <Link2 className="w-4 h-4 text-pink-400" />
                                        Social Link
                                    </Label>
                                    <Input 
                                        id="social"
                                        type="url" 
                                        placeholder="https://twitter.com/yourhandle" 
                                        value={socialLink}
                                        onChange={(e) => setSocialLink(e.target.value)}
                                        required
                                        maxLength={64}
                                        className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button 
                                    type="submit"
                                    disabled={initializeCreatorHandler.isPending || !publicKey}
                                    className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    {initializeCreatorHandler.isPending ? "Creating..." : !publicKey ? "Connect Wallet" : "Create Profile"}
                                </Button>

                                <p className="text-center text-sm text-gray-400">
                                    By creating a profile, you agree to our Terms of Service
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Info Section */}
                <div className="mt-16 p-8 bg-gradient-to-r from-pink-950/20 to-purple-950/20 border border-pink-500/20 rounded-3xl">
                    <div className="text-center max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Ready to start earning?
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                            Join thousands of creators who are already monetizing their time on TimeFun. 
                            Set up your profile in minutes and start connecting with your audience on the Solana blockchain.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 mt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-400">5 min</div>
                                <div className="text-sm text-gray-400">Setup time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-400">0%</div>
                                <div className="text-sm text-gray-400">Platform fees</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-400">Instant</div>
                                <div className="text-sm text-gray-400">Payouts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
