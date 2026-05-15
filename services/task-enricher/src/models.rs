use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TaskMessage {
    pub taskId: String,
    pub name: Option<String>,
    pub priority: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct EnrichedEvent {
    pub taskId: String,
    pub enrichedBy: String,
    pub enrichedAt: DateTime<Utc>,
    pub category: String,
}
