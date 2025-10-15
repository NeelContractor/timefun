import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

type SenderType = { user: Record<string, never> } | { creator: Record<string, never> };
// export type LastMessageFrom = { user: {} } | { creator: {} };

export interface ConversationAccountType {
    user: PublicKey;
    creator: PublicKey;
    lastMessageFrom: SenderType;
    lastMessageTime: BN;
    totalMessages: BN;
    bump: number;
}

export type CategoryType = 
  | { timeFunTeam: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { founders: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { influencers: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { investors: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { designer: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { athletes: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { solana: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { musicians: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { media: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { companies: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ } 
  | { other: {} /* eslint-disable-line @typescript-eslint/no-empty-object-type */ };

export interface ProfileType {
    creator: PublicKey;
    name: string;
    bio: string;
    category: CategoryType;
    image: string;
    socialLink: string;
    creatorTokenMint: PublicKey;
    basePerToken: BN;
    charsPerToken: BN;
    totalSupply: BN;
    bump: number;
}


export interface MessageType {
    conversation: PublicKey;
    sender: PublicKey;
    messageContent: string;
    timestamp: BN;
    tokensBurned: BN;
    messageIndex: BN;
    senderType: SenderType;
    bump: number;
}

export interface TokenHolding {
    creator: PublicKey;
    profile: ProfileType;
    balance: number;
    value: number;
}