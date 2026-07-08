-- CreateIndex
CREATE INDEX "idx_order_day_dishes_order_day_selected" ON "order_day_dishes"("order_day_id", "is_selected");
