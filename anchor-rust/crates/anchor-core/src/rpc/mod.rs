//! RPC client module for Anvil communication.
//!
//! This module provides a JSON-RPC client for communicating with Anvil instances.

mod client;
mod methods;

pub use client::{JsonRpcRequest, JsonRpcResponse, RpcClient, RpcError};
pub use methods::AnvilMethods;
