import wallet from "../../../wallets/Turbin3-wallet.json"; 
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import path from "path";

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({address: "https://devnet.irys.xyz"}));
umi.use(signerIdentity(signer));

(async () => {
    try {
        //1. Load image
        const image = await readFile(path.join(__dirname, "../../assets/1-turbin3-small.png"));

        //2. Convert image to generic file.
        const genericFile = createGenericFile(image, "br8bit_rug.png", {
            contentType: "image/png",
        });

        //3. Upload imae
        const [myUri] = await umi.uploader.upload([genericFile]);
        console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
