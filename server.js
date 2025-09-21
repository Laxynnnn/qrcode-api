// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ====== MongoDB Setup ======
mongoose.connect('mongodb://127.0.0.1:27017/qrcode', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected");
  console.log("Connected to database:", mongoose.connection.name);
})
.catch(err => console.error("❌ MongoDB connection error:", err));

// ====== Mongoose Schema ======
const qrSchema = new mongoose.Schema({
  text: String,
  template: String,
  color: String,
  qrCode: String, // base64 dataURL
  generatedAt: { type: Date, default: Date.now }
});

const QrModel = mongoose.model("History", qrSchema);

// ====== Routes ======

// Generate QR Code
app.post('/generate', async (req, res) => {
  try {
    console.log("✅ Request received from frontend"); // Log baru
    const { text, template, color } = req.body;

    console.log("✅ Data received:", req.body); // Log baru

    if (!text) {
      console.error("❌ Text is missing from request body"); // Log baru
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    // Generate QR (base64)
    const qrCode = await QRCode.toDataURL(text, {
      color: {
        dark: color || "#000000",
        light: "#FFFFFF"
      }
    });
    console.log("✅ QR Code generated successfully"); // Log baru

    // Save to MongoDB
    const newQR = await QrModel.create({
      text,
      template: template || "default",
      color: color || "#000000",
      qrCode
    });
    console.log("✅ Data saved to MongoDB with ID:", newQR._id); // Log baru

    res.json({ success: true, qrCode: newQR.qrCode });
  } catch (err) {
    console.error("❌ Error in try block:", err.message); // Log yang diperbarui
    res.status(500).json({ success: false, message: "Failed to generate QR Code" });
  }
});

// ====== Start Server ======
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});