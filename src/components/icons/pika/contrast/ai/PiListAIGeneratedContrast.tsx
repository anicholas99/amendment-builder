import React from 'react';

/**
 * PiListAIGeneratedContrast icon from the contrast style in ai category.
 */
interface PiListAIGeneratedContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListAIGeneratedContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'list-ai-generated icon',
  ...props
}: PiListAIGeneratedContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M18 13c.637 1.617 1.34 2.345 3 3-1.66.655-2.363 1.384-3 3-.637-1.616-1.34-2.345-3-3 1.66-.655 2.363-1.383 3-3Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h9.5M4 18h6M4 6h16m-6 14h.01M18 13c-.637 1.617-1.34 2.345-3 3 1.66.655 2.363 1.384 3 3 .637-1.616 1.34-2.345 3-3-1.66-.655-2.363-1.383-3-3Z" fill="none"/>
    </svg>
  );
}
