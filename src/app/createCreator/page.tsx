"use client"
import { WalletButton } from "@/components/solana/solana-provider"
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@solana/wallet-adapter-react"
import { CheckCircle2, FileText, Image, Link2, Sparkles, User } from "lucide-react"
import { useState } from "react"

export default function CreateCreator() {
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [socialLink, setSocialLink] = useState("");
    const [initialPrice, setInitialPrice] = useState(0);
    const [initialWords, setInitialWords] = useState(0);
    const { initializeCreatorHandler } = useTimeFunProgram();
    const { publicKey } = useWallet();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        if (!publicKey) return;
        await initializeCreatorHandler.mutateAsync({ creatorPubkey: publicKey, name, bio, image: imageUrl, socialLink });
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

                            <div className="space-y-6">
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
                                        className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
                                    />
                                </div>

                                {/* Bio Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-gray-300 font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-pink-400" />
                                        Bio
                                    </Label>
                                    <textarea
                                        id="bio"
                                        placeholder="Tell people about yourself..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full bg-black/40 border border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                                    />
                                </div>

                                {/* Image URL Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl" className="text-gray-300 font-medium flex items-center gap-2">
                                        <Image className="w-4 h-4 text-pink-400" />
                                        Profile Image URL
                                    </Label>
                                    <Input 
                                        id="imageUrl"
                                        type="text" 
                                        placeholder="https://example.com/image.jpg" 
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
                                    />
                                    {imageUrl && (
                                        <div className="mt-3 p-4 bg-black/40 border border-pink-500/20 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-2">Preview:</p>
                                            <img 
                                                src={imageUrl} 
                                                alt="Preview" 
                                                className="w-24 h-24 rounded-lg object-cover border-2 border-pink-500/30"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
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
                                        type="text" 
                                        placeholder="https://twitter.com/yourhandle" 
                                        value={socialLink}
                                        onChange={(e) => setSocialLink(e.target.value)}
                                        className="bg-black/40 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-xl h-12"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button 
                                    type="button"
                                    onClick={handleSubmit}
                                    className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Create Profile
                                </Button>

                                <p className="text-center text-sm text-gray-400">
                                    By creating a profile, you agree to our Terms of Service
                                </p>
                            </div>
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

    // return (
    //     <div className="mx-10 my-10">
    //         {/* <h1 className="flex justify-center text-2xl font-bold gap-5">Create Creator Profile</h1> */}
    //         <div className="flex justify-end gap-5">
    //             <WalletButton />
    //         </div>
    //         <div className="flex justify-center items-center gap-5">
    //             <Card className="w-full max-w-sm">
    //                 <CardHeader>
    //                     <CardTitle>Create Creator Profile</CardTitle>
    //                     {/* <CardDescription>
    //                         Enter your email below to login to your account
    //                     </CardDescription> */}
    //                     <CardAction>
    //                         {/* <Button variant="link">Sign Up</Button> */}
    //                     </CardAction>
    //                 </CardHeader>
    //                 <CardContent>
    //                     <form>
    //                         <div className="flex flex-col gap-6">
    //                             <div className="grid gap-2">
    //                                 <Label htmlFor="name">Name</Label>
    //                                 <Input 
    //                                     type="text" 
    //                                     placeholder="Name" 
    //                                     onChange={(e) => {
    //                                         setName(e.target.value)
    //                                     }} 
    //                                 />
    //                                 <Label htmlFor="bio">Bio</Label>
    //                                 <Input 
    //                                     type="text" 
    //                                     placeholder="Bio" 
    //                                     onChange={(e) => {
    //                                         setBio(e.target.value)
    //                                     }} 
    //                                 />
    //                                 <Label htmlFor="image">Image</Label>
    //                                 <Input 
    //                                     type="text" 
    //                                     placeholder="Image" 
    //                                     onChange={(e) => {
    //                                         setImage(e.target.value)
    //                                     }} 
    //                                 />
    //                                 <Label htmlFor="social">Social Link</Label>
    //                                 <Input 
    //                                     type="text" 
    //                                     placeholder="SocialLink" 
    //                                     onChange={(e) => {
    //                                         setSocialLink(e.target.value)
    //                                     }} 
    //                                 />
    //                                 {/* <Label htmlFor="price">Base Price</Label>  */}
    //                                 {/* // TODO: probably hardcode */}
    //                                 {/* <Input 
    //                                     type="number" 
    //                                     placeholder="initial Price " 
    //                                     onChange={(e) => {
    //                                         setInitialPrice(Number(e.target.value))
    //                                     }} 
    //                                 /> */}
    //                                 {/* <Label htmlFor="chars">Chars Per Words</Label>  */}
    //                                 {/* // TODO: probably hardcode */}
    //                                 {/* <Input 
    //                                     type="number" 
    //                                     placeholder="Initial Words" 
    //                                     onChange={(e) => {
    //                                         setInitialWords(Number(e.target.value))
    //                                     }} 
    //                                 /> */}
    //                             </div>
    //                             {/* <div className="grid gap-2">
    //                                 <div className="flex items-center">
    //                                     <Label htmlFor="password">Password</Label>
    //                                     <a
    //                                         href="#"
    //                                         className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
    //                                     >
    //                                         Forgot your password?
    //                                     </a>
    //                                 </div>
    //                                 <Input id="password" type="password" required />
    //                             </div> */}
    //                         </div>
    //                     </form>
    //                 </CardContent>
    //                 <CardFooter className="flex-col gap-2">
    //                     <Button type="submit" className="w-full">
    //                         Create
    //                     </Button>
    //                     {/* <Button variant="outline" className="w-full">
    //                         Login with Google
    //                     </Button> */}
    //                 </CardFooter>
    //             </Card>
    //         </div>
    //     </div>
    // )
}
