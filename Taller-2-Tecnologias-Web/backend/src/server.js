// Import the Express application instance
import app from "./app.js";

// Define the port number, defaulting to 4000 if not set in environment
const PORT = Number(process.env.PORT || 4000);

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message indicating the server is running
  console.log(`Backend ejecutandose en http://localhost:${PORT}`);
});
