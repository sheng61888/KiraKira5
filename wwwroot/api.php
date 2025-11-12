<?php
// api.php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'db.php'; // Your database connection

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {

    // --- ASSIGNMENT FUNCTIONS ---

    case 'get_courses_and_subchapters':
        $courses = [];
        $course_result = $conn->query("SELECT course_id, title FROM courses ORDER BY course_id");
        while ($course = $course_result->fetch_assoc()) {
            $chapters = [];
            $chap_stmt = $conn->prepare("SELECT chapter_id, title FROM chapters WHERE course_id = ? ORDER BY order_index");
            $chap_stmt->bind_param("i", $course['course_id']);
            $chap_stmt->execute();
            $chap_result = $chap_stmt->get_result();
            
            while ($chapter = $chap_result->fetch_assoc()) {
                $subchapters = [];
                $sub_stmt = $conn->prepare("SELECT subchapter_id, title FROM subchapters WHERE chapter_id = ? ORDER BY order_index");
                $sub_stmt->bind_param("i", $chapter['chapter_id']);
                $sub_stmt->execute();
                $sub_result = $sub_stmt->get_result();
                while ($sub = $sub_result->fetch_assoc()) {
                    $subchapters[] = $sub;
                }
                $chapter['subchapters'] = $subchapters;
                $chapters[] = $chapter;
            }
            $course['chapters'] = $chapters;
            $courses[] = $course;
        }
        echo json_encode($courses);
        break;

    case 'get_classes':
        $result = $conn->query("SELECT class_id, title FROM classes");
        $classes = [];
        while ($row = $result->fetch_assoc()) {
            $classes[] = $row;
        }
        echo json_encode($classes);
        break;

    case 'get_assignments':
        $sql = "
            SELECT 
                ca.assignment_id, ca.title, ca.deadline,
                c.title AS class_title,
                co.title AS course_title,
                ch.title AS chapter_title,
                s.title AS subchapter_title
            FROM class_assignments ca
            JOIN classes c ON ca.class_id = c.class_id
            LEFT JOIN courses co ON ca.course_id = co.course_id
            LEFT JOIN chapters ch ON ca.chapter_id = ch.chapter_id
            LEFT JOIN subchapters s ON ca.subchapter_id = s.subchapter_id
            ORDER BY ca.deadline DESC
        ";
        $result = $conn->query($sql);
        $assignments = [];
        while ($row = $result->fetch_assoc()) {
            $row['content_title'] = $row['subchapter_title'] ?? $row['chapter_title'] ?? $row['course_title'];
            $assignments[] = $row;
        }
        echo json_encode($assignments);
        break;

    case 'create_assignment':
        $stmt = $conn->prepare("INSERT INTO class_assignments (title, class_id, course_id, chapter_id, subchapter_id, deadline) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "siiiss",
            $input['title'],
            $input['class_id'],
            $input['course_id'],
            $input['chapter_id'],
            $input['subchapter_id'],
            $input['deadline']
        );
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Assignment created!']);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
        break;
        
    case 'delete_assignment':
        $stmt = $conn->prepare("DELETE FROM class_assignments WHERE assignment_id = ?");
        $stmt->bind_param("i", $input['assignment_id']);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Assignment deleted!']);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
        break;

    // --- USER MANAGEMENT FUNCTIONS (For Admins) ---

    case 'get_users':
        $sql = "SELECT user_id, username, name, email, role FROM users";
        $result = $conn->query($sql);
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode($users);
        break;
        
    // ... (You can add the other user functions like add_user, delete_user here if admins also use this file) ...

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

$conn->close();
?>