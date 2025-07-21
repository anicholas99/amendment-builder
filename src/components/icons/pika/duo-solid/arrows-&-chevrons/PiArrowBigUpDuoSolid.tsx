import React from 'react';

/**
 * PiArrowBigUpDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowBigUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-up icon',
  ...props
}: PiArrowBigUpDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M19.803 9.208a1 1 0 0 1-.92 1.588 59.8 59.8 0 0 0-13.77 0 1 1 0 0 1-.92-1.588 36.3 36.3 0 0 1 6.487-6.744 2.11 2.11 0 0 1 2.637 0 36.3 36.3 0 0 1 6.486 6.744Z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M15.999 19.429c0 .252 0 .498-.017.706a2 2 0 0 1-.201.77 2 2 0 0 1-.874.874c-.24.116-.503.184-.77.2-.208.02-.454.02-.706.02h-2.864c-.252 0-.498 0-.706-.017a2 2 0 0 1-.77-.201 2 2 0 0 1-.874-.874 2 2 0 0 1-.201-.77c-.017-.209-.017-.454-.017-.707V9.471a1 1 0 0 1 .95-1q3.05-.15 6.1 0a1 1 0 0 1 .95 1z" clipRule="evenodd" opacity=".28"/>
    </svg>
  );
}
