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
    console.log(req.query.url);
  try {
    // const videoUrl = "https://youtu.be/bWycnVL6_dE?si=Vj2zcToTPTODyzOE";
    const videoUrl = req.query.url;

    if (!ytdl.validateURL(videoUrl)) {
      throw new Error('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo', });

    const videoStream = ytdl(videoUrl, { format });

    // Convert stream to buffer
    const chunks = [];
    videoStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    videoStream.on('end', async () => {
      const videoBuffer = Buffer.concat(chunks);

      const fileRef = ref(storage, `videos/${info.title}.mp4`);
      await uploadBytes(fileRef, videoBuffer);

      const downloadURL = await getDownloadURL(fileRef);

      console.log('Firebase Storage download URL:', downloadURL);
      res.status(200).send(downloadURL);
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
