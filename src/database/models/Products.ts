import { InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  check
} from "drizzle-orm/pg-core";
import { UserModel } from "./Users";

export const ProductModel = pgTable("products", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  productDescription: text("product_description").notNull(),
  price: integer("price").notNull(),
  stockQuantity: integer("stock_quantity")
    .notNull(),
  category: text("category").notNull(),
  productId: text("product_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => UserModel.id, { onDelete: "cascade" }),
  imageName: text("image_name"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [check('price_check', sql`${table.price} >= 0`), check('stock_quantity_check', sql`${table.stockQuantity} >= 0`)]);

export const productRelations = relations(ProductModel, ({ one }) => ({
  user: one(UserModel, {
    fields: [ProductModel.userId],
    references: [UserModel.id],
  }),
}));

export type Product = InferSelectModel<typeof ProductModel>;
