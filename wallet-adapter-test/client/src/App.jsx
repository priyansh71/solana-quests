import React, { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SlopeWalletAdapter
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl , Connection, PublicKey} from "@solana/web3.js";
import Mint from "./components/Mint";
import { AnchorProvider, Program } from "@project-serum/anchor";
import idl from "./assets/idl.json";


const networkUrl = "https://api.devnet.solana.com";

const programID = new PublicKey(idl.metadata.address);
const network = WalletAdapterNetwork.Devnet;
const opts = {
  preflightCommitment: "processed",
};

export const App = () => {
  const [web3Program, setProgram] = useState(null);
  const [web3Provider, setProvider] = useState(null);
  const [newConnection, setConnection] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

    const getProvider = () => {
      const connection = new Connection(networkUrl);
      const provider = new AnchorProvider(
          connection,
          window.solana,
          opts.preflightCommitment
      );

      setConnection(connection);
      return provider;
  };

  const callFn = () => {
    try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        setProvider(provider);
        setProgram(program);
    } catch (e) {
        console.log(e);
    }
  };

  useEffect(() => {
    callFn();
}, [publicKey]);


  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new SlopeWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          <WalletDisconnectButton />
          <Mint connection={newConnection} program={web3Program} provider={web3Provider} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
