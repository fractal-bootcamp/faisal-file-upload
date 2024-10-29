import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import multer from "multer";

dotenv.config();

const upload = multer({ dest: 'uploads/' });
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (_req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});
