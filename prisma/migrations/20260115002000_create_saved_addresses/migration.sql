CREATE TABLE "saved_addresses" (
  "id" SERIAL PRIMARY KEY,
  "address" TEXT NOT NULL,
  "lat" DECIMAL(10,8) NOT NULL,
  "lng" DECIMAL(11,8) NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saved_addresses_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "saved_addresses_user_id_idx" ON "saved_addresses"("user_id");

