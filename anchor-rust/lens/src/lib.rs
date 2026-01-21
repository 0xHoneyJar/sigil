//! sigil-lens-core - Library crate for Lens constraint verification
//!
//! This crate provides formal verification via CEL (Common Expression Language)
//! and heuristic linting for Sigil physics analysis.
//!
//! # Example
//!
//! ```rust,ignore
//! use sigil_lens_core::{verify_constraints, types::PhysicsAnalysis};
//!
//! let physics = PhysicsAnalysis {
//!     effect: "Financial".to_string(),
//!     behavioral: BehavioralPhysics {
//!         sync: "pessimistic".to_string(),
//!         timing: 800,
//!         confirmation: true,
//!     },
//!     // ...
//! };
//!
//! let results = verify_constraints(&physics)?;
//! ```

pub mod cel;
pub mod commands;
pub mod correction;
pub mod error;
pub mod heuristics;
pub mod io;
pub mod parser;
pub mod types;

// Re-export commonly used types
pub use error::{LensError, Result};
pub use types::{
    constraint::{Constraint, ConstraintCategory, Severity},
    constraint_result::ConstraintResult,
    request::{LintRequest, VerifyRequest},
    response::{LintResponse, VerifyResponse},
};
pub use parser::ComponentMetrics;

/// Verify physics analysis against all constraints
///
/// Returns a list of constraint results (pass/fail) for each constraint.
pub fn verify_constraints(
    physics: &types::physics::PhysicsAnalysis,
) -> Result<Vec<ConstraintResult>> {
    commands::verify::verify(physics)
}

/// Load constraints from the pub/ directory or use embedded defaults
pub fn load_constraints() -> Result<Vec<Constraint>> {
    types::constraint::Constraint::load_all()
}
