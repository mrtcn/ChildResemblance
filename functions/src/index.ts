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
import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase/app";
import * as logger from "firebase-functions/logger";
// import { onObjectFinalized } from "firebase-functions/v2/storage";
import {getDownloadURL, getStorage, ref, deleteObject} from "firebase/storage";
import * as path from "path";
import {ImageResponse} from "./models/image-response";

initializeApp({
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
export const createEditImage = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  logger.log("Check if request is authorized with Firebase ID token");
  if ((!req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)) {
    logger.error(
      "No Firebase ID token was passed as a Bearer token in",
      "the Authorization header.",
      "Make sure you authorize your request by providing the following",
      " HTTP header:",
      "Authorization: Bearer <Firebase ID Token>",
      "or by passing a ${__session} cookie."
    );
    res.status(403).send("Unauthorized");
    return;
  }

  // let idToken;
  if (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")) {
    logger.log("Found \"Authorization\" header");
    // Read the ID Token from the Authorization header.
    // idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    logger.log("Found \"__session\" cookie");
    // Read the ID Token from cookie.
    // idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    // const decodedIdToken = await auth.auth().verifyIdToken(idToken);
    const imgUrl = req.query["imgUrl"]?.toString();
    logger.log("imgUrl: " + imgUrl);
    const storage = getStorage();
    const downloadUrl = await getDownloadURL(ref(storage, imgUrl));
    const filename = path.basename(downloadUrl);
    const filenameNormalized = filename.split("?")[0];
    logger.log("downloadUrl: " + downloadUrl);
    logger.log("filenameNormalized: " + filenameNormalized);
    https.get(downloadUrl, (downloadResponse) => {
      const fileStream = createWriteStream(filenameNormalized);
      downloadResponse.pipe(fileStream);

      fileStream.on("finish", async () => {
        fileStream.close();
        console.log("Download finished");
        const response = await openai.createImageEdit(
          createReadStream(filenameNormalized) as any,
          "Transform background into uss enterprise ship",
          createReadStream(filenameNormalized) as any,
          2,
          "1024x1024");
        res.send(new ImageResponse(response.data.data[0].url));
        unlink(filenameNormalized, async () => {
          console.log("Deleted file ${filenameNormalized}");
          deleteObject(ref(storage, imgUrl)).then(() => {
            console.log("Image removed from Firebase Storage");
          });
        });
        return;
      });
    });
  } catch (error) {
    logger.error("Error while verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
    return;
  }
});
