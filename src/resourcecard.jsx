function ResourceCard({ resource, onView }) {
  const rating = resource.rating || 0;
  const ratingCount = resource.ratingCount || 0;

  return (
    <div className="resource-card">
      <div className="resource-card-top">
        <span className="subject-badge">
          {resource.subject}
        </span>

        <span className="type-badge">
          {resource.type}
        </span>
      </div>

      <div className="resource-icon">
        {resource.type === "PYQ"
          ? "📝"
          : resource.type === "Assignment"
          ? "📋"
          : resource.type === "PPT"
          ? "📊"
          : "📚"}
      </div>

      <h3>{resource.title}</h3>

      <p className="resource-subject">
        {resource.subject}
      </p>

      <div className="resource-meta">
        <span>
          ⭐{" "}
          {rating > 0
            ? rating.toFixed(1)
            : "New"}
        </span>

        <span>
          📥 {resource.downloads || 0} downloads
        </span>
      </div>

      {ratingCount > 0 && (
        <p className="rating-count">
          {ratingCount}{" "}
          {ratingCount === 1 ? "rating" : "ratings"}
        </p>
      )}

      <button
        type="button"
        onClick={() => onView(resource)}
      >
        View Resource →
      </button>
    </div>
  );
}

export default ResourceCard;