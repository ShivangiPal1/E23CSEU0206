export type NotificationType = "Placement" | "Result" | "Event";
export type NotificationFilter = "All" | NotificationType;

export interface RawNotification {
  ID?: string;
  id?: string;
  _id?: string;
  Type?: string;
  type?: string;
  notification_type?: string;
  Message?: string;
  message?: string;
  text?: string;
  Timestamp?: string;
  timestamp?: string;
  created_at?: string;
  Viewed?: boolean;
  viewed?: boolean;
  isRead?: boolean;
  is_read?: boolean;
  status?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  viewed: boolean;
  raw: RawNotification;
}

export interface PriorityNotification extends NotificationItem {
  priorityScore: number;
}

const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export const NOTIFICATION_FILTERS: NotificationFilter[] = [
  "All",
  "Placement",
  "Result",
  "Event",
];

export function normaliseNotification(raw: RawNotification, index: number): NotificationItem {
  const timestamp =
    getString(raw.Timestamp) ??
    getString(raw.timestamp) ??
    getString(raw.created_at) ??
    new Date(0).toISOString();

  const type =
    getString(raw.Type) ??
    getString(raw.type) ??
    getString(raw.notification_type) ??
    "Unknown";

  return {
    id:
      getString(raw.ID) ??
      getString(raw.id) ??
      getString(raw._id) ??
      `${type}-${timestamp}-${index}`,
    type,
    message:
      getString(raw.Message) ??
      getString(raw.message) ??
      getString(raw.text) ??
      "No message available",
    timestamp,
    viewed: readViewedState(raw),
    raw,
  };
}

function readViewedState(raw: RawNotification) {
  if (typeof raw.Viewed === "boolean") {
    return raw.Viewed;
  }

  if (typeof raw.viewed === "boolean") {
    return raw.viewed;
  }

  if (typeof raw.isRead === "boolean") {
    return raw.isRead;
  }

  if (typeof raw.is_read === "boolean") {
    return raw.is_read;
  }

  return String(raw.status ?? "").toLowerCase() === "viewed";
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function formatNotificationTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Invalid timestamp";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getTypeWeight(type: string) {
  return TYPE_WEIGHT[type as NotificationType] ?? 0;
}

export function scoreNotification(notification: NotificationItem) {
  const recencyScore = new Date(notification.timestamp).getTime();
  return getTypeWeight(notification.type) * 1_000_000_000_000 + recencyScore;
}

class MinHeap {
  private readonly maxSize: number;
  private heap: PriorityNotification[] = [];

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  insert(item: PriorityNotification) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.bubbleUp(this.heap.length - 1);
      return;
    }

    if (item.priorityScore > this.peekMin().priorityScore) {
      this.heap[0] = item;
      this.sinkDown(0);
    }
  }

  getItems() {
    return [...this.heap].sort((left, right) => right.priorityScore - left.priorityScore);
  }

  private peekMin() {
    return this.heap[0];
  }

  private bubbleUp(index: number) {
    let currentIndex = index;

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);

      if (
        this.heap[parentIndex].priorityScore <= this.heap[currentIndex].priorityScore
      ) {
        break;
      }

      [this.heap[parentIndex], this.heap[currentIndex]] = [
        this.heap[currentIndex],
        this.heap[parentIndex],
      ];

      currentIndex = parentIndex;
    }
  }

  private sinkDown(index: number) {
    let currentIndex = index;

    while (true) {
      const leftIndex = currentIndex * 2 + 1;
      const rightIndex = currentIndex * 2 + 2;
      let smallestIndex = currentIndex;

      if (
        leftIndex < this.heap.length &&
        this.heap[leftIndex].priorityScore < this.heap[smallestIndex].priorityScore
      ) {
        smallestIndex = leftIndex;
      }

      if (
        rightIndex < this.heap.length &&
        this.heap[rightIndex].priorityScore < this.heap[smallestIndex].priorityScore
      ) {
        smallestIndex = rightIndex;
      }

      if (smallestIndex === currentIndex) {
        return;
      }

      [this.heap[currentIndex], this.heap[smallestIndex]] = [
        this.heap[smallestIndex],
        this.heap[currentIndex],
      ];

      currentIndex = smallestIndex;
    }
  }
}

export function getTopPriorityNotifications(
  notifications: NotificationItem[],
  count = 10
) {
  const heap = new MinHeap(count);

  notifications.forEach((notification) => {
    heap.insert({
      ...notification,
      priorityScore: scoreNotification(notification),
    });
  });

  return heap.getItems();
}
