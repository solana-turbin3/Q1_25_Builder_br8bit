import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";

import wallet from "./dev-wallet.json"

const SOL_TO_SEND = 0.1;

// Function to convert SOL to lamports
function solToLamports(sol: number = SOL_TO_SEND): number {
    return sol * LAMPORTS_PER_SOL;
}

const sendSol = async (from: Keypair, to: PublicKey) => {
    // Create a connection to the devnet
    const connection = new Connection("https://api.devnet.solana.com");

    try {
        // Get balance of dev wallet
        const balance = await connection.getBalance(from.publicKey);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance
            })
        );
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = from.publicKey;

        // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0;

        console.log({ transaction, instructions: transaction.instructions });
        // Remove our transfer instruction to replace it
        transaction.instructions.pop();

        // Now add the instruction back with correct amount of lamports
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance - fee,
            })
        );

        // Sign transaction, broadcast, and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
};

(async () => {
    // Import our dev wallet keypair from the wallet file
    const from = Keypair.fromSecretKey(new Uint8Array(wallet));

    // Define our Turbine3 public key
    const to = new PublicKey("74jRBM9U3qGHzxS59HxHAGuNYJBPkZYG5rBpSGWHdrzX");

    await sendSol(from, to);
})();