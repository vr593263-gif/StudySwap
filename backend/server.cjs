require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const Resource = require("./resourcemodel.cjs");
const User = require("./usermodel.cjs");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const app = express();

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/studyswap")
  .then(() => {
    console.log("MongoDB connected!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Uploads folder
const uploadsFolder = path.join(__dirname, "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

// Allow access to uploaded files
app.use(
  "/uploads",
  express.static(uploadsFolder)
);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
// Signup API
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

const user = new User({
  name: name.trim(),
  email: email.toLowerCase().trim(),
  password: hashedPassword,
});

    const savedUser = await user.save();

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Error creating account",
    });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
  password,
  user.password
);

if (!passwordMatch) {
  return res.status(401).json({
    message: "Invalid email or password",
  });
}

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});
// Forgot Password - Send OTP
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.resetOTP = otp;
    user.resetOTPExpires = otpExpiry;

    await user.save();

    await transporter.sendMail({
      from: `"StudySwap" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "StudySwap Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>StudySwap Password Reset 🔐</h2>

          <p>Hi ${user.name},</p>

          <p>
            Use the following OTP to reset your StudySwap password:
          </p>

          <h1 style="letter-spacing: 8px;">
            ${otp}
          </h1>

          <p>
            This OTP will expire in <strong>10 minutes</strong>.
          </p>

          <p>
            If you didn't request a password reset,
            you can safely ignore this email.
          </p>

          <p>
            — StudySwap Team
          </p>
        </div>
      `,
    });

    res.json({
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
});
// Home route
app.get("/", (req, res) => {
  res.send("StudySwap Backend is running!");
});

// Test route
app.get("/api/test", (req, res) => {
  res.send("API TEST WORKING!");
});

// Get all resources
app.get("/api/resources", async (req, res) => {
  try {
    const resources = await Resource.find();

    res.json(resources);
  } catch (error) {
    console.error("Fetch error:", error);

    res.status(500).json({
      message: "Error fetching resources",
    });
  }
});

// Upload resource
app.post(
  "/api/resources",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a file",
        });
      }

      const resource = new Resource({
        title: req.body.title,
        subject: req.body.subject,
        type: req.body.type,

        // Store only the filename
        filePath: req.file.filename,
      });

      const savedResource = await resource.save();

      res.status(201).json(savedResource);
    } catch (error) {
      console.error("Upload error:", error);

      res.status(500).json({
        message: "Error uploading resource",
      });
    }
  }
);

// Download resource
app.get(
  "/api/resources/:id/download",
  async (req, res) => {
    try {
      const resource = await Resource.findById(
        req.params.id
      );

      if (!resource) {
        return res.status(404).send(
          "Resource not found"
        );
      }

      if (!resource.filePath) {
        return res.status(404).send(
          "File path not found"
        );
      }

      // Get only filename from database
      const fileName = path.basename(
        resource.filePath
      );

      // Create correct current file path
      const filePath = path.join(
        uploadsFolder,
        fileName
      );

      console.log("Download requested:");
      console.log("File:", fileName);
      console.log("Path:", filePath);

      // Check whether file actually exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).send(
          "File does not exist in uploads folder"
        );
      }

      res.download(
        filePath,
        fileName,
        (error) => {
          if (error) {
            console.error(
              "Download error:",
              error.message
            );

            if (!res.headersSent) {
              res.status(500).send(
                "Download failed"
              );
            }
          }
        }
      );
    } catch (error) {
      console.error(
        "Download route error:",
        error
      );

      res.status(500).send(
        "Download failed"
      );
    }
  }
);

// Delete resource
app.delete(
  "/api/resources/:id",
  async (req, res) => {
    try {
      const deletedResource =
        await Resource.findByIdAndDelete(
          req.params.id
        );

      if (!deletedResource) {
        return res.status(404).json({
          message: "Resource not found",
        });
      }

      // Delete actual file too
      if (deletedResource.filePath) {
        const fileName = path.basename(
          deletedResource.filePath
        );

        const filePath = path.join(
          uploadsFolder,
          fileName
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.json({
        message:
          "Resource deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      res.status(500).json({
        message:
          "Error deleting resource",
      });
    }
  }
);

// Edit resource
app.put(
  "/api/resources/:id",
  async (req, res) => {
    try {
      const { title, subject, type } =
        req.body;

      if (
        !title ||
        !subject ||
        !type
      ) {
        return res.status(400).json({
          message:
            "Title, subject and type are required",
        });
      }

      const updatedResource =
        await Resource.findByIdAndUpdate(
          req.params.id,
          {
            title: title.trim(),
            subject: subject.trim(),
            type: type.trim(),
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        );

      if (!updatedResource) {
        return res.status(404).json({
          message: "Resource not found",
        });
      }

      res.json(updatedResource);
    } catch (error) {
      console.error(
        "Edit error:",
        error
      );

      res.status(500).json({
        message:
          "Error updating resource",
      });
    }
  }
);

// Rating resource
app.put(
  "/api/resources/:id/rating",
  async (req, res) => {
    try {
      const { rating } = req.body;

      if (
        !rating ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5",
        });
      }

      const resource =
        await Resource.findById(
          req.params.id
        );

      if (!resource) {
        return res.status(404).json({
          message:
            "Resource not found",
        });
      }

      const oldTotal =
        resource.rating *
        resource.ratingCount;

      const newRatingCount =
        resource.ratingCount + 1;

      const newAverageRating =
        (oldTotal + rating) /
        newRatingCount;

      resource.rating =
        newAverageRating;

      resource.ratingCount =
        newRatingCount;

      const updatedResource =
        await resource.save();

      res.json(updatedResource);
    } catch (error) {
      console.error(
        "Rating error:",
        error
      );

      res.status(500).json({
        message:
          "Error saving rating",
      });
    }
  }
);
// Verify OTP and Reset Password
// Verify OTP
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetOTP || !user.resetOTPExpires) {
      return res.status(400).json({
        message: "No OTP request found. Please request a new OTP.",
      });
    }

    if (new Date() > user.resetOTPExpires) {
      user.resetOTP = null;
      user.resetOTPExpires = null;

      await user.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.resetOTP !== otp.trim()) {
      return res.status(400).json({
        message: "Wrong OTP. Please enter the correct OTP.",
      });
    }

    res.json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
});
// Reset Password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetOTP || !user.resetOTPExpires) {
      return res.status(400).json({
        message: "No OTP request found. Please request a new OTP.",
      });
    }

    if (new Date() > user.resetOTPExpires) {
      user.resetOTP = null;
      user.resetOTPExpires = null;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.resetOTP !== otp.trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // Clear OTP after successful password reset
    user.resetOTP = null;
    user.resetOTPExpires = null;

    await user.save();

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Failed to reset password",
    });
  }
});
// Start server
app.listen(5000, () => {
  console.log(
    "Server running on http://localhost:5000"
  );
});