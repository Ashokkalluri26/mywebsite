import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

async function getAccessToken() {
  const url = "https://oauth2.googleapis.com/token";

  const data = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: process.env.REFRESH_TOKEN,
    grant_type: "refresh_token"
  };

  const response = await axios.post(url, data);
  return response.data.access_token;
}

app.post("/create-post", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" });
    }

    const accessToken = await getAccessToken();
    const blogId = process.env.BLOG_ID;

    const response = await axios.post(
      `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`,
      {
        kind: "blogger#post",
        blog: { id: blogId },
        title,
        content
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      message: "Post published successfully",
      post: response.data
    });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to publish",
      details: error.response?.data || error.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("JobUpdates Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
