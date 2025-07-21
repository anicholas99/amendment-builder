import React from 'react';

/**
 * PiArrowBigDownDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowBigDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-down icon',
  ...props
}: PiArrowBigDownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M19.803 14.791a1 1 0 0 0-.92-1.588c-4.574.53-9.194.53-13.77 0a1 1 0 0 0-.92 1.588 36.3 36.3 0 0 0 6.487 6.744 2.11 2.11 0 0 0 2.637 0 36.3 36.3 0 0 0 6.486-6.744Z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M15.999 4.601V4.57c0-.252 0-.498-.017-.706a2 2 0 0 0-.201-.77 2 2 0 0 0-.874-.874 2 2 0 0 0-.77-.2C13.929 2 13.683 2 13.431 2h-2.864c-.252 0-.498 0-.706.017a2 2 0 0 0-.77.201 2 2 0 0 0-.874.874 2 2 0 0 0-.201.77c-.017.208-.017.454-.017.706v9.959a1 1 0 0 0 .95 1q3.05.15 6.1 0a1 1 0 0 0 .95-1z" clipRule="evenodd" opacity=".28"/>
    </svg>
  );
}
