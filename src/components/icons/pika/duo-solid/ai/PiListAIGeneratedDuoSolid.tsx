import React from 'react';

/**
 * PiListAIGeneratedDuoSolid icon from the duo-solid style in ai category.
 */
interface PiListAIGeneratedDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListAIGeneratedDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-ai-generated icon',
  ...props
}: PiListAIGeneratedDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h9.5M4 18h6M4 6h16" opacity=".28"/><path fill={color || "currentColor"} d="M18.93 12.633a1 1 0 0 0-1.86 0c-.293.743-.566 1.19-.896 1.523s-.781.614-1.54.914a1 1 0 0 0 0 1.86c.759.3 1.21.582 1.54.914s.603.78.896 1.523a1 1 0 0 0 1.86 0c.293-.743.566-1.19.896-1.523s.781-.614 1.54-.914a1 1 0 0 0 0-1.86c-.759-.3-1.21-.582-1.54-.914s-.603-.78-.896-1.523Z"/><path fill={color || "currentColor"} d="M14 19a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
