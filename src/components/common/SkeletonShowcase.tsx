import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SkeletonLoader from './SkeletonLoader';

/**
 * Showcase component for the enhanced skeleton loader
 * Demonstrates various skeleton patterns and animations
 */
export const SkeletonShowcase: React.FC = () => {
  const [activeVariant, setActiveVariant] = useState<
    'default' | 'shimmer' | 'wave' | 'pulse' | 'glow'
  >('shimmer');

  const variants = [
    { value: 'default', label: 'Default' },
    { value: 'shimmer', label: 'Shimmer' },
    { value: 'wave', label: 'Wave' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'glow', label: 'Glow' },
  ] as const;

  const skeletonTypes = [
    {
      value: 'document',
      label: 'Document',
      description: 'Full document with sections',
    },
    {
      value: 'projects-dashboard',
      label: 'Projects Dashboard',
      description: 'Project cards with metadata',
    },
    { value: 'table', label: 'Table', description: 'Data table with headers' },
    {
      value: 'detailed-card',
      label: 'Detailed Card',
      description: 'Rich card with avatar and actions',
    },
    { value: 'form', label: 'Form', description: 'Form fields with labels' },
    { value: 'chat', label: 'Chat', description: 'Chat conversation' },
    { value: 'sidebar', label: 'Sidebar', description: 'Navigation sidebar' },
    {
      value: 'search-history',
      label: 'Search History',
      description: 'Search results list',
    },
    {
      value: 'project-list',
      label: 'Project List',
      description: 'Project navigation',
    },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          Enhanced Skeleton Loader Showcase
        </h1>
        <p className="text-muted-foreground">
          Demonstrating modern skeleton loading patterns with various animations
          and layouts
        </p>
      </div>

      {/* Animation Variant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Animation Variants</CardTitle>
          <CardDescription>
            Choose an animation style to see how it affects all skeleton
            patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {variants.map(variant => (
              <Button
                key={variant.value}
                variant={
                  activeVariant === variant.value ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setActiveVariant(variant.value)}
              >
                {variant.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Pattern Showcase */}
      <Tabs defaultValue="document" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          {skeletonTypes.slice(0, 5).map(type => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mt-2">
          {skeletonTypes.slice(5).map(type => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {skeletonTypes.map(type => (
          <TabsContent
            key={type.value}
            value={type.value}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{type.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>
              <Badge variant="secondary">{activeVariant}</Badge>
            </div>

            <Card>
              <CardContent className="p-6">
                <SkeletonLoader
                  type={type.value as any}
                  variant={activeVariant}
                  count={
                    type.value === 'projects-dashboard'
                      ? 3
                      : type.value === 'detailed-card'
                        ? 2
                        : type.value === 'form'
                          ? 4
                          : type.value === 'chat'
                            ? 4
                            : type.value === 'search-history'
                              ? 3
                              : type.value === 'project-list'
                                ? 5
                                : 1
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Enhanced Animations</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Shimmer effects with gradient backgrounds</li>
                <li>• Wave animations for dynamic feel</li>
                <li>• Pulse effects with subtle scaling</li>
                <li>• Glow effects with shadow animations</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Modern Design</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Consistent with shadcn/ui design system</li>
                <li>• Responsive and mobile-friendly</li>
                <li>• Proper semantic HTML structure</li>
                <li>• Accessibility features built-in</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Flexible API</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Multiple predefined patterns</li>
                <li>• Customizable variant animations</li>
                <li>• Configurable counts and layouts</li>
                <li>• Easy to extend with new patterns</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Performance</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• CSS-based animations for smooth performance</li>
                <li>• Reduced motion support for accessibility</li>
                <li>• Minimal bundle size impact</li>
                <li>• Optimized for modern browsers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkeletonShowcase;
