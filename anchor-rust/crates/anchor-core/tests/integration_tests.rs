//! Integration tests for the Anchor pipeline.
//!
//! These tests verify the full flow from session creation through task execution,
//! snapshot/checkpoint management, and validation.

use sigil_anchor_core::{
    get_default_physics, parse_grounding_statement, validate_grounding, Network, PhysicsTable,
    Session, SessionStatus, Task, TaskGraph, TaskStatus, TaskType, Vocabulary, Zone,
};
use std::collections::HashSet;

/// Test: Session creation and basic state management
#[test]
fn test_session_creation() {
    let session = Session::new("test-session-1", Network::Mainnet, 12345678);

    assert_eq!(session.id, "test-session-1");
    assert_eq!(session.network, Network::Mainnet);
    assert_eq!(session.block_number, 12345678);
    assert_eq!(session.status, SessionStatus::Active);
    assert!(session.fork_id.is_none());
}

/// Test: Task graph with multiple dependencies
#[test]
fn test_task_graph_pipeline() {
    let mut graph = TaskGraph::new();

    // Create a pipeline: fork -> snapshot -> validate -> checkpoint
    let fork_task = Task::new(
        "task-fork".to_string(),
        TaskType::Fork,
        serde_json::json!({"network": "mainnet", "block": 12345678}),
    );

    let snapshot_task = Task::with_dependencies(
        "task-snapshot".to_string(),
        TaskType::Ground,
        serde_json::json!({"fork_id": "fork-1"}),
        vec!["task-fork".to_string()],
    );

    let validate_task = Task::with_dependencies(
        "task-validate".to_string(),
        TaskType::Validate,
        serde_json::json!({"snapshot_id": "snap-1"}),
        vec!["task-snapshot".to_string()],
    );

    let checkpoint_task = Task::with_dependencies(
        "task-checkpoint".to_string(),
        TaskType::Write,
        serde_json::json!({"session_id": "session-1"}),
        vec!["task-validate".to_string()],
    );

    // Add tasks in order
    assert!(graph.add_task(fork_task).is_ok());
    assert!(graph.add_task(snapshot_task).is_ok());
    assert!(graph.add_task(validate_task).is_ok());
    assert!(graph.add_task(checkpoint_task).is_ok());

    // Verify graph structure
    assert_eq!(graph.len(), 4);

    // Initially only fork task is ready (no dependencies)
    let ready = graph.get_ready_tasks();
    assert_eq!(ready.len(), 1);
    assert_eq!(ready[0].id, "task-fork");
}

/// Test: Task execution order
#[test]
fn test_task_execution_order() {
    let mut graph = TaskGraph::new();

    // Create tasks
    let task1 = Task::new("task-1".to_string(), TaskType::Fork, serde_json::json!({}));
    let task2 = Task::with_dependencies(
        "task-2".to_string(),
        TaskType::Ground,
        serde_json::json!({}),
        vec!["task-1".to_string()],
    );
    let task3 = Task::with_dependencies(
        "task-3".to_string(),
        TaskType::Validate,
        serde_json::json!({}),
        vec!["task-1".to_string()],
    );
    let task4 = Task::with_dependencies(
        "task-4".to_string(),
        TaskType::Write,
        serde_json::json!({}),
        vec!["task-2".to_string(), "task-3".to_string()],
    );

    graph.add_task(task1).unwrap();
    graph.add_task(task2).unwrap();
    graph.add_task(task3).unwrap();
    graph.add_task(task4).unwrap();

    // Complete task-1
    graph.set_status("task-1", TaskStatus::Complete).unwrap();

    // Now task-2 and task-3 should be ready
    let ready = graph.get_ready_tasks();
    assert_eq!(ready.len(), 2);
    let ready_ids: HashSet<_> = ready.iter().map(|t| t.id.as_str()).collect();
    assert!(ready_ids.contains("task-2"));
    assert!(ready_ids.contains("task-3"));

    // Complete task-2 and task-3
    graph.set_status("task-2", TaskStatus::Complete).unwrap();
    graph.set_status("task-3", TaskStatus::Complete).unwrap();

    // Now task-4 should be ready
    let ready = graph.get_ready_tasks();
    assert_eq!(ready.len(), 1);
    assert_eq!(ready[0].id, "task-4");
}

/// Test: Error recovery in task graph
#[test]
fn test_task_error_recovery() {
    let mut graph = TaskGraph::new();

    let task1 = Task::new("task-1".to_string(), TaskType::Fork, serde_json::json!({}));
    let task2 = Task::with_dependencies(
        "task-2".to_string(),
        TaskType::Ground,
        serde_json::json!({}),
        vec!["task-1".to_string()],
    );

    graph.add_task(task1).unwrap();
    graph.add_task(task2).unwrap();

    // Fail task-1
    graph.set_status("task-1", TaskStatus::Failed).unwrap();

    // Task-2 should not be ready (dependency failed)
    let ready = graph.get_ready_tasks();
    assert!(ready.is_empty());

    // Verify status
    assert_eq!(graph.get("task-1").unwrap().status, TaskStatus::Failed);
    assert!(graph.get("task-1").unwrap().completed_at.is_some());
}

/// Test: Parallel task execution
#[test]
fn test_parallel_task_execution() {
    let mut graph = TaskGraph::new();

    // Create independent tasks
    let task1 = Task::new("task-1".to_string(), TaskType::Fork, serde_json::json!({}));
    let task2 = Task::new(
        "task-2".to_string(),
        TaskType::Ground,
        serde_json::json!({}),
    );
    let task3 = Task::new(
        "task-3".to_string(),
        TaskType::Validate,
        serde_json::json!({}),
    );
    let task4 = Task::with_dependencies(
        "task-4".to_string(),
        TaskType::Write,
        serde_json::json!({}),
        vec![
            "task-1".to_string(),
            "task-2".to_string(),
            "task-3".to_string(),
        ],
    );

    graph.add_task(task1).unwrap();
    graph.add_task(task2).unwrap();
    graph.add_task(task3).unwrap();
    graph.add_task(task4).unwrap();

    // All three independent tasks should be ready
    let ready = graph.get_ready_tasks();
    assert_eq!(ready.len(), 3);
}

/// Test: Full validation pipeline
#[test]
fn test_validation_pipeline() {
    // Create a grounding statement
    let statement_text = r#"
        Component: ClaimButton
        Zone: Critical
        Keywords: claim, withdraw
        Sync: pessimistic
        Timing: 800ms
        Confirmation: required
        Effect: Financial
    "#;

    // Parse the statement
    let statement = parse_grounding_statement(statement_text).unwrap();
    assert_eq!(statement.component, "ClaimButton");
    assert_eq!(statement.cited_zone, Zone::Critical);

    // Validate with physics
    let vocabulary = Vocabulary::defaults();
    let physics = get_default_physics();
    let result = validate_grounding(&statement, &vocabulary, &physics);

    // Should be valid (Critical zone for Financial effect is correct)
    assert!(matches!(
        result.status,
        sigil_anchor_core::ValidationStatus::Valid
    ));
}

/// Test: Physics table lookup
#[test]
fn test_physics_table() {
    let physics = PhysicsTable::defaults();

    // Financial should have pessimistic sync and 800ms timing
    let financial_rule = physics
        .get(&sigil_anchor_core::EffectType::Financial)
        .unwrap();
    assert_eq!(
        financial_rule.sync,
        sigil_anchor_core::SyncStrategy::Pessimistic
    );
    assert_eq!(financial_rule.timing_ms, 800);

    // Standard should have optimistic sync and 200ms timing
    let standard_rule = physics
        .get(&sigil_anchor_core::EffectType::Standard)
        .unwrap();
    assert_eq!(
        standard_rule.sync,
        sigil_anchor_core::SyncStrategy::Optimistic
    );
    assert_eq!(standard_rule.timing_ms, 200);
}

/// Test: Task graph serialization roundtrip
#[test]
fn test_task_graph_serialization() {
    let mut graph = TaskGraph::new();

    let task1 = Task::new(
        "task-1".to_string(),
        TaskType::Fork,
        serde_json::json!({"network": "mainnet"}),
    );
    let task2 = Task::with_dependencies(
        "task-2".to_string(),
        TaskType::Ground,
        serde_json::json!({"component": "Button"}),
        vec!["task-1".to_string()],
    );

    graph.add_task(task1).unwrap();
    graph.add_task(task2).unwrap();

    // Serialize
    let json = graph.to_json().unwrap();

    // Deserialize
    let restored = TaskGraph::from_json(&json).unwrap();

    // Verify
    assert_eq!(restored.len(), 2);
    assert_eq!(restored.get("task-1").unwrap().task_type, TaskType::Fork);
    assert_eq!(
        restored.get("task-2").unwrap().dependencies,
        vec!["task-1".to_string()]
    );
}

/// Test: Zone hierarchy validation
#[test]
fn test_zone_hierarchy() {
    // Critical is most restrictive
    assert!(Zone::Critical.is_more_restrictive_than(&Zone::Elevated));
    assert!(Zone::Critical.is_more_restrictive_than(&Zone::Standard));
    assert!(Zone::Critical.is_more_restrictive_than(&Zone::Local));

    // Elevated is more restrictive than Standard and Local
    assert!(Zone::Elevated.is_more_restrictive_than(&Zone::Standard));
    assert!(Zone::Elevated.is_more_restrictive_than(&Zone::Local));

    // Standard is more restrictive than Local
    assert!(Zone::Standard.is_more_restrictive_than(&Zone::Local));

    // Verify is_at_least_as_restrictive_as
    assert!(Zone::Critical.is_at_least_as_restrictive_as(&Zone::Critical));
    assert!(Zone::Critical.is_at_least_as_restrictive_as(&Zone::Elevated));
    assert!(!Zone::Local.is_at_least_as_restrictive_as(&Zone::Standard));
}

/// Test: Network configuration
#[test]
fn test_network_configuration() {
    // Mainnet
    let mainnet = Network::Mainnet;
    assert_eq!(mainnet.chain_id(), 1);
    assert_eq!(mainnet.name(), "mainnet");

    // Base
    let base = Network::Base;
    assert_eq!(base.chain_id(), 8453);

    // Berachain
    let berachain = Network::Berachain;
    assert_eq!(berachain.chain_id(), 80094);
}

/// Test: Session status transitions
#[test]
fn test_session_status_transitions() {
    let mut session = Session::new("test-session-transitions", Network::Mainnet, 12345678);

    // Initial status
    assert_eq!(session.status, SessionStatus::Active);

    // Pause
    session.status = SessionStatus::Paused;
    assert_eq!(session.status, SessionStatus::Paused);

    // Resume (set back to Active)
    session.status = SessionStatus::Active;
    assert_eq!(session.status, SessionStatus::Active);

    // Complete
    session.status = SessionStatus::Completed;
    assert_eq!(session.status, SessionStatus::Completed);
}
