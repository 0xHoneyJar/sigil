//! Core types for Anchor operations.
//!
//! This module contains all shared data structures used across Anchor:
//! - [`Zone`]: Physics restrictiveness hierarchy
//! - [`Network`]: Blockchain network configuration
//! - [`Fork`]: Anvil fork instance management
//! - [`Task`]: Pipeline task management
//! - [`Snapshot`]: EVM state snapshot management
//! - [`Checkpoint`]: Full EVM state persistence
//! - [`Session`]: Development session management
//! - Physics types: [`SyncStrategy`], [`ConfirmationType`], [`EffectType`], [`PhysicsRule`], [`PhysicsTable`]

mod checkpoint;
mod fork;
mod network;
mod physics;
mod session;
mod snapshot;
mod task;
mod zone;

pub use checkpoint::{Checkpoint, CheckpointRegistry};
pub use fork::{Fork, ForkRegistry};
pub use network::Network;
pub use physics::{ConfirmationType, EffectType, PhysicsRule, PhysicsTable, SyncStrategy};
pub use session::{Session, SessionMetadata, SessionRegistry, SessionStatus};
pub use snapshot::{Snapshot, SnapshotRegistry};
pub use task::{Task, TaskStatus, TaskType};
pub use zone::Zone;
