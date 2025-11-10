# Community Management Implementation

## Overview
This implementation provides admin functionality to view and delete community threads posted by learners.

## Files Created/Modified

### 1. Database Schema
**File:** `database_query/community_threads.sql`
- Creates `community_threads` table with thread information
- Creates `community_replies` table with reply information
- Includes foreign key relationships with cascade delete

**To Setup:** Run this SQL script on your database to create the tables.

### 2. Backend Service Layer
**File:** `code/community_service.cs`
- `GetAllThreadsAsync()` - Retrieves all threads with user info and reply counts
- `DeleteThreadAsync()` - Deletes a thread (replies cascade delete automatically)
- `CommunityThreadDto` - Data transfer object for thread information

### 3. API Controller
**File:** `Controllers/AdminController.cs` (Modified)
- `GET /api/Admin/community/threads` - Returns all community threads
- `DELETE /api/Admin/community/threads/{threadId}` - Deletes a specific thread

### 4. Admin UI
**File:** `html/admin-CommunityManagement.html`
- Admin page for viewing and managing community threads
- Table displaying thread details (ID, title, category, author, replies, date)
- Delete button for each thread with confirmation modal

### 5. Frontend JavaScript
**File:** `js/admin-community.js`
- Loads and displays threads from API
- Handles thread deletion with confirmation
- Real-time UI updates after deletion
- Status messages for user feedback

### 6. Styling
**File:** `css/admin.css` (Modified)
- Added styles for community management page
- Table styling with sticky headers
- Badge styles for categories and tags
- Modal styling for delete confirmation
- Status message styling

## Features

### Admin Capabilities
1. **View All Threads**
   - See all community threads posted by learners
   - View thread title, body preview, category, tags
   - See author username and reply count
   - View creation date/time

2. **Delete Threads**
   - Delete inappropriate or spam threads
   - Confirmation modal prevents accidental deletion
   - Automatic deletion of all replies (cascade)
   - Real-time UI update after deletion

3. **Refresh Data**
   - Manual refresh button to reload threads
   - Auto-refresh on page load

## API Endpoints

### Get All Threads
```
GET /api/Admin/community/threads
Response: Array of CommunityThreadDto objects
```

### Delete Thread
```
DELETE /api/Admin/community/threads/{threadId}
Response: { message: "Thread deleted successfully" }
```

## Database Schema

### community_threads
- `thread_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (VARCHAR(255), FOREIGN KEY)
- `title` (VARCHAR(255))
- `body` (TEXT)
- `category` (VARCHAR(100))
- `primary_tag` (VARCHAR(100))
- `created_at` (TIMESTAMP)

### community_replies
- `reply_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `thread_id` (INT, FOREIGN KEY)
- `user_id` (VARCHAR(255), FOREIGN KEY)
- `body` (TEXT)
- `created_at` (TIMESTAMP)

## Security Features
- Parameterized queries prevent SQL injection
- Async/await patterns for database operations
- Error handling with proper logging
- Cascade delete ensures data integrity

## Usage

1. **Setup Database:**
   ```sql
   -- Run the SQL script
   source database_query/community_threads.sql
   ```

2. **Access Admin Panel:**
   - Navigate to `admin-CommunityManagement.html`
   - View all community threads in the table

3. **Delete Thread:**
   - Click "Delete" button on any thread
   - Confirm deletion in the modal
   - Thread and all replies are removed

## Next Steps (Optional Enhancements)
- Add search/filter functionality
- Add pagination for large thread lists
- Add ability to view thread details before deletion
- Add thread moderation (hide/unhide instead of delete)
- Add bulk delete functionality
- Add export threads to CSV
