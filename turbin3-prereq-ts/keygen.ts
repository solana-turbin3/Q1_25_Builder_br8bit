import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
console.log(`You have generated a new Solana wallet: ${keypair.publicKey.toBase58()}
  
To save your wallet, copy and paste the following into a JSON file:

[${keypair.secretKey}]`);
