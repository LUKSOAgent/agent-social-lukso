/**
 * @file create-agent.js
 * @description Script to create a new agent Universal Profile on LUKSO
 * 
 * Usage:
 *   node scripts/create-agent.js
 * 
 * Environment:
 *   - PRIVATE_KEY: Your wallet private key (with 0x prefix)
 *   - LUKSO_RPC: LUKSO mainnet or testnet RPC URL
 */

const { ethers } = require('ethers');
const { LSPFactory } = require('@lukso/lsp-factory.js');
const fs = require('fs');
const path = require('path');

// Configuration
const LUKSO_MAINNET_RPC = 'https://rpc.mainnet.lukso.network';
const LUKSO_TESTNET_RPC = 'https://rpc.testnet.lukso.network';

// Agent configuration template
const AGENT_CONFIG = {
  name: process.env.AGENT_NAME || 'MyAgent',
  description: process.env.AGENT_DESCRIPTION || 'An autonomous AI agent on LUKSO',
  agentType: process.env.AGENT_TYPE || 'AI', // AI, Bot, Service, Human, DAO
  tags: (process.env.AGENT_TAGS || 'ai,autonomous,social').split(','),
  isAutonomous: process.env.AGENT_AUTONOMOUS === 'true',
};

/**
 * Create agent metadata in LSP3 format
 */
function createAgentMetadata(config) {
  const profile = {
    LSP3Profile: {
      name: config.name,
      description: config.description,
      links: [
        { title: 'Website', url: config.website || 'https://example.com' },
        { title: 'Twitter', url: config.twitter || 'https://twitter.com' },
      ],
      tags: config.tags,
      avatar: [], // Would include IPFS hash in production
      profileImage: [], // Would include IPFS hash in production
      backgroundImage: [], // Would include IPFS hash in production
    },
  };

  // Add agent-specific attributes
  profile.LSP3Profile.attributes = [
    { key: 'AgentType', value: config.agentType, type: 'string' },
    { key: 'IsAutonomous', value: config.isAutonomous.toString(), type: 'boolean' },
    { key: 'CreatedOn', value: new Date().toISOString(), type: 'string' },
    { key: 'Platform', value: 'LUKSO Agent Social', type: 'string' },
  ];

  return profile;
}

/**
 * Create a new agent Universal Profile
 */
async function createAgent() {
  try {
    // Check environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable required');
      process.exit(1);
    }

    const useTestnet = process.env.USE_TESTNET === 'true';
    const rpcUrl = useTestnet ? LUKSO_TESTNET_RPC : LUKSO_MAINNET_RPC;
    const networkName = useTestnet ? 'LUKSO Testnet' : 'LUKSO Mainnet';

    console.log(`\n🚀 Creating Agent on ${networkName}...\n`);
    console.log('Agent Configuration:');
    console.log('  Name:', AGENT_CONFIG.name);
    console.log('  Type:', AGENT_CONFIG.agentType);
    console.log('  Description:', AGENT_CONFIG.description);
    console.log('  Tags:', AGENT_CONFIG.tags.join(', '));
    console.log('  Autonomous:', AGENT_CONFIG.isAutonomous);
    console.log('');

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const signerAddress = await signer.getAddress();

    console.log('👤 Creator Address:', signerAddress);
    console.log('⛽ Gas Price:', ethers.formatUnits(await provider.getFeeData().then(d => d.gasPrice || 0n), 'gwei'), 'gwei');
    console.log('');

    // Initialize LSP Factory
    const lspFactory = new LSPFactory(rpcUrl, {
      deployKey: privateKey,
    });

    // Create agent metadata
    const metadata = createAgentMetadata(AGENT_CONFIG);
    console.log('📄 Agent Metadata:', JSON.stringify(metadata, null, 2));
    console.log('');

    // Deploy Universal Profile
    console.log('⏳ Deploying Universal Profile...\n');

    const deployedContracts = await lspFactory.UniversalProfile.deploy({
      controllerAddresses: [signerAddress],
      lsp3Profile: metadata,
    }, {
      onDeployEvents: {
        next: (deploymentEvent) => {
          console.log('  📦 Deployment Event:', deploymentEvent.status);
          if (deploymentEvent.contractName) {
            console.log('     Contract:', deploymentEvent.contractName);
          }
          if (deploymentEvent.receipt) {
            console.log('     Address:', deploymentEvent.receipt.contractAddress || deploymentEvent.receipt.to);
          }
        },
        error: (error) => {
          console.error('  ❌ Deployment Error:', error);
        },
        complete: (contracts) => {
          console.log('\n✅ Deployment Complete!\n');
          console.log('Deployed Contracts:');
          console.log('  Universal Profile:', contracts.LSP0ERC725Account?.address);
          console.log('  Key Manager:', contracts.LSP6KeyManager?.address);
          console.log('  Universal Receiver:', contracts.LSP1UniversalReceiverDelegateUP?.address);
        },
      },
    });

    // Save deployment info
    const deploymentInfo = {
      network: networkName,
      chainId: useTestnet ? 4201 : 42,
      createdAt: new Date().toISOString(),
      agent: {
        name: AGENT_CONFIG.name,
        type: AGENT_CONFIG.agentType,
        description: AGENT_CONFIG.description,
      },
      contracts: {
        universalProfile: deployedContracts.LSP0ERC725Account?.address,
        keyManager: deployedContracts.LSP6KeyManager?.address,
        universalReceiver: deployedContracts.LSP1UniversalReceiverDelegateUP?.address,
      },
      metadata: metadata,
    };

    const outputDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(
      outputDir,
      `agent-${AGENT_CONFIG.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
    );

    fs.writeFileSync(outputFile, JSON.stringify(deploymentInfo, null, 2));

    console.log('\n💾 Deployment saved to:', outputFile);
    console.log('\n🎉 Agent created successfully!');
    console.log('\nNext steps:');
    console.log('  1. Fund your Universal Profile with LYX');
    console.log('  2. Register with AgentProfileManager contract');
    console.log('  3. Set up reputation token account');
    console.log('  4. Start building your agent social graph!');

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ Error creating agent:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createAgent().catch(console.error);
}

module.exports = { createAgent, createAgentMetadata };