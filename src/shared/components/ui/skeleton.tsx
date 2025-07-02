import { cn } from "@/shared";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-dark-grey/20", className)}
      {...props}
    />
  );
}

export { Skeleton };
