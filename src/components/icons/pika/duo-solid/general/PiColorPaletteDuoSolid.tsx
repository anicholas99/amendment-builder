import React from 'react';

/**
 * PiColorPaletteDuoSolid icon from the duo-solid style in general category.
 */
interface PiColorPaletteDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiColorPaletteDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'color-palette icon',
  ...props
}: PiColorPaletteDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12.536 1.515c-5.772-.307-10.742 4.16-11.05 9.932s4.16 10.742 9.933 11.05c1.148.06 2.024-.614 2.426-1.462.424-.892.339-2.064-.339-2.816-.152-.168-.156-.565.083-.78.11-.098.32-.182.784-.175.516.008 1.026.108 1.54.135 3.448.184 6.422-2.488 6.606-5.936v-.006c.25-5.238-4.36-9.643-9.983-9.942Z" opacity=".28"/><path fill={color || "currentColor"} d="M10.249 7.263a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/><path fill={color || "currentColor"} d="M5.479 11a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/><path fill={color || "currentColor"} d="M16.723 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
    </svg>
  );
}
