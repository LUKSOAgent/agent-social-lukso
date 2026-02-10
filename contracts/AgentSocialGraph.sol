// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    LSP26FollowerSystem
} from "@lukso/lsp-smart-contracts/contracts/LSP26FollowerSystem/LSP26FollowerSystem.sol";
import {
    ILSP26FollowerSystem
} from "@lukso/lsp-smart-contracts/contracts/LSP26FollowerSystem/ILSP26FollowerSystem.sol";

/**
 * @title AgentSocialGraph
 * @notice Extended social graph functionality for agent-to-agent interactions
 * @dev Built on top of LSP26 Follower System with additional agent-specific features
 * 
 * Features:
 * - Extended follow system with relationship types
 * - Agent verification badges
 * - Social graph queries and analytics
 * - Follow notifications for agents
 */
contract AgentSocialGraph is LSP26FollowerSystem {
    
    // ============ Enums ============
    
    enum RelationshipType {
        None,
        Follow,           // Standard follow
        Friend,           // Mutual follow
        Collaborator,     // Working relationship
        Trusted,          // High trust relationship
        Blocked           // Blocked relationship
    }
    
    // ============ Structs ============
    
    struct AgentProfile {
        bool isAgent;
        bool isVerified;
        uint256 followerCount;
        uint256 followingCount;
        uint256 reputationScore;
        string agentType;        // e.g., "AI", "Human", "DAO"
        bytes metadata;
    }
    
    struct FollowRequest {
        address follower;
        address target;
        uint256 timestamp;
        bool pending;
    }
    
    // ============ State Variables ============
    
    /// @notice Contract admin
    address public admin;
    
    /// @notice Mapping of agent profiles
    mapping(address => AgentProfile) public agentProfiles;
    
    /// @notice Relationship type between two addresses
    mapping(address => mapping(address => RelationshipType)) public relationshipTypes;
    
    /// @notice Pending follow requests (for private profiles)
    mapping(address => mapping(address => FollowRequest)) public followRequests;
    
    /// @notice List of verified agents
    address[] public verifiedAgents;
    
    /// @notice Total registered agents
    uint256 public totalAgents;
    
    /// @notice Agent reputation token contract
    address public reputationToken;
    
    // ============ Events ============
    
    event AgentRegistered(address indexed agent, string agentType);
    event AgentVerified(address indexed agent);
    event AgentUnverified(address indexed agent);
    event RelationshipUpdated(
        address indexed follower,
        address indexed target,
        RelationshipType relationshipType
    );
    event FollowRequested(
        address indexed follower,
        address indexed target,
        uint256 timestamp
    );
    event FollowRequestAccepted(
        address indexed follower,
        address indexed target
    );
    event FollowRequestRejected(
        address indexed follower,
        address indexed target
    );
    
    // ============ Modifiers ============
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyAgent() {
        require(agentProfiles[msg.sender].isAgent, "Not registered agent");
        _;
    }
    
    modifier onlyVerifiedAgent() {
        require(
            agentProfiles[msg.sender].isAgent && agentProfiles[msg.sender].isVerified,
            "Not verified agent"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address admin_) {
        admin = admin_;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set reputation token contract address
     * @param token Address of reputation token
     */
    function setReputationToken(address token) external onlyAdmin {
        reputationToken = token;
    }
    
    /**
     * @notice Register a new agent
     * @param agent Agent address
     * @param agentType Type of agent (e.g., "AI", "Human")
     * @param metadata Agent metadata
     */
    function registerAgent(
        address agent,
        string calldata agentType,
        bytes calldata metadata
    ) external onlyAdmin {
        require(!agentProfiles[agent].isAgent, "Agent already registered");
        
        agentProfiles[agent] = AgentProfile({
            isAgent: true,
            isVerified: false,
            followerCount: 0,
            followingCount: 0,
            reputationScore: 0,
            agentType: agentType,
            metadata: metadata
        });
        
        totalAgents++;
        
        emit AgentRegistered(agent, agentType);
    }
    
    /**
     * @notice Verify an agent
     * @param agent Agent to verify
     */
    function verifyAgent(address agent) external onlyAdmin {
        require(agentProfiles[agent].isAgent, "Not registered agent");
        require(!agentProfiles[agent].isVerified, "Already verified");
        
        agentProfiles[agent].isVerified = true;
        verifiedAgents.push(agent);
        
        emit AgentVerified(agent);
    }
    
    /**
     * @notice Unverify an agent
     * @param agent Agent to unverify
     */
    function unverifyAgent(address agent) external onlyAdmin {
        require(agentProfiles[agent].isVerified, "Not verified");
        
        agentProfiles[agent].isVerified = false;
        
        // Remove from verified agents array
        for (uint256 i = 0; i < verifiedAgents.length; i++) {
            if (verifiedAgents[i] == agent) {
                verifiedAgents[i] = verifiedAgents[verifiedAgents.length - 1];
                verifiedAgents.pop();
                break;
            }
        }
        
        emit AgentUnverified(agent);
    }
    
    /**
     * @notice Batch register agents
     */
    function batchRegisterAgents(
        address[] calldata agents,
        string[] calldata types,
        bytes[] calldata metadataArray
    ) external onlyAdmin {
        require(
            agents.length == types.length && types.length == metadataArray.length,
            "Length mismatch"
        );
        
        for (uint256 i = 0; i < agents.length; i++) {
            if (!agentProfiles[agents[i]].isAgent) {
                agentProfiles[agents[i]] = AgentProfile({
                    isAgent: true,
                    isVerified: false,
                    followerCount: 0,
                    followingCount: 0,
                    reputationScore: 0,
                    agentType: types[i],
                    metadata: metadataArray[i]
                });
                totalAgents++;
                emit AgentRegistered(agents[i], types[i]);
            }
        }
    }
    
    // ============ Follow Functions ============
    
    /**
     * @notice Follow an agent with relationship type
     * @param target Agent to follow
     * @param relType Type of relationship
     */
    function followWithType(
        address target,
        RelationshipType relType
    ) external onlyAgent {
        require(agentProfiles[target].isAgent, "Target not registered");
        require(target != msg.sender, "Cannot follow self");
        require(relType != RelationshipType.Blocked, "Use block function");
        
        // Call LSP26 follow
        _follow(msg.sender, target);
        
        // Update relationship type
        relationshipTypes[msg.sender][target] = relType;
        
        // Update counts
        agentProfiles[target].followerCount++;
        agentProfiles[msg.sender].followingCount++;
        
        // Check if mutual follow -> Friend relationship
        if (isFollowing(target, msg.sender)) {
            relationshipTypes[msg.sender][target] = RelationshipType.Friend;
            relationshipTypes[target][msg.sender] = RelationshipType.Friend;
        }
        
        emit RelationshipUpdated(msg.sender, target, relType);
    }
    
    /**
     * @notice Unfollow an agent
     * @param target Agent to unfollow
     */
    function unfollowAgent(address target) external onlyAgent {
        require(isFollowing(msg.sender, target), "Not following");
        
        _unfollow(msg.sender, target);
        
        // Update relationship
        RelationshipType currentType = relationshipTypes[msg.sender][target];
        relationshipTypes[msg.sender][target] = RelationshipType.None;
        
        // If was friends, update target's relationship too
        if (currentType == RelationshipType.Friend) {
            relationshipTypes[target][msg.sender] = RelationshipType.Follow;
        }
        
        // Update counts
        agentProfiles[target].followerCount--;
        agentProfiles[msg.sender].followingCount--;
        
        emit RelationshipUpdated(msg.sender, target, RelationshipType.None);
    }
    
    /**
     * @notice Block an agent
     * @param target Agent to block
     */
    function blockAgent(address target) external onlyAgent {
        require(target != msg.sender, "Cannot block self");
        
        // If currently following, unfollow
        if (isFollowing(msg.sender, target)) {
            _unfollow(msg.sender, target);
            agentProfiles[target].followerCount--;
            agentProfiles[msg.sender].followingCount--;
        }
        
        // If target is following, remove their follow
        if (isFollowing(target, msg.sender)) {
            _unfollow(target, msg.sender);
            agentProfiles[msg.sender].followerCount--;
            agentProfiles[target].followingCount--;
        }
        
        relationshipTypes[msg.sender][target] = RelationshipType.Blocked;
        
        emit RelationshipUpdated(msg.sender, target, RelationshipType.Blocked);
    }
    
    /**
     * @notice Request to follow a private agent
     * @param target Agent to request follow
     */
    function requestFollow(address target) external onlyAgent {
        require(agentProfiles[target].isAgent, "Target not registered");
        require(!isFollowing(msg.sender, target), "Already following");
        require(followRequests[target][msg.sender].pending == false, "Request pending");
        
        followRequests[target][msg.sender] = FollowRequest({
            follower: msg.sender,
            target: target,
            timestamp: block.timestamp,
            pending: true
        });
        
        emit FollowRequested(msg.sender, target, block.timestamp);
    }
    
    /**
     * @notice Accept a follow request
     * @param follower Agent requesting to follow
     */
    function acceptFollowRequest(address follower) external onlyAgent {
        FollowRequest storage request = followRequests[msg.sender][follower];
        require(request.pending, "No pending request");
        
        request.pending = false;
        
        // Auto-follow
        _follow(follower, msg.sender);
        relationshipTypes[follower][msg.sender] = RelationshipType.Follow;
        agentProfiles[msg.sender].followerCount++;
        agentProfiles[follower].followingCount++;
        
        emit FollowRequestAccepted(follower, msg.sender);
        emit RelationshipUpdated(follower, msg.sender, RelationshipType.Follow);
    }
    
    /**
     * @notice Reject a follow request
     * @param follower Agent requesting to follow
     */
    function rejectFollowRequest(address follower) external onlyAgent {
        FollowRequest storage request = followRequests[msg.sender][follower];
        require(request.pending, "No pending request");
        
        request.pending = false;
        
        emit FollowRequestRejected(follower, msg.sender);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get agent profile
     * @param agent Agent address
     * @return Agent profile struct
     */
    function getAgentProfile(address agent) external view returns (AgentProfile memory) {
        return agentProfiles[agent];
    }
    
    /**
     * @notice Check if two agents have mutual follow (friends)
     * @param agent1 First agent
     * @param agent2 Second agent
     * @return True if mutual follow
     */
    function areFriends(address agent1, address agent2) external view returns (bool) {
        return relationshipTypes[agent1][agent2] == RelationshipType.Friend;
    }
    
    /**
     * @notice Get relationship type between two agents
     * @param from First agent
     * @param to Second agent
     * @return Relationship type
     */
    function getRelationship(address from, address to) external view returns (RelationshipType) {
        return relationshipTypes[from][to];
    }
    
    /**
     * @notice Get all verified agents
     * @return Array of verified agent addresses
     */
    function getVerifiedAgents() external view returns (address[] memory) {
        return verifiedAgents;
    }
    
    /**
     * @notice Get pending follow requests for an agent
     * @param agent Agent to check
     * @return Array of pending request structs
     */
    function getPendingRequests(address agent) external view returns (FollowRequest[] memory) {
        // First count pending requests
        uint256 count = 0;
        for (uint256 i = 0; i < totalAgents; i++) {
            // This is a simplified version - in production, maintain an array
        }
        
        // Return empty for now - implementation would track pending requests
        return new FollowRequest[](0);
    }
    
    /**
     * @notice Check if agent is blocked by another
     * @param agent Agent to check
     * @param by Potential blocker
     * @return True if blocked
     */
    function isBlockedBy(address agent, address by) external view returns (bool) {
        return relationshipTypes[by][agent] == RelationshipType.Blocked;
    }
    
    /**
     * @notice Get social graph stats for an agent
     * @param agent Agent address
     * @return followerCount Number of followers
     * @return followingCount Number following
     * @return friendCount Number of friends
     */
    function getSocialStats(address agent) external view returns (
        uint256 followerCount,
        uint256 followingCount,
        uint256 friendCount
    ) {
        AgentProfile memory profile = agentProfiles[agent];
        
        // Count friends
        uint256 friends = 0;
        // In production, would iterate through followers and check mutual
        
        return (profile.followerCount, profile.followingCount, friends);
    }
}