import React from 'react';

/**
 * PiPlaylistAISolid icon from the solid style in ai category.
 */
interface PiPlaylistAISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaylistAISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'playlist-ai icon',
  ...props
}: PiPlaylistAISolidProps): JSX.Element {
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
      <path fillRule="evenodd" d="M7 3.001 17 3a1 1 0 1 0 0-2L7 1.001a1 1 0 0 0 0 2ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2zm1.96 4h10.08c.666 0 1.226 0 1.683.037.48.04.934.124 1.366.345a3.5 3.5 0 0 1 1.53 1.529c.22.432.305.887.344 1.366.037.457.037 1.017.037 1.683v4.08c0 .666 0 1.226-.037 1.683-.04.48-.124.934-.345 1.366a3.5 3.5 0 0 1-1.529 1.53c-.432.22-.887.305-1.366.344-.457.037-1.017.037-1.683.037H6.96c-.666 0-1.226 0-1.683-.037-.48-.04-.934-.124-1.366-.345a3.5 3.5 0 0 1-1.53-1.529c-.22-.432-.304-.887-.344-1.366C2 19.266 2 18.706 2 18.04v-4.08c0-.666 0-1.226.037-1.683.04-.48.124-.934.344-1.366a3.5 3.5 0 0 1 1.53-1.53c.432-.22.887-.305 1.366-.344C5.734 9 6.294 9 6.96 9Zm6.27 3.617a1 1 0 0 0-1.86 0c-.293.743-.566 1.191-.896 1.523s-.781.614-1.541.914a1 1 0 0 0 0 1.86c.76.3 1.212.583 1.54.914.33.332.604.78.896 1.523a1 1 0 0 0 1.861 0c.293-.742.566-1.19.896-1.523.329-.331.78-.614 1.54-.913a1 1 0 0 0 0-1.861c-.76-.3-1.211-.582-1.54-.914-.33-.332-.603-.78-.896-1.523ZM7.7 19.323a1 1 0 0 1 1-1h.001a1 1 0 1 1-1 1z" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
