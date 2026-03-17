import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI!;
  if (!uri) throw new Error("MONGO_URI missing");

  console.log("📂 MongoDB: Attempting connection with pooled settings...");
  
  await mongoose.connect(uri, {
    maxPoolSize: 100,             // Maintain up to 100 socket connections
    minPoolSize: 10,              // Maintain at least 10 socket connections
    socketTimeoutMS: 45000,       // Close sockets after 45 seconds of inactivity
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    heartbeatFrequencyMS: 10000,   // Check server status every 10 seconds
  });

  console.log("🗄️ MongoDB connected (Pool: 10-100)");
};
