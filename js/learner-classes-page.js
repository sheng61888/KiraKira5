(() => {
  const selectors = {
    joinSection: "#joinClassSection",
    dashboard: "#classDashboard",
    enrolledCoursesList: "#enrolledCoursesList",
    courseDetailSection: "#courseDetailSection",
    classTitle: "#classTitle",
    classCode: "#classCodeDisplay",
    classGrade: "#classGrade",
    classDescription: "#classDescription",
    courseChapters: "#courseChapters",
    joinForm: "#joinClassForm",
    classCodeInput: "#classCode"
  };

  const copy = {
    defaultClassDescription: "Your teacher can drop announcements, assignments, and focus topics here once you join."
  };

  const getElement = selector => document.querySelector(selector);

  const setText = (selector, text) => {
    const el = getElement(selector);
    if (el) {
      el.textContent = text;
    }
  };

  const setVisibility = hasEnrollment => {
    const dashboard = getElement(selectors.dashboard);
    if (dashboard) {
      dashboard.style.display = hasEnrollment ? "block" : "none";
    }
  };

  const renderClassInfo = (info, hasEnrollment) => {
    if (!hasEnrollment) {
      setVisibility(false);
      return;
    }
    setVisibility(true);
    if (info) {
      setText(selectors.classTitle, info.title || "Your enrolled course");
      setText(selectors.classCode, `Code: ${info.code || "-"}`);
      const gradeLabel = info.gradeLevel || "Enrolled Course";
      setText(selectors.classGrade, gradeLabel);
      const description = info.description || "Course description";
      setText(selectors.classDescription, description);
    }
  };

  const renderCourseChapters = async (courseId) => {
    const container = getElement(selectors.courseChapters);
    if (!container) return;

    try {
      console.log('Fetching chapters for course:', courseId);
      const response = await fetch(`http://localhost:5000/api/course/chapters/${courseId}`);
      console.log('Chapters response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.status}`);
      }
      
      const chapters = await response.json();
      console.log('Chapters:', chapters);

      if (!chapters || chapters.length === 0) {
        container.innerHTML = "<p class='muted'>No chapters available yet.</p>";
        return;
      }

      let html = '';
      for (const chapter of chapters) {
        html += `<div style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
          <h4>${chapter.orderIndex}. ${chapter.title}</h4>`;
        
        const subResponse = await fetch(`http://localhost:5000/api/course/subchapters/${chapter.chapterId}`);
        if (subResponse.ok) {
          const subChapters = await subResponse.json();
          
          if (subChapters && subChapters.length > 0) {
            subChapters.forEach(sub => {
              html += `<div style="margin-left: 1.5rem; margin-top: 0.5rem; color: #666;">
                ${chapter.orderIndex}.${sub.orderIndex} ${sub.title}
              </div>`;
            });
          }
        }
        html += `</div>`;
      }
      container.innerHTML = html;
    } catch (error) {
      console.error("Error loading chapters:", error);
      container.innerHTML = `<p class='muted'>Unable to load course content. ${error.message}</p>`;
    }
  };

  const renderEnrolledClasses = async (classes, learnerId) => {
    const container = getElement(selectors.enrolledCoursesList);
    if (!container) return;

    if (!classes || classes.length === 0) {
      container.innerHTML = "<p class='muted'>No classes yet. Use the form above to join a class.</p>";
      return;
    }

    let assignments = [];
    try {
      const response = await fetch(`/api/learner/${learnerId}/assignments`);
      if (response.ok) {
        assignments = await response.json();
      }
    } catch (error) {
      console.error("Unable to load assignments", error);
    }

    let html = '<div style="display: grid; gap: 1rem;">';
    classes.forEach(cls => {
      const classAssignments = assignments.filter(a => a.className === cls.className);
      html += `<div style="padding: 1.5rem; background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); border-left: 4px solid var(--accent);">
        <h3 style="color: var(--text); margin: 0 0 0.5rem 0;">${cls.className}</h3>
        <p style="color: var(--muted); margin: 0.25rem 0;">Teacher: ${cls.teacherId}</p>
        <p style="color: var(--muted); margin: 0.25rem 0;"><strong>Join Code:</strong> ${cls.joinCode}</p>`;
      
      if (classAssignments.length > 0) {
        html += '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">';
        html += '<h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">Assigned Modules</h4>';
        classAssignments.forEach(a => {
          const d = new Date(a.dueDate);
          const dueDate = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
          const status = a.isCompleted ? '✓ Completed' : '○ Pending';
          const moduleLink = `course-map.html?module=${a.moduleId}`;
          html += `<a href="${moduleLink}" style="display: block; margin: 0.5rem 0; padding: 0.5rem; background: var(--surface); border-radius: 4px; text-decoration: none; color: inherit; border: 1px solid transparent; transition: border-color 0.2s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='transparent'">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 500;">${a.moduleName}</span>
              <span style="color: var(--muted); font-size: 0.85rem;">${status}</span>
            </div>
            <div style="color: var(--muted); font-size: 0.85rem; margin-top: 0.25rem;">Due: ${dueDate}</div>
          </a>`;
        });
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  };

  window.viewCourse = async (courseId) => {
    const detailSection = getElement(selectors.courseDetailSection);
    if (!detailSection) return;

    try {
      const response = await fetch(`http://localhost:5000/api/course/admin/courses`);
      const courses = await response.json();
      const course = courses.find(c => c.courseId === courseId);

      if (course) {
        setText(selectors.classTitle, course.title);
        setText(selectors.classCode, `Code: ${course.enrollmentCode}`);
        setText(selectors.classDescription, course.description);
        
        const session = window.kiraLearnerSession;
        const learnerId = session ? session.ensureId() : null;
        if (learnerId) {
          const numericLearnerId = learnerId.replace(/\D/g, '');
          const enrollResponse = await fetch(`http://localhost:5000/api/course/enrollments/${numericLearnerId}`);
          const enrollments = await enrollResponse.json();
          const enrollment = enrollments.find(e => e.courseId === courseId);
          
          if (enrollment) {
            window.currentEnrollmentId = enrollment.enrollmentId;
            window.currentEnrollmentCompleted = enrollment.isCompleted;
            
            const btn = document.getElementById('completeCourseBtn');
            if (btn) {
              if (enrollment.isCompleted) {
                btn.textContent = 'Completed';
                btn.disabled = true;
                btn.style.opacity = '0.6';
              } else {
                btn.textContent = 'Complete Course (Earn 1000 XP)';
                btn.disabled = false;
                btn.style.opacity = '1';
              }
            }
          }
        }
        
        await renderCourseChapters(courseId);
        detailSection.style.display = 'block';
        detailSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading course details:', error);
    }
  };

  window.completeCourse = async () => {
    if (!window.currentEnrollmentId) {
      alert('Enrollment not found.');
      return;
    }
    
    if (window.currentEnrollmentCompleted) {
      alert('This course is already completed!');
      return;
    }

    if (!confirm('Mark this course as completed and earn 1000 XP?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/course/complete/${window.currentEnrollmentId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Congratulations! Course completed. You earned 1000 XP!');
        window.currentEnrollmentCompleted = true;
        
        const btn = document.getElementById('completeCourseBtn');
        if (btn) {
          btn.textContent = 'Completed';
          btn.disabled = true;
          btn.style.opacity = '0.6';
        }
        
        await fetchClasses();
      } else {
        alert('Failed to complete course.');
      }
    } catch (error) {
      console.error('Error completing course:', error);
      alert('Error completing course.');
    }
  };

  const fetchClasses = async () => {
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      setVisibility(false);
      return;
    }
    try {
      const response = await fetch(`/api/TeacherPanel/student/${learnerId}/classes`);
      if (!response.ok) {
        throw new Error(`Classes request failed with status ${response.status}`);
      }
      const classes = await response.json();
      
      if (classes && classes.length > 0) {
        setVisibility(true);
        await renderEnrolledClasses(classes, learnerId);
      } else {
        setVisibility(false);
      }
    } catch (error) {
      console.error("Unable to load classes", error);
      setVisibility(false);
    }
  };

  const joinClass = async event => {
    event.preventDefault();
    const session = window.kiraLearnerSession;
    if (!session) {
      alert("Session not found. Please log in again.");
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      alert("Learner ID not found. Please log in again.");
      return;
    }
    const input = document.querySelector(selectors.classCodeInput);
    const code = input ? input.value.trim() : "";
    if (!code) {
      alert("Please enter a class code.");
      return;
    }
    console.log("Attempting to join class with:", { learnerId, code });
    try {
      const response = await fetch('/api/TeacherPanel/join', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: learnerId, joinCode: code })
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      if (!response.ok) {
        alert(data.message || "Unable to join class. Please check the code.");
        return;
      }
      alert("Successfully joined class!");
      await fetchClasses();
      if (input) {
        input.value = "";
      }
    } catch (error) {
      console.error("Unable to join class", error);
      alert("Unable to join class. Error: " + error.message);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    fetchClasses();
    const form = document.querySelector(selectors.joinForm);
    if (form) {
      form.addEventListener("submit", joinClass);
    }
  });

  document.addEventListener("kira:learner-missing", () => {
    setVisibility(false);
  });
})();
