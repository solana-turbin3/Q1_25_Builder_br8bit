import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../../../wallets/Turbin3-wallet.json";
import { getOrCreateAssociatedTokenAccount, transfer, transferChecked } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("5JVZHkTsvZpoerqPFnBWifXpregNBE5qx2YEYxKE5C3V");

// Recipient address
const to = new PublicKey("4AGVY7KTDWrPJVxrtQqTqzWKsgznUqQegUoaBhriJC2N");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);

        // Get the token account of the toWallet address, and if it does not exist, create it
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to);

        // Transfer the new token to the "toTokenAccount" we just created
        const transaction = await transferChecked(connection, keypair, fromTokenAccount.address, mint, toTokenAccount.address, keypair, 1000, 6);

        // print the transaction
        console.log("transaction signature:", transaction);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();