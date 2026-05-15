type EventItem = {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string;
  value?: any;
  [key: string]: any;
};

const events: EventItem[] = [];

function addEvent(item: EventItem) {
  events.push(item);
}

function getAllEvents(): EventItem[] {
  return events.slice().reverse();
}

export { addEvent, getAllEvents };
