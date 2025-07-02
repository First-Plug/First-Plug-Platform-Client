import { EmptyCard, EmptyCardLayout } from "@/shared";

export const EmptyStock = function EmptyStock() {
  return (
    <EmptyCardLayout>
      <EmptyCard type="stock" />
    </EmptyCardLayout>
  );
};
