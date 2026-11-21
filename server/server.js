import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test backend
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CertiFlow backend is running!"
  });
});

// Test PostgreSQL connection
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});


// Create a new batch
app.post("/api/batches", async (req, res) => {
  try {
    const { name, centre, candidates } = req.body;

    if (!name || !centre) {
      return res.status(400).json({
        success: false,
        message: "Batch name and centre are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO batches (name, centre, candidates, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, centre, Number(candidates), "Pending Review"]
    );

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch: result.rows[0],
    });
  } catch (error) {
    console.error("Batch creation error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create batch",
    });
  }
});




// Get all batches from PostgreSQL
app.get("/api/batches", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM batches ORDER BY id DESC"
    );

    res.json({
      success: true,
      batches: result.rows
    });
  } catch (error) {
    console.error("Error fetching batches:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch batches"
    });
  }
});



// Save batch review and approval history
app.post("/api/batches/:id/review", async (req, res) => {
  const client = await pool.connect();

  try {
    const batchId = Number(req.params.id);
    const { status, role, comments } = req.body;

    const allowedStatuses = ["Approved", "Correction Required", "Pending Review"];

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    if (!allowedStatuses.includes(status) || !role) {
      return res.status(400).json({
        success: false,
        message: "Invalid review details",
      });
    }

    await client.query("BEGIN");

    const batch = await client.query(
      "UPDATE batches SET status = $1 WHERE id = $2 RETURNING *",
      [status, batchId]
    );

    if (batch.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    await client.query(
      `INSERT INTO approvals
       (batch_id, action, performed_by_role, comments)
       VALUES ($1, $2, $3, $4)`,
      [batchId, status, role, comments || ""]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Review saved successfully",
      batch: batch.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Review error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to save review",
    });
  } finally {
    client.release();
  }
});





app.listen(PORT, () => {
  console.log(`CertiFlow server running at http://localhost:${PORT}`);
});