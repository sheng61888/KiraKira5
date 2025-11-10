using System.Data;
using MySql.Data.MySqlClient;
using KiraKira5.Models;

namespace KiraKira5.Services
{
    /// <summary>
    /// Service for managing courses, enrollment, and progress tracking
    /// </summary>
    public class CourseService
    {
        private readonly string _connectionString;
        private const int CourseCompletionXp = 1000;

        public CourseService(string connectionString)
        {
            _connectionString = connectionString;
        }

        /// <summary>
        /// Enrolls a learner in a course using enrollment code
        /// </summary>
        public async Task<bool> EnrollLearnerAsync(int learnerId, string enrollmentCode)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var courseId = await GetCourseIdByCodeAsync(connection, enrollmentCode);
            if (courseId == null) return false;

            var query = @"INSERT INTO enrollments (learner_id, course_id, enrolled_date, is_completed, xp_earned) 
                         VALUES (@learnerId, @courseId, @enrolledDate, 0, 0)";

            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@learnerId", learnerId);
            command.Parameters.AddWithValue("@courseId", courseId);
            command.Parameters.AddWithValue("@enrolledDate", DateTime.Now);

            try
            {
                return await command.ExecuteNonQueryAsync() > 0;
            }
            catch (MySqlException)
            {
                return false;
            }
        }

        /// <summary>
        /// Marks a course as completed and awards XP
        /// </summary>
        public async Task<bool> CompleteCourseAsync(int enrollmentId)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var getLearnerQuery = "SELECT learner_id FROM enrollments WHERE enrollment_id = @enrollmentId";
                using var getLearnerCmd = new MySqlCommand(getLearnerQuery, connection, transaction);
                getLearnerCmd.Parameters.AddWithValue("@enrollmentId", enrollmentId);
                var learnerIdObj = await getLearnerCmd.ExecuteScalarAsync();

                if (learnerIdObj == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                var updateEnrollmentQuery = @"UPDATE enrollments 
                             SET is_completed = 1, completed_date = @completedDate, xp_earned = @xp 
                             WHERE enrollment_id = @enrollmentId";
                using var updateEnrollmentCmd = new MySqlCommand(updateEnrollmentQuery, connection, transaction);
                updateEnrollmentCmd.Parameters.AddWithValue("@enrollmentId", enrollmentId);
                updateEnrollmentCmd.Parameters.AddWithValue("@completedDate", DateTime.Now);
                updateEnrollmentCmd.Parameters.AddWithValue("@xp", CourseCompletionXp);
                await updateEnrollmentCmd.ExecuteNonQueryAsync();

                var learnerIdInt = Convert.ToInt32(learnerIdObj);
                var learnerIdStr = $"L{learnerIdInt:D6}";
                
                var updateProfileQuery = @"UPDATE learner_profile 
                             SET xp = xp + @xp 
                             WHERE uid = @learnerId";
                using var updateProfileCmd = new MySqlCommand(updateProfileQuery, connection, transaction);
                updateProfileCmd.Parameters.AddWithValue("@xp", CourseCompletionXp);
                updateProfileCmd.Parameters.AddWithValue("@learnerId", learnerIdStr);
                await updateProfileCmd.ExecuteNonQueryAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        /// <summary>
        /// Updates sub-chapter progress
        /// </summary>
        public async Task<bool> UpdateSubChapterProgressAsync(int enrollmentId, int subChapterId, bool isCompleted)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"INSERT INTO subchapter_progress (enrollment_id, subchapter_id, is_completed, completed_date)
                         VALUES (@enrollmentId, @subChapterId, @isCompleted, @completedDate)
                         ON DUPLICATE KEY UPDATE is_completed = @isCompleted, completed_date = @completedDate";

            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@enrollmentId", enrollmentId);
            command.Parameters.AddWithValue("@subChapterId", subChapterId);
            command.Parameters.AddWithValue("@isCompleted", isCompleted);
            command.Parameters.AddWithValue("@completedDate", isCompleted ? DateTime.Now : (object)DBNull.Value);

            return await command.ExecuteNonQueryAsync() > 0;
        }

        /// <summary>
        /// Creates a new course (Admin)
        /// </summary>
        public async Task<int> CreateCourseAsync(string title, string description, string enrollmentCode)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"INSERT INTO courses (title, description, enrollment_code, is_active, created_date) 
                         VALUES (@title, @description, @enrollmentCode, 1, @createdDate);
                         SELECT LAST_INSERT_ID();";

            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@title", title);
            command.Parameters.AddWithValue("@description", description);
            command.Parameters.AddWithValue("@enrollmentCode", enrollmentCode);
            command.Parameters.AddWithValue("@createdDate", DateTime.Now);

            return Convert.ToInt32(await command.ExecuteScalarAsync());
        }

        /// <summary>
        /// Creates a chapter (Admin)
        /// </summary>
        public async Task<int> CreateChapterAsync(int courseId, string title, string content, int orderIndex)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"INSERT INTO chapters (course_id, title, content, order_index) 
                         VALUES (@courseId, @title, @content, @orderIndex);
                         SELECT LAST_INSERT_ID();";

            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@courseId", courseId);
            command.Parameters.AddWithValue("@title", title);
            command.Parameters.AddWithValue("@content", content);
            command.Parameters.AddWithValue("@orderIndex", orderIndex);

            return Convert.ToInt32(await command.ExecuteScalarAsync());
        }

        /// <summary>
        /// Creates a sub-chapter (Admin)
        /// </summary>
        public async Task<int> CreateSubChapterAsync(int chapterId, string title, string content, int orderIndex)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"INSERT INTO subchapters (chapter_id, title, content, order_index) 
                         VALUES (@chapterId, @title, @content, @orderIndex);
                         SELECT LAST_INSERT_ID();";

            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@chapterId", chapterId);
            command.Parameters.AddWithValue("@title", title);
            command.Parameters.AddWithValue("@content", content);
            command.Parameters.AddWithValue("@orderIndex", orderIndex);

            return Convert.ToInt32(await command.ExecuteScalarAsync());
        }

        /// <summary>
        /// Gets learner's enrolled courses with progress
        /// </summary>
        public async Task<List<Enrollment>> GetLearnerEnrollmentsAsync(int learnerId)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"SELECT e.*, c.title, c.description, c.enrollment_code 
                         FROM enrollments e
                         JOIN courses c ON e.course_id = c.course_id
                         WHERE e.learner_id = @learnerId";

            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@learnerId", learnerId);

            var enrollments = new List<Enrollment>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                enrollments.Add(new Enrollment
                {
                    EnrollmentId = reader.GetInt32("enrollment_id"),
                    LearnerId = reader.GetInt32("learner_id"),
                    CourseId = reader.GetInt32("course_id"),
                    EnrolledDate = reader.GetDateTime("enrolled_date"),
                    CompletedDate = reader.IsDBNull("completed_date") ? null : reader.GetDateTime("completed_date"),
                    IsCompleted = reader.GetBoolean("is_completed"),
                    XpEarned = reader.GetInt32("xp_earned"),
                    Course = new Course
                    {
                        CourseId = reader.GetInt32("course_id"),
                        Title = reader.GetString("title"),
                        Description = reader.GetString("description"),
                        EnrollmentCode = reader.GetString("enrollment_code")
                    }
                });
            }
            return enrollments;
        }

        /// <summary>
        /// Gets all courses
        /// </summary>
        public async Task<List<Course>> GetAllCoursesAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT * FROM courses ORDER BY created_date DESC";
            using var command = new MySqlCommand(query, connection);

            var courses = new List<Course>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                courses.Add(new Course
                {
                    CourseId = reader.GetInt32("course_id"),
                    Title = reader.GetString("title"),
                    Description = reader.GetString("description"),
                    EnrollmentCode = reader.GetString("enrollment_code"),
                    IsActive = reader.GetBoolean("is_active"),
                    CreatedDate = reader.GetDateTime("created_date")
                });
            }
            return courses;
        }

        /// <summary>
        /// Gets chapters by course ID
        /// </summary>
        public async Task<List<Chapter>> GetChaptersByCourseAsync(int courseId)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT * FROM chapters WHERE course_id = @courseId ORDER BY order_index";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@courseId", courseId);

            var chapters = new List<Chapter>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                chapters.Add(new Chapter
                {
                    ChapterId = reader.GetInt32("chapter_id"),
                    CourseId = reader.GetInt32("course_id"),
                    Title = reader.GetString("title"),
                    Content = reader.IsDBNull("content") ? null : reader.GetString("content"),
                    OrderIndex = reader.GetInt32("order_index")
                });
            }
            return chapters;
        }

        /// <summary>
        /// Gets sub-chapters by chapter ID
        /// </summary>
        public async Task<List<SubChapter>> GetSubChaptersByChapterAsync(int chapterId)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT * FROM subchapters WHERE chapter_id = @chapterId ORDER BY order_index";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@chapterId", chapterId);

            var subChapters = new List<SubChapter>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                subChapters.Add(new SubChapter
                {
                    SubChapterId = reader.GetInt32("subchapter_id"),
                    ChapterId = reader.GetInt32("chapter_id"),
                    Title = reader.GetString("title"),
                    Content = reader.IsDBNull("content") ? null : reader.GetString("content"),
                    OrderIndex = reader.GetInt32("order_index")
                });
            }
            return subChapters;
        }

        /// <summary>
        /// Gets complete course structure with chapters and sub-chapters
        /// </summary>
        public async Task<List<dynamic>> GetCourseStructureAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"SELECT c.course_id, c.title as course_title, c.enrollment_code,
                         ch.chapter_id, ch.title as chapter_title, ch.order_index as chapter_order,
                         sc.subchapter_id, sc.title as subchapter_title, sc.order_index as subchapter_order
                         FROM courses c
                         LEFT JOIN chapters ch ON c.course_id = ch.course_id
                         LEFT JOIN subchapters sc ON ch.chapter_id = sc.chapter_id
                         ORDER BY c.course_id, ch.order_index, sc.order_index";

            using var command = new MySqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();

            var structure = new List<dynamic>();
            var courseDict = new Dictionary<int, dynamic>();

            while (await reader.ReadAsync())
            {
                var courseId = reader.GetInt32("course_id");
                if (!courseDict.ContainsKey(courseId))
                {
                    courseDict[courseId] = new
                    {
                        courseId,
                        title = reader.GetString("course_title"),
                        enrollmentCode = reader.GetString("enrollment_code"),
                        chapters = new List<dynamic>()
                    };
                    structure.Add(courseDict[courseId]);
                }

                if (!reader.IsDBNull("chapter_id"))
                {
                    var chapterId = reader.GetInt32("chapter_id");
                    var chapters = (List<dynamic>)courseDict[courseId].chapters;
                    var chapter = chapters.FirstOrDefault(ch => ((dynamic)ch).chapterId == chapterId);

                    if (chapter == null)
                    {
                        chapter = new
                        {
                            chapterId,
                            title = reader.GetString("chapter_title"),
                            orderIndex = reader.GetInt32("chapter_order"),
                            subChapters = new List<dynamic>()
                        };
                        chapters.Add(chapter);
                    }

                    if (!reader.IsDBNull("subchapter_id"))
                    {
                        var subChapters = (List<dynamic>)((dynamic)chapter).subChapters;
                        subChapters.Add(new
                        {
                            subChapterId = reader.GetInt32("subchapter_id"),
                            title = reader.GetString("subchapter_title"),
                            orderIndex = reader.GetInt32("subchapter_order")
                        });
                    }
                }
            }
            return structure;
        }

        private async Task<int?> GetCourseIdByCodeAsync(MySqlConnection connection, string enrollmentCode)
        {
            var query = "SELECT course_id FROM courses WHERE enrollment_code = @code AND is_active = 1";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@code", enrollmentCode);

            var result = await command.ExecuteScalarAsync();
            return result != null ? Convert.ToInt32(result) : null;
        }
    }
}
