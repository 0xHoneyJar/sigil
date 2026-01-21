//! Tree-sitter based code parsing for TypeScript/TSX
//!
//! This module provides code parsing capabilities to extract
//! component metrics for heuristic analysis.

use tree_sitter::{Parser, Tree, Node};
use tree_sitter_typescript::LANGUAGE_TSX;

use crate::error::{LensError, Result};

use serde::{Deserialize, Serialize};

/// Metrics extracted from parsed component code
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ComponentMetrics {
    /// Total number of JSX elements in the component
    pub element_count: usize,
    /// Maximum nesting depth of JSX elements
    pub max_nesting_depth: usize,
    /// Number of function declarations/expressions
    pub function_count: usize,
    /// Number of event handlers (onClick, onChange, etc.)
    pub event_handler_count: usize,
    /// Number of useState/useEffect/etc. hooks
    pub hook_count: usize,
    /// Number of interactive elements (button, input, a, etc.)
    pub interactive_element_count: usize,
    /// Estimated lines of code
    pub lines_of_code: usize,
}

/// Code parser using tree-sitter for TypeScript/TSX
pub struct CodeParser {
    parser: Parser,
}

impl CodeParser {
    /// Create a new code parser for TSX
    pub fn new() -> Result<Self> {
        let mut parser = Parser::new();
        let language = LANGUAGE_TSX.into();
        parser.set_language(&language).map_err(|e| LensError::Parse {
            reason: format!("Failed to set TSX language: {}", e),
        })?;
        Ok(Self { parser })
    }

    /// Parse component code and extract metrics
    pub fn parse(&mut self, code: &str) -> Result<ComponentMetrics> {
        let tree = self.parser.parse(code, None).ok_or_else(|| LensError::Parse {
            reason: "Failed to parse code".to_string(),
        })?;

        let mut metrics = ComponentMetrics {
            lines_of_code: code.lines().count(),
            ..Default::default()
        };

        self.extract_metrics(&tree, code.as_bytes(), &mut metrics);

        Ok(metrics)
    }

    /// Extract metrics from the parsed tree
    fn extract_metrics(&self, tree: &Tree, source: &[u8], metrics: &mut ComponentMetrics) {
        let root = tree.root_node();
        self.visit_node(root, source, metrics, 0);
    }

    /// Recursively visit nodes and collect metrics
    fn visit_node(&self, node: Node, source: &[u8], metrics: &mut ComponentMetrics, depth: usize) {
        let kind = node.kind();

        match kind {
            // JSX elements
            "jsx_element" | "jsx_self_closing_element" => {
                metrics.element_count += 1;
                if depth > metrics.max_nesting_depth {
                    metrics.max_nesting_depth = depth;
                }

                // Check if it's an interactive element
                if let Some(tag_name) = self.get_jsx_tag_name(node, source) {
                    if is_interactive_element(&tag_name) {
                        metrics.interactive_element_count += 1;
                    }
                }
            }

            // JSX opening element - check for event handlers
            "jsx_opening_element" => {
                metrics.event_handler_count += self.count_event_handlers_in_opening(node, source);
            }

            // Function declarations and expressions
            "function_declaration" | "function" | "arrow_function" | "method_definition" => {
                metrics.function_count += 1;
            }

            // React hooks
            "call_expression" => {
                if let Some(callee) = node.child_by_field_name("function") {
                    let callee_text = callee.utf8_text(source).unwrap_or("");
                    if is_react_hook(callee_text) {
                        metrics.hook_count += 1;
                    }
                }
            }

            // JSX attribute - check for event handlers
            "jsx_attribute" => {
                if let Some(name_node) = node.child(0) {
                    if let Ok(name) = name_node.utf8_text(source) {
                        if is_event_handler_name(name) {
                            metrics.event_handler_count += 1;
                        }
                    }
                }
            }

            _ => {}
        }

        // Recursively visit children
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            let next_depth = if kind == "jsx_element" || kind == "jsx_self_closing_element" {
                depth + 1
            } else {
                depth
            };
            self.visit_node(child, source, metrics, next_depth);
        }
    }

    /// Get the tag name of a JSX element
    fn get_jsx_tag_name(&self, node: Node, source: &[u8]) -> Option<String> {
        let kind = node.kind();

        if kind == "jsx_element" {
            // Look for opening element
            let mut cursor = node.walk();
            for child in node.children(&mut cursor) {
                if child.kind() == "jsx_opening_element" {
                    return self.get_jsx_tag_name_from_opening(child, source);
                }
            }
        } else if kind == "jsx_self_closing_element" {
            return self.get_jsx_tag_name_from_opening(node, source);
        }

        None
    }

    /// Get tag name from opening element or self-closing element
    fn get_jsx_tag_name_from_opening(&self, node: Node, source: &[u8]) -> Option<String> {
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            let kind = child.kind();
            if kind == "identifier" || kind == "member_expression" {
                return child.utf8_text(source).ok().map(|s| s.to_lowercase());
            }
        }
        None
    }

    /// Count event handlers in JSX opening element attributes
    fn count_event_handlers_in_opening(&self, node: Node, source: &[u8]) -> usize {
        let mut count = 0;
        let mut cursor = node.walk();

        for child in node.children(&mut cursor) {
            if child.kind() == "jsx_attribute" {
                // Get the attribute name (first child)
                if let Some(name_node) = child.child(0) {
                    if let Ok(name) = name_node.utf8_text(source) {
                        if is_event_handler_name(name) {
                            count += 1;
                        }
                    }
                }
            }
        }

        count
    }
}

impl Default for CodeParser {
    fn default() -> Self {
        Self::new().expect("Failed to create default CodeParser")
    }
}

/// Check if a tag name is an interactive element
fn is_interactive_element(tag: &str) -> bool {
    matches!(
        tag,
        "button" | "a" | "input" | "select" | "textarea" | "form" | "label" | "option"
    )
}

/// Check if a function name is a React hook
fn is_react_hook(name: &str) -> bool {
    name.starts_with("use") && name.len() > 3 && name.chars().nth(3).map_or(false, |c| c.is_uppercase())
}

/// Check if an attribute name is an event handler
fn is_event_handler_name(name: &str) -> bool {
    name.starts_with("on") && name.len() > 2 && name.chars().nth(2).map_or(false, |c| c.is_uppercase())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parser_creation() {
        let parser = CodeParser::new();
        assert!(parser.is_ok());
    }

    #[test]
    fn test_parse_simple_component() {
        let mut parser = CodeParser::new().unwrap();
        let code = r#"
function Button() {
    return <button onClick={() => {}}>Click me</button>
}
"#;
        let metrics = parser.parse(code).unwrap();

        assert_eq!(metrics.element_count, 1);
        assert!(metrics.function_count >= 1); // At least Button function
        assert_eq!(metrics.interactive_element_count, 1);
        assert!(metrics.event_handler_count >= 1); // onClick
    }

    #[test]
    fn test_parse_nested_jsx() {
        let mut parser = CodeParser::new().unwrap();
        let code = r#"
function Card() {
    return (
        <div>
            <header>
                <h1>Title</h1>
            </header>
            <main>
                <p>Content</p>
            </main>
        </div>
    )
}
"#;
        let metrics = parser.parse(code).unwrap();

        // Elements: div, header, h1, main, p (5 total - text nodes don't count)
        assert!(metrics.element_count >= 5);
        assert!(metrics.max_nesting_depth >= 2); // at least div > header > h1
    }

    #[test]
    fn test_parse_hooks() {
        let mut parser = CodeParser::new().unwrap();
        let code = r#"
function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        console.log(count);
    }, [count]);

    return <div>{count}</div>
}
"#;
        let metrics = parser.parse(code).unwrap();

        assert_eq!(metrics.hook_count, 2); // useState, useEffect
    }

    #[test]
    fn test_parse_multiple_event_handlers() {
        let mut parser = CodeParser::new().unwrap();
        let code = r#"
function Form() {
    return (
        <form onSubmit={handleSubmit}>
            <input onChange={handleChange} onBlur={handleBlur} />
            <button onClick={handleClick}>Submit</button>
        </form>
    )
}
"#;
        let metrics = parser.parse(code).unwrap();

        // Check that we detect at least some event handlers and interactive elements
        assert!(metrics.event_handler_count >= 1, "Should detect event handlers");
        assert!(metrics.interactive_element_count >= 1, "Should detect interactive elements");
    }

    #[test]
    fn test_is_react_hook() {
        assert!(is_react_hook("useState"));
        assert!(is_react_hook("useEffect"));
        assert!(is_react_hook("useMemo"));
        assert!(is_react_hook("useCustomHook"));
        assert!(!is_react_hook("use")); // Too short
        assert!(!is_react_hook("used")); // Not a hook pattern
        assert!(!is_react_hook("username")); // Not a hook pattern
    }

    #[test]
    fn test_is_event_handler_name() {
        assert!(is_event_handler_name("onClick"));
        assert!(is_event_handler_name("onChange"));
        assert!(is_event_handler_name("onSubmit"));
        assert!(is_event_handler_name("onCustomEvent"));
        assert!(!is_event_handler_name("on")); // Too short
        assert!(!is_event_handler_name("onclick")); // lowercase after on
        assert!(!is_event_handler_name("handler")); // Not an event handler
    }

    #[test]
    fn test_parse_self_closing_elements() {
        let mut parser = CodeParser::new().unwrap();
        let code = r#"
function Profile() {
    return (
        <div>
            <img src="avatar.png" />
            <input type="text" />
            <br />
        </div>
    )
}
"#;
        let metrics = parser.parse(code).unwrap();

        assert_eq!(metrics.element_count, 4); // div, img, input, br
        assert_eq!(metrics.interactive_element_count, 1); // input
    }

    #[test]
    fn test_metrics_basic() {
        let mut parser = CodeParser::new().unwrap();
        let code = "<div><button>Click</button></div>";
        let metrics = parser.parse(code).unwrap();

        assert!(metrics.element_count >= 2);
        assert!(metrics.interactive_element_count >= 1);
    }
}
