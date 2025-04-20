import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import express, { Request, Response } from "express";
import multer from "multer";
import { ProductModel } from "../database/models/Products";
import { db } from "../database/plugins/database";
import { randomImageName } from "../utils/RandomImageName";

dotenv.config();

const productRouter = express.Router();

const imageStorage = multer.memoryStorage();
const imageUpload = multer({ storage: imageStorage });

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const awsAccessKey = process.env.AWS_ACCESS_KEY;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey!,
    secretAccessKey: awsSecretAccessKey!,
  },
  region: bucketRegion,
});

productRouter.post(
  "/upload-product",
  imageUpload.single("productImages"),
  async (req: Request, res: Response) => {
    console.log("req.body", req.body);
    console.log("req.file", req.file);

    const imageName = randomImageName();

    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };

    console.log("image name:", imageName);

    const command = new PutObjectCommand(params);

    await s3.send(command);

    const product = db.insert(ProductModel).values({
      productName: req.body.productName,
      productDescription: req.body.productDescription,
      price: req.body.price,
      stockQuantity: req.body.stockQuantity,
      category: req.body.category,
      productId: req.body.productId,
      userId: req.body.userId,
      isActive: true,
      createdAt: new Date(),
      imageName: imageName,
    });

    await product;
    res.status(201).json({ message: "Product uploaded successfully" });
  }
);

productRouter.get("/get-product", async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;

    const getProduct = await db.query.ProductModel.findMany({
      where: eq(ProductModel.productId, productId),
      with: { user: true },
    });

    if (getProduct.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    for (const product of getProduct) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: product.imageName!,
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

      product.imageUrl = url;
    }

    res.send(getProduct);
  } catch (error) {
    res.status(500).json({
      message: "Error occured while fetching product from the database",
    });
  }
});

productRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    const products = await db.query.ProductModel.findMany({
      where: eq(ProductModel.userId, userId),
      with: { user: true },
    });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this user' });
    }

    res.send(products);
  } catch (error) {
    res.status(500).json({
      message: 'Error occurred while fetching products from the database',
    });
  }
});

export default productRouter;
