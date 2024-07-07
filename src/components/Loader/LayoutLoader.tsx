import { Skeleton } from "@/components/ui/skeleton";
export function LayoutLoader() {
  return (
    <div className=" w-full h-full flex flex-col gap-4 p-4">
      <div className="flex justify-between">
        <Skeleton className="h-12 w-1/6 rounded-full" />
        <div className=" flex gap-2">
          <Skeleton className="h-12 w-20 rounded-full" />
          <Skeleton className="h-12 w-20 rounded-full" />
        </div>
      </div>

      <div className="flex-grow flex flex-col gap-2">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
