//! JSON-RPC client for Anvil communication.

use reqwest::Client;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;
use thiserror::Error;

/// RPC client errors.
#[derive(Debug, Error)]
pub enum RpcError {
    /// HTTP request failed
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    /// JSON serialization/deserialization failed
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    /// RPC returned an error response
    #[error("RPC error {code}: {message}")]
    Rpc { code: i64, message: String },

    /// Request timed out
    #[error("Request timed out after {0:?}")]
    Timeout(Duration),

    /// Server not ready
    #[error("Server not ready at {0}")]
    NotReady(String),

    /// Invalid response format
    #[error("Invalid response: {0}")]
    InvalidResponse(String),
}

/// JSON-RPC request structure.
#[derive(Debug, Clone, Serialize)]
pub struct JsonRpcRequest<P> {
    /// JSON-RPC version (always "2.0")
    pub jsonrpc: &'static str,
    /// Method name
    pub method: String,
    /// Method parameters
    pub params: P,
    /// Request ID
    pub id: u64,
}

impl<P> JsonRpcRequest<P> {
    /// Create a new JSON-RPC request.
    pub fn new(method: impl Into<String>, params: P, id: u64) -> Self {
        Self {
            jsonrpc: "2.0",
            method: method.into(),
            params,
            id,
        }
    }
}

/// JSON-RPC response structure.
#[derive(Debug, Clone, Deserialize)]
pub struct JsonRpcResponse<R> {
    /// JSON-RPC version
    pub jsonrpc: String,
    /// Request ID
    pub id: u64,
    /// Result (if successful)
    pub result: Option<R>,
    /// Error (if failed)
    pub error: Option<JsonRpcError>,
}

/// JSON-RPC error structure.
#[derive(Debug, Clone, Deserialize)]
pub struct JsonRpcError {
    /// Error code
    pub code: i64,
    /// Error message
    pub message: String,
    /// Additional data
    #[serde(default)]
    pub data: Option<serde_json::Value>,
}

/// RPC client for communicating with Anvil.
#[derive(Debug)]
pub struct RpcClient {
    /// HTTP client
    client: Client,
    /// RPC URL
    url: String,
    /// Request ID counter
    id_counter: AtomicU64,
    /// Request timeout
    timeout: Duration,
}

impl RpcClient {
    /// Create a new RPC client.
    pub fn new(url: impl Into<String>) -> Self {
        Self::with_timeout(url, Duration::from_secs(30))
    }

    /// Create a new RPC client with custom timeout.
    pub fn with_timeout(url: impl Into<String>, timeout: Duration) -> Self {
        let client = Client::builder()
            .timeout(timeout)
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            url: url.into(),
            id_counter: AtomicU64::new(1),
            timeout,
        }
    }

    /// Get the RPC URL.
    pub fn url(&self) -> &str {
        &self.url
    }

    /// Get the next request ID.
    fn next_id(&self) -> u64 {
        self.id_counter.fetch_add(1, Ordering::SeqCst)
    }

    /// Make a JSON-RPC call.
    pub async fn call<P, R>(&self, method: &str, params: P) -> Result<R, RpcError>
    where
        P: Serialize,
        R: DeserializeOwned,
    {
        let request = JsonRpcRequest::new(method, params, self.next_id());

        let response = self
            .client
            .post(&self.url)
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    RpcError::Timeout(self.timeout)
                } else {
                    RpcError::Http(e)
                }
            })?;

        let rpc_response: JsonRpcResponse<R> = response.json().await?;

        if let Some(error) = rpc_response.error {
            return Err(RpcError::Rpc {
                code: error.code,
                message: error.message,
            });
        }

        rpc_response
            .result
            .ok_or_else(|| RpcError::InvalidResponse("Missing result field".to_string()))
    }

    /// Check if the RPC server is ready.
    pub async fn is_ready(&self) -> bool {
        self.call::<[(); 0], String>("eth_chainId", [])
            .await
            .is_ok()
    }

    /// Wait for the RPC server to become ready.
    pub async fn wait_for_ready(
        &self,
        max_attempts: u32,
        interval: Duration,
    ) -> Result<(), RpcError> {
        for _ in 0..max_attempts {
            if self.is_ready().await {
                return Ok(());
            }
            tokio::time::sleep(interval).await;
        }
        Err(RpcError::NotReady(self.url.clone()))
    }

    /// Get the chain ID.
    pub async fn get_chain_id(&self) -> Result<u64, RpcError> {
        let hex: String = self.call("eth_chainId", [(); 0]).await?;
        parse_hex_u64(&hex)
    }

    /// Get the current block number.
    pub async fn get_block_number(&self) -> Result<u64, RpcError> {
        let hex: String = self.call("eth_blockNumber", [(); 0]).await?;
        parse_hex_u64(&hex)
    }
}

/// Parse a hex string to u64.
pub fn parse_hex_u64(hex: &str) -> Result<u64, RpcError> {
    let hex = hex.strip_prefix("0x").unwrap_or(hex);
    u64::from_str_radix(hex, 16)
        .map_err(|_| RpcError::InvalidResponse(format!("Invalid hex: {}", hex)))
}

/// Format a u64 as a hex string.
#[allow(dead_code)]
pub fn format_hex_u64(value: u64) -> String {
    format!("0x{:x}", value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_hex_u64() {
        assert_eq!(parse_hex_u64("0x1").unwrap(), 1);
        assert_eq!(parse_hex_u64("0xa").unwrap(), 10);
        assert_eq!(parse_hex_u64("0xff").unwrap(), 255);
        assert_eq!(parse_hex_u64("0x100").unwrap(), 256);
        assert_eq!(parse_hex_u64("1").unwrap(), 1);
        assert_eq!(parse_hex_u64("ff").unwrap(), 255);
    }

    #[test]
    fn test_parse_hex_u64_invalid() {
        assert!(parse_hex_u64("0xzz").is_err());
        assert!(parse_hex_u64("not_hex").is_err());
    }

    #[test]
    fn test_format_hex_u64() {
        assert_eq!(format_hex_u64(0), "0x0");
        assert_eq!(format_hex_u64(1), "0x1");
        assert_eq!(format_hex_u64(10), "0xa");
        assert_eq!(format_hex_u64(255), "0xff");
        assert_eq!(format_hex_u64(256), "0x100");
    }

    #[test]
    fn test_json_rpc_request_new() {
        let request = JsonRpcRequest::new("eth_chainId", [(); 0], 1);
        assert_eq!(request.jsonrpc, "2.0");
        assert_eq!(request.method, "eth_chainId");
        assert_eq!(request.id, 1);
    }

    #[test]
    fn test_json_rpc_request_serialize() {
        let request = JsonRpcRequest::new("eth_blockNumber", [(); 0], 42);
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"jsonrpc\":\"2.0\""));
        assert!(json.contains("\"method\":\"eth_blockNumber\""));
        assert!(json.contains("\"id\":42"));
    }

    #[test]
    fn test_json_rpc_response_deserialize_success() {
        let json = r#"{"jsonrpc":"2.0","id":1,"result":"0x1"}"#;
        let response: JsonRpcResponse<String> = serde_json::from_str(json).unwrap();
        assert_eq!(response.id, 1);
        assert_eq!(response.result, Some("0x1".to_string()));
        assert!(response.error.is_none());
    }

    #[test]
    fn test_json_rpc_response_deserialize_error() {
        let json =
            r#"{"jsonrpc":"2.0","id":1,"error":{"code":-32600,"message":"Invalid request"}}"#;
        let response: JsonRpcResponse<String> = serde_json::from_str(json).unwrap();
        assert_eq!(response.id, 1);
        assert!(response.result.is_none());
        let error = response.error.unwrap();
        assert_eq!(error.code, -32600);
        assert_eq!(error.message, "Invalid request");
    }

    #[test]
    fn test_rpc_client_new() {
        let client = RpcClient::new("http://localhost:8545");
        assert_eq!(client.url(), "http://localhost:8545");
    }

    #[test]
    fn test_rpc_client_with_timeout() {
        let client = RpcClient::with_timeout("http://localhost:8545", Duration::from_secs(10));
        assert_eq!(client.url(), "http://localhost:8545");
        assert_eq!(client.timeout, Duration::from_secs(10));
    }

    #[test]
    fn test_rpc_client_next_id() {
        let client = RpcClient::new("http://localhost:8545");
        assert_eq!(client.next_id(), 1);
        assert_eq!(client.next_id(), 2);
        assert_eq!(client.next_id(), 3);
    }

    #[test]
    fn test_rpc_error_display() {
        let err = RpcError::Rpc {
            code: -32600,
            message: "Invalid request".to_string(),
        };
        assert_eq!(err.to_string(), "RPC error -32600: Invalid request");

        let err = RpcError::Timeout(Duration::from_secs(30));
        assert_eq!(err.to_string(), "Request timed out after 30s");

        let err = RpcError::NotReady("http://localhost:8545".to_string());
        assert_eq!(err.to_string(), "Server not ready at http://localhost:8545");
    }
}
