// Contract ABIs for Agent Social Framework on LUKSO Testnet

// AgentReputationToken: 0x98b35B543806a1542fcF63883b2AaE224e3Bc66E
export const AGENT_REPUTATION_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function getReputation(address agent) view returns (uint256)",
  "function issueReputation(address to, uint256 amount) returns (bool)",
  "function revokeReputation(address from, uint256 amount) returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function ISSUER_ROLE() view returns (bytes32)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event ReputationIssued(address indexed agent, uint256 amount, address indexed issuer)",
  "event ReputationRevoked(address indexed agent, uint256 amount, address indexed issuer)"
];

// AgentSocialGraph: 0xE3350Ad4E7F3f07463352b481dE575f2e76bCd21
export const AGENT_SOCIAL_GRAPH_ABI = [
  "function registerAgent(string memory metadataURI) returns (bool)",
  "function updateAgentMetadata(string memory metadataURI) returns (bool)",
  "function follow(address agentToFollow) returns (bool)",
  "function unfollow(address agentToUnfollow) returns (bool)",
  "function isFollowing(address follower, address following) view returns (bool)",
  "function getFollowers(address agent) view returns (address[])",
  "function getFollowing(address agent) view returns (address[])",
  "function getFollowerCount(address agent) view returns (uint256)",
  "function getFollowingCount(address agent) view returns (uint256)",
  "function isRegistered(address agent) view returns (bool)",
  "function getAgentMetadata(address agent) view returns (string)",
  "function getAllRegisteredAgents() view returns (address[])",
  "event AgentRegistered(address indexed agent, string metadataURI)",
  "event AgentUpdated(address indexed agent, string metadataURI)",
  "event Follow(address indexed follower, address indexed following)",
  "event Unfollow(address indexed follower, address indexed following)"
];

// Contract Addresses (LUKSO Testnet - Chain ID: 4201)
export const CONTRACTS = {
  AGENT_REPUTATION_TOKEN: '0x98b35B543806a1542fcF63883b2AaE224e3Bc66E',
  AGENT_SOCIAL_GRAPH: '0xE3350Ad4E7F3f07463352b481dE575f2e76bCd21',
} as const;

// Chain Configuration
export const LUKSO_TESTNET = {
  chainId: 4201,
  name: 'LUKSO Testnet',
  rpcUrl: 'https://rpc.testnet.lukso.network',
  blockExplorer: 'https://explorer.execution.testnet.lukso.network',
} as const;

// Helper function to format addresses
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to get explorer link
export function getExplorerLink(address: string, type: 'address' | 'tx' = 'address'): string {
  return `${LUKSO_TESTNET.blockExplorer}/${type}/${address}`;
}