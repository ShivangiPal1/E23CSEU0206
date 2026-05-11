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
