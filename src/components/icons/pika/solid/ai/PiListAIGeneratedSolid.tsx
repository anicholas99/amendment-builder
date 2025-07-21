import React from 'react';

/**
 * PiListAIGeneratedSolid icon from the solid style in ai category.
 */
interface PiListAIGeneratedSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListAIGeneratedSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-ai-generated icon',
  ...props
}: PiListAIGeneratedSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M3 6a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" fill="currentColor"/><path d="M3 12a1 1 0 0 1 1-1h9.5a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" fill="currentColor"/><path d="M3 18a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" fill="currentColor"/><path d="M18 12a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 18 12Z" fill="currentColor"/><path d="M13 20a1 1 0 0 1 1-1h.001a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" fill="currentColor"/>
    </svg>
  );
}
