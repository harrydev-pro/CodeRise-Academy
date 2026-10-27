import { Link } from "react-router-dom";
import { ShoppingBag, PlayCircle } from "lucide-react";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { readStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getVideoCourses } from "../../features/video-courses/videoCourseService";

export default function MyPurchases() {
  const { user } = useAuth();

  const purchases = readStore(
    STORAGE_KEYS.PURCHASES,
    []
  ).filter(
    (purchase) =>
      purchase.userId === user?.id &&
      purchase.status === "completed"
  );

  const courses = getVideoCourses();

  if (purchases.length === 0) {
    return (
      <div className="student-page">
        <div className="student-page-heading">
          <h1>My Purchases</h1>
          <p>Access video courses you have purchased.</p>
        </div>

        <EmptyState
          icon={ShoppingBag}
          title="No completed purchases"
          description="Your completed video-course purchases will appear here."
          actionLabel="Browse Video Courses"
          actionHref="/video-courses"
        />
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <span className="eyebrow">YOUR PURCHASES</span>
        <h1>My Purchases</h1>
        <p>View your completed video-course purchases.</p>
      </div>

      <div className="student-track-grid">
        {purchases.map((purchase) => {
          const course = courses.find(
            (item) => item.id === purchase.courseId
          );

          return (
            <article className="student-track-card" key={purchase.id}>
              <span className="student-track-icon">
                <PlayCircle size={25} />
              </span>

              <h2>{course?.title || purchase.courseTitle || "Video course"}</h2>

              <p>
                Purchased on {formatDate(purchase.createdAt)}
              </p>

              <p>
                Amount: {formatCurrency(Number(purchase.amount) || 0)}
              </p>

              <Button
                as={Link}
                to={`/video-courses/${purchase.courseId}`}
                fullWidth
              >
                Open Course
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}