//! Task types for the Anchor pipeline.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Task types in the Anchor pipeline.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskType {
    /// Fork creation task
    Fork,
    /// Grounding validation task
    Ground,
    /// Warden validation task
    Warden,
    /// Code generation task
    Generate,
    /// Validation task
    Validate,
    /// Write task
    Write,
}

impl std::fmt::Display for TaskType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TaskType::Fork => write!(f, "fork"),
            TaskType::Ground => write!(f, "ground"),
            TaskType::Warden => write!(f, "warden"),
            TaskType::Generate => write!(f, "generate"),
            TaskType::Validate => write!(f, "validate"),
            TaskType::Write => write!(f, "write"),
        }
    }
}

/// Task status in the pipeline.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    /// Task is waiting to be executed
    Pending,
    /// Task is currently running
    Running,
    /// Task completed successfully
    Complete,
    /// Task is blocked by dependencies
    Blocked,
    /// Task failed with an error
    Failed,
}

impl TaskStatus {
    /// Check if the task is in a terminal state.
    pub fn is_terminal(&self) -> bool {
        matches!(self, TaskStatus::Complete | TaskStatus::Failed)
    }

    /// Check if the task can be executed.
    pub fn can_execute(&self) -> bool {
        matches!(self, TaskStatus::Pending)
    }
}

impl std::fmt::Display for TaskStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TaskStatus::Pending => write!(f, "pending"),
            TaskStatus::Running => write!(f, "running"),
            TaskStatus::Complete => write!(f, "complete"),
            TaskStatus::Blocked => write!(f, "blocked"),
            TaskStatus::Failed => write!(f, "failed"),
        }
    }
}

/// Task in the state-pinned graph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    /// Unique task ID
    pub id: String,

    /// Task type
    #[serde(rename = "type")]
    pub task_type: TaskType,

    /// Current status
    pub status: TaskStatus,

    /// Snapshot ID binding this task to EVM state
    #[serde(skip_serializing_if = "Option::is_none")]
    pub snapshot_id: Option<String>,

    /// Checkpoint ID for recovery
    #[serde(skip_serializing_if = "Option::is_none")]
    pub checkpoint_id: Option<String>,

    /// IDs of tasks this depends on
    #[serde(default)]
    pub dependencies: Vec<String>,

    /// Task input data
    pub input: serde_json::Value,

    /// Task output data
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<serde_json::Value>,

    /// Error message if failed
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,

    /// Creation timestamp
    #[serde(with = "chrono::serde::ts_milliseconds")]
    pub created_at: DateTime<Utc>,

    /// Completion timestamp
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "ts_milliseconds_option")]
    pub completed_at: Option<DateTime<Utc>>,
}

mod ts_milliseconds_option {
    use chrono::{DateTime, TimeZone, Utc};
    use serde::{self, Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(date: &Option<DateTime<Utc>>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match date {
            Some(d) => serializer.serialize_some(&d.timestamp_millis()),
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<DateTime<Utc>>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let opt: Option<i64> = Option::deserialize(deserializer)?;
        Ok(opt.map(|millis| Utc.timestamp_millis_opt(millis).unwrap()))
    }
}

impl Task {
    /// Create a new task.
    pub fn new(id: String, task_type: TaskType, input: serde_json::Value) -> Self {
        Self {
            id,
            task_type,
            status: TaskStatus::Pending,
            snapshot_id: None,
            checkpoint_id: None,
            dependencies: Vec::new(),
            input,
            output: None,
            error: None,
            created_at: Utc::now(),
            completed_at: None,
        }
    }

    /// Create a new task with dependencies.
    pub fn with_dependencies(
        id: String,
        task_type: TaskType,
        input: serde_json::Value,
        dependencies: Vec<String>,
    ) -> Self {
        let mut task = Self::new(id, task_type, input);
        task.dependencies = dependencies;
        task
    }

    /// Mark the task as running.
    pub fn start(&mut self) {
        self.status = TaskStatus::Running;
    }

    /// Mark the task as complete with output.
    pub fn complete(&mut self, output: serde_json::Value) {
        self.status = TaskStatus::Complete;
        self.output = Some(output);
        self.completed_at = Some(Utc::now());
    }

    /// Mark the task as failed with an error message.
    pub fn fail(&mut self, error: String) {
        self.status = TaskStatus::Failed;
        self.error = Some(error);
        self.completed_at = Some(Utc::now());
    }

    /// Mark the task as blocked.
    pub fn block(&mut self) {
        self.status = TaskStatus::Blocked;
    }

    /// Bind this task to a snapshot.
    pub fn bind_snapshot(&mut self, snapshot_id: String) {
        self.snapshot_id = Some(snapshot_id);
    }

    /// Bind this task to a checkpoint.
    pub fn bind_checkpoint(&mut self, checkpoint_id: String) {
        self.checkpoint_id = Some(checkpoint_id);
    }

    /// Check if all dependencies are in a given set of completed task IDs.
    pub fn dependencies_satisfied(
        &self,
        completed_ids: &std::collections::HashSet<String>,
    ) -> bool {
        self.dependencies
            .iter()
            .all(|dep| completed_ids.contains(dep))
    }

    /// Get the task duration if completed.
    pub fn duration_ms(&self) -> Option<i64> {
        self.completed_at
            .map(|completed| (completed - self.created_at).num_milliseconds())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn test_task_type_display() {
        assert_eq!(TaskType::Fork.to_string(), "fork");
        assert_eq!(TaskType::Ground.to_string(), "ground");
        assert_eq!(TaskType::Warden.to_string(), "warden");
        assert_eq!(TaskType::Generate.to_string(), "generate");
        assert_eq!(TaskType::Validate.to_string(), "validate");
        assert_eq!(TaskType::Write.to_string(), "write");
    }

    #[test]
    fn test_task_status_is_terminal() {
        assert!(TaskStatus::Complete.is_terminal());
        assert!(TaskStatus::Failed.is_terminal());
        assert!(!TaskStatus::Pending.is_terminal());
        assert!(!TaskStatus::Running.is_terminal());
        assert!(!TaskStatus::Blocked.is_terminal());
    }

    #[test]
    fn test_task_status_can_execute() {
        assert!(TaskStatus::Pending.can_execute());
        assert!(!TaskStatus::Running.can_execute());
        assert!(!TaskStatus::Complete.can_execute());
        assert!(!TaskStatus::Failed.can_execute());
        assert!(!TaskStatus::Blocked.can_execute());
    }

    #[test]
    fn test_task_new() {
        let task = Task::new(
            "task-1".to_string(),
            TaskType::Fork,
            serde_json::json!({"network": "mainnet"}),
        );

        assert_eq!(task.id, "task-1");
        assert_eq!(task.task_type, TaskType::Fork);
        assert_eq!(task.status, TaskStatus::Pending);
        assert!(task.dependencies.is_empty());
    }

    #[test]
    fn test_task_with_dependencies() {
        let task = Task::with_dependencies(
            "task-2".to_string(),
            TaskType::Ground,
            serde_json::json!({}),
            vec!["task-1".to_string()],
        );

        assert_eq!(task.dependencies.len(), 1);
        assert_eq!(task.dependencies[0], "task-1");
    }

    #[test]
    fn test_task_lifecycle() {
        let mut task = Task::new("task-1".to_string(), TaskType::Fork, serde_json::json!({}));

        // Start
        task.start();
        assert_eq!(task.status, TaskStatus::Running);

        // Complete
        task.complete(serde_json::json!({"result": "success"}));
        assert_eq!(task.status, TaskStatus::Complete);
        assert!(task.output.is_some());
        assert!(task.completed_at.is_some());
    }

    #[test]
    fn test_task_fail() {
        let mut task = Task::new("task-1".to_string(), TaskType::Fork, serde_json::json!({}));
        task.start();
        task.fail("Connection refused".to_string());

        assert_eq!(task.status, TaskStatus::Failed);
        assert_eq!(task.error, Some("Connection refused".to_string()));
        assert!(task.completed_at.is_some());
    }

    #[test]
    fn test_task_dependencies_satisfied() {
        let task = Task::with_dependencies(
            "task-3".to_string(),
            TaskType::Ground,
            serde_json::json!({}),
            vec!["task-1".to_string(), "task-2".to_string()],
        );

        let mut completed = HashSet::new();
        assert!(!task.dependencies_satisfied(&completed));

        completed.insert("task-1".to_string());
        assert!(!task.dependencies_satisfied(&completed));

        completed.insert("task-2".to_string());
        assert!(task.dependencies_satisfied(&completed));
    }

    #[test]
    fn test_task_bind_snapshot() {
        let mut task = Task::new("task-1".to_string(), TaskType::Fork, serde_json::json!({}));
        task.bind_snapshot("snap-123".to_string());
        assert_eq!(task.snapshot_id, Some("snap-123".to_string()));
    }

    #[test]
    fn test_task_serialize_deserialize() {
        let mut task = Task::new(
            "task-1".to_string(),
            TaskType::Fork,
            serde_json::json!({"network": "mainnet"}),
        );
        task.dependencies = vec!["dep-1".to_string()];

        let json = serde_json::to_string(&task).unwrap();
        let deserialized: Task = serde_json::from_str(&json).unwrap();

        assert_eq!(task.id, deserialized.id);
        assert_eq!(task.task_type, deserialized.task_type);
        assert_eq!(task.dependencies, deserialized.dependencies);
    }
}
