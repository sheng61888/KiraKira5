# Community Management Implementation

## Overview
This implementation provides functionality for learners to add comments/replies to community threads, and admin functionality to view and delete both threads and replies.

## Files Created/Modified

### 1. Database Schema
**File:** `database_query/community_threads.sql`
- Creates `community_threads` table with thread information
- Creates `community_replies` table with reply information
- Includes foreign key relationships with cascade delete
- Uses `uid` column for user references (consistent with usertable)

**To Setup:** Run this SQL script on your database to create the tables.

### 2. Backend Service Layer
**File:** `code/community_service.cs`
- `GetAllThreadsAsync()` - Retrieves all threads with user info and reply counts
- `DeleteThreadAsync()` - Deletes a thread (replies cascade delete automatically)
- `GetThreadRepliesAsync()` - Retrieves all replies for a specific thread
- `DeleteReplyAsync()` - Deletes a specific reply
- `AdminCommunityThreadDto` - Data transfer object for thread information
- `CommunityReplyDto` - Data transfer object for reply information

### 3. API Controllers
**File:** `Controllers/AdminController.cs` (Modified)
- `GET /api/Admin/community/threads` - Returns all community threads
- `DELETE /api/Admin/community/threads/{threadId}` - Deletes a specific thread
- `GET /api/Admin/community/threads/{threadId}/replies` - Returns all replies for a thread
- `DELETE /api/Admin/community/replies/{replyId}` - Deletes a specific reply

**File:** `Controllers/Learner.cs` (Existing)
- `POST /api/Learner/{learnerId}/community/threads/{threadId}/replies` - Learner creates a reply
- `GET /api/Learner/{learnerId}/community/threads/{threadId}` - Learner views thread with replies

### 4. Admin UI
**File:** `html/admin-CommunityManagement.html`
- Admin page for viewing and managing community threads
- Table displaying thread details (ID, title, category, author, replies, date)
- Delete button for each thread with confirmation modal

### 5. Frontend JavaScript
**File:** `js/admin-community.js`
- Loads and displays threads from API
- Handles thread deletion with confirmation
- Loads and displays replies for each thread
- Handles reply deletion with confirmation
- Real-time UI updates after deletion
- Status messages for user feedback

**File:** `js/learner-thread.js` (Existing)
- Learners can view thread details
- Learners can post replies to threads
- Real-time reply updates

### 6. Styling
**File:** `css/admin.css` (Modified)
- Added styles for community management page
- Table styling with sticky headers
- Badge styles for categories and tags
- Modal styling for delete confirmation
- Status message styling

## Features

### Learner Capabilities
1. **Add Comments/Replies**
   - Post replies to any community thread
   - View all replies on a thread
   - See reply author and timestamp
   - Real-time updates after posting

### Admin Capabilities
1. **View All Threads**
   - See all community threads posted by learners
   - View thread title, body preview, category, tags
   - See author username and reply count
   - View creation date/time

2. **View Thread Replies**
   - Click "View" on any thread to see all replies
   - See reply author, content, and timestamp
   - View replies in chronological order

3. **Delete Threads**
   - Delete inappropriate or spam threads
   - Confirmation modal prevents accidental deletion
   - Automatic deletion of all replies (cascade)
   - Real-time UI update after deletion

4. **Delete Replies**
   - Delete individual inappropriate or spam replies
   - Confirmation dialog prevents accidental deletion
   - Real-time UI update after deletion
   - Reply count automatically updates

5. **Refresh Data**
   - Manual refresh button to reload threads
   - Auto-refresh on page load

## API Endpoints

### Admin Endpoints

#### Get All Threads
```
GET /api/Admin/community/threads
Response: Array of AdminCommunityThreadDto objects
```

#### Get Thread Replies
```
GET /api/Admin/community/threads/{threadId}/replies
Response: Array of CommunityReplyDto objects
```

#### Delete Thread
```
DELETE /api/Admin/community/threads/{threadId}
Response: { message: "Thread deleted successfully" }
```

#### Delete Reply
```
DELETE /api/Admin/community/replies/{replyId}
Response: { message: "Reply deleted successfully" }
```

### Learner Endpoints

#### Create Reply
```
POST /api/Learner/{learnerId}/community/threads/{threadId}/replies
Body: { message: "Reply content" }
Response: Reply object
```

#### Get Thread Details with Replies
```
GET /api/Learner/{learnerId}/community/threads/{threadId}
Response: Thread object with replies array
```

## Database Schema

### community_threads
- `thread_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `uid` (VARCHAR(255), FOREIGN KEY to usertable)
- `title` (VARCHAR(255))
- `body` (TEXT)
- `category` (VARCHAR(100))
- `primary_tag` (VARCHAR(100))
- `created_at` (TIMESTAMP)

### community_replies
- `reply_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `thread_id` (INT, FOREIGN KEY to community_threads)
- `uid` (VARCHAR(255), FOREIGN KEY to usertable)
- `body` (TEXT)
- `created_at` (TIMESTAMP)

## Security Features
- Parameterized queries prevent SQL injection
- Async/await patterns for database operations
- Error handling with proper logging
- Cascade delete ensures data integrity

## Usage

### For Learners

1. **View Thread:**
   - Navigate to `learner-community.html`
   - Click on any thread to view details

2. **Add Reply:**
   - On thread detail page, scroll to reply form
   - Type your comment/reply
   - Click "Post reply" button
   - Reply appears immediately

### For Admins

1. **Setup Database:**
   ```sql
   -- Run the SQL script
   source database_query/community_threads.sql
   ```

2. **Access Admin Panel:**
   - Navigate to `admin-CommunityManagement.html`
   - View all community threads in the table

3. **View Thread Replies:**
   - Click "View" button on any thread
   - Modal shows thread details and all replies
   - Each reply shows author, content, and timestamp

4. **Delete Reply:**
   - In the thread view modal, click "Delete" on any reply
   - Confirm deletion in the dialog
   - Reply is removed immediately

5. **Delete Thread:**
   - Click "Delete" button on any thread in the table
   - Confirm deletion in the modal
   - Thread and all replies are removed

## Next Steps (Optional Enhancements)
- Add pagination for large reply lists
- Add thread moderation (hide/unhide instead of delete)
- Add bulk delete functionality for threads and replies
- Add export threads and replies to CSV
- Add reply editing capability for learners
- Add notification system for reply mentions
- Add reply voting/like system
