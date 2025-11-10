# Community Replies Implementation

## Summary
Added functionality for learners to add comments/replies to community threads, and for admins to delete individual replies.

## Changes Made

### 1. Backend Service (community_service.cs)
Added two new methods:
- `GetThreadRepliesAsync()` - Retrieves all replies for a specific thread with user information
- `DeleteReplyAsync()` - Deletes a specific reply by ID

Added new DTO:
- `CommunityReplyDto` - Data transfer object containing reply information (ReplyId, Body, CreatedAt, Username)

### 2. Admin Controller (AdminController.cs)
Added two new API endpoints:
- `GET /api/Admin/community/threads/{threadId}/replies` - Returns all replies for a thread
- `DELETE /api/Admin/community/replies/{replyId}` - Deletes a specific reply

### 3. Database Schema (community_threads.sql)
Fixed column naming consistency:
- Changed `user_id` to `uid` in both tables to match the usertable schema
- Ensures proper foreign key relationships

### 4. Admin UI (admin-CommunityManagement.html)
Enhanced the view modal:
- Added replies section to display all replies when viewing a thread
- Each reply shows author, timestamp, content, and delete button

### 5. Admin JavaScript (admin-community.js)
Added new functions:
- `loadReplies(threadId)` - Fetches and displays replies for a thread
- `deleteReply(replyId, threadId)` - Handles reply deletion with confirmation
- Updated `viewThread()` to be async and load replies automatically

## Features

### Learner Features (Already Existing)
- Post replies to community threads via `learner-thread.html`
- View all replies on a thread
- Real-time updates after posting

### New Admin Features
- View all replies when viewing a thread
- Delete individual inappropriate or spam replies
- Confirmation dialog before deletion
- Automatic reply count update after deletion
- Real-time UI updates

## API Usage Examples

### Admin: Get Thread Replies
```http
GET /api/Admin/community/threads/123/replies
```
Response:
```json
[
  {
    "replyId": 1,
    "body": "Great question! Here's my answer...",
    "createdAt": "2024-01-15T10:30:00",
    "username": "student123"
  }
]
```

### Admin: Delete Reply
```http
DELETE /api/Admin/community/replies/1
```
Response:
```json
{
  "message": "Reply deleted successfully"
}
```

### Learner: Create Reply
```http
POST /api/Learner/student123/community/threads/123/replies
Content-Type: application/json

{
  "message": "This is my reply to the thread"
}
```

## Security Features
- Parameterized queries prevent SQL injection
- Async/await patterns for database operations
- Proper error handling and logging
- Confirmation dialogs prevent accidental deletions

## Testing Steps

### Test Learner Reply Creation
1. Navigate to `learner-thread.html?threadId=1`
2. Scroll to reply form
3. Enter a comment and click "Post reply"
4. Verify reply appears immediately

### Test Admin Reply Viewing
1. Navigate to `admin-CommunityManagement.html`
2. Click "View" on any thread with replies
3. Verify all replies are displayed with author and timestamp

### Test Admin Reply Deletion
1. In the thread view modal, click "Delete" on a reply
2. Confirm the deletion
3. Verify reply is removed and count updates
4. Refresh and verify deletion persisted

## Database Consistency Note
The schema now uses `uid` consistently across all tables:
- `community_threads.uid` → references `usertable.uid`
- `community_replies.uid` → references `usertable.uid`

If you have existing data with `user_id` columns, run this migration:
```sql
ALTER TABLE community_threads CHANGE user_id uid VARCHAR(255);
ALTER TABLE community_replies CHANGE user_id uid VARCHAR(255);
```
