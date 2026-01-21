//! Task Graph module for dependency-based task execution.
//!
//! This module provides a petgraph-based task graph for managing
//! task dependencies and execution order.

mod task;

pub use task::TaskGraph;
