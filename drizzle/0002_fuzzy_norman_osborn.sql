CREATE TABLE "products" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" text NOT NULL,
	"product_description" text NOT NULL,
	"price" integer NOT NULL,
	"stock_quantity" integer NOT NULL,
	"category" text NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_product_id_unique" UNIQUE("product_id"),
	CONSTRAINT "price_check" CHECK ("products"."price" >= 0),
	CONSTRAINT "stock_quantity_check" CHECK ("products"."stock_quantity" >= 0)
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;