"use client"
import { WalletButton } from "@/components/solana/solana-provider";
import { useTimeFunProgram } from "@/components/timefun/timefun-data-access"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { User, CreativeCommons, UserCircleIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function Page() {
    const { wallet, publicKey } = useWallet();
    const { buyTokensHandler, creatorProfileAccounts, initializeCreatorHandler, sellTokensHandler, sendMessageHandler, withdrawFromVaultHandler, conversationAccounts, creatorReplyBackHandler, program } = useTimeFunProgram();

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState("");
    const [socialLink, setSocialLink] = useState("");
    // const [initialPrice, setInitialPrice] = useState(0);
    // const [initialWords, setInitialWords] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [creatorPubkey, setCreatorPubkey] = useState("");
    const [userPubkey, setUserPubkey] = useState("");
    const [sendMessageContent, setSendMessageContent] = useState("");
    const [replyMessageContent, setReplyMessageContent] = useState("");
    const [amountOfTokensToBuy, setAmountOfTokensToBuy] = useState(0);
    const [amountOfTokensToSell, setAmountOfTokensToSell] = useState(0);

    let DECIMALS = 1000000;

    const handleInitialzeCreator = async () => {
        if (publicKey) {
            await initializeCreatorHandler.mutateAsync({ creatorPubkey: publicKey, name, bio, image, socialLink });
        }
    }

    const handleBuyTokens = async () => {
        if (publicKey) {
            await buyTokensHandler.mutateAsync({ creatorPubkey: new PublicKey(creatorPubkey), buyerPubkey: publicKey, amount: new BN(amountOfTokensToBuy) });
        }
    }

    const handleSellTokens = async () => {
        if (publicKey) {
            await sellTokensHandler.mutateAsync({ creatorPubkey: new PublicKey(creatorPubkey), sellerPubkey: publicKey, amount: new BN(amountOfTokensToSell) });
        }
    }

    const handleSendMessage = async () => {
        if (publicKey) {
            await sendMessageHandler.mutateAsync({ creatorPubkey: new PublicKey(creatorPubkey), userPubkey: publicKey, messageContent: sendMessageContent });
        }
    }

    const handleCreatorReplyBackHandler = async () => {
        if (publicKey) {
            await creatorReplyBackHandler.mutateAsync({ creatorPubkey: publicKey, userPubkey: new PublicKey(userPubkey), messageContent: replyMessageContent });
        }
    }

    const handleWithdrawFromVault = async () => {
        if (publicKey) {
            await withdrawFromVaultHandler.mutateAsync({ creatorPubkey: publicKey, withdrawAmount: new BN(withdrawAmount) });
        }
    }

    const getTypeIcon = (Type: any) => {
        // Since landType is an object with one property, we need to check the key
        const typeKey = Object.keys(Type)[0];
        
        switch (typeKey) {
            case 'user': return <p>User</p>;
            case 'creator': return <p>Creator</p>;
            default: return <p>Default User</p>;
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
    };

    useEffect(() => {
        program.addEventListener("messageSent", (event) => {
            console.log('\n📨 MessageSent event (Creator Reply):');
            console.log('   Sender:', event.sender.toBase58());
            console.log('   Recipient:', event.recipient.toBase58());
            console.log('   Tokens burned:', event.tokensBurned.toString(), '(ZERO - FREE REPLY!)');
            console.log('   Message:', event.message);
          });
    })

    return <div>
        <div>
            <WalletButton />
        </div>
        <div className="grid grid-rows-2 gap-5">
            <div className="row-span-1">
                <div className="flex justify-between px-5 gap-5">
                    {/* <p>test1</p> */}

                    
                    <div className="grid">
                        <h1>CreatorProfileAccounts</h1>
                        {creatorProfileAccounts.data?.map((creator) => (
                            <div key={creator.account.creator.toBase58()} className="grid border rounded-lg p-3 bg-gray-700">
                                {JSON.stringify(creator.account)}
                                <div>Creator: {creator.account.creator.toBase58()}</div>
                                <div>Name: {creator.account.name}</div>
                                <div>Bio: {creator.account.bio}</div>
                                <div>Image: {creator.account.image}</div>
                                <div>Social Link: {creator.account.socialLink}</div>
                                <div>Base Price: {creator.account.basePerToken.toNumber()}</div>
                                <div>Token Mint: {creator.account.creatorTokenMint.toBase58()}</div>
                                <div>Total Supply: {creator.account.totalSupply.toNumber()}</div>
                                <div>Chars Per Token: {creator.account.charsPerToken.toNumber()}</div>
                                <div>Image: {creator.account.image}</div>
                                <Image src={creator.account.image} alt="Image" width={100} height={100} />
                            </div>
                        ))}
                        
                    </div>

                    <div className="grid">
                        <h1>Conversation Accoutns</h1>
                        {conversationAccounts.data?.map((convo) => (
                            <div key={convo.publicKey.toBase58()} className="grid border rounded-lg p-3 bg-gray-700">
                                <div>Creator: {convo.account.creator.toBase58()}</div>
                                <div>User: {convo.account.user.toBase58()}</div>
                                <div>Last Message From: {getTypeIcon(convo.account.lastMessageFrom)}</div>
                                <div>Last Message Time: {formatDate(convo.account.lastMessageTime.toNumber())}</div>
                                <div>Total Messages: {convo.account.totalMessages.toNumber()}</div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="grid justify-center gap-5">
                    <h1>Testing Creator Page</h1>

                    {/* <div ref={}></div> */}
                    {program.addEventListener("messageSent", (event) => {
                        // console.log('\n📨 MessageSent event (Creator Reply):');
                        // console.log('   Sender:', event.sender.toBase58());
                        // console.log('   Recipient:', event.recipient.toBase58());
                        // console.log('   Tokens burned:', event.tokensBurned.toString(), '(ZERO - FREE REPLY!)');
                        // console.log('   Message:', event.message);
                        <div key={event.timestamp.toString()}>
                            <div>{event.sender.toBase58().trimEnd()}</div>
                            <div>{event.message}</div>
                            <div>{formatDate(event.timestamp.toNumber())}</div>
                        </div>
                    })}

                    <div>
                        <h1>Initialize Creator</h1>
                        <Input 
                            type="text" 
                            placeholder="Name" 
                            onChange={(e) => {
                                setName(e.target.value)
                            }} 
                        />
                        <Input 
                            type="text" 
                            placeholder="Bio" 
                            onChange={(e) => {
                                setBio(e.target.value)
                            }} 
                        />
                        <Input 
                            type="text" 
                            placeholder="Image" 
                            onChange={(e) => {
                                setImage(e.target.value)
                            }} 
                        />
                        <Input 
                            type="text" 
                            placeholder="SocialLink" 
                            onChange={(e) => {
                                setSocialLink(e.target.value)
                            }} 
                        />
                        {/* <Input 
                            type="number" 
                            placeholder="initial Price " 
                            onChange={(e) => {
                                setInitialPrice(Number(e.target.value))
                            }} 
                        />
                        <Input 
                            type="number" 
                            placeholder="Initial Words" 
                            onChange={(e) => {
                                setInitialWords(Number(e.target.value))
                            }} 
                        /> */}
                        <Button
                            onClick={() => {
                                handleInitialzeCreator()
                            }}
                        >InitializeCreator</Button>
                    </div>

                    <div>
                        <h1>Withdraw token mint amount</h1>
                        <Input 
                            type="number" 
                            placeholder="Withdraw Amount" 
                            onChange={(e) => {
                                setWithdrawAmount(Number(e.target.value))
                            }} 
                        />
                        <Button
                            onClick={() => {
                                handleWithdrawFromVault()
                            }}
                        >Withdraw</Button>
                    </div>

                    <div>
                        <h1>Creator Reply Back to Users</h1>
                            <Input 
                                type="text" 
                                placeholder="User PublicKey" 
                                onChange={(e) => {
                                    setUserPubkey(e.target.value)
                                }} 
                            />
                            <Textarea 
                                // type="text" 
                                placeholder="Message" 
                                onChange={(e) => {
                                    setReplyMessageContent(e.target.value)
                                }} 
                            />
                            <Button
                                onClick={() => {
                                    handleCreatorReplyBackHandler()
                                }}
                            >Send</Button>
                    </div>
                </div>

                <div className="grid justify-center gap-5">
                    <h1>Testing Users Page</h1>
                    <div>
                        <h1>Buy Creator Time Tokens</h1>
                        <Input 
                            type="text" 
                            placeholder="Creator PublicKey" 
                            onChange={(e) => {
                                setCreatorPubkey(e.target.value)
                            }} 
                        />
                        <Input 
                            type="number" 
                            placeholder="Amount to Buy" 
                            onChange={(e) => {
                                setAmountOfTokensToBuy(Number(e.target.value))
                            }} 
                        />
                        <Button
                            onClick={() => {
                                handleBuyTokens()
                            }}
                        >Buy Tokens</Button>
                    </div>

                    <div>
                        <h1>Sell Creator Time Tokens</h1>
                        <Input 
                            type="text" 
                            placeholder="Creator PublicKey" 
                            onChange={(e) => {
                                setCreatorPubkey(e.target.value)
                            }} 
                        />
                        <Input 
                            type="number" 
                            placeholder="Amount to Sell" 
                            onChange={(e) => {
                                setAmountOfTokensToSell(Number(e.target.value))
                            }} 
                        />
                        <Button
                            onClick={() => {
                                handleSellTokens()
                            }}
                        >Sell Tokens</Button>
                    </div>

                    <div>
                        <h1>Send Message to Creator</h1>
                        <Input 
                            type="text" 
                            placeholder="Creator PublicKey" 
                            onChange={(e) => {
                                setCreatorPubkey(e.target.value)
                            }} 
                        />
                        <Textarea 
                            // type="text" 
                            placeholder="Message" 
                            onChange={(e) => {
                                setSendMessageContent(e.target.value)
                            }} 
                        />
                        <Button
                            onClick={() => {
                                handleSendMessage()
                            }}
                        >Send</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}