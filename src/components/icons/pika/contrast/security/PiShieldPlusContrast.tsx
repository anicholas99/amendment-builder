import React from 'react';

/**
 * PiShieldPlusContrast icon from the contrast style in security category.
 */
interface PiShieldPlusContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShieldPlusContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'shield-plus icon',
  ...props
}: PiShieldPlusContrastProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill="currentColor" d="m5.495 4.314 5.388-1.946a3 3 0 0 1 2.038 0l5.465 1.974a3 3 0 0 1 1.972 2.591l.227 2.95A11 11 0 0 1 14.857 20.4l-1.49.806a3 3 0 0 1-2.914-.032l-1.52-.867a11 11 0 0 1-5.544-9.978l.127-3.31a3 3 0 0 1 1.98-2.705Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.132 15v-3m0 0V9m0 3h-3m3 0h3m-4.25-9.632L5.496 4.313a3 3 0 0 0-1.98 2.707l-.127 3.308a11 11 0 0 0 5.543 9.979l1.521.867a3 3 0 0 0 2.915.032l1.489-.807a11 11 0 0 0 5.728-10.516l-.227-2.95a3 3 0 0 0-1.972-2.592L12.92 2.368a3 3 0 0 0-2.038 0Z" fill="none"/>
    </svg>
  );
}
