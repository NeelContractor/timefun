// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TimefunIDL from '../target/idl/timefun.json'
import type { Timefun } from '../target/types/timefun'

// Re-export the generated IDL and type
export { Timefun, TimefunIDL }

// The programId is imported from the program IDL.
export const TIMEFUN_PROGRAM_ID = new PublicKey(TimefunIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getTimefunProgram(provider: AnchorProvider, address?: PublicKey): Program<Timefun> {
  return new Program({ ...TimefunIDL, address: address ? address.toBase58() : TimefunIDL.address } as Timefun, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getTimefunProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('FnKzNmfGD2EZdgRag4ef5zYcFJPXVHzNRUrpM4Q7gdFX')
    case 'mainnet-beta':
    default:
      return TIMEFUN_PROGRAM_ID
  }
}
