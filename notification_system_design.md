# Stage 1 – Notification System API Design

 Overview
The Campus Notification Platform allows students to receive real-time updates related to:

- Placements
- College Events
- Results

For this assessment, users are assumed to already be authenticated. Every request contains a bearer token in the `Authorization` header.


 Core Features

The notification system should support the following actions:

 FEATURE - DESCRIPTION 

 Get Notifications - Fetch all notifications for a student
 Get Notification by ID - Fetch complete details of a specific notification 
 Mark as Read - Mark a notification as read 
 Mark All as Read - Mark every notification as read
 Unread Count - Get unread notification count for badge display 
 Filter Notifications - Filter notifications by type 



# API Design

 1. Get All Notifications
Returns a paginated list of notifications for the logged-in student.

Endpoint

GET /api/v1/notifications

 Headers
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

 Query Parameters
| Parameter | Type | Description |

| page | integer | Page number (default: 1) |
| limit | integer | Number of results per page (default: 20) |
| type | string | Placement / Event / Result |
| is_read | boolean | Filter read/unread notifications |

 Example Request

GET /api/v1/notifications?page=1&limit=20&type=Placement&is_read=false


Response (200 OK)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
        "type": "Placement",
        "message": "CSX Corporation is hiring interns",
        "is_read": false,
        "created_at": "2026-04-22T17:51:18Z"
      }
    ]
  }
}
```



2. Get Notification by ID



GET /api/v1/notifications/:id


Response (200 OK)
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
      "type": "Placement",
      "message": "CSX Corporation is hiring interns",
      "is_read": false
    }
  }
}
```



3. Mark Notification as Read



PATCH /api/v1/notifications/:id/read


Response (200 OK)
```json
{
  "success": true,
  "data": {
    "is_read": true
  }
}




4. Mark All Notifications as Read


PATCH /api/v1/notifications/read-all


 Response (200 OK)
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

 5. Get Unread Notification Count


GET /api/v1/notifications/unread-count


 Response (200 OK)
```json
{
  "success": true,
  "data": {
    "unread_count": 17
  }
}
```


# Real-Time Notification Mechanism
 Server-Sent Events (SSE)

The platform uses Server-Sent Events (SSE) for real-time notification delivery.

 SSE Endpoint

GET /api/v1/notifications/stream


Event Format
```text
event: new_notification
data: {"message":"CSX Corporation is hiring interns"}
```
 Client Example
```javascript
const eventSource = new EventSource('/api/v1/notifications/stream');

eventSource.addEventListener('new_notification', (event) => {
  const notification = JSON.parse(event.data);
  console.log(notification);
});
```

# Flow
1. Student opens the application.
2. Client connects to the SSE endpoint.
3. Server pushes notifications in real time.
4. Client updates the UI instantly.

---

# Summary of Endpoints

| Method | Endpoint | Purpose |

| GET | `/api/v1/notifications` | Get all notifications |
| GET | `/api/v1/notifications/:id` | Get notification by ID |
| PATCH | `/api/v1/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all notifications as read |
| GET | `/api/v1/notifications/unread-count` | Get unread notification count |
| GET | `/api/v1/notifications/stream` | Real-time notification stream |

# Stage 2

## Database Choice

For storing notifications, I would use MongoDB.

The main reason for choosing MongoDB is that notifications are simple JSON-like objects and their structure can change easily in future if more fields are added. Since the application may generate a large number of notifications continuously, MongoDB is a good fit because it handles frequent writes efficiently and also works well with Node.js applications.

Another reason is that notifications are generally fetched user-wise and in sorted order (latest first), which MongoDB can handle efficiently using indexes.

---

# Database Schema

## Notifications Collection

```json
{
  "_id": "ObjectId",
  "user_id": "student_101",
  "type": "Placement",
  "message": "Microsoft is hiring interns",
  "is_read": false,
  "created_at": "2026-05-11T10:00:00Z"
}
```

### Field Description

| Field | Purpose |
|---|---|
| _id | Unique notification ID |
| user_id | Student receiving the notification |
| type | Notification category |
| message | Notification content |
| is_read | Read/unread status |
| created_at | Notification creation time |



# Indexing

To improve performance, indexes can be created on:

| Field | Reason |
|---|---|
| user_id | Faster notification retrieval for a student |
| created_at | Faster sorting of latest notifications |
| is_read | Faster unread notification filtering |
| type | Faster filtering by category |



# Possible Issues at Scale

## 1. Large Number of Notifications

As more students use the platform, the notification collection can grow very large.

### Solution
- Use pagination while fetching notifications
- Archive older notifications
- Delete unnecessary old records after a certain period if needed


## 2. Slow Query Performance

If unread notifications are queried repeatedly for many users, performance may reduce over time.

### Solution
- Add proper indexes
- Cache unread counts if required
- Fetch only required fields instead of full documents



## 3. Real-Time Connection Load

Maintaining many active SSE connections at the same time may increase server load.

### Solution
- Scale the backend horizontally
- Use load balancing
- Move real-time services separately if traffic becomes very high



# Sample MongoDB Queries

## Get All Notifications

```js
db.notifications.find({
  user_id: "student_101"
})
.sort({ created_at: -1 })
.limit(20)
```

---

## Get Notification By ID

```js
db.notifications.findOne({
  _id: ObjectId("notification_id")
})
```



## Mark Notification as Read

```js
db.notifications.updateOne(
  {
    _id: ObjectId("notification_id")
  },
  {
    $set: {
      is_read: true
    }
  }
)
```



## Mark All Notifications as Read

```js
db.notifications.updateMany(
  {
    user_id: "student_101",
    is_read: false
  },
  {
    $set: {
      is_read: true
    }
  }
)
```



## Get Unread Notification Count

```js
db.notifications.countDocuments({
  user_id: "student_101",
  is_read: false
})
```

# Stage 3

## The Query in Question

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

---

## 1. Is this query accurate?

The query is mostly correct because it fetches unread notifications for a particular student and sorts them based on creation time.

However, one thing that can be improved is the use of `SELECT *`. Fetching every column is usually unnecessary because the frontend may only need a few fields like notification type, message, and timestamp. As the dataset grows, returning extra data increases memory usage and query time.

A better version would be:

```sql
SELECT id, studentID, notification_type, message, isRead, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

---

## 2. Why is this query slow?

With 5 million notifications in the database, performance issues are expected if proper indexing is not used.

### Reason 1: Full table scan

If there is no index on `studentID` and `isRead`, the database may scan a very large portion of the table before finding matching rows. As the number of records increases, this becomes slower.

### Reason 2: Sorting cost

The query also sorts results using `createdAt`. Without an index supporting the sorting order, the database has to perform additional sorting operations in memory.

### Reason 3: Fetching unnecessary columns

Using `SELECT *` increases the amount of data read from disk and sent to the application, even if some columns are never used.

In notification systems, read operations happen very frequently, so query optimization becomes important as the number of users grows.

---

## 3. What changes would improve the query?

### Use a composite index

A composite index is more useful here than separate indexes on individual columns.

```sql
CREATE INDEX idx_notifications_student_read_date
ON notifications(studentID, isRead, createdAt ASC);
```

This helps because:
- the database can quickly locate notifications for a specific student
- unread notifications are filtered faster
- results are already closer to the required sorting order

### Add pagination

Returning thousands of notifications at once is unnecessary and expensive.

```sql
SELECT id, studentID, notification_type, message, isRead, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC
LIMIT 20 OFFSET 0;
```

---

## 4. Likely Computation Cost

Without indexing, the query performance can become close to a full table scan as the dataset grows.

After adding a proper composite index, the database only needs to scan a much smaller subset of rows instead of checking the entire table.

This reduces response time significantly and improves overall API performance.

---

## 5. Should every column be indexed?

No, adding indexes on every column is not a good approach.

Indexes improve read performance, but they also increase:
- storage usage
- insert/update time
- maintenance overhead

Since notifications are generated frequently, excessive indexing can slow down write operations.

Indexes should mainly be added on:
- columns used in filtering
- columns used in sorting
- columns frequently used in joins

It is generally better to design indexes based on actual query patterns instead of indexing every field.

---

## 6. Query to Find Students Who Received Placement Notifications in Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

This query returns unique students who received placement notifications during the last 7 days.

If student details are also needed:

```sql
SELECT DISTINCT s.id, s.name, s.email
FROM notifications n
JOIN students s ON s.id = n.studentID
WHERE n.notificationType = 'Placement'
AND n.createdAt >= NOW() - INTERVAL '7 days';
```

---

## 7. Additional Improvements

As the platform grows further, additional optimizations can also help:

- archiving older notifications
- caching unread counts
- database partitioning
- using read replicas for heavy traffic
- limiting unnecessary API calls

These changes can help maintain performance even when the system scales to millions of records.
