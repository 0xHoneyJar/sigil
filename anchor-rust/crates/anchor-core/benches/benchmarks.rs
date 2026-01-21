//! Performance benchmarks for Anchor Core.
//!
//! Run with: `cargo bench`
//!
//! Target performance:
//! - Cold start time: <50ms
//! - RPC call latency: <25ms (network excluded)
//! - Validation time: <30ms

use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use sigil_anchor_core::{
    get_default_physics, parse_grounding_statement, validate_grounding, Network, PhysicsTable,
    Session, Task, TaskGraph, TaskType, Vocabulary, Zone,
};

/// Benchmark cold start: creating default physics and vocabulary.
fn bench_cold_start(c: &mut Criterion) {
    let mut group = c.benchmark_group("cold_start");

    group.bench_function("physics_defaults", |b| {
        b.iter(|| black_box(PhysicsTable::defaults()));
    });

    group.bench_function("vocabulary_defaults", |b| {
        b.iter(|| black_box(Vocabulary::defaults()));
    });

    group.bench_function("full_cold_start", |b| {
        b.iter(|| {
            let physics = PhysicsTable::defaults();
            let vocab = Vocabulary::defaults();
            black_box((physics, vocab))
        });
    });

    group.finish();
}

/// Benchmark session creation and management.
fn bench_session(c: &mut Criterion) {
    let mut group = c.benchmark_group("session");

    group.bench_function("create", |b| {
        b.iter(|| black_box(Session::new("bench-session", Network::Mainnet, 12345678)));
    });

    group.finish();
}

/// Benchmark task graph operations.
fn bench_task_graph(c: &mut Criterion) {
    let mut group = c.benchmark_group("task_graph");

    group.bench_function("create_empty", |b| {
        b.iter(|| black_box(TaskGraph::new()));
    });

    group.bench_function("add_task", |b| {
        let mut graph = TaskGraph::new();
        let mut counter = 0;
        b.iter(|| {
            counter += 1;
            let task = Task::new(
                format!("task-{}", counter),
                TaskType::Fork,
                serde_json::json!({}),
            );
            let _ = graph.add_task(task);
        });
    });

    // Benchmark with varying graph sizes
    for size in [10, 50, 100, 500].iter() {
        group.bench_with_input(
            BenchmarkId::new("get_ready_tasks", size),
            size,
            |b, &size| {
                let mut graph = TaskGraph::new();

                // Create a graph with half independent, half dependent tasks
                for i in 0..size {
                    let task = if i < size / 2 {
                        Task::new(format!("task-{}", i), TaskType::Fork, serde_json::json!({}))
                    } else {
                        Task::with_dependencies(
                            format!("task-{}", i),
                            TaskType::Ground,
                            serde_json::json!({}),
                            vec![format!("task-{}", i - size / 2)],
                        )
                    };
                    let _ = graph.add_task(task);
                }

                b.iter(|| black_box(graph.get_ready_tasks()));
            },
        );

        group.bench_with_input(BenchmarkId::new("serialization", size), size, |b, &size| {
            let mut graph = TaskGraph::new();
            for i in 0..size {
                let task = Task::new(
                    format!("task-{}", i),
                    TaskType::Fork,
                    serde_json::json!({"index": i}),
                );
                let _ = graph.add_task(task);
            }

            b.iter(|| {
                let json = graph.to_json().unwrap();
                black_box(json)
            });
        });
    }

    group.finish();
}

/// Benchmark grounding statement parsing.
fn bench_parsing(c: &mut Criterion) {
    let mut group = c.benchmark_group("parsing");

    let simple_statement = r#"
        Component: ClaimButton
        Zone: Critical
        Keywords: claim
        Sync: pessimistic
    "#;

    let complex_statement = r#"
        Component: ComplexWithdrawFlow
        Zone: Critical
        Keywords: withdraw, unstake, claim, redeem
        Sync: pessimistic
        Timing: 800ms
        Confirmation: required
        Effect: Financial
        Context: Web3 DeFi application
        Notes: Multi-step withdrawal process with validation
    "#;

    group.bench_function("parse_simple", |b| {
        b.iter(|| black_box(parse_grounding_statement(simple_statement).unwrap()));
    });

    group.bench_function("parse_complex", |b| {
        b.iter(|| black_box(parse_grounding_statement(complex_statement).unwrap()));
    });

    group.finish();
}

/// Benchmark validation operations.
fn bench_validation(c: &mut Criterion) {
    let mut group = c.benchmark_group("validation");

    let statement = r#"
        Component: ClaimButton
        Zone: Critical
        Keywords: claim, withdraw
        Sync: pessimistic
        Timing: 800ms
        Confirmation: required
        Effect: Financial
    "#;

    let parsed = parse_grounding_statement(statement).unwrap();
    let physics = get_default_physics();
    let vocab = Vocabulary::defaults();

    group.bench_function("validate_grounding", |b| {
        b.iter(|| black_box(validate_grounding(&parsed, &vocab, &physics)));
    });

    // Benchmark full validation pipeline
    group.bench_function("full_validation_pipeline", |b| {
        b.iter(|| {
            let parsed = parse_grounding_statement(statement).unwrap();
            let physics = get_default_physics();
            let vocab = Vocabulary::defaults();
            black_box(validate_grounding(&parsed, &vocab, &physics))
        });
    });

    group.finish();
}

/// Benchmark zone operations.
fn bench_zones(c: &mut Criterion) {
    let mut group = c.benchmark_group("zones");

    group.bench_function("hierarchy_check", |b| {
        b.iter(|| {
            let result = Zone::Critical.is_more_restrictive_than(&Zone::Standard);
            black_box(result)
        });
    });

    group.bench_function("zone_comparison_all", |b| {
        let zones = [Zone::Critical, Zone::Elevated, Zone::Standard, Zone::Local];
        b.iter(|| {
            for z1 in &zones {
                for z2 in &zones {
                    black_box(z1.is_at_least_as_restrictive_as(z2));
                }
            }
        });
    });

    group.finish();
}

/// Benchmark network configuration.
fn bench_network(c: &mut Criterion) {
    let mut group = c.benchmark_group("network");

    group.bench_function("chain_id_lookup", |b| {
        let networks = [
            Network::Mainnet,
            Network::Base,
            Network::Berachain,
            Network::Arbitrum,
            Network::Optimism,
        ];
        b.iter(|| {
            for net in &networks {
                black_box(net.chain_id());
            }
        });
    });

    group.finish();
}

criterion_group!(
    benches,
    bench_cold_start,
    bench_session,
    bench_task_graph,
    bench_parsing,
    bench_validation,
    bench_zones,
    bench_network,
);

criterion_main!(benches);
