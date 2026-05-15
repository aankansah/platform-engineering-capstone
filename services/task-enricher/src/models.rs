use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TaskMessage {
    pub task_id: String,
    pub name: Option<String>,
    pub priority: Option<String>,
    pub description: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EnrichedEvent {
    pub task_id: String,
    pub service: String,
    pub status: String,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub priority: Option<String>,
    pub category: String,
    pub enriched_by: String,
    pub metadata: EnrichmentMetadata,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EnrichmentMetadata {
    pub name_length: usize,
    pub description_length: usize,
    pub priority_rank: u8,
    pub has_description: bool,
}
