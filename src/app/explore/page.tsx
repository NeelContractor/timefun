"use client"
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import BN from "bn.js";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProfileType {
    creator: PublicKey;
    name: string;
    bio: string;
    image: string;
    socialLink: string;
    creatorTokenMint: PublicKey;
    basePerToken: BN;
    charsPerToken: BN;
    totalSupply: BN;
    bump: number;
}

export default function Explore() {
    const { creatorProfileAccounts } = useTimeFunProgram();
    return <div>
        <div>
            {/* {creatorProfileAccounts.} */}
            {creatorProfileAccounts.isLoading ? (
                <span className="loading loading-spinner loading-lg"></span>
            ) : creatorProfileAccounts.data?.length ? (
                <div className="mx-10 my-10">
                    <div className="grid md:grid-cols-6 gap-4">
                        {creatorProfileAccounts.data?.map((profile) => (
                            <CreatorCard key={profile.publicKey.toString()} account={profile.publicKey} profile={profile.account} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h2 className={'text-2xl'}>No accounts</h2>
                    No profile accounts found. Create one above to get started.
                </div>
            )}
        </div>
    </div>
}

function CreatorCard({ account, profile }: { account: PublicKey, profile: ProfileType }) {
    const router = useRouter();
   
    return <div className="border rounded-xl items-center p-2">
        <Image src={profile.image ?? "/timefunImage"} alt="Image" width={150} height={150} className="self-center" />
        <h1 className="text-2xl font-bold text-center">{profile.name}</h1>
        <Button
            className="bg-pink-500 hover:bg-pink-400 text-white font-bold"
            onClick={() => {
                router.push(`/profile/${profile.creator}`)
            }}
        >Explore</Button>
    </div>
  }
  