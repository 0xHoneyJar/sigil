//! Core types for Anchor operations.
//!
//! This module contains all shared data structures used across Anchor:
//! - [`Zone`]: Physics restrictiveness hierarchy
//! - [`Network`]: Blockchain network configuration
//! - [`Fork`]: Anvil fork instance management
//! - [`Task`]: Pipeline task management
//! - Physics types: [`SyncStrategy`], [`ConfirmationType`], [`EffectType`], [`PhysicsRule`], [`PhysicsTable`]

mod fork;
mod network;
mod physics;
mod task;
mod zone;

pub use fork::{Fork, ForkRegistry};
pub use network::Network;
pub use physics::{ConfirmationType, EffectType, PhysicsRule, PhysicsTable, SyncStrategy};
pub use task::{Task, TaskStatus, TaskType};
pub use zone::Zone;
