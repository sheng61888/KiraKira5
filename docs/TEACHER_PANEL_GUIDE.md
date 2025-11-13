# Teacher Panel System Guide

## Overview
The reworked teacher panel allows teachers to:
1. Create classes with unique join codes
2. Assign modules to classes with due dates
3. Track student progress on assigned modules

## Database Setup

Run the SQL script to create required tables:
```sql
-- Located at: database_query/teacher_panel_tables.sql
```

This creates:
- `teacher_classes` - Classes created by teachers
- `class_enrollments` - Student enrollments
- `class_module_assignments` - Module assignments
- `student_module_progress` - Progress tracking

## API Endpoints

### Teacher Endpoints

**Create Class**
```
POST /api/TeacherPanel/classes
Body: { "teacherId": "T001", "className": "Form 4 Math" }
Response: { "classId": 1, "joinCode": "ABC123", ... }
```

**Get Teacher Classes**
```
GET /api/TeacherPanel/classes?teacherId=T001
Response: [{ "classId": 1, "className": "...", "studentCount": 5, ... }]
```

**Assign Module**
```
POST /api/TeacherPanel/assignments
Body: { "classId": 1, "moduleId": "quadratic-intro", "dueDate": "2024-12-31T23:59:59Z" }
```

**Get Class Assignments**
```
GET /api/TeacherPanel/classes/1/assignments
Response: [{ "assignmentId": 1, "moduleName": "...", "completedCount": 3, "totalStudents": 5 }]
```

**Get Student Progress**
```
GET /api/TeacherPanel/progress?teacherId=T001
Response: [{ "studentName": "...", "className": "...", "moduleName": "...", "isCompleted": true }]
```

### Student Endpoints

**Join Class**
```
POST /api/TeacherPanel/join
Body: { "studentId": "S001", "joinCode": "ABC123" }
Response: { "message": "Successfully joined class" }
```

## Frontend Pages

### Teacher Pages
- `/html/teacher-dashboard-new.html` - Main dashboard with class management
- `/html/teacher-student-progress-new.html` - Student progress tracking

### Student Pages
- `/html/learner-join-class.html` - Join class using code

## Usage Flow

### For Teachers:
1. Log in as teacher
2. Navigate to "My Classes"
3. Click "Create Class" and enter class name
4. Share the generated join code with students
5. Click "Assign Module" to assign modules with due dates
6. View student progress in "Student Progress" page

### For Students:
1. Log in as student
2. Navigate to join class page
3. Enter join code provided by teacher
4. Complete assigned modules before due date

## Module IDs
Available modules for assignment:
- `quadratic-intro` - Quadratic Functions - Introduction
- `quadratic-equations` - Quadratic Equations
- `quadratic-functions` - Quadratic Functions - Advanced
- `numberbases-intro` - Number Bases - Introduction

## Notes
- Join codes are 6 characters (letters and numbers)
- Each class has a unique join code
- Students can join multiple classes
- Progress is automatically tracked when students complete modules
- Teachers can view real-time progress of all students
