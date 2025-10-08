// /api/chat/verify/route.ts
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC =
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
    "https://api.devnet.solana.com";

const PROGRAM_ID = new PublicKey(
  "4XpARVWj2XoKbXjdPoxSb4Ua54t5DzQPse9HDVMjvakE"
);

export async function POST(req: Request) {
    try {
        const { userPubkey, creatorPubkey, wordCount } = await req.json();

        const connection = new Connection(SOLANA_RPC);

        // Derive PDA
        const [userBalancePDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_balance"),
                new PublicKey(userPubkey).toBuffer(),
                new PublicKey(creatorPubkey).toBuffer(),
            ],
            PROGRAM_ID
        );

        // Fetch PDA account
        const accountInfo = await connection.getAccountInfo(userBalancePDA);

        if (!accountInfo) {
            return NextResponse.json(
                {
                    canChat: false,
                    error: "No tokens found",
                },
                { status: 403 }
            );
        }

        // Decode account data (skip 8 bytes for discriminator)
        const data = accountInfo.data;
        const balance = Number(data.readBigUInt64LE(8));
        const wordsAvailable = Number(data.readBigUInt64LE(16));
        const wordsConsumed = Number(data.readBigUInt64LE(24));
        const tokensLocked = Number(data.readBigUInt64LE(32));

        if (wordsAvailable >= wordCount) {
            return NextResponse.json({
                canChat: true,
                balance,
                wordsAvailable,
                wordsConsumed,
                tokensLocked,
            });
        } else {
            return NextResponse.json(
                {
                canChat: false,
                error: "Insufficient words",
                wordsAvailable,
                wordsNeeded: wordCount,
                },
                { status: 403 }
            );
        }
    } catch (error) {
        console.error("Error verifying chat access:", error);
        return NextResponse.json(
            {
                canChat: false,
                error: "Verification failed",
            },
            { status: 500 }
        );
    }
}