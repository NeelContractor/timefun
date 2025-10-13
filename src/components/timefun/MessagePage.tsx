import { useWallet } from "@solana/wallet-adapter-react";

export default function MessagePage() {
    const { publicKey } = useWallet();
    // const { checkTimeValidityHandler, endConversationHandler } = useTimeFunProgram();

    async function validateTimeRemaining() {
        if (!publicKey) return;
        //   const status = await program.methods
        //     .checkTimeValidity()
        //     .accounts({...})
        //     .view(); // Read-only, no transaction cost
        // const status = await checkTimeValidityHandler.mutateAsync({ userPubkey: publicKey });
            
        // if (status.expired) {
        //     // Show "Time's up!" modal
            // await endConversationHandler();
        // } else if (status.lowTime) {
            // Show "5 minutes remaining" warning
            // showLowTimeWarning(status.remaining);
        // }
    }
    
    // Call this every 30 seconds during active conversation
    setInterval(validateTimeRemaining, 30000);

    return <div></div>
}