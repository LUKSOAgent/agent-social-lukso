// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Import LSP7 standard from @lukso/lsp-smart-contracts
import {
    LSP7DigitalAsset
} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";
import {
    LSP7DigitalAssetCore
} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAssetCore.sol";

/**
 * @title AgentReputationToken
 * @notice LSP7-based reputation/karma token for agent-to-agent social features
 * @dev Non-divisible tokens (decimals = 0) representing reputation points
 * 
 * Features:
 * - Minting reputation for positive agent behavior
 * - Burning reputation for negative behavior
 * - Transfer restrictions (soulbound option)
 * - Admin-controlled issuance
 */
contract AgentReputationToken is LSP7DigitalAsset {
    
    // ============ Errors ============
    error NotAuthorized(address caller);
    error InvalidAmount();
    error SoulboundTransfer();
    error AgentNotRegistered(address agent);
    
    // ============ State Variables ============
    
    /// @notice Contract owner/admin
    address public admin;
    
    /// @notice Whether tokens are soulbound (non-transferable)
    bool public isSoulbound;
    
    /// @notice Mapping of authorized issuers
    mapping(address => bool) public authorizedIssuers;
    
    /// @notice Mapping of registered agent addresses
    mapping(address => bool) public registeredAgents;
    
    /// @notice Agent profile metadata URI
    mapping(address => bytes) public agentProfileMetadata;
    
    /// @notice Total reputation issued per agent
    mapping(address => uint256) public totalReputationIssued;
    
    /// @notice Total reputation burned per agent
    mapping(address => uint256) public totalReputationBurned;
    
    // ============ Events ============
    
    event AgentRegistered(address indexed agent, bytes profileMetadata);
    event ReputationIssued(address indexed agent, address indexed issuer, uint256 amount, string reason);
    event ReputationBurned(address indexed agent, address indexed burner, uint256 amount, string reason);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    event SoulboundStatusChanged(bool isSoulbound);
    
    // ============ Modifiers ============
    
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAuthorized(msg.sender);
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender] && msg.sender != admin) {
            revert NotAuthorized(msg.sender);
        }
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the reputation token
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param admin_ Admin address
     * @param isSoulbound_ Whether tokens should be soulbound
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address admin_,
        bool isSoulbound_
    ) LSP7DigitalAsset(
        name_,
        symbol_,
        admin_,
        0, // decimals = 0 for non-divisible reputation points
        isSoulbound_
    ) {
        admin = admin_;
        isSoulbound = isSoulbound_;
        authorizedIssuers[admin_] = true;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Authorize an address to issue reputation tokens
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) external onlyAdmin {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    /**
     * @notice Revoke an issuer's authorization
     * @param issuer Address to revoke
     */
    function revokeIssuer(address issuer) external onlyAdmin {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    /**
     * @notice Toggle soulbound status
     * @param status New soulbound status
     */
    function setSoulbound(bool status) external onlyAdmin {
        isSoulbound = status;
        emit SoulboundStatusChanged(status);
    }
    
    /**
     * @notice Transfer admin rights
     * @param newAdmin New admin address
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
        authorizedIssuers[newAdmin] = true;
    }
    
    // ============ Agent Registration ============
    
    /**
     * @notice Register an agent to receive reputation
     * @param agent Agent address
     * @param profileMetadata LSP3 profile metadata URI
     */
    function registerAgent(
        address agent,
        bytes memory profileMetadata
    ) external onlyAdmin {
        registeredAgents[agent] = true;
        agentProfileMetadata[agent] = profileMetadata;
        emit AgentRegistered(agent, profileMetadata);
    }
    
    /**
     * @notice Batch register multiple agents
     * @param agents Array of agent addresses
     * @param metadataArray Array of profile metadata
     */
    function batchRegisterAgents(
        address[] calldata agents,
        bytes[] calldata metadataArray
    ) external onlyAdmin {
        require(agents.length == metadataArray.length, "Length mismatch");
        
        for (uint256 i = 0; i < agents.length; i++) {
            registeredAgents[agents[i]] = true;
            agentProfileMetadata[agents[i]] = metadataArray[i];
            emit AgentRegistered(agents[i], metadataArray[i]);
        }
    }
    
    // ============ Reputation Management ============
    
    /**
     * @notice Issue reputation tokens to an agent
     * @param agent Agent to receive reputation
     * @param amount Amount of reputation points
     * @param reason Reason for issuance
     */
    function issueReputation(
        address agent,
        uint256 amount,
        string calldata reason
    ) external onlyAuthorizedIssuer {
        if (!registeredAgents[agent]) revert AgentNotRegistered(agent);
        if (amount == 0) revert InvalidAmount();
        
        _mint(agent, agent, amount, true, bytes(reason));
        totalReputationIssued[agent] += amount;
        
        emit ReputationIssued(agent, msg.sender, amount, reason);
    }
    
    /**
     * @notice Batch issue reputation to multiple agents
     * @param agents Array of agent addresses
     * @param amounts Array of amounts
     * @param reasons Array of reasons
     */
    function batchIssueReputation(
        address[] calldata agents,
        uint256[] calldata amounts,
        string[] calldata reasons
    ) external onlyAuthorizedIssuer {
        require(
            agents.length == amounts.length && amounts.length == reasons.length,
            "Length mismatch"
        );
        
        for (uint256 i = 0; i < agents.length; i++) {
            if (!registeredAgents[agents[i]]) continue;
            if (amounts[i] == 0) continue;
            
            _mint(agents[i], agents[i], amounts[i], true, bytes(reasons[i]));
            totalReputationIssued[agents[i]] += amounts[i];
            
            emit ReputationIssued(agents[i], msg.sender, amounts[i], reasons[i]);
        }
    }
    
    /**
     * @notice Burn reputation tokens from an agent
     * @param agent Agent to burn reputation from
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burnReputation(
        address agent,
        uint256 amount,
        string calldata reason
    ) external onlyAuthorizedIssuer {
        if (amount == 0) revert InvalidAmount();
        
        _burn(agent, agent, amount, bytes(reason));
        totalReputationBurned[agent] += amount;
        
        emit ReputationBurned(agent, msg.sender, amount, reason);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get agent's net reputation score
     * @param agent Agent address
     * @return Net reputation (issued - burned)
     */
    function getReputationScore(address agent) external view returns (uint256) {
        return totalReputationIssued[agent] - totalReputationBurned[agent];
    }
    
    /**
     * @notice Check if address is authorized issuer
     * @param issuer Address to check
     * @return True if authorized
     */
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer];
    }
    
    /**
     * @notice Get agent profile metadata
     * @param agent Agent address
     * @return Profile metadata bytes
     */
    function getAgentProfile(address agent) external view returns (bytes memory) {
        return agentProfileMetadata[agent];
    }
    
    // ============ Override Transfer for Soulbound ============
    
    /**
     * @notice Override transfer to enforce soulbound if enabled
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount, data);
        
        // Allow minting (from = address(0)) and burning (to = address(0))
        // But prevent transfers between addresses if soulbound
        if (isSoulbound && from != address(0) && to != address(0)) {
            revert SoulboundTransfer();
        }
    }
}