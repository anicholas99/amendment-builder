import React from 'react';

/**
 * PiBearAppContrast icon from the contrast style in apps-&-social category.
 */
interface PiBearAppContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBearAppContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'bear-app icon',
  ...props
}: PiBearAppContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M10.965 4.236c-.363-.589-1.858-1.472-2.605-1.177-.629.247-.567 1.087-.567 2.378C6.661 7 6.34 7.181 5.505 9.04 4.357 11.599 3.15 14.702 2.425 21h15.404c-.929-1.903-2.288-3.013-3.104-6.366-.576-2.37 2.832-1.835 4.1-2.31 1.677-.629 2.52-1.971 2.674-2.923.302-1.88-.34-1.506-1.088-1.63-1.087-.182-3.058-1.179-4.576-2.674-1.036-1.02-2.65-1.042-4.87-.86Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M10.965 4.236c-.363-.589-1.858-1.472-2.605-1.177-.629.247-.567 1.087-.567 2.378C6.661 7 6.34 7.181 5.505 9.04 4.357 11.599 3.15 14.702 2.425 21h15.404c-.929-1.903-2.288-3.013-3.104-6.366-.576-2.37 2.832-1.835 4.1-2.31 1.677-.629 2.52-1.971 2.674-2.923.302-1.88-.34-1.506-1.088-1.63-1.087-.182-3.058-1.179-4.576-2.674-1.036-1.02-2.65-1.042-4.87-.86Z" fill="none"/>
    </svg>
  );
}
