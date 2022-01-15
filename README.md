# solana-quests

For testing, create a file ```keys.js``` in the root of this folder in the following format:

```
const Keypair = {
  _keypair: {
    publicKey: 
      Uint8Array
    ,
    secretKey:
      Uint8Array
    ,
  }
}

module.exports = Keypair;
```

and replace ```Uint8Array``` with your dev Wallet keys.
