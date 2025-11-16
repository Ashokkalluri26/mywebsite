const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const {google} = require('googleapis');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * Configuration - replace these environment variables
 * BLOG_ID - your Blogger blog ID (provided: 7791873568125614615)
 * CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN - for OAuth2 to get access token
 * PORT - optional
 */
const BLOG_ID = process.env.BLOG_ID || '7791873568125614615';

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID || 'YOUR_CLIENT_ID',
  process.env.CLIENT_SECRET || 'YOUR_CLIENT_SECRET'
);

if (process.env.REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN});
}

// Helper: get access token (automatically uses refresh token)
async function getAccessToken() {
  if(!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    try {
      const res = await oauth2Client.getAccessToken();
      return res.token;
    } catch(e) {
      console.error('Error getting access token:', e);
      return null;
    }
  }
  return oauth2Client.credentials.access_token;
}

app.post('/postJob', async (req, res) => {
  try {
    const { title, short, full, category, tags } = req.body;
    // create post on Blogger
    const accessToken = await getAccessToken();
    if(!accessToken) {
      return res.json({ success:false, message: 'No access token. Set CLIENT_ID, CLIENT_SECRET and REFRESH_TOKEN as env vars.' });
    }

    const blogger = google.blogger({version: 'v3', auth: oauth2Client});
    const created = await blogger.posts.insert({
      blogId: BLOG_ID,
      requestBody: {
        title: title,
        content: full + '<p><em>Short: ' + (short||'') + '</em></p>'
      }
    });

    const blogUrl = created.data.url || '';
    // save short info to jobs.json (frontend reads this file)
    const jobsPath = __dirname + '/../frontend/jobs.json';
    let jobs = [];
    try {
      const raw = fs.readFileSync(jobsPath);
      jobs = JSON.parse(raw);
    } catch(e) {
      jobs = [];
    }
    jobs.unshift({ title, short, link: blogUrl, category, tags });
    fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2));

    res.json({ success:true, message:'Posted to Blogger', blogUrl });
  } catch (err) {
    console.error(err);
    res.json({ success:false, message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Backend listening on port', PORT));
