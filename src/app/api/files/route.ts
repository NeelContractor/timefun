import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "../../../lib/pinata";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file = data.get("file");
      
        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
        }
        
        // Convert Blob to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Create a new File from the Blob data
        const newFile = new File([arrayBuffer], "timefun.txt", { type: file.type ?? "application/octet-stream" });

        // Upload using Pinata SDK (which expects a File)
        const { cid } = await pinata.upload.public.file(newFile);
        const url = await pinata.gateways.public.convert(cid);
        console.log("Resolved IPFS URL:", url);
    
        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}