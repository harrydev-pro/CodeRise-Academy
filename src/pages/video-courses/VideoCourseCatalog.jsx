import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  GraduationCap,
  Search,
  Video,
} from "lucide-react";

import {
  getVideoCourses,
} from "../../features/video-courses/videoCourseService";

import { formatCurrency } from "../../utils/formatCurrency";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

export default function VideoCourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    try {
      setCourses(
        getVideoCourses().filter((course) => course.published !== false)
      );
    } catch (error) {
      console.error("Unable to load video courses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const categories = [
    "All",
    ...new Set(
      courses
        .map((course) => course.category || course.track || "General")
        .filter(Boolean)
    ),
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = [
      course.title,
      course.description,
      course.instructor,
      course.category,
      course.track,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const courseCategory = course.category || course.track || "General";

    return (
      matchesSearch &&
      (category === "All" || courseCategory === category)
    );
  });

  if (loading) {
    return <Loader message="Loading video courses..." />;
  }

  return (
    <main className="page-container">
      <section className="video-catalog-hero">
        <div className="video-catalog-hero-content">
          <span className="eyebrow">CODERISE VIDEO ACADEMY</span>

          <h1>Learn practical skills at your own pace.</h1>

          <p>
            Explore structured video courses, learn from guided lessons,
            and build your skills with CodeRise Academy.
          </p>

          <a href="#video-course-list" className="btn btn-primary">
            Explore courses <ArrowRight size={17} />
          </a>
        </div>

        <div className="video-hero-illustration" aria-hidden="true">
          <div className="video-illustration-card">
            <Video size={42} />
            <span>Learn</span>
          </div>

          <div className="video-illustration-small">
            <BookOpen size={24} />
          </div>
        </div>
      </section>

      <section className="section-block" id="video-course-list">
        <div className="section-heading">
          <div>
            <span className="eyebrow">COURSE LIBRARY</span>
            <h2>Explore video courses</h2>
            <p>
              These are separate from the full academy training programs.
            </p>
          </div>

          <span className="count-badge">
            {filteredCourses.length} courses
          </span>
        </div>

        <div className="course-filter-bar">
          <div className="course-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search courses..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search video courses"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter courses by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {filteredCourses.length === 0 ? (
          <EmptyState
            title="No courses found"
            description="Try another search term or choose a different category."
          />
        ) : (
          <div className="video-course-grid">
            {filteredCourses.map((course) => (
              <article className="video-course-card" key={course.id}>
                <div className="video-course-cover">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="video-course-cover-placeholder">
                      <Video size={38} />
                      <span>CodeRise Academy</span>
                    </div>
                  )}

                  <span className="video-course-badge">
                    {course.level || "All levels"}
                  </span>
                </div>

                <div className="video-course-body">
                  <span className="course-category">
                    {course.category || course.track || "Technology"}
                  </span>

                  <h3>{course.title}</h3>

                  <p>
                    {course.description ||
                      "Learn essential concepts through guided video lessons."}
                  </p>

                  <div className="video-course-meta">
                    <span>
                      <GraduationCap size={16} />
                      {course.instructor || "CodeRise Academy"}
                    </span>

                    {course.duration && (
                      <span>
                        <Clock3 size={16} />
                        {course.duration}
                      </span>
                    )}
                  </div>

                  <div className="video-course-footer">
                    <div className="course-price">
                      {Number(course.price) === 0
                        ? "Free"
                        : formatCurrency(course.price)}
                    </div>

                    <Link
                      to={`/video-courses/${course.id}`}
                      className="text-link"
                    >
                      View course <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="learning-callout">
        <div>
          <h2>Ready for structured learning?</h2>
          <p>
            Explore the full academy programs if you want a longer,
            structured learning experience.
          </p>
        </div>

        <Link to="/programs" className="btn btn-outline">
          View academy programs
        </Link>
      </section>
    </main>
  );
}