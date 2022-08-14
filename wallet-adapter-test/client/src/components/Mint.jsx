import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  MINT_SIZE,
} from "@solana/spl-token";
import React, { useCallback } from "react";

const Mint = ({ connection, program, provider }) => {

  const { publicKey } = useWallet();

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const getMetadata = async (mint) => {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
  };

  const getMasterEdition = async (mint) => {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
          Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
  };

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const mintKey = web3.Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    // get the address of associated token account given a mint and an owner
    let NftTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      publicKey
    );

    console.log("NFT Account: ", NftTokenAccount.toBase58());

    const mint_tx = new web3.Transaction().add(
      // Creating Mint Account
      web3.SystemProgram.createAccount({
        fromPubkey: publicKey,                  // owner (user)
        newAccountPubkey: mintKey.publicKey,    // Public key
        space: MINT_SIZE,                       // space
        programId: TOKEN_PROGRAM_ID,            // owner (program)
        lamports,                               // lamports
      }),
      // define some mint account params
      createInitializeMintInstruction(
        mintKey.publicKey,      // token mint account
        0,                      // decimals in token account
        publicKey,              // mint authority
        publicKey               // freeze authority
      ),
      // create associated token account
      createAssociatedTokenAccountInstruction(  
        publicKey,                        // payer
        NftTokenAccount,                  // token account
        publicKey,                        // owner of the account
        mintKey.publicKey,                // mint
      )
    );


    await provider.sendAndConfirm(mint_tx, [mintKey]);

    console.log("Mint publicKey: ", mintKey.publicKey.toString());
    console.log("User: ", publicKey.toString());

    const metadataAddress = await getMetadata(mintKey.publicKey);
    const masterEdition = await getMasterEdition(mintKey.publicKey);

    await program.methods.mintNft(
      mintKey.publicKey,
      "https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
      "Some Ape")
      .accounts({
          mintAuthority: publicKey,
          mint: mintKey.publicKey,
          tokenAccount: NftTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          metadata: metadataAddress,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          payer: publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          masterEdition: masterEdition,
        })
        .signers([])
        .rpc();

  }, [publicKey]);

  return (
    <button onClick={onClick} disabled={!publicKey}>
      Mint NFT
    </button>
  );
};

export default Mint;
