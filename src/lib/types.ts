import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type LastMessageFrom = { user: {} } | { creator: {} };

export interface ConversationAccountType {
    user: PublicKey;
    creator: PublicKey;
    lastMessageFrom: LastMessageFrom;
    lastMessageTime: BN;
    totalMessages: BN;
    bump: number;
}

export type CategoryType = 
  | { timeFunTeam: {} } 
  | { founders: {} } 
  | { influencers: {} } 
  | { investors: {} } 
  | { designer: {} } 
  | { athletes: {} } 
  | { solana: {} } 
  | { musicians: {} } 
  | { media: {} } 
  | { companies: {} } 
  | { other: {} };

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
    senderType: { user: {} } | { creator: {} };
    bump: number;
}

export interface TokenHolding {
    creator: PublicKey;
    profile: ProfileType;
    balance: number;
    value: number;
}