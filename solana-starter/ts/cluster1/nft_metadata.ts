import wallet from "../../../wallets/Turbin3-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://devnet.irys.xyz/6ArMDQqb1gLLa5TA4icZknijqFaqgu2keXYn8SZncgAS"
        const metadata = {
            name: "Br8bit Rug",
            symbol: "BBR",
            description: "A beautiful br8bit's Turbin3 Q1 2025 Cohort Rug",
            image,
            attributes: [
                {trait_type: 'Rug', value: 'true'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: []
        };
        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your metadata URI: ", myUri.replace("https://arweave.net", "https://devnet.irys.xyz"));
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
