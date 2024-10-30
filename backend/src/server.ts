import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3 } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { authMiddleware } from "./middleware";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

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

app.get("/api/protected", authMiddleware, async (req, res) => {
    // Get user ID from auth context
    const { userId } = getAuth(req);
    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId ?? '');
    // Send response without return statement
    res.json(user);
});

// get image from s3
app.get("/api/image/:id", (req, res) => {
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

        // Set Content-Type based on the file extension from the key
        const contentType = key.toLowerCase().endsWith('.png') ? 'image/png'
            : key.toLowerCase().endsWith('.gif') ? 'image/gif'
                : key.toLowerCase().endsWith('.webp') ? 'image/webp'
                    : key.toLowerCase().endsWith('.svg') ? 'image/svg+xml'
                        : 'image/jpeg'; // Default to jpeg for jpg/jpeg/unknown
        res.set('Content-Type', contentType);
        res.set('Content-Length', data.ContentLength);
        res.send(data);
    })
})

// fetch all files for the user (owned or shared)
app.get("/api/files", authMiddleware, async (req, res) => {
    try {
        const user = (req as any).user
        const files = await prisma.file.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    {
                        sharedWith: {
                            some: {
                                sharedWithId: user.id
                            }
                        }
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        email: true,
                    }
                },
                sharedWith: {
                    include: {
                        sharedWith: {
                            select: {
                                firstName: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        })
        res.status(200).json({ message: 'Files fetched', files })
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// upload image to s3
app.post("/api/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        // get uploaded file info from multer-s3
        const file = req.file as Express.MulterS3.File
        const user = (req as any).user

        // store file information in the database
        const fileRecord = await prisma.file.create({
            data: {
                name: file.originalname,
                awsKey: file.key,
                awsUrl: file.location,
                userId: user.id
            }
        })

        res.status(200).json({ message: 'File uploaded', file: fileRecord });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// share file with another user
app.post("/api/files/:fileId/share", authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params
        const { userEmail, canEdit } = req.body
        const currentUser = (req as any).user

        // find target user by email
        const targetUser = await prisma.user.findUnique({
            where: { email: userEmail }
        })

        if (!targetUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // verify that the current user is the owner of the file
        const file = await prisma.file.findUnique({
            where: {
                id: fileId,
                userId: currentUser.id
            }
        })

        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // create share record
        const share = await prisma.fileShare.create({
            data: {
                fileId,
                sharedById: currentUser.id,
                sharedWithId: targetUser.id,
                canEdit,
            }
        })

        res.status(200).json({ message: 'File shared', share });
        return;
    } catch (error) {
        console.error('Error sharing file:', error);
        res.status(500).json({ error: 'Failed to share file' });
        return;
    }
});

// delete file sharing
app.delete("/api/files/:fileId/share/:shareId", authMiddleware, async (req, res) => {
    try {
        const { fileId, shareId } = req.params
        const currentUser = (req as any).user

        // find share record
        const share = await prisma.fileShare.findUnique({
            where: {
                id: shareId,
                fileId,
                sharedById: currentUser.id
            }
        })

        if (!share) {
            res.status(404).json({ error: 'Share not found' });
            return;
        }

        // delete share record
        await prisma.fileShare.delete({
            where: { id: shareId }
        })

        res.status(200).json({ message: 'Share deleted' });
    } catch (error) {
        console.error('Error deleting share:', error);
        res.status(500).json({ error: 'Failed to delete share' });
        return;
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});
