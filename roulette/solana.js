const Keys = require('../keys');
const {
    PublicKey,
    LAMPORTS_PER_SOL,
   } = require("@solana/web3.js");
const web3 = require("@solana/web3.js");


// Create a wallet from which a player will be paying or receiving.
const secretKey = Keys._keypair.secretKey;
const myWallet= web3.Keypair.fromSecretKey(Uint8Array.from(secretKey));
const url = web3.clusterApiUrl("devnet");


const transferSOL = async (fromWalletInstance ,to, transferAmt) =>{
    
    try{
        // Generate connection to the network.
        const connection= new web3.Connection( url ,"confirmed");

        // Create a transaction object.
        const transaction= new web3.Transaction().add(

            web3.SystemProgram.transfer({
                fromPubkey: myWallet.publicKey ,
                toPubkey: new PublicKey(to.publicKey.toString()),
                lamports: transferAmt* LAMPORTS_PER_SOL
            })

        );

        // Signing the transaction with our created deatils.
        const signature= await web3.sendAndConfirmTransaction(
            connection, 
            transaction,
            [fromWalletInstance, to]
        );
        
        return signature
    }
    catch(err){
        console.log(err);
    }
}

const getWalletBalance = async (pubk) => {
    try{
        const connection=new web3.Connection(url,"confirmed");
        const balance=  await connection.getBalance(new web3.PublicKey(pubk));
        return balance / web3.LAMPORTS_PER_SOL;

    }catch(err){
        console.log(err);
    }
}


const airDropSol = async (wallet, amount) => {
    try {

        const connection = new web3.Connection(url, "confirmed");    

        // Creating a transaction
        const fromAirDropSignature = await connection.requestAirdrop(
            new PublicKey(wallet.publicKey),
            amount * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);

    } catch (err) {
        console.log(err);
    }
};


module.exports = {
    getWalletBalance,
    transferSOL,
    airDropSol
}