import React from 'react';

/**
 * PiWineGlassEmptyContrast icon from the contrast style in food category.
 */
interface PiWineGlassEmptyContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWineGlassEmptyContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'wine-glass-empty icon',
  ...props
}: PiWineGlassEmptyContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12 13c3.6 0 6-2.736 6-6.111A10 10 0 0 0 16.698 2H7.302A10 10 0 0 0 6 6.889C6 10.264 8.4 13 12 13Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13c3.6 0 6-2.736 6-6.111A10 10 0 0 0 16.698 2H7.302A10 10 0 0 0 6 6.889C6 10.264 8.4 13 12 13Zm0 0v9m4 0H8" fill="none"/>
    </svg>
  );
}
