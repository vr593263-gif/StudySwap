import { useEffect, useState } from "react";
import Navbar from "./navbar";
import ResourceCard from "./resourcecard";
import Login from "./login";
import Signup from "./signup";
import ForgotPassword from "./forgotpassword";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] =
  useState(false);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);

  const [rating, setRating] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: "",
    subject: "",
    type: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    title: "",
    subject: "",
    type: "",
  });

  // Resources uploaded during this session
  const [myResourceIds, setMyResourceIds] = useState([]);

  // Fetch resources
  useEffect(() => {
    fetch("http://localhost:5000/api/resources")
      .then((response) => response.json())
      .then((data) => {
        setResources(data);
      })
      .catch((error) => {
        console.error("Error fetching resources:", error);
      });
  }, []);

  // Search filter
  const filteredResources = resources.filter((resource) => {
    const title = resource.title || "";
    const subject = resource.subject || "";

    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      subject.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Upload resource
  const handleUpload = async () => {
    if (
      !uploadData.title.trim() ||
      !uploadData.subject.trim() ||
      !uploadData.type
    ) {
      alert("Please fill all details");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();

    formData.append("title", uploadData.title);
    formData.append("subject", uploadData.subject);
    formData.append("type", uploadData.type);
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:5000/api/resources",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      setResources((previousResources) => [
        ...previousResources,
        data,
      ]);

      // Remember this resource as user's resource
      setMyResourceIds((previousIds) => [
        ...previousIds,
        data._id,
      ]);

      setUploadData({
        title: "",
        subject: "",
        type: "",
      });

      setSelectedFile(null);
      setShowUploadForm(false);

      alert("Resource uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Something went wrong while uploading!");
    }
  };

  // Download resource
  const handleDownload = () => {
    setDownloadCount(
      (previousCount) => previousCount + 1
    );

    window.open(
      `http://localhost:5000/api/resources/${selectedResource._id}/download`,
      "_blank"
    );
  };

  // Delete resource
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/resources/${selectedResource._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Delete failed"
        );
      }

      setResources((previousResources) =>
        previousResources.filter(
          (resource) =>
            resource._id !== selectedResource._id
        )
      );

      setMyResourceIds((previousIds) =>
        previousIds.filter(
          (id) => id !== selectedResource._id
        )
      );

      setSelectedResource(null);
      setIsEditing(false);

      alert("Resource deleted successfully!");
    } catch (error) {
      console.error("Delete Error:", error);
      alert(
        "Error deleting resource: " + error.message
      );
    }
  };

  // Open edit form
  const handleEdit = () => {
    setEditData({
      title: selectedResource.title || "",
      subject: selectedResource.subject || "",
      type: selectedResource.type || "",
    });

    setIsEditing(true);
  };

  // Save edited resource
  const handleSaveEdit = async () => {
    if (
      !editData.title.trim() ||
      !editData.subject.trim() ||
      !editData.type
    ) {
      alert("Please fill all edit fields");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/resources/${selectedResource._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editData.title.trim(),
            subject: editData.subject.trim(),
            type: editData.type,
          }),
        }
      );

      const updatedResource = await response.json();

      if (!response.ok) {
        throw new Error(
          updatedResource.message || "Edit failed"
        );
      }

      setResources((previousResources) =>
        previousResources.map((resource) =>
          resource._id === updatedResource._id
            ? updatedResource
            : resource
        )
      );

      setSelectedResource(updatedResource);
      setIsEditing(false);

      alert("Resource updated successfully!");
    } catch (error) {
      console.error("Edit Error:", error);
      alert(
        "Error updating resource: " + error.message
      );
    }
  };

  // Rating resource
  const handleRating = async (star) => {
    setRating(star);

    try {
      const response = await fetch(
        `http://localhost:5000/api/resources/${selectedResource._id}/rating`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: star,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Rating save failed"
        );
      }

      alert("Rating saved successfully!");
    } catch (error) {
      console.error("Rating Error:", error);
      alert(
        "Error saving rating: " + error.message
      );
    }
  };

  // Open selected resource
  const handleViewResource = (resource) => {
  setSelectedResource(resource);
  setRating(0);
  setDownloadCount(0);
  setIsEditing(false);

  setTimeout(() => {
    document
      .getElementById("resource-details-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, 100);
};

  // Close selected resource
  const handleBack = () => {
  setSelectedResource(null);
  setIsEditing(false);

  setTimeout(() => {
    document
      .getElementById("resources-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, 100);
};

  // Navbar - Home
    const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };
  const handleSignup = (userData) => {
  setUser(userData);
  setIsLoggedIn(true);
  setShowSignup(false);
};

  const handleHome = () => {
    setSelectedResource(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Navbar - Browse
  const handleBrowse = () => {
    setSelectedResource(null);

    setTimeout(() => {
      document
        .getElementById("resources-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // Navbar - Upload
  const handleOpenUpload = () => {
    setSelectedResource(null);
    setShowUploadForm(true);

    setTimeout(() => {
      document
        .getElementById("upload-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // Navbar - My Resources
  const handleMyResources = () => {
    setSelectedResource(null);

    setSearch("");

    setTimeout(() => {
      document
        .getElementById("my-resources-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // Resources uploaded by current user during this session
  const myResources = resources.filter((resource) =>
    myResourceIds.includes(resource._id)
  );

  return (
    <>
      {!isLoggedIn ? (
  showForgotPassword ? (
    <ForgotPassword
      onBackToLogin={() => {
        setShowForgotPassword(false);
      }}
    />
  ) : showSignup ? (
    <Signup
      onSignup={handleSignup}
      onShowLogin={() => {
        setShowSignup(false);
      }}
    />
  ) : (
    <Login
      onLogin={handleLogin}
      onShowSignup={() => {
        setShowSignup(true);
      }}
      onForgotPassword={() => {
        setShowForgotPassword(true);
      }}
    />
  )
) : (
  <div className="app">

      {/* NAVBAR */}
      <Navbar
        onHome={handleHome}
        onBrowse={handleBrowse}
        onUpload={handleOpenUpload}
        onMyResources={handleMyResources}
      />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">

          <div className="hero-text">

            <span className="hero-badge">
              📚 Student Learning Platform
            </span>

            <h1>
              Find. Share.
              <br />
              <span>Study Together.</span>
            </h1>

            <p>
              Discover notes, PYQs, assignments and
              study resources shared by students like you.
            </p>

            <div className="search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search notes, subjects, PYQs..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <button type="button">
                Search
              </button>

            </div>

            <div className="category-chips">

              <button
                type="button"
                onClick={() => setSearch("Notes")}
              >
                📖 Notes
              </button>

              <button
                type="button"
                onClick={() => setSearch("PYQ")}
              >
                📝 PYQs
              </button>

              <button
                type="button"
                onClick={() =>
                  setSearch("Assignment")
                }
              >
                📋 Assignments
              </button>

              <button
                type="button"
                onClick={() => setSearch("PPT")}
              >
                📊 PPTs
              </button>

            </div>
          </div>

          <div className="hero-illustration">

            <div className="illustration-circle">
              📚
            </div>

            <div className="floating-card card-one">
              ⭐ 4.8 Rating
            </div>

            <div className="floating-card card-two">
              📥 1.2k Downloads
            </div>

          </div>

        </div>
      </section>

      {/* RESOURCES SECTION */}
      <section
        className="resources"
        id="resources-section"
      >

        <div className="section-header">

          <div>
            <h2>Latest Resources</h2>

            <p>
              Explore study material shared by students
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenUpload}
          >
            + Upload Resource
          </button>

        </div>

        {filteredResources.length === 0 ? (
          <div className="empty-state">

            <div>
              📚
            </div>

            <h3>No resources found</h3>

            <p>
              Try another search or upload a new
              resource.
            </p>

          </div>
        ) : (

          <div className="resource-grid">

            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onView={handleViewResource}
              />
            ))}

          </div>

        )}

      </section>

      {/* MY RESOURCES SECTION */}
      <section
        className="resources my-resources"
        id="my-resources-section"
      >

        <div className="section-header">

          <div>
            <h2>My Resources</h2>

            <p>
              Resources uploaded by you in this session
            </p>
          </div>

        </div>

        {myResources.length === 0 ? (

          <div className="empty-state">

            <div>
              📂
            </div>

            <h3>No resources uploaded yet</h3>

            <p>
              Upload your first study resource to see
              it here.
            </p>

            <button
              type="button"
              onClick={handleOpenUpload}
            >
              Upload Resource
            </button>

          </div>

        ) : (

          <div className="resource-grid">

            {myResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onView={handleViewResource}
              />
            ))}

          </div>

        )}

      </section>

      {/* UPLOAD FORM */}
      {showUploadForm && (
        <section
          className="upload-form"
          id="upload-section"
        >

          <div className="upload-header">

            <div>
              <h2>Upload Resource</h2>

              <p>
                Share your study material with other
                students.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowUploadForm(false)
              }
            >
              ✕
            </button>

          </div>

          <div className="upload-fields">

            <input
              type="text"
              placeholder="Resource title"
              value={uploadData.title}
              onChange={(e) =>
                setUploadData({
                  ...uploadData,
                  title: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Subject"
              value={uploadData.subject}
              onChange={(e) =>
                setUploadData({
                  ...uploadData,
                  subject: e.target.value,
                })
              }
            />

            <select
              value={uploadData.type}
              onChange={(e) =>
                setUploadData({
                  ...uploadData,
                  type: e.target.value,
                })
              }
            >

              <option value="">
                Select Resource Type
              </option>

              <option value="Notes">
                Notes
              </option>

              <option value="PYQ">
                PYQ
              </option>

              <option value="Assignment">
                Assignment
              </option>

              <option value="PPT">
                PPT
              </option>

            </select>

            <input
              type="file"
              onChange={(e) =>
                setSelectedFile(
                  e.target.files[0]
                )
              }
            />

            {selectedFile && (
              <p>
                Selected file:{" "}
                <strong>
                  {selectedFile.name}
                </strong>
              </p>
            )}

            <button
              type="button"
              onClick={handleUpload}
            >
              Upload Resource
            </button>

          </div>

        </section>
      )}

      {/* RESOURCE DETAILS */}
      {selectedResource && (
        <section
  className="resource-details"
  id="resource-details-section"
>

          <h2>
            {selectedResource.title}
          </h2>

          <p>
            Subject: {selectedResource.subject}
          </p>

          <p>
            Type: {selectedResource.type}
          </p>

          {/* Rating */}
          <div className="rating">

            <p>
              Rate this resource:
            </p>

            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() =>
                  handleRating(star)
                }
              >
                {star <= rating
                  ? "★"
                  : "☆"}
              </button>
            ))}

            <p>
              Your Rating: {rating}/5
            </p>

          </div>

          <p>
            Downloads: {downloadCount}
          </p>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
          >
            Download Resource
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
          >
            Delete Resource
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={handleEdit}
          >
            Edit Resource
          </button>

          {/* Edit Form */}
          {isEditing && (
            <div className="edit-form">

              <h3>
                Edit Resource
              </h3>

              <input
                type="text"
                placeholder="Resource title"
                value={editData.title}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    title: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Subject"
                value={editData.subject}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    subject: e.target.value,
                  })
                }
              />

              <select
                value={editData.type}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    type: e.target.value,
                  })
                }
              >

                <option value="">
                  Select Resource Type
                </option>

                <option value="Notes">
                  Notes
                </option>

                <option value="PYQ">
                  PYQ
                </option>

                <option value="Assignment">
                  Assignment
                </option>

                <option value="PPT">
                  PPT
                </option>

              </select>

              <button
                type="button"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsEditing(false)
                }
              >
                Cancel
              </button>

            </div>
          )}

          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
          >
            Back to Resources
          </button>

        </section>
      )}

            </div>
      )}
    </>
  );
}

export default App;