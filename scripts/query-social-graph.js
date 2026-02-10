/**
 * @file query-social-graph.js
 * @description Query agent social graph and reputation
 * 
 * Usage:
 *   node scripts/query-social-graph.js <agent-address>
 */

const { ethers } = require('ethers');
const { ERC725 } = require('@erc725/erc725.js');

const LSP26_ADDRESS = '0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA';

const LSP26_ABI = [
  'function isFollowing(address follower, address target) external view returns (bool)',
  'function getFollows(address follower) external view returns (address[])',
  'function getFollowers(address target) external view returns (address[])'
];

const LSP3_SCHEMA = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
];

async function querySocialGraph(agentAddress) {
  try {
    const rpcUrl = process.env.LUKSO_RPC || 'https://rpc.mainnet.lukso.network';
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    console.log('\n📊 Agent Social Graph\n');
    console.log('Agent:', agentAddress);
    console.log('');

    // Query LSP26 Follower System
    const lsp26 = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);

    const [follows, followers] = await Promise.all([
      lsp26.getFollows(agentAddress).catch(() => []),
      lsp26.getFollowers(agentAddress).catch(() => [])
    ]);

    console.log('Following:', follows.length);
    follows.forEach((addr, i) => console.log(`  ${i + 1}. ${addr}`));

    console.log('\nFollowers:', followers.length);
    followers.forEach((addr, i) => console.log(`  ${i + 1}. ${addr}`));

    // Try to fetch LSP3 profile
    try {
      const erc725 = new ERC725(LSP3_SCHEMA, agentAddress, provider);
      const profileData = await erc725.fetchData('LSP3Profile');
      
      if (profileData?.value?.url) {
        const response = await fetch(profileData.value.url);
        const profile = await response.json();
        console.log('\n📄 Profile:');
        console.log('  Name:', profile.LSP3Profile?.name || 'N/A');
        console.log('  Description:', profile.LSP3Profile?.description || 'N/A');
        console.log('  Tags:', profile.LSP3Profile?.tags?.join(', ') || 'N/A');
      }
    } catch (e) {
      console.log('\nℹ️  No LSP3 profile data found');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

const targetAddress = process.argv[2] || process.env.UP_ADDRESS;
if (targetAddress) {
  querySocialGraph(targetAddress);
} else {
  console.log('Usage: node query-social-graph.js <agent-address>');
}

module.exports = { querySocialGraph };
