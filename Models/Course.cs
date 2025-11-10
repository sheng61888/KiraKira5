namespace KiraKira5.Models
{
    /// <summary>
    /// Represents a course with enrollment code and chapters
    /// </summary>
    public class Course
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string EnrollmentCode { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public ICollection<Chapter> Chapters { get; set; }
        public ICollection<Enrollment> Enrollments { get; set; }
    }

    /// <summary>
    /// Represents a chapter within a course
    /// </summary>
    public class Chapter
    {
        public int ChapterId { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int OrderIndex { get; set; }
        public Course Course { get; set; }
        public ICollection<SubChapter> SubChapters { get; set; }
        public ICollection<ChapterProgress> ChapterProgress { get; set; }
    }

    /// <summary>
    /// Represents a sub-chapter within a chapter
    /// </summary>
    public class SubChapter
    {
        public int SubChapterId { get; set; }
        public int ChapterId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int OrderIndex { get; set; }
        public Chapter Chapter { get; set; }
        public ICollection<SubChapterProgress> SubChapterProgress { get; set; }
    }

    /// <summary>
    /// Tracks learner enrollment in courses
    /// </summary>
    public class Enrollment
    {
        public int EnrollmentId { get; set; }
        public int LearnerId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrolledDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public bool IsCompleted { get; set; }
        public int XpEarned { get; set; }
        public Course Course { get; set; }
    }

    /// <summary>
    /// Tracks chapter completion progress
    /// </summary>
    public class ChapterProgress
    {
        public int ChapterProgressId { get; set; }
        public int EnrollmentId { get; set; }
        public int ChapterId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedDate { get; set; }
        public Enrollment Enrollment { get; set; }
        public Chapter Chapter { get; set; }
    }

    /// <summary>
    /// Tracks sub-chapter completion progress
    /// </summary>
    public class SubChapterProgress
    {
        public int SubChapterProgressId { get; set; }
        public int EnrollmentId { get; set; }
        public int SubChapterId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedDate { get; set; }
        public Enrollment Enrollment { get; set; }
        public SubChapter SubChapter { get; set; }
    }
}
