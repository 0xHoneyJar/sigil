//! Anvil-specific RPC methods.

use super::client::{parse_hex_u64, RpcClient, RpcError};
use serde::{Deserialize, Serialize};

/// Anvil-specific RPC methods.
pub trait AnvilMethods {
    /// Create a snapshot of the current EVM state.
    fn create_snapshot(&self)
        -> impl std::future::Future<Output = Result<String, RpcError>> + Send;

    /// Revert to a previously created snapshot.
    fn revert_snapshot(
        &self,
        snapshot_id: &str,
    ) -> impl std::future::Future<Output = Result<bool, RpcError>> + Send;

    /// Dump the entire EVM state to a base64-encoded string.
    fn dump_state(&self) -> impl std::future::Future<Output = Result<String, RpcError>> + Send;

    /// Load EVM state from a base64-encoded string.
    fn load_state(
        &self,
        state: &str,
    ) -> impl std::future::Future<Output = Result<bool, RpcError>> + Send;

    /// Mine a single block.
    fn mine(&self) -> impl std::future::Future<Output = Result<(), RpcError>> + Send;

    /// Set the next block timestamp.
    fn set_next_block_timestamp(
        &self,
        timestamp: u64,
    ) -> impl std::future::Future<Output = Result<(), RpcError>> + Send;

    /// Impersonate an account (unlock for transactions).
    fn impersonate_account(
        &self,
        address: &str,
    ) -> impl std::future::Future<Output = Result<(), RpcError>> + Send;

    /// Stop impersonating an account.
    fn stop_impersonating_account(
        &self,
        address: &str,
    ) -> impl std::future::Future<Output = Result<(), RpcError>> + Send;

    /// Set the balance of an account.
    fn set_balance(
        &self,
        address: &str,
        balance: u128,
    ) -> impl std::future::Future<Output = Result<(), RpcError>> + Send;

    /// Get node info.
    fn node_info(&self) -> impl std::future::Future<Output = Result<NodeInfo, RpcError>> + Send;
}

/// Node information from anvil_nodeInfo.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeInfo {
    /// Current block number
    pub current_block_number: String,
    /// Current block timestamp
    pub current_block_timestamp: u64,
    /// Current block hash (if available)
    #[serde(default)]
    pub current_block_hash: Option<String>,
    /// Hard fork
    pub hard_fork: String,
    /// Transaction order
    pub transaction_order: String,
    /// Environment
    pub environment: EnvironmentInfo,
    /// Fork config (if forking)
    #[serde(default)]
    pub fork_config: Option<ForkConfig>,
}

/// Environment information.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvironmentInfo {
    /// Base fee
    pub base_fee: String,
    /// Chain ID
    pub chain_id: u64,
    /// Gas limit
    pub gas_limit: String,
    /// Gas price
    pub gas_price: String,
}

/// Fork configuration (if forking).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ForkConfig {
    /// Fork URL
    pub fork_url: String,
    /// Fork block number
    pub fork_block_number: u64,
    /// Fork retry backoff
    #[serde(default)]
    pub fork_retry_backoff: Option<u64>,
}

impl AnvilMethods for RpcClient {
    async fn create_snapshot(&self) -> Result<String, RpcError> {
        let result: String = self.call("evm_snapshot", [(); 0]).await?;
        Ok(result)
    }

    async fn revert_snapshot(&self, snapshot_id: &str) -> Result<bool, RpcError> {
        // Parse snapshot_id as hex if it starts with 0x, otherwise use as-is
        let id = if snapshot_id.starts_with("0x") {
            parse_hex_u64(snapshot_id)? as i64
        } else {
            snapshot_id.parse::<i64>().map_err(|_| {
                RpcError::InvalidResponse(format!("Invalid snapshot ID: {}", snapshot_id))
            })?
        };
        self.call("evm_revert", [id]).await
    }

    async fn dump_state(&self) -> Result<String, RpcError> {
        self.call("anvil_dumpState", [(); 0]).await
    }

    async fn load_state(&self, state: &str) -> Result<bool, RpcError> {
        self.call("anvil_loadState", [state]).await
    }

    async fn mine(&self) -> Result<(), RpcError> {
        let _: String = self.call("evm_mine", [(); 0]).await?;
        Ok(())
    }

    async fn set_next_block_timestamp(&self, timestamp: u64) -> Result<(), RpcError> {
        let _: String = self.call("evm_setNextBlockTimestamp", [timestamp]).await?;
        Ok(())
    }

    async fn impersonate_account(&self, address: &str) -> Result<(), RpcError> {
        let _: bool = self.call("anvil_impersonateAccount", [address]).await?;
        Ok(())
    }

    async fn stop_impersonating_account(&self, address: &str) -> Result<(), RpcError> {
        let _: bool = self
            .call("anvil_stopImpersonatingAccount", [address])
            .await?;
        Ok(())
    }

    async fn set_balance(&self, address: &str, balance: u128) -> Result<(), RpcError> {
        let balance_hex = format!("0x{:x}", balance);
        let _: bool = self
            .call("anvil_setBalance", (address, balance_hex))
            .await?;
        Ok(())
    }

    async fn node_info(&self) -> Result<NodeInfo, RpcError> {
        self.call("anvil_nodeInfo", [(); 0]).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_node_info_deserialize() {
        let json = r#"{
            "currentBlockNumber": "0x10",
            "currentBlockTimestamp": 1705689600,
            "hardFork": "cancun",
            "transactionOrder": "fifo",
            "environment": {
                "baseFee": "0x3b9aca00",
                "chainId": 1,
                "gasLimit": "0x1c9c380",
                "gasPrice": "0x3b9aca00"
            }
        }"#;

        let info: NodeInfo = serde_json::from_str(json).unwrap();
        assert_eq!(info.current_block_number, "0x10");
        assert_eq!(info.current_block_timestamp, 1705689600);
        assert_eq!(info.hard_fork, "cancun");
        assert_eq!(info.environment.chain_id, 1);
        assert!(info.fork_config.is_none());
    }

    #[test]
    fn test_node_info_with_fork() {
        let json = r#"{
            "currentBlockNumber": "0x100",
            "currentBlockTimestamp": 1705689600,
            "hardFork": "cancun",
            "transactionOrder": "fifo",
            "environment": {
                "baseFee": "0x3b9aca00",
                "chainId": 1,
                "gasLimit": "0x1c9c380",
                "gasPrice": "0x3b9aca00"
            },
            "forkConfig": {
                "forkUrl": "https://eth.example.com",
                "forkBlockNumber": 18500000
            }
        }"#;

        let info: NodeInfo = serde_json::from_str(json).unwrap();
        assert!(info.fork_config.is_some());
        let fork = info.fork_config.unwrap();
        assert_eq!(fork.fork_url, "https://eth.example.com");
        assert_eq!(fork.fork_block_number, 18500000);
    }

    #[test]
    fn test_environment_info_deserialize() {
        let json = r#"{
            "baseFee": "0x3b9aca00",
            "chainId": 31337,
            "gasLimit": "0x1c9c380",
            "gasPrice": "0x3b9aca00"
        }"#;

        let env: EnvironmentInfo = serde_json::from_str(json).unwrap();
        assert_eq!(env.chain_id, 31337);
        assert_eq!(env.base_fee, "0x3b9aca00");
    }

    #[test]
    fn test_fork_config_deserialize() {
        let json = r#"{
            "forkUrl": "https://eth.example.com",
            "forkBlockNumber": 18500000,
            "forkRetryBackoff": 100
        }"#;

        let config: ForkConfig = serde_json::from_str(json).unwrap();
        assert_eq!(config.fork_url, "https://eth.example.com");
        assert_eq!(config.fork_block_number, 18500000);
        assert_eq!(config.fork_retry_backoff, Some(100));
    }
}
