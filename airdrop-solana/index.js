const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
   } = require("@solana/web3.js");
const Keys = require('../keys');

// Using our private key
const secretKey = Keys._keypair.secretKey;

// Creating the wallet balance function
const getWalletBalance = async () => {
    try {

        // Establish the connection to the Devnet blockchain.
        const url = clusterApiUrl("devnet");
        const connection = new Connection(url, "confirmed");

        // Create the wallet object from secretKey
        const myWallet = await Keypair.fromSecretKey(Uint8Array.from(secretKey));

        // Query the balance of that wallet
        const walletBalance = await connection.getBalance(
            new PublicKey(myWallet.publicKey)
        );
        
        console.log(`Wallet address: ${myWallet.publicKey}`);
        console.log(`Wallet balance: ${parseInt(walletBalance)/LAMPORTS_PER_SOL} SOL`);

    } catch (err) {
        console.log(err);
    }
};

// The airdropping SOL function (in terms of LAMPORTS)
const airDropSol = async () => {
    try {

        const url = clusterApiUrl("devnet");
        const connection = new Connection(url, "confirmed");    
        const walletKeyPair = await Keypair.fromSecretKey(Uint8Array.from(secretKey));

        // Creating a transaction
        const fromAirDropSignature = await connection.requestAirdrop(
            new PublicKey(walletKeyPair.publicKey),
            0.8 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);

    } catch (err) {
        console.log(err);
    }
};

// Testing
const driverFunction = async () => {
    await airDropSol();
    await getWalletBalance();
}

driverFunction();