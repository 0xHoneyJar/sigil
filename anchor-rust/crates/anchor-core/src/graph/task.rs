//! Task Graph implementation using petgraph.
//!
//! Provides dependency tracking, cycle detection, and execution ordering.

use crate::error::AnchorError;
use crate::types::{Task, TaskStatus};
use chrono::Utc;
use petgraph::algo::is_cyclic_directed;
use petgraph::graph::{DiGraph, NodeIndex};
use petgraph::visit::Dfs;
use petgraph::Direction;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Task graph for dependency-based execution.
///
/// Uses petgraph's DiGraph internally with HashMap lookups for O(1) task access.
#[derive(Debug, Clone)]
pub struct TaskGraph {
    /// The directed graph structure
    graph: DiGraph<String, ()>,
    /// Task storage with O(1) lookup by ID
    tasks: HashMap<String, Task>,
    /// Map from task ID to node index
    node_indices: HashMap<String, NodeIndex>,
}

/// Serializable representation of a task graph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerializedTaskGraph {
    /// All tasks in the graph
    pub tasks: Vec<Task>,
    /// Version for compatibility
    #[serde(default = "default_version")]
    pub version: String,
}

fn default_version() -> String {
    "1.0".to_string()
}

impl Default for TaskGraph {
    fn default() -> Self {
        Self::new()
    }
}

impl TaskGraph {
    /// Create a new empty task graph.
    pub fn new() -> Self {
        Self {
            graph: DiGraph::new(),
            tasks: HashMap::new(),
            node_indices: HashMap::new(),
        }
    }

    /// Get the number of tasks in the graph.
    pub fn len(&self) -> usize {
        self.tasks.len()
    }

    /// Check if the graph is empty.
    pub fn is_empty(&self) -> bool {
        self.tasks.is_empty()
    }

    /// Add a task to the graph.
    ///
    /// Returns an error if:
    /// - A task with the same ID already exists
    /// - A dependency does not exist
    /// - Adding the task would create a cycle
    pub fn add_task(&mut self, task: Task) -> Result<(), AnchorError> {
        // Check if task already exists
        if self.tasks.contains_key(&task.id) {
            return Err(AnchorError::TaskAlreadyExists(task.id.clone()));
        }

        // Validate dependencies exist
        for dep_id in &task.dependencies {
            if !self.tasks.contains_key(dep_id) {
                return Err(AnchorError::DependencyNotFound(dep_id.clone()));
            }
        }

        // Check if adding this task would create a cycle
        if self.would_create_cycle(&task.id, &task.dependencies) {
            return Err(AnchorError::CircularDependency(task.id.clone()));
        }

        // Add node to graph
        let node_idx = self.graph.add_node(task.id.clone());
        self.node_indices.insert(task.id.clone(), node_idx);

        // Add edges for dependencies
        for dep_id in &task.dependencies {
            if let Some(&dep_idx) = self.node_indices.get(dep_id) {
                // Edge from dependency to this task (dep must complete before this)
                self.graph.add_edge(dep_idx, node_idx, ());
            }
        }

        // Store the task
        self.tasks.insert(task.id.clone(), task);

        Ok(())
    }

    /// Check if adding a task with given dependencies would create a cycle.
    fn would_create_cycle(&self, task_id: &str, dependencies: &[String]) -> bool {
        // If no dependencies, can't create a cycle
        if dependencies.is_empty() {
            return false;
        }

        // Temporarily add the node and edges to check for cycles
        let mut test_graph = self.graph.clone();
        let new_node = test_graph.add_node(task_id.to_string());

        for dep_id in dependencies {
            if let Some(&dep_idx) = self.node_indices.get(dep_id) {
                test_graph.add_edge(dep_idx, new_node, ());
            }
        }

        is_cyclic_directed(&test_graph)
    }

    /// Get a task by ID.
    pub fn get(&self, task_id: &str) -> Option<&Task> {
        self.tasks.get(task_id)
    }

    /// Get a mutable reference to a task by ID.
    pub fn get_mut(&mut self, task_id: &str) -> Option<&mut Task> {
        self.tasks.get_mut(task_id)
    }

    /// Get all tasks with a specific status.
    pub fn get_by_status(&self, status: TaskStatus) -> Vec<&Task> {
        self.tasks.values().filter(|t| t.status == status).collect()
    }

    /// Get all tasks that are ready to execute.
    ///
    /// A task is ready if:
    /// - Its status is Pending
    /// - All its dependencies are Complete
    pub fn get_ready_tasks(&self) -> Vec<&Task> {
        let completed_ids: HashSet<String> = self
            .tasks
            .values()
            .filter(|t| t.status == TaskStatus::Complete)
            .map(|t| t.id.clone())
            .collect();

        self.tasks
            .values()
            .filter(|t| t.status == TaskStatus::Pending && t.dependencies_satisfied(&completed_ids))
            .collect()
    }

    /// Set a task's status.
    ///
    /// If setting to Complete, also sets completed_at.
    pub fn set_status(&mut self, task_id: &str, status: TaskStatus) -> Result<(), AnchorError> {
        let task = self
            .tasks
            .get_mut(task_id)
            .ok_or_else(|| AnchorError::TaskNotFound(task_id.to_string()))?;

        task.status = status;

        if status == TaskStatus::Complete || status == TaskStatus::Failed {
            task.completed_at = Some(Utc::now());
        }

        Ok(())
    }

    /// Get all tasks.
    pub fn all(&self) -> Vec<&Task> {
        self.tasks.values().collect()
    }

    /// Get tasks in topological order (dependencies first).
    pub fn topological_order(&self) -> Vec<&Task> {
        let mut result = Vec::new();
        let mut visited = HashSet::new();

        // Start DFS from all roots (tasks with no dependencies)
        for task in self.tasks.values() {
            if task.dependencies.is_empty() {
                if let Some(&node_idx) = self.node_indices.get(&task.id) {
                    self.dfs_order(node_idx, &mut visited, &mut result);
                }
            }
        }

        // Handle any remaining unvisited nodes (shouldn't happen with valid graph)
        for task in self.tasks.values() {
            if !visited.contains(&task.id) {
                if let Some(&node_idx) = self.node_indices.get(&task.id) {
                    self.dfs_order(node_idx, &mut visited, &mut result);
                }
            }
        }

        result
    }

    fn dfs_order<'a>(
        &'a self,
        node_idx: NodeIndex,
        visited: &mut HashSet<String>,
        result: &mut Vec<&'a Task>,
    ) {
        let task_id = &self.graph[node_idx];
        if visited.contains(task_id) {
            return;
        }
        visited.insert(task_id.clone());

        if let Some(task) = self.tasks.get(task_id) {
            result.push(task);
        }

        // Visit all successors
        let mut dfs = Dfs::new(&self.graph, node_idx);
        dfs.next(&self.graph); // Skip the current node
        while let Some(next_idx) = dfs.next(&self.graph) {
            let next_id = &self.graph[next_idx];
            if !visited.contains(next_id) {
                self.dfs_order(next_idx, visited, result);
            }
        }
    }

    /// Get direct dependencies of a task.
    pub fn dependencies(&self, task_id: &str) -> Vec<&Task> {
        self.tasks
            .get(task_id)
            .map(|t| {
                t.dependencies
                    .iter()
                    .filter_map(|dep_id| self.tasks.get(dep_id))
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Get direct dependents of a task (tasks that depend on it).
    pub fn dependents(&self, task_id: &str) -> Vec<&Task> {
        if let Some(&node_idx) = self.node_indices.get(task_id) {
            self.graph
                .neighbors_directed(node_idx, Direction::Outgoing)
                .filter_map(|idx| {
                    let dep_id = &self.graph[idx];
                    self.tasks.get(dep_id)
                })
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Remove a task from the graph.
    ///
    /// Returns error if task has dependents.
    pub fn remove_task(&mut self, task_id: &str) -> Result<Task, AnchorError> {
        // Check if task exists
        if !self.tasks.contains_key(task_id) {
            return Err(AnchorError::TaskNotFound(task_id.to_string()));
        }

        // Check if task has dependents
        let dependents = self.dependents(task_id);
        if !dependents.is_empty() {
            let dependent_ids: Vec<String> = dependents.iter().map(|t| t.id.clone()).collect();
            return Err(AnchorError::TaskHasDependents(
                task_id.to_string(),
                dependent_ids,
            ));
        }

        // Remove from graph
        if let Some(node_idx) = self.node_indices.remove(task_id) {
            self.graph.remove_node(node_idx);
            // Note: removing a node invalidates indices, so we need to rebuild the index map
            self.rebuild_node_indices();
        }

        // Remove from tasks
        self.tasks
            .remove(task_id)
            .ok_or_else(|| AnchorError::TaskNotFound(task_id.to_string()))
    }

    /// Rebuild node indices after a node removal.
    fn rebuild_node_indices(&mut self) {
        self.node_indices.clear();
        for node_idx in self.graph.node_indices() {
            let task_id = self.graph[node_idx].clone();
            self.node_indices.insert(task_id, node_idx);
        }
    }

    /// Serialize the task graph to JSON.
    pub fn to_json(&self) -> Result<String, AnchorError> {
        let serialized = SerializedTaskGraph {
            tasks: self.tasks.values().cloned().collect(),
            version: "1.0".to_string(),
        };
        serde_json::to_string_pretty(&serialized)
            .map_err(|e| AnchorError::SerializationError(e.to_string()))
    }

    /// Deserialize a task graph from JSON.
    pub fn from_json(json: &str) -> Result<Self, AnchorError> {
        let serialized: SerializedTaskGraph = serde_json::from_str(json)
            .map_err(|e| AnchorError::SerializationError(e.to_string()))?;

        let mut graph = TaskGraph::new();

        // Sort tasks by dependency count to add them in order
        let mut sorted_tasks: Vec<Task> = serialized.tasks;
        sorted_tasks.sort_by_key(|t| t.dependencies.len());

        // Add tasks in dependency order
        for task in sorted_tasks {
            graph.add_task(task)?;
        }

        Ok(graph)
    }

    /// Save the task graph to a file.
    pub async fn save(&self, path: &std::path::Path) -> Result<(), AnchorError> {
        let json = self.to_json()?;

        // Ensure parent directory exists
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .map_err(|e| AnchorError::IoError(format!("Failed to create directory: {}", e)))?;
        }

        tokio::fs::write(path, json)
            .await
            .map_err(|e| AnchorError::IoError(format!("Failed to write graph file: {}", e)))
    }

    /// Load a task graph from a file.
    pub async fn load(path: &std::path::Path) -> Result<Self, AnchorError> {
        let json = tokio::fs::read_to_string(path)
            .await
            .map_err(|e| AnchorError::IoError(format!("Failed to read graph file: {}", e)))?;

        Self::from_json(&json)
    }

    /// Generate a pretty-printed dependency tree.
    pub fn pretty_tree(&self) -> String {
        let mut result = String::new();
        let root_tasks: Vec<_> = self
            .tasks
            .values()
            .filter(|t| t.dependencies.is_empty())
            .collect();

        for root in root_tasks {
            self.build_tree_string(&root.id, "", true, &mut result);
        }

        if result.is_empty() {
            result.push_str("(empty graph)");
        }

        result
    }

    fn build_tree_string(&self, task_id: &str, prefix: &str, is_last: bool, result: &mut String) {
        let connector = if is_last { "└── " } else { "├── " };
        let task = match self.tasks.get(task_id) {
            Some(t) => t,
            None => return,
        };

        let status_icon = match task.status {
            TaskStatus::Complete => "✓",
            TaskStatus::Running => "►",
            TaskStatus::Failed => "✗",
            TaskStatus::Blocked => "◌",
            TaskStatus::Pending => "○",
        };

        result.push_str(&format!(
            "{}{}{} {} [{}]\n",
            prefix, connector, status_icon, task_id, task.task_type
        ));

        let child_prefix = if is_last {
            format!("{}    ", prefix)
        } else {
            format!("{}│   ", prefix)
        };

        let dependents = self.dependents(task_id);
        let dependent_count = dependents.len();
        for (i, dependent) in dependents.iter().enumerate() {
            let is_last_child = i == dependent_count - 1;
            self.build_tree_string(&dependent.id, &child_prefix, is_last_child, result);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::TaskType;
    use serde_json::json;

    fn create_test_task(id: &str, task_type: TaskType, dependencies: Vec<&str>) -> Task {
        Task::with_dependencies(
            id.to_string(),
            task_type,
            json!({}),
            dependencies.into_iter().map(String::from).collect(),
        )
    }

    #[test]
    fn test_new_graph() {
        let graph = TaskGraph::new();
        assert!(graph.is_empty());
        assert_eq!(graph.len(), 0);
    }

    #[test]
    fn test_add_task() {
        let mut graph = TaskGraph::new();
        let task = create_test_task("task-1", TaskType::Fork, vec![]);

        assert!(graph.add_task(task).is_ok());
        assert_eq!(graph.len(), 1);
        assert!(graph.get("task-1").is_some());
    }

    #[test]
    fn test_add_duplicate_task() {
        let mut graph = TaskGraph::new();
        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-1", TaskType::Ground, vec![]);

        assert!(graph.add_task(task1).is_ok());
        let result = graph.add_task(task2);
        assert!(matches!(result, Err(AnchorError::TaskAlreadyExists(_))));
    }

    #[test]
    fn test_add_task_with_dependencies() {
        let mut graph = TaskGraph::new();
        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);

        assert!(graph.add_task(task1).is_ok());
        assert!(graph.add_task(task2).is_ok());
        assert_eq!(graph.len(), 2);
    }

    #[test]
    fn test_add_task_missing_dependency() {
        let mut graph = TaskGraph::new();
        let task = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);

        let result = graph.add_task(task);
        assert!(matches!(result, Err(AnchorError::DependencyNotFound(_))));
    }

    #[test]
    fn test_circular_dependency_detection() {
        let mut graph = TaskGraph::new();

        // Create a chain: task-1 -> task-2 -> task-3
        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);
        let task3 = create_test_task("task-3", TaskType::Validate, vec!["task-2"]);

        assert!(graph.add_task(task1).is_ok());
        assert!(graph.add_task(task2).is_ok());
        assert!(graph.add_task(task3).is_ok());

        // Adding a task with dependencies on task-3 and task-1 is valid (no cycle)
        // because task-4 would be a new node depending on both, not creating a cycle
        assert!(!graph.would_create_cycle("task-4", &["task-3".to_string(), "task-1".to_string()]));

        // A cycle would be created if we tried to add a dependency from task-1 back to task-3
        // But we can't test this directly without modifying the task after it's added
        // Instead, verify the graph doesn't have cycles
        assert!(!petgraph::algo::is_cyclic_directed(&graph.graph));

        // Test adding a task that depends on itself (self-cycle) - this should be detected
        // through the would_create_cycle check
        // Note: We need to first add the task to the graph for self-cycle detection to work
        // But adding a task that depends on itself will fail due to missing dependency
        let self_dep_task = create_test_task("task-5", TaskType::Fork, vec!["task-5"]);
        assert!(matches!(
            graph.add_task(self_dep_task),
            Err(AnchorError::DependencyNotFound(_))
        ));
    }

    #[test]
    fn test_get_by_status() {
        let mut graph = TaskGraph::new();

        let mut task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        task1.status = TaskStatus::Complete;

        let task2 = create_test_task("task-2", TaskType::Ground, vec![]);
        let mut task3 = create_test_task("task-3", TaskType::Validate, vec![]);
        task3.status = TaskStatus::Complete;

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();
        graph.add_task(task3).unwrap();

        let completed = graph.get_by_status(TaskStatus::Complete);
        assert_eq!(completed.len(), 2);

        let pending = graph.get_by_status(TaskStatus::Pending);
        assert_eq!(pending.len(), 1);
    }

    #[test]
    fn test_get_ready_tasks() {
        let mut graph = TaskGraph::new();

        let mut task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        task1.status = TaskStatus::Complete;

        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);
        let task3 = create_test_task("task-3", TaskType::Validate, vec!["task-2"]);
        let task4 = create_test_task("task-4", TaskType::Write, vec![]);

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();
        graph.add_task(task3).unwrap();
        graph.add_task(task4).unwrap();

        let ready = graph.get_ready_tasks();
        // task-2 is ready (depends on complete task-1)
        // task-4 is ready (no dependencies)
        // task-3 is not ready (depends on pending task-2)
        assert_eq!(ready.len(), 2);
        let ready_ids: HashSet<_> = ready.iter().map(|t| t.id.as_str()).collect();
        assert!(ready_ids.contains("task-2"));
        assert!(ready_ids.contains("task-4"));
    }

    #[test]
    fn test_set_status() {
        let mut graph = TaskGraph::new();
        let task = create_test_task("task-1", TaskType::Fork, vec![]);
        graph.add_task(task).unwrap();

        assert!(graph.set_status("task-1", TaskStatus::Running).is_ok());
        assert_eq!(graph.get("task-1").unwrap().status, TaskStatus::Running);

        assert!(graph.set_status("task-1", TaskStatus::Complete).is_ok());
        assert_eq!(graph.get("task-1").unwrap().status, TaskStatus::Complete);
        assert!(graph.get("task-1").unwrap().completed_at.is_some());
    }

    #[test]
    fn test_set_status_not_found() {
        let mut graph = TaskGraph::new();
        let result = graph.set_status("nonexistent", TaskStatus::Complete);
        assert!(matches!(result, Err(AnchorError::TaskNotFound(_))));
    }

    #[test]
    fn test_dependencies_and_dependents() {
        let mut graph = TaskGraph::new();

        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);
        let task3 = create_test_task("task-3", TaskType::Validate, vec!["task-1"]);

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();
        graph.add_task(task3).unwrap();

        // task-2 depends on task-1
        let deps = graph.dependencies("task-2");
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].id, "task-1");

        // task-1 has two dependents
        let dependents = graph.dependents("task-1");
        assert_eq!(dependents.len(), 2);
    }

    #[test]
    fn test_remove_task() {
        let mut graph = TaskGraph::new();

        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-2", TaskType::Ground, vec![]);

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();

        let removed = graph.remove_task("task-2").unwrap();
        assert_eq!(removed.id, "task-2");
        assert_eq!(graph.len(), 1);
    }

    #[test]
    fn test_remove_task_with_dependents() {
        let mut graph = TaskGraph::new();

        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();

        // Can't remove task-1 because task-2 depends on it
        let result = graph.remove_task("task-1");
        assert!(matches!(result, Err(AnchorError::TaskHasDependents(_, _))));
    }

    #[test]
    fn test_serialization_roundtrip() {
        let mut graph = TaskGraph::new();

        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();

        let json = graph.to_json().unwrap();
        let restored = TaskGraph::from_json(&json).unwrap();

        assert_eq!(restored.len(), 2);
        assert!(restored.get("task-1").is_some());
        assert!(restored.get("task-2").is_some());
        assert_eq!(
            restored.get("task-2").unwrap().dependencies,
            vec!["task-1".to_string()]
        );
    }

    #[test]
    fn test_topological_order() {
        let mut graph = TaskGraph::new();

        let task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);
        let task3 = create_test_task("task-3", TaskType::Validate, vec!["task-2"]);

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();
        graph.add_task(task3).unwrap();

        let order = graph.topological_order();
        let ids: Vec<&str> = order.iter().map(|t| t.id.as_str()).collect();

        // task-1 must come before task-2, task-2 must come before task-3
        let pos1 = ids.iter().position(|&id| id == "task-1").unwrap();
        let pos2 = ids.iter().position(|&id| id == "task-2").unwrap();
        let pos3 = ids.iter().position(|&id| id == "task-3").unwrap();

        assert!(pos1 < pos2);
        assert!(pos2 < pos3);
    }

    #[test]
    fn test_pretty_tree() {
        let mut graph = TaskGraph::new();

        let mut task1 = create_test_task("task-1", TaskType::Fork, vec![]);
        task1.status = TaskStatus::Complete;

        let task2 = create_test_task("task-2", TaskType::Ground, vec!["task-1"]);

        graph.add_task(task1).unwrap();
        graph.add_task(task2).unwrap();

        let tree = graph.pretty_tree();
        assert!(tree.contains("task-1"));
        assert!(tree.contains("task-2"));
        assert!(tree.contains("✓")); // Complete status
        assert!(tree.contains("○")); // Pending status
    }

    #[test]
    fn test_typescript_compatible_json_format() {
        let mut graph = TaskGraph::new();
        let task = create_test_task("task-1", TaskType::Fork, vec![]);
        graph.add_task(task).unwrap();

        let json = graph.to_json().unwrap();

        // Verify JSON structure is compatible with TypeScript format
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(parsed.get("tasks").is_some());
        assert!(parsed.get("version").is_some());

        let tasks = parsed.get("tasks").unwrap().as_array().unwrap();
        assert_eq!(tasks.len(), 1);

        let task_json = &tasks[0];
        assert!(task_json.get("id").is_some());
        assert!(task_json.get("type").is_some());
        assert!(task_json.get("status").is_some());
        assert!(task_json.get("dependencies").is_some());
        assert!(task_json.get("input").is_some());
        assert!(task_json.get("created_at").is_some());
    }
}
