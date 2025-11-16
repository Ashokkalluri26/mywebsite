import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required" });
  }

  try {
    // Step 1: Generate Access Token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
        grant_type: "refresh_token"
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Publish post to Blogger
    const postResponse = await axios.post(
      `https://www.googleapis.com/blogger/v3/blogs/${process.env.BLOG_ID}/posts/`,
      {
        kind: "blogger#post",
        blog: { id: process.env.BLOG_ID },
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

    return res.json({
      message: "Post published successfully!",
      url: postResponse.data.url,
      postId: postResponse.data.id
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to publish post",
      details: error.response?.data || error.message
    });
  }
}
