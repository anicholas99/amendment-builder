import React from 'react';

/**
 * PiBallCricketDuoSolid icon from the duo-solid style in sports category.
 */
interface PiBallCricketDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBallCricketDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ball-cricket icon',
  ...props
}: PiBallCricketDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M14.627 2.196C9.213.745 3.647 3.958 2.196 9.373s1.762 10.98 7.177 12.431c1.124.301 2.257.402 3.359.322 4.191-.303 7.923-3.209 9.072-7.5 1.451-5.414-1.762-10.98-7.177-12.43Z" opacity=".28"/><path fill={color || "currentColor"} d="M17.934 5.308a1 1 0 1 0-1.931-.518l-.26.966a1 1 0 1 0 1.933.518z"/><path fill={color || "currentColor"} d="M16.9 9.172a1 1 0 0 0-1.933-.518l-.258.966a1 1 0 1 0 1.931.518z"/><path fill={color || "currentColor"} d="M15.864 13.035a1 1 0 0 0-1.932-.517l-.259.966a1 1 0 1 0 1.932.517z"/><path fill={color || "currentColor"} d="M14.829 16.9a1 1 0 0 0-1.932-.519l-.26.966a1 1 0 0 0 1.933.518z"/><path fill={color || "currentColor"} d="M13.793 20.763a1 1 0 1 0-1.931-.518l-.26.966a1 1 0 0 0 .234.94q.781.012 1.541-.092a1 1 0 0 0 .157-.33z"/><path fill={color || "currentColor"} d="m10.352 22.016 5.229-19.514a10.3 10.3 0 0 0-1.932-.518L8.42 21.5a10.3 10.3 0 0 0 1.932.517Z"/><path fill={color || "currentColor"} d="M7.491 21.096a1 1 0 0 0-1.605-.991q.747.566 1.605.99Z"/><path fill={color || "currentColor"} d="m12.644 1.869-.246.92a1 1 0 1 1-1.932-.518l.086-.32a10 10 0 0 1 2.092-.082Z"/><path fill={color || "currentColor"} d="M10.914 4.462a1 1 0 0 1 .707 1.225l-.259.966a1 1 0 1 1-1.931-.518l.258-.966a1 1 0 0 1 1.225-.707Z"/><path fill={color || "currentColor"} d="M9.879 8.326a1 1 0 0 1 .707 1.225l-.259.966a1 1 0 1 1-1.932-.518l.26-.966a1 1 0 0 1 1.224-.707Z"/><path fill={color || "currentColor"} d="M8.844 12.19a1 1 0 0 1 .707 1.224l-.26.966a1 1 0 1 1-1.931-.517l.259-.966a1 1 0 0 1 1.225-.707Z"/><path fill={color || "currentColor"} d="M7.808 16.053a1 1 0 0 1 .707 1.225l-.258.966a1 1 0 1 1-1.932-.518l.259-.966a1 1 0 0 1 1.224-.707Z"/>
    </svg>
  );
}
