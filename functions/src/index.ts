/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {createReadStream, createWriteStream, unlink} from "fs";
import * as https from "https";
import {onCall} from "firebase-functions/v2/https";
import {initializeApp} from "firebase/app";
import * as logger from "firebase-functions/logger";
// import { onObjectFinalized } from "firebase-functions/v2/storage";
import {getDownloadURL, getStorage, ref, deleteObject, connectStorageEmulator} from "firebase/storage";
import * as path from "path";
import {ImageResponse} from "./models/image-response";

const app = initializeApp({
  apiKey: "AIzaSyDtCYbg61gKFnY4YuyLtEOFB3FGqBqqJm8",
  authDomain: "child-resemblance.firebaseapp.com",
  databaseURL: "https://child-resemblance-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "child-resemblance",
  storageBucket: "child-resemblance.appspot.com",
  messagingSenderId: "534106968791",
  appId: "1:534106968791:web:d41b3a7d47b667dd9c1692",
  measurementId: "G-VYHZB9H743",
});
import {OpenAIApi, Configuration} from "openai";
const config = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(config);

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// export const imageUploaded = onObjectFinalized({cpu: 2}, async (event) => {
// })
export const createEditImage = onCall(async (data) => {
  const imgUrl = data.data.imgUrl;
  logger.log("imgUrl: " + imgUrl);
  const storage = getStorage(app);
  logger.log("location.hostname" + location.hostname);
  if(location.hostname === "127.0.0.1"){
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    logger.log("connectStorageEmulator called");
  }
  const downloadUrl = await getDownloadURL(ref(storage, imgUrl));
  const filename = path.basename(downloadUrl);
  const filenameNormalized = filename.split("?")[0];
  logger.log("downloadUrl: " + downloadUrl);
  logger.log("filenameNormalized: " + filenameNormalized);
  return https.get(downloadUrl, (downloadResponse) => {
    const fileStream = createWriteStream(filenameNormalized);
    downloadResponse.pipe(fileStream);

    return fileStream.on("finish", async () => {
      fileStream.close();
      console.log("Download finished");
      const response = await openai.createImageEdit(
        createReadStream(filenameNormalized) as any,
        "Transform background into uss enterprise ship",
        createReadStream(filenameNormalized) as any,
        2,
        "1024x1024");      
      unlink(filenameNormalized, async () => {
        console.log("Deleted file ${filenameNormalized}");
        deleteObject(ref(storage, imgUrl)).then(() => {
          console.log("Image removed from Firebase Storage");
        });
      });
      return new ImageResponse(response.data.data[0].url);
    });
  });
});