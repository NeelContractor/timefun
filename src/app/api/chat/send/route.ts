// /api/chat/send/route.ts
import { NextResponse } from "next/server";
import { Connection, Transaction } from "@solana/web3.js";
import { saveMessageToDatabase } from "@/lib/db";

const SOLANA_RPC =
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
    "https://api.devnet.solana.com";

// ⬇️ Replace this with your actual DB logic (Vercel KV / Postgres / etc.)
// async function saveMessageToDatabase(data: {
//     from: string;
//     to: string;
//     message: string;
//     timestamp: number;
//     txSignature: string;
// }) {
//     // Example: store in KV / SQL
//     // await kv.set(`msg:${data.txSignature}`, data);
//     return `msg_${data.txSignature}`; // return a fake ID for now
// }

export async function POST(req: Request) {
    try {
        const {
            userPubkey,
            creatorPubkey,
            message,
            signedTransaction, // user sends pre-signed consume_words tx
        } = await req.json();

        const connection = new Connection(SOLANA_RPC);

        // 1. Deserialize the transaction
        const transaction = Transaction.from(
            Buffer.from(signedTransaction, "base64")
        );

        // 2. Send transaction to Solana
        const signature = await connection.sendRawTransaction(
            transaction.serialize()
        );

        // 3. Confirm transaction (wait for network confirmation)
        await connection.confirmTransaction(signature, "confirmed");

        // 4. Save the message after confirmation
        const messageId = await saveMessageToDatabase({
            from: userPubkey,
            to: creatorPubkey,
            message,
            timestamp: Date.now(),
            txSignature: signature,
        });

        return NextResponse.json({
            success: true,
            messageId,
            signature,
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to send message",
            },
            { status: 500 }
        );
    }
}