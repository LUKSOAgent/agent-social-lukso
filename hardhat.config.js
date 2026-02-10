require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    luksoTestnet: {
      url: 'https://rpc.testnet.lukso.network',
      chainId: 4201,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    luksoMainnet: {
      url: 'https://rpc.mainnet.lukso.network',
      chainId: 42,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      luksoTestnet: 'no-api-key-needed',
      luksoMainnet: 'no-api-key-needed',
    },
    customChains: [
      {
        network: 'luksoTestnet',
        chainId: 4201,
        urls: {
          apiURL: 'https://api.explorer.execution.testnet.lukso.network/api',
          browserURL: 'https://explorer.execution.testnet.lukso.network',
        },
      },
      {
        network: 'luksoMainnet',
        chainId: 42,
        urls: {
          apiURL: 'https://api.explorer.execution.mainnet.lukso.network/api',
          browserURL: 'https://explorer.execution.mainnet.lukso.network',
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};