/**
 * @file issue-reputation.js
 * @description Script to issue reputation tokens to agents
 * 
 * Usage:
 *   node scripts/issue-reputation.js <agent-address> <amount> <reason>
 * 
 * Example:
 *   node scripts/issue-reputation.js 0x123... 100 "Helpful contribution"
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ABI for AgentReputationToken (minimal for issuance)
const REPUTATION_TOKEN_ABI = [
  'function issueReputation(address agent, uint256 amount, string calldata reason) external',
  'function batchIssueReputation(address[] calldata agents, uint256[] calldata amounts, string[] calldata reasons) external',
  'function getReputationScore(address agent) external view returns (uint256)',
  'function balanceOf(address tokenOwner) external view returns (uint256)',
  'function totalReputationIssued(address agent) external view returns (uint256)',
  'function totalReputationBurned(address agent) external view returns (uint256)',
  'function registeredAgents(address agent) external view returns (bool)',
  'event ReputationIssued(address indexed agent, address indexed issuer, uint256 amount, string reason)',
];

// Configuration
const LUKSO_MAINNET_RPC = 'https://rpc.mainnet.lukso.network';
const LUKSO_TESTNET_RPC = 'https://rpc.testnet.lukso.network';

/**
 * Load deployment info
 */
function loadDeployment(network = 'mainnet') {
  const deploymentPath = path.join(__dirname, '..', 'deployments', `contracts-${network}.json`);
  if (fs.existsSync(deploymentPath)) {
    return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  }
  return null;
}

/**
 * Issue reputation to a single agent
 */
async function issueReputation(agentAddress, amount, reason, options = {}) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable required');
    }

    const useTestnet = process.env.USE_TESTNET === 'true' || options.useTestnet;
    const rpcUrl = useTestnet ? LUKSO_TESTNET_RPC : LUKSO_MAINNET_RPC;
    const networkName = useTestnet ? 'Testnet' : 'Mainnet';

    console.log(`\n🏆 Issuing Reputation on LUKSO ${networkName}\n`);

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const signerAddress = await signer.getAddress();

    console.log('👤 Issuer:', signerAddress);
    console.log('🎯 Agent:', agentAddress);
    console.log('💎 Amount:', amount);
    console.log('📝 Reason:', reason);
    console.log('');

    // Get contract address
    const deployment = loadDeployment(useTestnet ? 'testnet' : 'mainnet');
    const tokenAddress = options.tokenAddress || deployment?.contracts?.reputationToken;

    if (!tokenAddress) {
      throw new Error('Reputation token address not found. Deploy contracts first or provide tokenAddress.');
    }

    console.log('📜 Token Contract:', tokenAddress);
    console.log('');

    // Connect to contract
    const tokenContract = new ethers.Contract(tokenAddress, REPUTATION_TOKEN_ABI, signer);

    // Check if agent is registered
    const isRegistered = await tokenContract.registeredAgents(agentAddress);
    if (!isRegistered) {
      console.warn('⚠️  Warning: Agent is not registered in the reputation system');
      console.log('   The transaction may revert.\n');
    }

    // Get current reputation
    const currentScore = await tokenContract.getReputationScore(agentAddress).catch(() => 0n);
    console.log('📊 Current Reputation Score:', currentScore.toString());
    console.log('📊 New Score will be:', (currentScore + BigInt(amount)).toString());
    console.log('');

    // Issue reputation
    console.log('⏳ Issuing reputation...\n');

    const tx = await tokenContract.issueReputation(agentAddress, amount, reason, {
      gasLimit: 500000,
    });

    console.log('📝 Transaction hash:', tx.hash);
    console.log('⏳ Waiting for confirmation...\n');

    const receipt = await tx.wait();

    console.log('✅ Transaction confirmed!');
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas used:', receipt.gasUsed.toString());
    console.log('');

    // Parse events
    const event = receipt.logs
      .map(log => {
        try {
          return tokenContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(e => e?.name === 'ReputationIssued');

    if (event) {
      console.log('📢 Event Emitted: ReputationIssued');
      console.log('   Agent:', event.args.agent);
      console.log('   Issuer:', event.args.issuer);
      console.log('   Amount:', event.args.amount.toString());
      console.log('   Reason:', event.args.reason);
      console.log('');
    }

    // Get updated score
    const newScore = await tokenContract.getReputationScore(agentAddress);
    console.log('🎉 New Reputation Score:', newScore.toString());

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      agentAddress,
      amount,
      reason,
      newScore: newScore.toString(),
    };

  } catch (error) {
    console.error('\n❌ Error issuing reputation:', error.message);
    throw error;
  }
}

/**
 * Batch issue reputation to multiple agents
 */
async function batchIssueReputation(agents, amounts, reasons, options = {}) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable required');
    }

    const useTestnet = process.env.USE_TESTNET === 'true' || options.useTestnet;
    const rpcUrl = useTestnet ? LUKSO_TESTNET_RPC : LUKSO_MAINNET_RPC;

    console.log(`\n🏆 Batch Issuing Reputation (${agents.length} agents)\n`);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    const deployment = loadDeployment(useTestnet ? 'testnet' : 'mainnet');
    const tokenAddress = options.tokenAddress || deployment?.contracts?.reputationToken;

    if (!tokenAddress) {
      throw new Error('Token address not found');
    }

    const tokenContract = new ethers.Contract(tokenAddress, REPUTATION_TOKEN_ABI, signer);

    console.log('📜 Token Contract:', tokenAddress);
    console.log('');

    // Display batch details
    console.log('Batch Details:');
    let totalAmount = 0n;
    for (let i = 0; i < agents.length; i++) {
      console.log(`  ${i + 1}. ${agents[i]} -> ${amounts[i]} (${reasons[i]})`);
      totalAmount += BigInt(amounts[i]);
    }
    console.log(`\nTotal to issue: ${totalAmount.toString()} reputation points\n`);

    // Execute batch
    const tx = await tokenContract.batchIssueReputation(agents, amounts, reasons, {
      gasLimit: 1000000 + agents.length * 50000,
    });

    console.log('📝 Transaction hash:', tx.hash);
    console.log('⏳ Waiting for confirmation...\n');

    const receipt = await tx.wait();

    console.log('✅ Batch complete!');
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas used:', receipt.gasUsed.toString());

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      agentsProcessed: agents.length,
    };

  } catch (error) {
    console.error('\n❌ Error in batch issuance:', error.message);
    throw error;
  }
}

/**
 * Query agent reputation
 */
async function queryReputation(agentAddress, options = {}) {
  try {
    const useTestnet = process.env.USE_TESTNET === 'true' || options.useTestnet;
    const rpcUrl = useTestnet ? LUKSO_TESTNET_RPC : LUKSO_MAINNET_RPC;

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const deployment = loadDeployment(useTestnet ? 'testnet' : 'mainnet');
    const tokenAddress = options.tokenAddress || deployment?.contracts?.reputationToken;

    if (!tokenAddress) {
      throw new Error('Token address not found');
    }

    const tokenContract = new ethers.Contract(tokenAddress, REPUTATION_TOKEN_ABI, provider);

    const [score, balance, issued, burned, isRegistered] = await Promise.all([
      tokenContract.getReputationScore(agentAddress).catch(() => 0n),
      tokenContract.balanceOf(agentAddress).catch(() => 0n),
      tokenContract.totalReputationIssued(agentAddress).catch(() => 0n),
      tokenContract.totalReputationBurned(agentAddress).catch(() => 0n),
      tokenContract.registeredAgents(agentAddress).catch(() => false),
    ]);

    const result = {
      agentAddress,
      reputationScore: score.toString(),
      tokenBalance: balance.toString(),
      totalIssued: issued.toString(),
      totalBurned: burned.toString(),
      isRegistered,
    };

    console.log('\n📊 Agent Reputation Report');
    console.log('=========================');
    console.log('Agent:', agentAddress);
    console.log('Registered:', isRegistered ? '✅ Yes' : '❌ No');
    console.log('Current Score:', score.toString());
    console.log('Token Balance:', balance.toString());
    console.log('Total Issued:', issued.toString());
    console.log('Total Burned:', burned.toString());
    console.log('');

    return result;

  } catch (error) {
    console.error('Error querying reputation:', error.message);
    throw error;
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'query' && args[1]) {
    queryReputation(args[1]).catch(console.error);
  } else if (args.length >= 3) {
    // issue-reputation.js <agent-address> <amount> <reason>
    issueReputation(args[0], args[1], args[2]).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node scripts/issue-reputation.js <agent-address> <amount> <reason>');
    console.log('  node scripts/issue-reputation.js query <agent-address>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/issue-reputation.js 0x123... 100 "Helpful contribution"');
    console.log('  node scripts/issue-reputation.js query 0x123...');
    process.exit(1);
  }
}

module.exports = {
  issueReputation,
  batchIssueReputation,
  queryReputation,
};