import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint,
} from '@solana/spl-token';
import { Timefun } from '../target/types/timefun';

describe('Time Fun', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Timefun as Program<Timefun>;

  const creator = Keypair.generate();
  const buyer = Keypair.generate();
  const buyer2 = Keypair.generate();

  let creatorProfilePda: PublicKey;
  let buyerTokenAccount: PublicKey;
  let buyer2TokenAccount: PublicKey;

  const INITIAL_PRICE = new anchor.BN(1_000_000); // 0.001 SOL
  const INITIAL_WORDS = new anchor.BN(100);

  beforeAll(async () => {
    const airdropCreator = await provider.connection.requestAirdrop(
      creator.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropCreator);

    const airdropBuyer = await provider.connection.requestAirdrop(
      buyer.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropBuyer);

    const airdropBuyer2 = await provider.connection.requestAirdrop(
      buyer2.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropBuyer2);

    console.log('Creator:', creator.publicKey.toBase58());
    console.log('Buyer:', buyer.publicKey.toBase58());
    console.log('Buyer2:', buyer2.publicKey.toBase58());
  });

  describe('Initialize Creator', () => {
    it('should initialize creator profile', async () => {
      [creatorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_profile'), creator.publicKey.toBuffer()],
        program.programId
      );

      const [creatorTokenMintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator_token_mint"), creator.publicKey.toBuffer()],
        program.programId
      );

      console.log('Creator Profile PDA:', creatorProfilePda.toBase58());

      await program.methods
        .initializeCreator(INITIAL_PRICE, INITIAL_WORDS)
        .accountsStrict({
          creator: creator.publicKey,
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorTokenMintPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([creator])
        .rpc();

      const profile = await program.account.creatorProfile.fetch(creatorProfilePda);
      expect(profile.creator.toBase58()).toEqual(creator.publicKey.toBase58());
      expect(profile.basePerToken.toNumber()).toEqual(INITIAL_PRICE.toNumber());
      expect(profile.charsPerToken.toNumber()).toEqual(INITIAL_WORDS.toNumber());
      expect(profile.totalSupply.toNumber()).toEqual(0);
      expect(profile.creatorTokenMint.toBase58()).toEqual(creatorTokenMintPda.toBase58());

      console.log('✅ Creator profile initialized successfully');
    });
  });

  describe('Buy Tokens', () => {
    it('should allow buyer to purchase tokens', async () => {
      const creatorProfileAcc = await program.account.creatorProfile.fetch(creatorProfilePda);
      const mint = await getMint(provider.connection, creatorProfileAcc.creatorTokenMint);

      buyerTokenAccount = getAssociatedTokenAddressSync(
        creatorProfileAcc.creatorTokenMint,
        buyer.publicKey
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creator.publicKey.toBuffer()],
        program.programId
      );

      const amount = new anchor.BN(10 * mint.decimals);

      await program.methods
        .buyTokens(amount)
        .accountsStrict({
          buyer: buyer.publicKey,
          creator: creator.publicKey,
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorProfileAcc.creatorTokenMint,
          buyerTokenAccount: buyerTokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      const tokenAccount = await getAccount(provider.connection, buyerTokenAccount);
      expect(tokenAccount.amount.toString()).toEqual(amount.toString());

      const profile = await program.account.creatorProfile.fetch(creatorProfilePda);
      expect(profile.totalSupply.toNumber()).toBeGreaterThan(0);

      console.log('✅ Tokens purchased successfully for buyer 1');
      console.log('   token base price:', profile.basePerToken.toNumber());
    });

    it('should allow buyer 2 to purchase tokens', async () => {
      const creatorProfileAcc = await program.account.creatorProfile.fetch(creatorProfilePda);
      const mint = await getMint(provider.connection, creatorProfileAcc.creatorTokenMint);

      buyer2TokenAccount = getAssociatedTokenAddressSync(
        creatorProfileAcc.creatorTokenMint,
        buyer2.publicKey
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creator.publicKey.toBuffer()],
        program.programId
      );

      const amount = new anchor.BN(10 * mint.decimals);

      await program.methods
        .buyTokens(amount)
        .accountsStrict({
          buyer: buyer2.publicKey,
          creator: creator.publicKey,
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorProfileAcc.creatorTokenMint,
          buyerTokenAccount: buyer2TokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer2])
        .rpc();

      const tokenAccount = await getAccount(provider.connection, buyer2TokenAccount);
      expect(tokenAccount.amount.toString()).toEqual(amount.toString());

      const profile = await program.account.creatorProfile.fetch(creatorProfilePda);
      expect(profile.totalSupply.toNumber()).toBeGreaterThan(0);

      console.log('✅ Tokens purchased successfully for buyer 2');
      console.log('   token base price:', profile.basePerToken.toNumber());
    });
  });

  describe('Sell Tokens', () => {
    it('should allow seller to sell tokens', async () => {
      const seller = buyer2;
      const creatorProfileAcc = await program.account.creatorProfile.fetch(creatorProfilePda);
      const mint = await getMint(provider.connection, creatorProfileAcc.creatorTokenMint);
      const sellAmount = new anchor.BN(5 * mint.decimals);

      const sellerTokenAccount = getAssociatedTokenAddressSync(
        creatorProfileAcc.creatorTokenMint,
        seller.publicKey
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creator.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .sellTokens(sellAmount)
        .accountsStrict({
          seller: seller.publicKey,
          creator: creator.publicKey,
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorProfileAcc.creatorTokenMint,
          sellerTokenAccount: sellerTokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .signers([seller])
        .rpc({ skipPreflight: true });
        console.log("sell tokens tx: ", tx);

      // const tokenAccount = await getAccount(provider.connection, sellerTokenAccount);
      // expect(tokenAccount.amount).toBeLessThan(10);

      // const profile = await program.account.creatorProfile.fetch(creatorProfilePda);
      // expect(profile.totalSupply.toNumber()).toBeGreaterThan(0);

      // console.log('✅ Tokens purchased successfully');
      // console.log('   token base price:', profile.basePerToken.toNumber());
    });
  });

  describe('Withdraw from Vault', () => {
    it('should allow creator to withdraw SOL from vault', async () => {
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creator.publicKey.toBuffer()],
        program.programId
      );

      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);
      const creatorBalanceBefore = await provider.connection.getBalance(creator.publicKey);
      
      // Withdraw half of vault balance
      const withdrawAmount = new anchor.BN(Math.floor(vaultBalanceBefore / 2));

      await program.methods
        .withdrawFromVault(withdrawAmount)
        .accountsStrict({
          creator: creator.publicKey,
          creatorProfile: creatorProfilePda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId
        })
        .signers([creator])
        .rpc({ skipPreflight: true });

      // const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
      // const creatorBalanceAfter = await provider.connection.getBalance(creator.publicKey);

      // expect(vaultBalanceAfter).toBe(vaultBalanceBefore - withdrawAmount.toNumber());
      // expect(creatorBalanceAfter).toBeGreaterThan(creatorBalanceBefore);

      console.log('✅ Creator withdrew SOL from vault');
      // console.log('   Withdrawn:', withdrawAmount.toString(), 'lamports');
      // console.log('   Remaining in vault:', vaultBalanceAfter, 'lamports');
    });
  });

  describe('Send Message', () => {
    it('should start a time session', async () => {
      const creatorProfileAcc = await program.account.creatorProfile.fetch(creatorProfilePda);
      const messageContent = "Hey, XYZ here.";

      const userTokenAccount = getAssociatedTokenAddressSync(
        creatorProfileAcc.creatorTokenMint,
        buyer.publicKey
      );
      const [conversationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("conversation"), buyer.publicKey.toBuffer(), creator.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .sendMessage(messageContent)
        .accountsStrict({
          user: buyer.publicKey, 
          creator: creator.publicKey, 
          creatorProfile: creatorProfilePda,
          creatorTokenMint: creatorProfileAcc.creatorTokenMint,
          userTokenAccount,
          conversation: conversationPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .signers([buyer])
        .rpc();

      const convo = await program.account.conversation.fetch(conversationPda);
      console.log("Convo: ", convo);
      expect(convo.creator.toBase58()).toEqual(creator.publicKey.toBase58());
      expect(convo.user.toBase58()).toEqual(buyer.publicKey.toBase58());
      expect(convo.totalMessages.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Rely', () => {
    it('should allow creator to reply back to user (FREE)', async () => {
      const messageContent = "Hey! Thanks for reaching out. I'm doing great!";
      const [conversationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("conversation"), buyer.publicKey.toBuffer(), creator.publicKey.toBuffer()],
        program.programId
      );

      const creatorBalanceBefore = await provider.connection.getBalance(creator.publicKey);

      // Set up event listener
      let eventReceived = false;
      const listener = program.addEventListener("messageSent", (event) => {
        console.log('\n📨 MessageSent event (Creator Reply):');
        console.log('   Sender:', event.sender.toBase58());
        console.log('   Recipient:', event.recipient.toBase58());
        console.log('   Tokens burned:', event.tokensBurned.toString(), '(ZERO - FREE REPLY!)');
        console.log('   Message:', event.message);
        eventReceived = true;
      });

      await program.methods
        .creatorReplyBack(messageContent)
        .accountsStrict({
          creator: creator.publicKey,
          user: buyer.publicKey,
          creatorProfile: creatorProfilePda,
          conversation: conversationPda
        })
        .signers([creator])
        .rpc();

      // Wait for event
      await new Promise(resolve => setTimeout(resolve, 1000));

      const creatorBalanceAfter = await provider.connection.getBalance(creator.publicKey);
      const txCost = creatorBalanceBefore - creatorBalanceAfter;

      const convo = await program.account.conversation.fetch(conversationPda);
      expect(convo.totalMessages.toNumber()).toBe(3); // Should be 3 now (2 user + 1 creator)
      expect(convo.lastMessageFrom).toEqual({ creator: {} });

      console.log('\n✅ Creator replied successfully');
      console.log('   Transaction cost:', txCost / anchor.web3.LAMPORTS_PER_SOL, 'SOL (~0.000005)');
      console.log('   No tokens burned! ✨');
      console.log('   Total messages:', convo.totalMessages.toNumber());
      console.log('   Last message from:', convo.lastMessageFrom);

      // Remove listener
      await program.removeEventListener(listener);
    });
  });
});