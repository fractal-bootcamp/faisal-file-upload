import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3 } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());

const s3 = new S3({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    storage: multerS3({
        s3,
        bucket: process.env.AWS_S3_BUCKET || '',
        metadata: (_req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (_req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    }),
});

app.get("/", async (_req, res) => {
    const data = await s3.listBuckets()

    res.send({ buckets: data });
});

// get image from s3
app.get("/image/:id", (req, res) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET || '',
        Key: req.params.id,
    }

    const key = req.params.id;

    s3.getObject(params, async (err: any, data: any) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Length', data.ContentLength);
        res.send(data);
    })
})

// upload image to s3
app.post("/upload", upload.single("file"), async (req, res) => {
    // req.file is the file that was uploaded
    console.log(req.file);

    // store file in the database
    const params = {
        Bucket: process.env.AWS_S3_BUCKET || '',
        Key: req.file?.filename,
    }

    res.send({ message: "File uploaded" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});
