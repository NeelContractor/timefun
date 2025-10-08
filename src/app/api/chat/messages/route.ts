// app/api/messages/route.ts
import { getMessagesFromDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

// ⬇️ Replace with your real DB implementation
// async function getMessagesFromDatabase(params: {
//     userPubkey: string | null;
//     creatorPubkey: string | null;
//     afterId: string;
// }) {
//   // Example fake DB response
//     return [
//         {
//             id: "1",
//             from: params.userPubkey,
//             to: params.creatorPubkey,
//             message: "Hello world",
//             timestamp: Date.now(),
//             txSignature: "fakeSig123",
//         },
//     ];
// }

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userPubkey = searchParams.get("user");
        const creatorPubkey = searchParams.get("creator");
        const lastMessageId = searchParams.get("lastMessageId") || "0";

        const messages = await getMessagesFromDatabase({
            userPubkey,
            creatorPubkey,
            afterId: lastMessageId,
        });

        return NextResponse.json({
            messages,
            hasMore: messages.length > 0,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { messages: [], error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}
