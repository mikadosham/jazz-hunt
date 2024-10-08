// File: /pages/api/cors-middleware.js
import nc from "next-connect";
import cors from "cors";

const handler = nc()
  .use(
    cors({
      origin: "*", // Adjust according to your needs
      methods: ["GET", "POST", "OPTIONS"], // Specify allowed methods
      allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    })
  )
  .get(async (req, res) => {
    res.json({ message: "This route supports CORS" });
  });

export default handler;
