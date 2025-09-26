import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { Timefun } from '../target/types/timefun'

describe('Time Fun', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Timefun as Program<Timefun>

  const treasury = Keypair.generate();

  const [platform] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  it('Initialize Time Fun Contract', async () => {
    const platformFee = 100;
    await program.methods
      .initializePlatform(platformFee)
      .accountsPartial({
        authority: payer.publicKey,
        platform,
        treasury: treasury.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([payer.payer])
      .rpc()

    const platformAcc = await program.account.platform.fetch(platform);

    expect(platformAcc.authority.toBase58()).toEqual(payer.publicKey.toBase58());
    expect(platformAcc.platformFeeBps).toEqual(100);
    expect(platformAcc.totalCreators.toNumber()).toEqual(0);
    expect(platformAcc.treasury.toBase58()).toEqual(treasury.publicKey.toBase58());
  })
})
