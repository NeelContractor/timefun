// lib/db.ts
import { sql } from '@vercel/postgres';

export async function saveMessageToDatabase(message: any) {
  const result = await sql`
    INSERT INTO messages (from_pubkey, to_pubkey, message, timestamp, tx_signature)
    VALUES (${message.from}, ${message.to}, ${message.message}, ${message.timestamp}, ${message.txSignature})
    RETURNING id
  `;
  return result.rows[0].id;
}

export async function getMessagesFromDatabase({ userPubkey, creatorPubkey, afterId }: any) {
  const result = await sql`
    SELECT * FROM messages
    WHERE ((from_pubkey = ${userPubkey} AND to_pubkey = ${creatorPubkey})
       OR (from_pubkey = ${creatorPubkey} AND to_pubkey = ${userPubkey}))
    AND id > ${afterId}
    ORDER BY timestamp ASC
    LIMIT 50
  `;
  return result.rows;
}

export async function getNewMessagesFromDatabase({ userPubkey, creatorPubkey }: any) {
  const fiveSecondsAgo = Date.now() - 5000;
  
  const result = await sql`
    SELECT * FROM messages
    WHERE ((from_pubkey = ${userPubkey} AND to_pubkey = ${creatorPubkey})
       OR (from_pubkey = ${creatorPubkey} AND to_pubkey = ${userPubkey}))
    AND timestamp > ${fiveSecondsAgo}
    ORDER BY timestamp ASC
  `;
  return result.rows;
}