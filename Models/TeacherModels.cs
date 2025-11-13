namespace KiraKira5.Models
{
    /// <summary>
    /// Represents a teacher's class
    /// </summary>
    public class TeacherClass
    {
        public int ClassId { get; set; }
        public string TeacherId { get; set; }
        public string ClassName { get; set; }
        public string JoinCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int StudentCount { get; set; }
    }

    /// <summary>
    /// Represents a student enrolled in a class
    /// </summary>
    public class ClassStudent
    {
        public string StudentId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime EnrolledAt { get; set; }
    }

    /// <summary>
    /// Represents a module assignment
    /// </summary>
    public class ModuleAssignment
    {
        public int AssignmentId { get; set; }
        public int ClassId { get; set; }
        public string ModuleId { get; set; }
        public string ModuleName { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime AssignedAt { get; set; }
        public int CompletedCount { get; set; }
        public int TotalStudents { get; set; }
    }

    /// <summary>
    /// Represents student progress on a module
    /// </summary>
    public class StudentProgress
    {
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public string ClassName { get; set; }
        public string ModuleName { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime DueDate { get; set; }
    }

    /// <summary>
    /// Request to create a new class
    /// </summary>
    public class CreateClassRequest
    {
        public string TeacherId { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request to assign a module
    /// </summary>
    public class AssignModuleRequest
    {
        public int ClassId { get; set; }
        public string ModuleId { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
    }

    /// <summary>
    /// Request to join a teacher class
    /// </summary>
    public class JoinTeacherClassRequest
    {
        public string StudentId { get; set; } = string.Empty;
        public string JoinCode { get; set; } = string.Empty;
    }
}
