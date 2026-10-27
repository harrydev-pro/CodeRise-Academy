import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

import Button from "../../components/common/Button";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">
          <Compass size={42} />
        </div>

        <p className="eyebrow">ERROR 404</p>

        <h1>Looks like you've taken a wrong turn.</h1>

        <p className="not-found-description">
          The page you're looking for doesn't exist, may have moved, or
          isn't available right now.
        </p>

        <div className="not-found-actions">
          <Button as={Link} to="/">
            Return home
          </Button>

          <Button
            as={Link}
            to="/programs"
            variant="outline"
          >
            Explore programs
          </Button>
        </div>

        <Link to="/" className="back-home-link">
          <ArrowLeft size={16} />
          Back to CodeRise Academy
        </Link>
      </div>
    </main>
  );
}