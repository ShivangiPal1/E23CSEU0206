
require("dotenv").config();

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const TOP_N = 10;


const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};




//  MinHeap keeps the TOP N highest-scored items efficiently.
 
 
class MinHeap {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.heap = [];
  }

  // Returns score of root (lowest in heap)
  peekMin() {
    return this.heap[0]?.score ?? -Infinity;
  }

  
  insert(item) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this._bubbleUp(this.heap.length - 1);
    } else if (item.score > this.peekMin()) {
      // Replace root (lowest) with new higher-scored item
      this.heap[0] = item;
      this._sinkDown(0);
    }
    // else: item scores lower than all top-N, ignore
  }

  
  getSortedTopN() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].score < this.heap[smallest].score)
        smallest = left;
      if (right < n && this.heap[right].score < this.heap[smallest].score)
        smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}
function scoreNotification(notification) {

    const weight =
      TYPE_WEIGHT[notification.Type] ?? 0;
  
    const recencyScore =
      new Date(notification.Timestamp).getTime();
  
    return (
      weight * 1000000000000 +
      recencyScore
    );
  }

function getTopN(notifications, n = TOP_N) {
  const heap = new MinHeap(n);

  for (const notification of notifications) {
    const score = scoreNotification(notification);
    heap.insert({ score, notification });
  }

  return heap.getSortedTopN().map((item) => ({
    ...item.notification,
    _score: item.score,
  }));
}


function updateTopNWithNewNotifications(currentTopN, newNotifications, n = TOP_N) {
  const combined = [...currentTopN, ...newNotifications];
  return getTopN(combined, n);
}


async function fetchNotifications() {
  console.log("Fetching notifications from API...\n");

  const response = await fetch(API_URL, {
    headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.notifications ?? [];
}

function displayResults(topN) {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`   TOP ${TOP_N} PRIORITY NOTIFICATIONS`);
  console.log(`${"═".repeat(70)}\n`);

  const typeEmoji = { Placement: "💼", Result: "📊", Event: "🎓" };

  topN.forEach((n, i) => {
    const emoji = typeEmoji[n.Type] ?? "🔔";
    const rank = String(i + 1).padStart(2, " ");
    const type = n.Type.padEnd(10);
    const timestamp = new Date(n.Timestamp).toLocaleString();

    console.log(`  #${rank}  ${emoji}  [${type}]  ${n.Message}`);
    console.log(`        ID: ${n.ID}`);
    console.log(`        Time: ${timestamp}`);
    console.log(`        Priority Score: ${n._score.toLocaleString()}`);
    console.log();
  });

  console.log(`${"═".repeat(70)}\n`);
}

function displaySummary(all, topN) {
  const counts = { Placement: 0, Result: 0, Event: 0 };
  for (const n of all) counts[n.Type] = (counts[n.Type] ?? 0) + 1;

  console.log("📦  FULL DATASET SUMMARY");
  console.log(`    Total notifications fetched : ${all.length}`);
  console.log(`    💼 Placement                : ${counts.Placement}`);
  console.log(`    📊 Result                   : ${counts.Result}`);
  console.log(`    🎓 Event                    : ${counts.Event}`);
  console.log();
  console.log("🏆  TOP 10 BREAKDOWN");
  const topCounts = { Placement: 0, Result: 0, Event: 0 };
  for (const n of topN) topCounts[n.Type] = (topCounts[n.Type] ?? 0) + 1;
  console.log(`    💼 Placement : ${topCounts.Placement}`);
  console.log(`    📊 Result    : ${topCounts.Result}`);
  console.log(`    🎓 Event     : ${topCounts.Event}`);
  console.log();
}


function demonstrateStreamingUpdate(currentTopN) {
  console.log("─".repeat(70));
  console.log("⚡  SIMULATING: New notifications arriving in real-time...\n");

  const newNotifications = [
    {
      ID: "new-001",
      Type: "Placement",
      Message: "Google India hiring - NEW ARRIVAL",
      Timestamp: new Date().toISOString(), // right now = most recent possible
    },
    {
      ID: "new-002",
      Type: "Event",
      Message: "Annual Tech Fest - NEW ARRIVAL",
      Timestamp: new Date(Date.now() - 1000).toISOString(),
    },
  ];

  console.log("  New notifications arriving:");
  newNotifications.forEach((n) => {
    console.log(`    → [${n.Type}] ${n.Message}`);
  });
  console.log();

  const updatedTopN = updateTopNWithNewNotifications(
    currentTopN,
    newNotifications
  );

  console.log("  Updated Top 10 after new arrivals:\n");
  updatedTopN.forEach((n, i) => {
    const rank = String(i + 1).padStart(2, " ");
    console.log(`    #${rank}  [${n.Type.padEnd(10)}]  ${n.Message}`);
  });
  console.log();

  return updatedTopN;
}


async function main() {
  try {
    const allNotifications = await fetchNotifications();
    console.log(` Fetched ${allNotifications.length} notifications\n`);

    const topN = getTopN(allNotifications, TOP_N);

    displaySummary(allNotifications, topN);

    displayResults(topN);

    demonstrateStreamingUpdate(topN);
  } catch (err) {
    console.error("❌  Error:", err.message);
    process.exit(1);
  }
}

main();
