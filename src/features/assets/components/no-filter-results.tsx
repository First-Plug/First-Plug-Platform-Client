import { EmptyCard, EmptyCardLayout } from "@/shared";

export const NoFilterResults = function NoFilterResults() {
  return (
    <EmptyCardLayout>
      <div className="flex flex-col justify-center items-center py-12">
        <div className="flex justify-center items-center bg-gray-100 mb-4 rounded-full w-16 h-16">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">
          No results found
        </h3>
        <p className="max-w-md text-gray-500 text-center">
          No assets match the current filters. Try adjusting your search
          criteria or clear the filters to see all assets.
        </p>
      </div>
    </EmptyCardLayout>
  );
};
