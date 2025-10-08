"use client"
import { WalletButton } from "@/components/solana/solana-provider"
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
import { useState } from "react"

export default function CreateCreator() {
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState("");
    const [socialLink, setSocialLink] = useState("");
    const [initialPrice, setInitialPrice] = useState(0);
    const [initialWords, setInitialWords] = useState(0);

    return (
        <div className="mx-10 my-10">
            {/* <h1 className="flex justify-center text-2xl font-bold gap-5">Create Creator Profile</h1> */}
            <div className="flex justify-end gap-5">
                <WalletButton />
            </div>
            <div className="flex justify-center items-center gap-5">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Create Creator Profile</CardTitle>
                        {/* <CardDescription>
                            Enter your email below to login to your account
                        </CardDescription> */}
                        <CardAction>
                            {/* <Button variant="link">Sign Up</Button> */}
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        type="text" 
                                        placeholder="Name" 
                                        onChange={(e) => {
                                            setName(e.target.value)
                                        }} 
                                    />
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input 
                                        type="text" 
                                        placeholder="Bio" 
                                        onChange={(e) => {
                                            setBio(e.target.value)
                                        }} 
                                    />
                                    <Label htmlFor="image">Image</Label>
                                    <Input 
                                        type="text" 
                                        placeholder="Image" 
                                        onChange={(e) => {
                                            setImage(e.target.value)
                                        }} 
                                    />
                                    <Label htmlFor="social">Social Link</Label>
                                    <Input 
                                        type="text" 
                                        placeholder="SocialLink" 
                                        onChange={(e) => {
                                            setSocialLink(e.target.value)
                                        }} 
                                    />
                                    {/* <Label htmlFor="price">Base Price</Label>  */}
                                    {/* // TODO: probably hardcode */}
                                    {/* <Input 
                                        type="number" 
                                        placeholder="initial Price " 
                                        onChange={(e) => {
                                            setInitialPrice(Number(e.target.value))
                                        }} 
                                    /> */}
                                    {/* <Label htmlFor="chars">Chars Per Words</Label>  */}
                                    {/* // TODO: probably hardcode */}
                                    {/* <Input 
                                        type="number" 
                                        placeholder="Initial Words" 
                                        onChange={(e) => {
                                            setInitialWords(Number(e.target.value))
                                        }} 
                                    /> */}
                                </div>
                                {/* <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" required />
                                </div> */}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button type="submit" className="w-full">
                            Create
                        </Button>
                        {/* <Button variant="outline" className="w-full">
                            Login with Google
                        </Button> */}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
