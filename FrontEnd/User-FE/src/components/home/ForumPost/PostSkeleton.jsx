// components/PostSkeleton.tsx
export default function PostSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="animate-pulse flex flex-col space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-52 bg-gray-200 rounded-lg"></div>
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}
