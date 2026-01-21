//! Network configuration types for blockchain fork targets.

use crate::error::AnchorError;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

/// Supported blockchain networks for forking.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Network {
    /// Ethereum Mainnet (chain ID: 1)
    Mainnet,
    /// Sepolia Testnet (chain ID: 11155111)
    Sepolia,
    /// Base L2 (chain ID: 8453)
    Base,
    /// Arbitrum One (chain ID: 42161)
    Arbitrum,
    /// Optimism (chain ID: 10)
    Optimism,
    /// Berachain (chain ID: 80094)
    Berachain,
    /// Custom network with user-provided configuration
    Custom {
        name: String,
        chain_id: u64,
        rpc_url: String,
    },
}

impl Network {
    /// Get the chain ID for this network.
    pub fn chain_id(&self) -> u64 {
        match self {
            Network::Mainnet => 1,
            Network::Sepolia => 11155111,
            Network::Base => 8453,
            Network::Arbitrum => 42161,
            Network::Optimism => 10,
            Network::Berachain => 80094,
            Network::Custom { chain_id, .. } => *chain_id,
        }
    }

    /// Get the default RPC URL from environment variables.
    ///
    /// Returns `None` if the environment variable is not set.
    pub fn default_rpc_url(&self) -> Option<String> {
        match self {
            Network::Mainnet => std::env::var("ETH_RPC_URL").ok(),
            Network::Sepolia => std::env::var("SEPOLIA_RPC_URL").ok(),
            Network::Base => std::env::var("BASE_RPC_URL").ok(),
            Network::Arbitrum => std::env::var("ARBITRUM_RPC_URL").ok(),
            Network::Optimism => std::env::var("OPTIMISM_RPC_URL").ok(),
            Network::Berachain => std::env::var("BERACHAIN_RPC_URL").ok(),
            Network::Custom { rpc_url, .. } => Some(rpc_url.clone()),
        }
    }

    /// Get the environment variable name for this network's RPC URL.
    pub fn rpc_env_var(&self) -> &'static str {
        match self {
            Network::Mainnet => "ETH_RPC_URL",
            Network::Sepolia => "SEPOLIA_RPC_URL",
            Network::Base => "BASE_RPC_URL",
            Network::Arbitrum => "ARBITRUM_RPC_URL",
            Network::Optimism => "OPTIMISM_RPC_URL",
            Network::Berachain => "BERACHAIN_RPC_URL",
            Network::Custom { .. } => "CUSTOM_RPC_URL",
        }
    }

    /// Get the human-readable network name.
    pub fn name(&self) -> &str {
        match self {
            Network::Mainnet => "mainnet",
            Network::Sepolia => "sepolia",
            Network::Base => "base",
            Network::Arbitrum => "arbitrum",
            Network::Optimism => "optimism",
            Network::Berachain => "berachain",
            Network::Custom { name, .. } => name,
        }
    }

    /// Check if this is a testnet.
    pub fn is_testnet(&self) -> bool {
        matches!(self, Network::Sepolia)
    }

    /// Check if this is a Layer 2 network.
    pub fn is_l2(&self) -> bool {
        matches!(self, Network::Base | Network::Arbitrum | Network::Optimism)
    }
}

impl FromStr for Network {
    type Err = AnchorError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "mainnet" | "ethereum" | "eth" => Ok(Network::Mainnet),
            "sepolia" => Ok(Network::Sepolia),
            "base" => Ok(Network::Base),
            "arbitrum" | "arb" => Ok(Network::Arbitrum),
            "optimism" | "op" => Ok(Network::Optimism),
            "berachain" | "bera" => Ok(Network::Berachain),
            _ => Err(AnchorError::UnknownNetwork(s.to_string())),
        }
    }
}

impl std::fmt::Display for Network {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.name())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chain_ids() {
        assert_eq!(Network::Mainnet.chain_id(), 1);
        assert_eq!(Network::Sepolia.chain_id(), 11155111);
        assert_eq!(Network::Base.chain_id(), 8453);
        assert_eq!(Network::Arbitrum.chain_id(), 42161);
        assert_eq!(Network::Optimism.chain_id(), 10);
        assert_eq!(Network::Berachain.chain_id(), 80094);
    }

    #[test]
    fn test_custom_network_chain_id() {
        let custom = Network::Custom {
            name: "test".to_string(),
            chain_id: 12345,
            rpc_url: "http://localhost:8545".to_string(),
        };
        assert_eq!(custom.chain_id(), 12345);
    }

    #[test]
    fn test_network_names() {
        assert_eq!(Network::Mainnet.name(), "mainnet");
        assert_eq!(Network::Sepolia.name(), "sepolia");
        assert_eq!(Network::Base.name(), "base");
        assert_eq!(Network::Arbitrum.name(), "arbitrum");
        assert_eq!(Network::Optimism.name(), "optimism");
        assert_eq!(Network::Berachain.name(), "berachain");
    }

    #[test]
    fn test_from_str_mainnet_aliases() {
        assert_eq!(Network::from_str("mainnet").unwrap(), Network::Mainnet);
        assert_eq!(Network::from_str("ethereum").unwrap(), Network::Mainnet);
        assert_eq!(Network::from_str("eth").unwrap(), Network::Mainnet);
        assert_eq!(Network::from_str("MAINNET").unwrap(), Network::Mainnet);
    }

    #[test]
    fn test_from_str_l2_aliases() {
        assert_eq!(Network::from_str("arbitrum").unwrap(), Network::Arbitrum);
        assert_eq!(Network::from_str("arb").unwrap(), Network::Arbitrum);
        assert_eq!(Network::from_str("optimism").unwrap(), Network::Optimism);
        assert_eq!(Network::from_str("op").unwrap(), Network::Optimism);
    }

    #[test]
    fn test_from_str_invalid() {
        let result = Network::from_str("unknown");
        assert!(result.is_err());
    }

    #[test]
    fn test_is_testnet() {
        assert!(Network::Sepolia.is_testnet());
        assert!(!Network::Mainnet.is_testnet());
        assert!(!Network::Base.is_testnet());
    }

    #[test]
    fn test_is_l2() {
        assert!(Network::Base.is_l2());
        assert!(Network::Arbitrum.is_l2());
        assert!(Network::Optimism.is_l2());
        assert!(!Network::Mainnet.is_l2());
        assert!(!Network::Sepolia.is_l2());
    }

    #[test]
    fn test_network_display() {
        assert_eq!(Network::Mainnet.to_string(), "mainnet");
        assert_eq!(Network::Base.to_string(), "base");
    }

    #[test]
    fn test_custom_network_rpc_url() {
        let custom = Network::Custom {
            name: "local".to_string(),
            chain_id: 31337,
            rpc_url: "http://localhost:8545".to_string(),
        };
        assert_eq!(
            custom.default_rpc_url(),
            Some("http://localhost:8545".to_string())
        );
    }

    #[test]
    fn test_rpc_env_vars() {
        assert_eq!(Network::Mainnet.rpc_env_var(), "ETH_RPC_URL");
        assert_eq!(Network::Sepolia.rpc_env_var(), "SEPOLIA_RPC_URL");
        assert_eq!(Network::Base.rpc_env_var(), "BASE_RPC_URL");
    }

    #[test]
    fn test_serialize_deserialize() {
        let network = Network::Mainnet;
        let json = serde_json::to_string(&network).unwrap();
        let deserialized: Network = serde_json::from_str(&json).unwrap();
        assert_eq!(network, deserialized);
    }

    #[test]
    fn test_custom_serialize_deserialize() {
        let custom = Network::Custom {
            name: "test".to_string(),
            chain_id: 12345,
            rpc_url: "http://test.local".to_string(),
        };
        let json = serde_json::to_string(&custom).unwrap();
        let deserialized: Network = serde_json::from_str(&json).unwrap();
        assert_eq!(custom, deserialized);
    }
}
