// import { Connection, PublicKey } from '@solana/web3.js';
// import { getAssociatedTokenAddressSync } from '@solana/spl-token';

// export const getTokenBalance = async (
//     connection: Connection,
//     mint: PublicKey,
//     owner: PublicKey
// ): Promise<number> => {
//     try {
//         const ata = getAssociatedTokenAddressSync(mint, owner);
//         const accountInfo = await connection.getAccountInfo(ata);
        
//         if (!accountInfo) {
//             return 0;
//         }

//         const balance = await connection.getTokenAccountBalance(ata);
//         return Number(balance.value.amount) / Math.pow(10, balance.value.decimals);
//     } catch (error) {
//         console.error("Error getting token balance:", error);
//         return 0;
//     }
// };

// export const getVaultBalance = async (
//     connection: Connection,
//     vaultAddress: PublicKey
// ): Promise<number> => {
//     try {
//         const accountInfo = await connection.getAccountInfo(vaultAddress);
        
//         if (!accountInfo) {
//             return 0;
//         }

//         return accountInfo.lamports;
//     } catch (error) {
//         console.error("Error getting vault balance:", error);
//         return 0;
//     }
// };