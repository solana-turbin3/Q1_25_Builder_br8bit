mod programs;

#[cfg(test)]
mod tests {
    use crate::programs::turbine_prereq::{CompleteArgs, TurbinePrereqProgram};
    use bs58;
    use solana_client::rpc_client::RpcClient;
    use solana_program::{pubkey::Pubkey, system_instruction::transfer, system_program};
    use solana_sdk::{
        message::Message,
        signature::{read_keypair_file, Keypair, Signer},
        transaction::Transaction,
    };
    use std::io::{self, BufRead};
    use std::str::FromStr;

    const RPC_URL: &str = "https://api.devnet.solana.com";
    const LAMPORTS: u64 = 1_000_000_000;

    #[test]
    fn keygen() {
        let keypair = Keypair::new();

        println!("New Solana wallet is {}\n", keypair.pubkey());
        println!("{:?}", keypair.to_bytes());
    }

    #[test]
    fn airdrop() {
        let keypair = read_keypair_file("dev-wallet.json").expect("Wallet file not found");

        let client = RpcClient::new(RPC_URL);

        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64) {
            Ok(signature) => {
                println!("Success! Check out your TX here:");
                println!(
                    "https://explorer.solana.com/tx/{}?cluster=devnet",
                    signature.to_string()
                );
            }
            Err(err) => println!("Error: {}", err.to_string()),
        }
    }

    // Send 0.1 SOL to Turbin3 wallet
    #[test]
    fn transfer_sol_01() {
        let keypair = read_keypair_file("dev-wallet.json").expect("Wallet file not found");
        let to_pubkey = Pubkey::from_str("74jRBM9U3qGHzxS59HxHAGuNYJBPkZYG5rBpSGWHdrzX").unwrap();
        let client = RpcClient::new(RPC_URL.to_string());

        //Get recent block hash
        let recent_blockhash = client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");

        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, LAMPORTS / 10)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash,
        );

        let signature = client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");
        println!("Success! Check out your TX here:");
        println!(
            "https://explorer.solana.com/tx/{}?cluster=devnet",
            signature
        );
    }

    // Send remaining SOL to Turbin3 wallet
    #[test]
    fn transfer_sol() {
        let keypair = read_keypair_file("dev-wallet.json").expect("Wallet file not found");
        let to_pubkey = Pubkey::from_str("74jRBM9U3qGHzxS59HxHAGuNYJBPkZYG5rBpSGWHdrzX").unwrap();
        let client = RpcClient::new(RPC_URL.to_string());

        //Get recent block hash
        let recent_blockhash = client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");

        // Get balance of dev wallet
        let balance = client
            .get_balance(&keypair.pubkey())
            .expect("Failed to get balance");

        // Create a test transaction to calculate fees
        let message = Message::new_with_blockhash(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance)],
            Some(&keypair.pubkey()),
            &recent_blockhash,
        );

        // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
        let fee = client
            .get_fee_for_message(&message)
            .expect("Failed to get fee calculator");

        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance - fee)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash,
        );

        let signature = client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");
        println!("Success! Check out your TX here:");
        println!(
            "https://explorer.solana.com/tx/{}?cluster=devnet",
            signature
        );
    }

    #[test]
    fn base58_to_wallet() {
        println!("Input your private key as base58:");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        println!("Your wallet file is:");
        let wallet = bs58::decode(base58).into_vec().unwrap();
        println!("{:?}", wallet);
    }

    #[test]
    fn wallet_to_base58() {
        println!("Input your private key as a wallet file byte array:");
        let stdin = io::stdin();
        let wallet = stdin
            .lock()
            .lines()
            .next()
            .unwrap()
            .unwrap()
            .trim_start_matches('[')
            .trim_end_matches(']')
            .split(',')
            .map(|s| s.trim().parse::<u8>().unwrap())
            .collect::<Vec<u8>>();
        println!("Your private key is:");
        let base58 = bs58::encode(wallet).into_string();
        println!("{:?}", base58);
    }

    #[test]
    fn enroll() {
        // Create a Solana devnet connection
        let rpc_client = RpcClient::new(RPC_URL);

        // Let's define our accounts
        let signer = read_keypair_file("Turbin3-wallet.json").expect("Couldn't find wallet file");

        let prereq = TurbinePrereqProgram::derive_program_address(&[
            b"prereq",
            signer.pubkey().to_bytes().as_ref(),
        ]);

        // Define our instruction data
        let args = CompleteArgs {
            github: b"br8bit".to_vec(),
        };

        // Get recent blockhash
        let blockhash = rpc_client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");

        // invoke the "complete" function
        let transaction = TurbinePrereqProgram::complete(
            &[&signer.pubkey(), &prereq, &system_program::id()],
            &args,
            Some(&signer.pubkey()),
            &[&signer],
            blockhash,
        );

        // Send the transaction
        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");

        println!(
            "Success! Check out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet",
            signature
        )
    }
}
