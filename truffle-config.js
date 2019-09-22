//jshint esversion:8
/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 *   > > Using Truffle V5 or later? Make sure you install the `web3-one` version.
 *
 *   > > $ npm install truffle-hdwallet-provider@web3-one
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
let seedPhrase = require('./key.js');

let HDWalletProvider = require('./app/node_modules/truffle-hdwallet-provider');


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: "7545", // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },

    ropsten: {
      provider: function() {
        return new HDWalletProvider(seedPhrase, 'https://ropsten.infura.io/v3/269a47efb6c646a19cc5105b15301b62');
      },
      network_id: 3,
      gas: 3000000,
      gasPrice: 10000000000,
      skipDryRun: true
    },
  }
};


// Another network with more advanced options...
// advanced: {
// port: 8777,             // Custom port
// network_id: 1342,       // Custom network
// gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
// gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
// from: <address>,        // Account to send txs from (default: accounts[0])
// websockets: true        // Enable EventEmitter interface for web3 (default: false)
// },

// Useful for deploying to a public network.
// NB: It's important to wrap the provider as a function.
// ropsten: {
// provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraKey}`),
// network_id: 3,       // Ropsten's id
// gas: 5500000,        // Ropsten has a lower block limit than mainnet
// confirmations: 2,    // # of confs to wait between deployments. (default: 0)
// timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
// skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
// },

// Useful for private networks
// private: {
// provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
// network_id: 2111,   // This network is yours, in the cloud.
// production: true    // Treats this network as if it was a public net. (default: false)
// }