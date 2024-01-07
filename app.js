const express = require('express');
const ytdl = require('ytdl-core');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const app = express();
const port = 3000;

// Increase the timeout to 10 minutes (adjust as needed)
app.timeout = 600000; // 10 minutes in milliseconds

// Initialize Firebase with your project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHGQCYWsUuRseO-uZ5vbjpFtjz1RsnF5Q",
  authDomain: "downloaderpro-8b241.firebaseapp.com",
  projectId: "downloaderpro-8b241",
  storageBucket: "downloaderpro-8b241.appspot.com",
  messagingSenderId: "631792454352",
  appId: "1:631792454352:web:532712aaacd2aa7bd76cd5",
  measurementId: "G-1SM9BMSKXS"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

app.get('/download', async (req, res) => {
  try {
    const videoUrl = req.query.url;

    if (!ytdl.validateURL(videoUrl)) {
      throw new Error('Invalid YouTube URL');
    }

    // Get video information
    const info = await ytdl.getInfo(videoUrl);
    
    // Access video details
    const title = info.videoDetails.title;
    const description = info.videoDetails.description;
    const thumbnails = info.videoDetails.thumbnails;

    console.log('Video Title:', title);
    console.log('Video Description:', description);
    console.log('Thumbnails:', thumbnails);

    // Choose the format for downloading
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });

    // Download the video stream
    const videoStream = ytdl(videoUrl, { format });

    // Convert stream to buffer
    const chunks = [];
    videoStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    videoStream.on('end', async () => {
      const videoBuffer = Buffer.concat(chunks);

      // Upload the video to Firebase Storage
      const fileRef = ref(storage, `videos/${title}.mp4`);
      await uploadBytes(fileRef, videoBuffer);

      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);

      console.log('Firebase Storage download URL:', downloadURL);
      res.status(200).json({
        title,
        description,
        thumbnails,
        downloadURL
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
