use crate::models::{EnrichedEvent, EnrichmentMetadata, TaskMessage};
use chrono::Utc;

pub fn enrich_task(task: &TaskMessage) -> EnrichedEvent {
    let priority = task.priority.as_deref().unwrap_or("").to_lowercase();
    let category = match priority.as_str() {
        "high" => "urgent",
        "low" => "background",
        _ => "standard",
    }
    .to_string();

    let priority_rank = match priority.as_str() {
        "high" => 3,
        "medium" => 2,
        "low" => 1,
        _ => 0,
    };
    let name_length = task.name.as_deref().unwrap_or("").chars().count();
    let description_length = task.description.as_deref().unwrap_or("").chars().count();

    EnrichedEvent {
        task_id: task.task_id.clone(),
        service: "task-enricher".to_string(),
        status: "ENRICHED".to_string(),
        message: "Task Enricher enriched task".to_string(),
        timestamp: Utc::now(),
        priority: task.priority.clone(),
        category,
        enriched_by: "task-enricher".to_string(),
        metadata: EnrichmentMetadata {
            name_length,
            description_length,
            priority_rank,
            has_description: description_length > 0,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enrich_high_priority() {
        let task = TaskMessage {
            task_id: "t1".into(),
            name: Some("Review Data".into()),
            priority: Some("high".into()),
            description: Some("Validate inputs".into()),
            created_at: None,
        };
        let e = enrich_task(&task);
        assert_eq!(e.task_id, "t1");
        assert_eq!(e.service, "task-enricher");
        assert_eq!(e.status, "ENRICHED");
        assert_eq!(e.message, "Task Enricher enriched task");
        assert_eq!(e.category, "urgent");
        assert_eq!(e.enriched_by, "task-enricher");
        assert_eq!(e.metadata.priority_rank, 3);
        assert_eq!(e.metadata.name_length, 11);
        assert!(e.metadata.has_description);
    }

    #[test]
    fn test_enrich_low_priority() {
        let task = TaskMessage {
            task_id: "t2".into(),
            name: None,
            priority: Some("low".into()),
            description: None,
            created_at: None,
        };

        let e = enrich_task(&task);

        assert_eq!(e.category, "background");
        assert_eq!(e.metadata.priority_rank, 1);
        assert_eq!(e.metadata.name_length, 0);
        assert!(!e.metadata.has_description);
    }

    #[test]
    fn test_enriched_event_serializes_for_timeline() {
        let task = TaskMessage {
            task_id: "t3".into(),
            name: Some("Sync Reports".into()),
            priority: Some("medium".into()),
            description: Some("Prepare daily summary".into()),
            created_at: None,
        };

        let value = serde_json::to_value(enrich_task(&task)).expect("event should serialize");

        assert_eq!(value["taskId"], "t3");
        assert_eq!(value["service"], "task-enricher");
        assert_eq!(value["status"], "ENRICHED");
        assert_eq!(value["message"], "Task Enricher enriched task");
        assert_eq!(value["priority"], "medium");
        assert_eq!(value["category"], "standard");
        assert_eq!(value["enrichedBy"], "task-enricher");
        assert_eq!(value["metadata"]["priorityRank"], 2);
    }
}
