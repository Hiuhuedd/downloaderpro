const express = require('express');
const ytdl = require('ytdl-core');

const bodyParser = require('body-parser');
const {fetchVideo} = require('@prevter/tiktok-scraper');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { ndown,tikdown,ytdown } = require("nayan-media-downloader")

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.post('/download', async (req, res) => {
      const link = req.body.url;

  try {
    // Check the platform and call the appropriate method based on the platform
    if (link.includes('youtu.be')) {
      try {
        
        let URL2 = await ytdown(link)
        console.log(URL2);
         const resObject={
           thumbnail: URL2.data.picture,
           title: URL2.data.title,
           description: URL2.data.published,
           url:URL2.data.video,
           source:"Youtube",
           color:"#dc2626"
         }
           res.status(200).json(resObject);
       
      } catch (error) {
        console.log(error);
        
      }
        
      } else if (link.includes('tiktok')) {
   try {
          
          try {
        
            const response= await fetchVideo(link);
         
            console.log(response);
             const resObject={
               thumbnail: response.previewImageUrl,
               title: "TikTok",
               description:response.description,
               url:response.videoWatermark.url,
               source:"TikTok",
               color:"#111"

             }
               res.status(200).json(resObject);
           
          } catch (error) {
            console.log(error);
            
          }
       
      } catch (error) {
          console.log(error);
      }
        
      } else if (link.includes('instagram')) {
        
        try {
        
          let URL = await ndown(link)
          const response=URL.data[1]||URL.data[0]
          console.log(response, URL.data);
           const resObject={
             thumbnail: response.thumbnail,
             title: "Instagram",
             description:"Instagram download",
             url:response.url,
             source:"Instagram",
             color:"#ec4899"
             
            }
             res.status(200).json(resObject);
             
            } catch (error) {
              console.log(error);
              
            }
            
            
          } else if ((link.includes("fb"))|| (link.includes("facebook"))) {
            
       
          try {
        
            let URL = await ndown(link)
            const response=URL.data[0]
            console.log(response);
             const resObject={
               thumbnail: response.thumbnail,
               title: "FaceBook",
               description:"Facebook download",
               url:response.url,
               source:"FaceBook",
               color:"#2563eb"
          
             }
               res.status(200).json(resObject);
           
          } catch (error) {
            console.log(error);
            
          }
        

    }else{
      res.status(400).send("Platform not found");

    }
    }catch (error) {
          console.error(error.message);
          res.status(400).send(error.message);
        }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


