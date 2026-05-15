use crate::models::{EnrichedEvent, TaskMessage};
use chrono::Utc;

pub fn enrich_task(task: &TaskMessage) -> EnrichedEvent {
    let category = match task.priority.as_deref().unwrap_or("") {
        "high" => "urgent",
        "low" => "background",
        _ => "standard",
    }
    .to_string();

    EnrichedEvent {
        taskId: task.taskId.clone(),
        enrichedBy: "task-enricher".to_string(),
        enrichedAt: Utc::now(),
        category,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enrich_high_priority() {
        let task = TaskMessage { taskId: "t1".into(), name: None, priority: Some("high".into()), description: None };
        let e = enrich_task(&task);
        assert_eq!(e.taskId, "t1");
        assert_eq!(e.category, "urgent");
        assert_eq!(e.enrichedBy, "task-enricher");
    }
}
