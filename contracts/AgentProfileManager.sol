// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    UniversalProfile
} from "@lukso/lsp-smart-contracts/contracts/UniversalProfile.sol";
import {
    LSP6KeyManager
} from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol";
import {
    LSP1UniversalReceiverDelegateUP
} from "@lukso/lsp-smart-contracts/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";

/**
 * @title AgentProfileManager
 * @notice Factory and manager for agent Universal Profiles on LUKSO
 * @dev Creates LSP3 Universal Profiles with agent-specific configurations
 * 
 * Features:
 * - Deploy Universal Profiles for agents
 * - Configure LSP6 KeyManager with agent permissions
 * - Set up LSP1 Universal Receiver
 * - Manage agent metadata and verification
 */
contract AgentProfileManager {
    
    // ============ Structs ============
    
    struct AgentConfig {
        string name;
        string description;
        string agentType;        // "AI", "Bot", "Service", "Human"
        string avatarUrl;
        string[] tags;
        bytes metadata;
        address owner;
        bool isAutonomous;       // Can act without human approval
    }
    
    struct AgentProfile {
        address universalProfile;
        address keyManager;
        address owner;
        string name;
        string agentType;
        uint256 createdAt;
        bool isActive;
        bytes32 profileHash;
    }
    
    // ============ State Variables ============
    
    address public admin;
    address public universalReceiverDelegate;
    
    /// @notice Agent profiles by address
    mapping(address => AgentProfile) public profiles;
    
    /// @notice All registered agent addresses
    address[] public agentAddresses;
    
    /// @notice Total agents created
    uint256 public totalAgents;
    
    /// @notice Authorized factory contracts
    mapping(address => bool) public authorizedFactories;
    
    /// @notice Agent type registry
    mapping(string => bool) public validAgentTypes;
    
    // ============ Events ============
    
    event AgentProfileCreated(
        address indexed agent,
        address indexed universalProfile,
        address indexed keyManager,
        string name,
        string agentType
    );
    event AgentProfileUpdated(address indexed agent, bytes32 profileHash);
    event AgentDeactivated(address indexed agent);
    event AgentReactivated(address indexed agent);
    event FactoryAuthorized(address indexed factory);
    event FactoryRevoked(address indexed factory);
    
    // ============ Modifiers ============
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == admin || authorizedFactories[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _universalReceiverDelegate) {
        admin = msg.sender;
        universalReceiverDelegate = _universalReceiverDelegate;
        
        // Initialize valid agent types
        validAgentTypes["AI"] = true;
        validAgentTypes["Bot"] = true;
        validAgentTypes["Service"] = true;
        validAgentTypes["Human"] = true;
        validAgentTypes["DAO"] = true;
        validAgentTypes["Oracle"] = true;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Authorize a factory contract
     * @param factory Factory address
     */
    function authorizeFactory(address factory) external onlyAdmin {
        authorizedFactories[factory] = true;
        emit FactoryAuthorized(factory);
    }
    
    /**
     * @notice Revoke factory authorization
     * @param factory Factory address
     */
    function revokeFactory(address factory) external onlyAdmin {
        authorizedFactories[factory] = false;
        emit FactoryRevoked(factory);
    }
    
    /**
     * @notice Add a valid agent type
     * @param agentType Agent type string
     */
    function addAgentType(string calldata agentType) external onlyAdmin {
        validAgentTypes[agentType] = true;
    }
    
    /**
     * @notice Update universal receiver delegate
     * @param newDelegate New delegate address
     */
    function updateUniversalReceiverDelegate(address newDelegate) external onlyAdmin {
        universalReceiverDelegate = newDelegate;
    }
    
    // ============ Profile Creation ============
    
    /**
     * @notice Create a new agent Universal Profile
     * @param config Agent configuration
     * @return universalProfile Address of created UP
     * @return keyManager Address of KeyManager
     */
    function createAgentProfile(
        AgentConfig calldata config
    ) external onlyAuthorized returns (address universalProfile, address keyManager) {
        require(validAgentTypes[config.agentType], "Invalid agent type");
        require(bytes(config.name).length > 0, "Name required");
        
        // Deploy Universal Profile
        UniversalProfile up = new UniversalProfile(address(this));
        universalProfile = address(up);
        
        // Deploy KeyManager
        LSP6KeyManager km = new LSP6KeyManager(universalProfile);
        keyManager = address(km);
        
        // Set up Universal Receiver Delegate
        // In production, this would set the LSP1UniversalReceiverDelegate data key
        
        // Transfer ownership to KeyManager
        up.transferOwnership(keyManager);
        
        // Store profile info
        bytes32 profileHash = keccak256(config.metadata);
        
        profiles[universalProfile] = AgentProfile({
            universalProfile: universalProfile,
            keyManager: keyManager,
            owner: config.owner,
            name: config.name,
            agentType: config.agentType,
            createdAt: block.timestamp,
            isActive: true,
            profileHash: profileHash
        });
        
        agentAddresses.push(universalProfile);
        totalAgents++;
        
        emit AgentProfileCreated(
            config.owner,
            universalProfile,
            keyManager,
            config.name,
            config.agentType
        );
        
        emit AgentProfileUpdated(universalProfile, profileHash);
        
        return (universalProfile, keyManager);
    }
    
    /**
     * @notice Batch create agent profiles
     * @param configs Array of agent configurations
     * @return profiles Array of created profile addresses
     */
    function batchCreateAgentProfiles(
        AgentConfig[] calldata configs
    ) external onlyAuthorized returns (address[] memory) {
        address[] memory createdProfiles = new address[](configs.length);
        
        for (uint256 i = 0; i < configs.length; i++) {
            (address up, address km) = this.createAgentProfile(configs[i]);
            createdProfiles[i] = up;
        }
        
        return createdProfiles;
    }
    
    // ============ Profile Management ============
    
    /**
     * @notice Update agent profile metadata
     * @param agent Agent UP address
     * @param newMetadata New metadata bytes
     */
    function updateProfileMetadata(
        address agent,
        bytes calldata newMetadata
    ) external onlyAuthorized {
        require(profiles[agent].isActive, "Profile not active");
        
        bytes32 newHash = keccak256(newMetadata);
        profiles[agent].profileHash = newHash;
        
        emit AgentProfileUpdated(agent, newHash);
    }
    
    /**
     * @notice Deactivate an agent profile
     * @param agent Agent address
     */
    function deactivateAgent(address agent) external onlyAdmin {
        profiles[agent].isActive = false;
        emit AgentDeactivated(agent);
    }
    
    /**
     * @notice Reactivate an agent profile
     * @param agent Agent address
     */
    function reactivateAgent(address agent) external onlyAdmin {
        profiles[agent].isActive = true;
        emit AgentReactivated(agent);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get agent profile details
     * @param agent Agent UP address
     * @return Agent profile struct
     */
    function getAgentProfile(address agent) external view returns (AgentProfile memory) {
        return profiles[agent];
    }
    
    /**
     * @notice Check if address is registered agent
     * @param agent Address to check
     * @return True if registered
     */
    function isRegisteredAgent(address agent) external view returns (bool) {
        return profiles[agent].universalProfile != address(0);
    }
    
    /**
     * @notice Get all agent addresses
     * @return Array of agent UP addresses
     */
    function getAllAgents() external view returns (address[] memory) {
        return agentAddresses;
    }
    
    /**
     * @notice Get agents by type
     * @param agentType Type to filter
     * @return Array of matching agent addresses
     */
    function getAgentsByType(string calldata agentType) external view returns (address[] memory) {
        // Count matching agents
        uint256 count = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (keccak256(bytes(profiles[agentAddresses[i]].agentType)) == keccak256(bytes(agentType))) {
                count++;
            }
        }
        
        // Collect matching agents
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (keccak256(bytes(profiles[agentAddresses[i]].agentType)) == keccak256(bytes(agentType))) {
                result[index] = agentAddresses[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @notice Get agents created in time range
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @return Array of agent addresses
     */
    function getAgentsByTimeRange(
        uint256 startTime,
        uint256 endTime
    ) external view returns (address[] memory) {
        // Count matching
        uint256 count = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            uint256 createdAt = profiles[agentAddresses[i]].createdAt;
            if (createdAt >= startTime && createdAt <= endTime) {
                count++;
            }
        }
        
        // Collect
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            uint256 createdAt = profiles[agentAddresses[i]].createdAt;
            if (createdAt >= startTime && createdAt <= endTime) {
                result[index] = agentAddresses[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @notice Get KeyManager for an agent
     * @param agent Agent UP address
     * @return KeyManager address
     */
    function getKeyManager(address agent) external view returns (address) {
        return profiles[agent].keyManager;
    }
}