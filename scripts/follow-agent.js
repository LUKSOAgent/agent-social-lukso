/**
 * @file follow-agent.js
 * @description Script to follow another agent via LSP26 Follower System
 * 
 * Usage:
 *   node scripts/follow-agent.js <agent-address-to-follow>
 * 
 * Environment:
 *   - PRIVATE_KEY: Your wallet private key
 *   - UP_ADDRESS: Your Universal Profile address
 *   - LUKSO_RPC: LUKSO RPC URL
 */

const { ethers } = require('ethers');

// LSP26 Follower System contract on LUKSO mainnet
const LSP26_ADDRESS = '0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA';

// Minimal ABI for LSP26
const LSP26_ABI = [
  'function follow(address target) external',
  'function unfollow(address target) external',
  'function isFollowing(address follower, address target) external view returns (bool)',
  'function getFollows(address follower) external view returns (address[])',
  'function getFollowers(address target) external view returns (address[])',
  'event Follow(address indexed follower, address indexed target)',
  'event Unfollow(address indexed follower, address indexed target)'
];

// LSP0 ERC725Account ABI (minimal)
const LSP0_ABI = [
  'function execute(uint256 operation, address to, uint256 value, bytes calldata data) external returns(bytes)',
  'function owner() external view returns (address)'
];

// LSP6 KeyManager ABI (minimal)
const LSP6_ABI = [
  'function execute(bytes calldata payload) external payable returns (bytes)',
  'function getData(bytes32 dataKey) external view returns (bytes)'
];

async function followAgent(targetAddress) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const upAddress = process.env.UP_ADDRESS;
    const rpcUrl = process.env.LUKSO_RPC || 'https://rpc.mainnet.lukso.network';

    if (!privateKey || !upAddress) {
      console.error('❌ PRIVATE_KEY and UP_ADDRESS required');
      process.exit(1);
    }

    if (!targetAddress) {
      console.error('❌ Usage: node follow-agent.js <agent-address>');
      process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    console.log('\n🔗 Following Agent...\n');
    console.log('Your UP:', upAddress);
    console.log('Target:', targetAddress);
    console.log('');

    // Get KeyManager address
    const upContract = new ethers.Contract(upAddress, LSP0_ABI, provider);
    const keyManagerAddress = await upContract.owner();

    console.log('KeyManager:', keyManagerAddress);

    // Encode follow call
    const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);
    const followCalldata = lsp26Contract.interface.encodeFunctionData('follow', [targetAddress]);

    // Encode UP.execute(0, LSP26, 0, followCalldata)
    const upExecuteCalldata = upContract.interface.encodeFunctionData('execute', [
      0, // operation: CALL
      LSP26_ADDRESS,
      0, // value
      followCalldata
    ]);

    // Execute via KeyManager
    const keyManager = new ethers.Contract(keyManagerAddress, LSP6_ABI, signer);
    
    console.log('⏳ Sending transaction...\n');
    
    const tx = await keyManager.execute(upExecuteCalldata);
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Confirmed in block:', receipt.blockNumber);

    // Check if now following
    const isFollowing = await lsp26Contract.isFollowing(upAddress, targetAddress);
    console.log('\nFollowing status:', isFollowing ? '✅ Following' : '❌ Not following');

    return receipt;

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const targetAddress = process.argv[2];
  followAgent(targetAddress).catch(console.error);
}

module.exports = { followAgent };
