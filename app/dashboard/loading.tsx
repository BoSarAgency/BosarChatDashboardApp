export default function DashboardLoading() {
    return (
        <div className="p-6 space-y-6">
            {/* Page title skeleton */}
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="space-y-4">
                    {/* Header row */}
                    <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>

                    {/* Table skeleton */}
                    <div className="space-y-3">
                        {/* Table header */}
                        <div className="grid grid-cols-6 gap-4 py-3 border-b border-gray-200">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>

                        {/* Table rows */}
                        {[1, 2, 3, 4, 5].map((row) => (
                            <div key={row} className="grid grid-cols-6 gap-4 py-3">
                                {[1, 2, 3, 4, 5, 6].map((col) => (
                                    <div key={col} className="h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
