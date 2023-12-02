import * as functions from "firebase-functions";
import * as express from "express";
import axios from "axios";
import * as crypto from "crypto";

const app = express();

app.use(express.json());

app.post("/pg/v1/pay-prod", async (req, res) => {
  const saltKey = "***YOUR_SALT_KEY***";
  const body = JSON.stringify(req.body);
  const payload = Buffer.from(body).toString("base64");
  const gateway = "/pg/v1/pay";
  const dataForChecksum = payload + gateway + saltKey;
  let hash = crypto.createHash("sha256");
  hash.update(dataForChecksum);
  const hashValue = hash.digest("hex");
  const xVerify = hashValue + "###" + 1;
  const url = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    "X-VERIFY": xVerify,
  };

  try {
    const response = await axios.post(url, { request: payload }, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Payment request failed" });
  }
});

export const api = functions.https.onRequest(app);
