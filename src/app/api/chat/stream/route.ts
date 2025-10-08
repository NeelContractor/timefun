// /api/chat/stream/route.ts
import { NextRequest } from "next/server";

// ⬇️ Replace this with your real DB fetcher
async function getNewMessagesFromDatabase(params: {
    userPubkey: string | null;
    creatorPubkey: string | null;
}) {
  // Example: return an empty array or fake messages
    return [
        {
            id: Date.now().toString(),
            from: params.userPubkey,
            to: params.creatorPubkey,
            message: "Hello via SSE",
            timestamp: Date.now(),
        },
    ];
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userPubkey = searchParams.get("user");
    const creatorPubkey = searchParams.get("creator");

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
        // Keep connection alive (every 15s)
        const keepAlive = setInterval(() => {
            controller.enqueue(encoder.encode(": keep-alive\n\n"));
        }, 15000);

        // Poll for new messages every 2s
        const pollInterval = setInterval(async () => {
            try {
                const messages = await getNewMessagesFromDatabase({
                    userPubkey,
                    creatorPubkey,
                });

                if (messages.length > 0) {
                    const data = `data: ${JSON.stringify(messages)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                }
            } catch (error) {
                console.error("Error in SSE:", error);
            }
        }, 2000);

            // Cleanup when connection closes
            req.signal.addEventListener("abort", () => {
                clearInterval(keepAlive);
                clearInterval(pollInterval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}