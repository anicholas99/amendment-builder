import React from 'react';

/**
 * PiPlaylistUploadDuoSolid icon from the duo-solid style in media category.
 */
interface PiPlaylistUploadDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaylistUploadDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'playlist-upload icon',
  ...props
}: PiPlaylistUploadDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7 3.001 17 3a1 1 0 1 0 0-2L7 1.001a1 1 0 0 0 0 2ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M6.96 9h10.08c.666 0 1.226 0 1.683.037.48.04.934.124 1.366.345a3.5 3.5 0 0 1 1.53 1.529c.22.432.305.887.344 1.366.037.457.037 1.017.037 1.683v4.08c0 .666 0 1.226-.037 1.683-.04.48-.124.934-.345 1.366a3.5 3.5 0 0 1-1.529 1.53c-.432.22-.887.305-1.366.344-.457.037-1.017.037-1.683.037H6.96c-.666 0-1.226 0-1.683-.037-.48-.04-.934-.124-1.366-.345a3.5 3.5 0 0 1-1.53-1.529c-.22-.432-.305-.887-.344-1.366C2 19.266 2 18.706 2 18.041V13.96c0-.666 0-1.226.037-1.683.04-.48.124-.934.344-1.366a3.5 3.5 0 0 1 1.53-1.53c.432-.22.887-.305 1.366-.344C5.734 9 6.295 9 6.96 9ZM13 19.02a1 1 0 0 1-2 0v-4.006q-.645.658-1.2 1.398a1 1 0 1 1-1.6-1.2 16 16 0 0 1 2.727-2.832 1.7 1.7 0 0 1 2.146 0 16 16 0 0 1 2.727 2.831 1 1 0 0 1-1.6 1.2q-.555-.739-1.2-1.397z" clipRule="evenodd"/>
    </svg>
  );
}
