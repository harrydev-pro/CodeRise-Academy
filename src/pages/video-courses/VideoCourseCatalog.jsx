import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  GraduationCap,
  Search,
  Video,
} from "lucide-react";

import { getVideoCourses } from "../../features/video-courses/videoCourseService";

import { formatCurrency } from "../../utils/formatCurrency";
import EmptyState from "../../components/common/EmptyState";

export default function VideoCourseCatalog() {
  const courses = getVideoCourses().filter(
    (course) => course.published !== false,
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(
      courses
        .map((course) => course.category || course.track || "General")
        .filter(Boolean),
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

    return matchesSearch && (category === "All" || courseCategory === category);
  });

  return (
    <main className="video-catalog-page">
      <section className="page-hero video-catalog-hero">
        <div className="container page-hero-content ">
          <span className="eyebrow">CODERISE VIDEO ACADEMY</span>

          <h1 className="text-xl font-medium">
            Learn practical skills at your own pace.
          </h1>

          <p className="max-w-2xl text-[16px] flex text-muted-foreground leading-8">
            Explore structured video courses, learn from guided lessons, and
            build your skills with CodeRise Academy.
          </p>

          <a href="#video-course-list" className="btn btn-primary w-[16rem] mt-4">
            Explore courses <ArrowRight size={17} />
          </a>
        </div>

        <div
          className="container video-hero-illustration flex gap-4 mt-4 items-center"
          aria-hidden="true"
        >
          <div className="video-illustration-card ">
            <Video size={32} />
            <span>Learn</span>
          </div>

          <div className="video-illustration-small">
            <BookOpen size={32} />
            <span>Lessons</span>
          </div>
        </div>
      </section>

      <section className="section-block video-catalog-list" id="video-course-list">
        <div className="container section-heading">
          <div>
            <span className="eyebrow">COURSE LIBRARY</span>
            <h2>Explore video courses</h2>
            <p>These are separate from the full academy training programs.</p>
          </div>

          <span className="count-badge">{filteredCourses.length} courses</span>
        </div>

        <div className="container course-filter-bar video-course-filters">
          <div className=" course-search relative items-center">
            <Search
              size={19}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="search"
              placeholder="Search courses..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search video courses"
              className="course-search-input "
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter courses by category"
            className="course-category-select "
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
          <div className="container video-course-grid  ">
            {filteredCourses.map((course) => (
              <article
                className="video-course-card "
                key={course.id}
              >
                <div className="video-course-cover ">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt="video course cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="video-course-cover-placeholder">
                      <Video size={38} />
                      <span>CodeRise Academy</span>
                    </div>
                  )}

                  <span className="video-course-badge ">
                    {course.level || "All levels"}
                  </span>
                </div>

                <div className="video-course-body">
                  <span className="course-category ">
                    {course.category || course.track || "Technology"}
                  </span>

                  <h3 className="text-2xl font-bold">{course.title}</h3>

                  <p className="">
                    {course.description ||
                      "Learn essential concepts through guided video lessons."}
                  </p>

                  <div className="video-course-meta ">
                    <span className="flex items-center gap-1 text-[16px] text-muted-foreground">
                      <GraduationCap size={20} />
                      {course.instructor || "CodeRise Academy"}
                    </span>

                    <div className="video-course-facts">
                      <div className="course-price">
                        {Number(course.price) === 0 ? "Free" : formatCurrency(course.price)}
                      </div>
                      {course.duration && <span className="video-course-duration">
                        <Clock3 size={20} aria-hidden="true" />
                        {course.duration}
                      </span>}
                    </div>
                  </div>

                  <div className="video-course-footer">
                    <Link
                      to={`/video-courses/${course.id}`}
                      className="text-link  flex text-center items-center "
                    >
                     <span>Explore course</span> <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="learning-callout flex flex-col gap-2 justify-center items-center mt-4">
        <div className="flex flex-col leading-6 gap-4 p-2 items-center">
          <h2 className=" p-2  px-4 font-medium">Ready for structured learning?</h2>
          <p className="text-center">
            Explore the full academy programs if you want a longer, structured
            learning experience.
          </p>
        </div>

        <Link to="/programs" className="btn btn-outline">
          View academy programs
        </Link>
      </section>
    </main>
  );
}
