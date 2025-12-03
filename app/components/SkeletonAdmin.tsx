export const SkeletonCard = () => (
  <div className="bg-white rounded-[15px] p-5 shadow-lg border border-gray-100 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-32 bg-gray-200 rounded"></div>
  </div>
);

export const SkeletonTable = () => (
  <div className="border border-[#9e1c60] rounded-[10px] overflow-hidden animate-pulse">
    <div className="h-12 bg-[#9e1c60]/20 w-full"></div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center p-4 border-b border-gray-100">
        <div className="h-4 w-8 bg-gray-200 rounded mr-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded mr-4"></div>
        <div className="h-4 w-24 bg-gray-200 rounded mr-4"></div>
        <div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
      </div>
    ))}
  </div>
);

export const SkeletonActivity = () => (
  <div className="bg-white rounded-[15px] p-6 shadow-lg border border-[#9e1c60]/20 animate-pulse">
    <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
