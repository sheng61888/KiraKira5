using Dapper;
using KiraKira5.Models;
using MySql.Data.MySqlClient;

namespace KiraKira5.Services
{
    /// <summary>
    /// Service for teacher panel operations
    /// </summary>
    public class TeacherPanelService
    {
        private readonly string _connectionString;

        public TeacherPanelService(string connectionString)
        {
            _connectionString = connectionString;
        }

        /// <summary>
        /// Creates a new class with a unique join code
        /// </summary>
        public async Task<TeacherClass> CreateClassAsync(CreateClassRequest request)
        {
            using var conn = new MySqlConnection(_connectionString);
            var joinCode = GenerateJoinCode();
            
            var sql = @"INSERT INTO teacher_classes (teacher_id, class_name, join_code) 
                       VALUES (@TeacherId, @ClassName, @JoinCode);
                       SELECT LAST_INSERT_ID();";
            
            var classId = await conn.ExecuteScalarAsync<int>(sql, new { request.TeacherId, request.ClassName, joinCode });
            
            return new TeacherClass
            {
                ClassId = classId,
                TeacherId = request.TeacherId,
                ClassName = request.ClassName,
                JoinCode = joinCode,
                CreatedAt = DateTime.Now,
                IsActive = true,
                StudentCount = 0
            };
        }

        /// <summary>
        /// Gets all classes for a teacher
        /// </summary>
        public async Task<IEnumerable<TeacherClass>> GetTeacherClassesAsync(string teacherId)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"SELECT tc.class_id AS ClassId, tc.teacher_id AS TeacherId, 
                              tc.class_name AS ClassName, tc.join_code AS JoinCode,
                              tc.created_at AS CreatedAt, tc.is_active AS IsActive,
                              COUNT(ce.student_id) AS StudentCount
                       FROM teacher_classes tc
                       LEFT JOIN class_enrollments ce ON tc.class_id = ce.class_id
                       WHERE tc.teacher_id = @TeacherId AND tc.is_active = 1
                       GROUP BY tc.class_id";
            
            return await conn.QueryAsync<TeacherClass>(sql, new { TeacherId = teacherId });
        }

        /// <summary>
        /// Allows a student to join a class using a join code
        /// </summary>
        public async Task<bool> JoinClassAsync(JoinTeacherClassRequest request)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            var classId = await conn.ExecuteScalarAsync<int?>(
                "SELECT class_id FROM teacher_classes WHERE join_code = @JoinCode AND is_active = 1",
                new { request.JoinCode });
            
            if (!classId.HasValue) return false;
            
            var sql = @"INSERT IGNORE INTO class_enrollments (class_id, student_id) 
                       VALUES (@ClassId, @StudentId)";
            
            await conn.ExecuteAsync(sql, new { ClassId = classId.Value, request.StudentId });
            return true;
        }

        /// <summary>
        /// Gets students enrolled in a class
        /// </summary>
        public async Task<IEnumerable<ClassStudent>> GetClassStudentsAsync(int classId)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"SELECT u.uid AS StudentId, u.name AS Name, u.email AS Email,
                              ce.enrolled_at AS EnrolledAt
                       FROM class_enrollments ce
                       JOIN usertable u ON ce.student_id = u.uid
                       WHERE ce.class_id = @ClassId
                       ORDER BY u.name";
            
            return await conn.QueryAsync<ClassStudent>(sql, new { ClassId = classId });
        }

        /// <summary>
        /// Assigns a module to a class
        /// </summary>
        public async Task<ModuleAssignment> AssignModuleAsync(AssignModuleRequest request)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"INSERT INTO class_module_assignments (class_id, module_id, due_date)
                       VALUES (@ClassId, @ModuleId, @DueDate);
                       SELECT LAST_INSERT_ID();";
            
            var assignmentId = await conn.ExecuteScalarAsync<int>(sql, request);
            
            var studentsSql = "SELECT student_id FROM class_enrollments WHERE class_id = @ClassId";
            var students = await conn.QueryAsync<string>(studentsSql, new { request.ClassId });
            
            foreach (var studentId in students)
            {
                await conn.ExecuteAsync(
                    "INSERT INTO student_module_progress (assignment_id, student_id) VALUES (@AssignmentId, @StudentId)",
                    new { AssignmentId = assignmentId, StudentId = studentId });
            }
            
            return await GetModuleAssignmentByIdAsync(assignmentId);
        }

        /// <summary>
        /// Gets module assignments for a class
        /// </summary>
        public async Task<IEnumerable<ModuleAssignment>> GetClassAssignmentsAsync(int classId)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"SELECT cma.assignment_id AS AssignmentId, cma.class_id AS ClassId,
                              cma.module_id AS ModuleId, cma.module_id AS ModuleName,
                              cma.due_date AS DueDate, cma.assigned_at AS AssignedAt,
                              COUNT(CASE WHEN smp.is_completed = 1 THEN 1 END) AS CompletedCount,
                              COUNT(smp.student_id) AS TotalStudents
                       FROM class_module_assignments cma
                       LEFT JOIN student_module_progress smp ON cma.assignment_id = smp.assignment_id
                       WHERE cma.class_id = @ClassId
                       GROUP BY cma.assignment_id
                       ORDER BY cma.due_date";
            
            return await conn.QueryAsync<ModuleAssignment>(sql, new { ClassId = classId });
        }

        /// <summary>
        /// Gets student progress across all classes for a teacher
        /// </summary>
        public async Task<IEnumerable<StudentProgress>> GetStudentProgressAsync(string teacherId)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"SELECT u.uid AS StudentId, u.name AS StudentName, tc.class_name AS ClassName,
                              cma.module_id AS ModuleName, smp.completed_at AS CompletedAt,
                              smp.is_completed AS IsCompleted, cma.due_date AS DueDate
                       FROM teacher_classes tc
                       JOIN class_module_assignments cma ON tc.class_id = cma.class_id
                       JOIN student_module_progress smp ON cma.assignment_id = smp.assignment_id
                       JOIN usertable u ON smp.student_id = u.uid
                       WHERE tc.teacher_id = @TeacherId
                       ORDER BY tc.class_name, u.name, cma.due_date";
            
            return await conn.QueryAsync<StudentProgress>(sql, new { TeacherId = teacherId });
        }

        private async Task<ModuleAssignment> GetModuleAssignmentByIdAsync(int assignmentId)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"SELECT cma.assignment_id AS AssignmentId, cma.class_id AS ClassId,
                              cma.module_id AS ModuleId, cma.module_id AS ModuleName,
                              cma.due_date AS DueDate, cma.assigned_at AS AssignedAt,
                              COUNT(CASE WHEN smp.is_completed = 1 THEN 1 END) AS CompletedCount,
                              COUNT(smp.student_id) AS TotalStudents
                       FROM class_module_assignments cma
                       LEFT JOIN student_module_progress smp ON cma.assignment_id = smp.assignment_id
                       WHERE cma.assignment_id = @AssignmentId
                       GROUP BY cma.assignment_id";
            
            return await conn.QueryFirstAsync<ModuleAssignment>(sql, new { AssignmentId = assignmentId });
        }

        private string GenerateJoinCode()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var random = new Random();
            return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
        }
    }
}
