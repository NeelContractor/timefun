"use client"

import { useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProfileType } from "../profile/[address]/page";

export default function Page() {
    const { conversationAccounts, creatorProfileAccounts } = useTimeFunProgram();
    const { publicKey } = useWallet();
    const [profile, setProfile] = useState<ProfileType>();

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
    
    // if (!address) {
    //     return <div>Error loading account</div>
    // }

    // useEffect(() => {
    //     const fetchProfile = async () => {
    //         // Find the matching profile
    //         const matchingProfile = creatorProfileAccounts.data?.find(
    //             (profile) => profile.publicKey.equals(address) // Use .equals() to compare PublicKeys
    //         );
            
    //         if (matchingProfile) {
    //             setProfile(matchingProfile.account);
    //             console.log('Found profile:', matchingProfile.account);
    //         } else {
    //             console.log('Profile not found for address:', address.toBase58());
    //         }
    //     };
        
    //     if (address && creatorProfileAccounts.data) {
    //         fetchProfile();
    //     }
    // }, [address, creatorProfileAccounts.data]);

    return (
        <div>
            <p>List all the creators conversation, if click open full messaging page</p>
            <div>
                <div className="grid justify-center gap-5 p-2">
                    {conversationAccounts.data
                        ?.filter((filteredConvo) => filteredConvo.account.user === publicKey)
                        ?.map((convo) => (
                            <div key={convo.publicKey.toString()}>
                                <div>{convo.account.creator.toBase58()}</div>
                                <div>{convo.account.lastMessageTime.toNumber()}</div>
                            </div>
                    ))}
                </div>
            </div>
        </div>
    )
}