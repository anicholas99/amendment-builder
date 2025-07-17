import { SkeletonShowcase } from '@/components/common';
import { SkeletonLoader } from '@/components/common';

export default function SkeletonDemo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Quick shimmer test */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold mb-4">Shimmer Animation Test</h2>
        <div className="space-y-4">
          <SkeletonLoader type="document" variant="shimmer" />
          <SkeletonLoader
            type="projects-dashboard"
            variant="shimmer"
            count={2}
          />
        </div>
      </div>

      {/* Full showcase */}
      <SkeletonShowcase />
    </div>
  );
}
