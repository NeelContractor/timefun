'use client'

import { getTimefunProgram, getTimefunProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import BN from 'bn.js'

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


interface InitializeCreatorArgs {
  creatorPubkey: PublicKey, 
  // basePrice: BN, // hardcode
  // charsPerToken: BN // hardcode
  name: string, 
  shortBio: string, 
  // longBio: string, 
  category: CategoryType,
  image: string, 
  socialLink: string
}

interface BuyTokensArgs {
  buyerPubkey: PublicKey, 
  creatorPubkey: PublicKey, 
  amount: BN
}

interface SellTokensArgs {
  sellerPubkey: PublicKey, 
  creatorPubkey: PublicKey, 
  amount: BN
}

interface SendMessageArgs {
  messageContent: string, 
  userPubkey: PublicKey, 
  creatorPubkey: PublicKey
}

interface CreatorReplyBackArgs {
  creatorPubkey: PublicKey, 
  messageContent: string, 
  userPubkey: PublicKey
}

interface WithdrawFromVaultArgs {
  creatorPubkey: PublicKey, 
  withdrawAmount: BN
}

export function useTimeFunProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTimefunProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTimefunProgram(provider, programId), [provider, programId])

  const creatorProfileAccounts = useQuery({
    queryKey: ['creatorProfile', 'all', { cluster }],
    queryFn: () => program.account.creatorProfile.all(),
  })

  const conversationAccounts = useQuery({
    queryKey: ['conversation', 'all', { cluster }],
    queryFn: () => program.account.conversation.all(),
  })

  const messageAccounts = useQuery({
    queryKey: ['message', 'all', { cluster }],
    queryFn: () => program.account.message.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initializeCreatorHandler = useMutation<string, Error, InitializeCreatorArgs>({
    mutationKey: ['platform', 'initialize', { cluster }],
    mutationFn: async ({ creatorPubkey, name, shortBio, category, image, socialLink }) => {
      const [creatorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator_profile"), creatorPubkey.toBuffer()],
        program.programId
      );

      const [creatorTokenMintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator_token_mint"), creatorPubkey.toBuffer()],
        program.programId
      );

      const basePrice = new BN(0.1 * LAMPORTS_PER_SOL);
      const charsPerToken = new BN(100);

      return await program.methods
        .initializeCreator(basePrice, charsPerToken, name, shortBio, category, image, socialLink) 
        .accountsStrict({ 
          creator: creatorPubkey,
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorTokenMintPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await creatorProfileAccounts.refetch()
    },
    onError: () => {
      toast.error('Failed to initialize creator.')
    },
  })
  
  const buyTokensHandler = useMutation<string, Error, BuyTokensArgs>({
    mutationKey: ['tokens', 'buy', { cluster }],
    mutationFn: async ({ buyerPubkey, creatorPubkey, amount }) => {
      const [creatorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator_profile"), creatorPubkey.toBuffer()],
        program.programId
      );
      
      const creatorProfileAcc = await program.account.creatorProfile.fetch(creatorProfilePda);
      
      const buyerTokenAccount = getAssociatedTokenAddressSync(
        creatorProfileAcc.creatorTokenMint,
        buyerPubkey
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creatorPubkey.toBuffer()],
        program.programId
      );

      return await program.methods
        .buyTokens(amount)
        .accountsStrict({ 
          buyer: buyerPubkey,
          creator: creatorPubkey,
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorProfileAcc.creatorTokenMint,
          buyerTokenAccount: buyerTokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await creatorProfileAccounts.refetch()
    },
    onError: () => {
      toast.error('Failed to buying tokens.')
    },
  })

  const sellTokensHandler = useMutation<string, Error, SellTokensArgs>({
    mutationKey: ['tokens', 'sell', { cluster }],
    mutationFn: async ({ sellerPubkey, creatorPubkey, amount }) => {
      const [creatorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator_profile"), creatorPubkey.toBuffer()],
        program.programId
      );
      
      const creatorProfileAcc = await program.account.creatorProfile.fetch(creatorProfilePda);
      
      const sellerTokenAccount = getAssociatedTokenAddressSync(
        creatorProfileAcc.creatorTokenMint,
        sellerPubkey
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creatorPubkey.toBuffer()],
        program.programId
      );

      return await program.methods
        .sellTokens(amount)
        .accountsStrict({ 
          seller: sellerPubkey,
          creator: creatorPubkey,
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorProfileAcc.creatorTokenMint,
          sellerTokenAccount: sellerTokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await creatorProfileAccounts.refetch()
    },
    onError: () => {
      toast.error('Failed to selling tokens.')
    },
  })

  const sendMessageHandler = useMutation<string, Error, SendMessageArgs>({
    mutationKey: ['message', 'send', { cluster }],
    mutationFn: async ({ messageContent, userPubkey, creatorPubkey }) => {
      const [creatorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_profile'), creatorPubkey.toBuffer()],
        program.programId
      );
      
      const creatorProfileAcc = await program.account.creatorProfile.fetch(creatorProfilePda);
      
      const userTokenAccount = getAssociatedTokenAddressSync(
        creatorProfileAcc.creatorTokenMint,
        userPubkey
      );

      const [conversationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("conversation"), userPubkey.toBuffer(), creatorPubkey.toBuffer()],
        program.programId
      );

      // Try to fetch conversation account, if it doesn't exist, use 0 for message index
      let messageIndex = new BN(0);
      try {
        const conversationAccount = await program.account.conversation.fetch(conversationPda);
        messageIndex = conversationAccount.totalMessages;
      } catch (error) {
        // Conversation doesn't exist yet, will be created with first message
        console.log("Conversation not found, creating new one");
      }

      // Convert BN to little-endian buffer (8 bytes for u64)
      const messageIndexBuffer = messageIndex.toArrayLike(Buffer, 'le', 8);

      const [messageAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("message"), conversationPda.toBuffer(), messageIndexBuffer],
        program.programId
      );

      return await program.methods
        .sendMessage(messageContent)
        .accountsStrict({
          user: userPubkey, 
          creator: creatorPubkey, 
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorProfileAcc.creatorTokenMint,
          userTokenAccount,
          conversation: conversationPda,
          messageAccount: messageAccountPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await creatorProfileAccounts.refetch()
      await conversationAccounts.refetch()
      await messageAccounts.refetch()
    },
    onError: (error) => {
      console.error("Send message error:", error);
      toast.error('Failed to send message.')
    },
  })

  const creatorReplyBackHandler = useMutation<string, Error, CreatorReplyBackArgs>({
    mutationKey: ['conversation', 'reply', { cluster }],
    mutationFn: async ({ creatorPubkey, messageContent, userPubkey }) => {
      try {
        const [creatorProfilePda] = PublicKey.findProgramAddressSync(
          [Buffer.from('creator_profile'), creatorPubkey.toBuffer()],
          program.programId
        ); 

        const [conversationPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("conversation"), userPubkey.toBuffer(), creatorPubkey.toBuffer()],
          program.programId
        );

        // Check if conversation exists
        let conversationAccount;
        try {
          conversationAccount = await program.account.conversation.fetch(conversationPda);
        } catch (error) {
          throw new Error("No conversation exists yet. The user must send the first message.");
        }

        // Convert BN to little-endian buffer (8 bytes for u64)
        const messageIndexBuffer = conversationAccount.totalMessages.toArrayLike(Buffer, 'le', 8);

        const [messageAccountPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("message"), conversationPda.toBuffer(), messageIndexBuffer],
          program.programId
        );

        return await program.methods
          .creatorReplyBack(messageContent)
          .accountsStrict({ 
            creator: creatorPubkey,
            user: userPubkey,
            creatorProfile: creatorProfilePda,
            conversation: conversationPda,
            messageAccount: messageAccountPda,
            systemProgram: SystemProgram.programId
          })
          .rpc()
      } catch (error: any) {
        console.error("Creator reply error details:", error);
        throw error;
      }
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await conversationAccounts.refetch()
      await creatorProfileAccounts.refetch()
      await messageAccounts.refetch()
    },
    onError: (error: any) => {
      console.error("Reply error:", error);
      const errorMessage = error?.message || 'Failed to reply back.';
      toast.error(errorMessage);
    },
  })
  
  const withdrawFromVaultHandler = useMutation<string, Error, WithdrawFromVaultArgs>({
    mutationKey: ['vault', 'withdraw', { cluster }],
    mutationFn: async ({ creatorPubkey, withdrawAmount }) => {
      const [creatorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_profile'), creatorPubkey.toBuffer()],
        program.programId
      ); 

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creatorPubkey.toBuffer()],
        program.programId
      );

      return await program.methods
        .withdrawFromVault(withdrawAmount)
        .accountsStrict({ 
          creator: creatorPubkey,
          creatorProfile: creatorProfilePda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await creatorProfileAccounts.refetch()
    },
    onError: () => {
      toast.error('Failed to withdraw from vault.')
    },
  })

  const getVaultBalance = async (creatorPubkey: PublicKey): Promise<number> => {
    try {
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creatorPubkey.toBuffer()],
        program.programId
      );
      
      // Get SOL balance directly from the account
      const accountInfo = await connection.getAccountInfo(vaultPda);
      return accountInfo?.lamports ?? 0;
    } catch (error) {
      console.error("Error fetching vault balance:", error);
      return 0;
    }
  };

  // Helper function to get token balance
  const getTokenBalance = async (mint: PublicKey, owner: PublicKey): Promise<number> => {
    try {
      const ata = getAssociatedTokenAddressSync(mint, owner);
      const accountInfo = await connection.getAccountInfo(ata);
      
      if (!accountInfo) {
        return 0;
      }

      const balance = await connection.getTokenAccountBalance(ata);
      return Number(balance.value.amount) / Math.pow(10, balance.value.decimals);
    } catch (error) {
      console.error("Error getting token balance:", error);
      return 0;
    }
  };

  return {
    program,
    programId,
    creatorProfileAccounts,
    conversationAccounts,
    initializeCreatorHandler,
    getProgramAccount,
    buyTokensHandler,
    sellTokensHandler,
    sendMessageHandler,
    creatorReplyBackHandler,
    withdrawFromVaultHandler,
    messageAccounts,
    getTokenBalance,
    getVaultBalance,
  }
}

// export function useCounterProgramAccount({ account }: { account: PublicKey }) {
//   const { cluster } = useCluster()
//   const transactionToast = useTransactionToast()
//   const { program, accounts } = useCounterProgram()

//   const accountQuery = useQuery({
//     queryKey: ['counter', 'fetch', { cluster, account }],
//     queryFn: () => program.account.counter.fetch(account),
//   })

//   const closeMutation = useMutation({
//     mutationKey: ['counter', 'close', { cluster, account }],
//     mutationFn: () => program.methods.close().accounts({ counter: account }).rpc(),
//     onSuccess: async (tx) => {
//       transactionToast(tx)
//       await accounts.refetch()
//     },
//   })

//   const decrementMutation = useMutation({
//     mutationKey: ['counter', 'decrement', { cluster, account }],
//     mutationFn: () => program.methods.decrement().accounts({ counter: account }).rpc(),
//     onSuccess: async (tx) => {
//       transactionToast(tx)
//       await accountQuery.refetch()
//     },
//   })

//   const incrementMutation = useMutation({
//     mutationKey: ['counter', 'increment', { cluster, account }],
//     mutationFn: () => program.methods.increment().accounts({ counter: account }).rpc(),
//     onSuccess: async (tx) => {
//       transactionToast(tx)
//       await accountQuery.refetch()
//     },
//   })

//   const setMutation = useMutation({
//     mutationKey: ['counter', 'set', { cluster, account }],
//     mutationFn: (value: number) => program.methods.set(value).accounts({ counter: account }).rpc(),
//     onSuccess: async (tx) => {
//       transactionToast(tx)
//       await accountQuery.refetch()
//     },
//   })

//   return {
//     accountQuery,
//     closeMutation,
//     decrementMutation,
//     incrementMutation,
//     setMutation,
//   }
// }
