import React from 'react';

/**
 * PiGiftDefaultDuoSolid icon from the duo-solid style in general category.
 */
interface PiGiftDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGiftDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'gift-default icon',
  ...props
}: PiGiftDefaultDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M11 14H4a1 1 0 0 0-1 1v2.241c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C7.29 23 7.954 23 8.758 23H11z"/><path fill={color || "currentColor"} d="M13 23v-9h7a1 1 0 0 1 1 1v2.241c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044z"/></g><path fill={color || "currentColor"} d="M6 5.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 17.663 7H20.5a2.5 2.5 0 0 1 0 5H13V7h1.5A1.5 1.5 0 1 0 13 5.5V7h-2V5.5A1.5 1.5 0 1 0 9.5 7H11v5H3.5a2.5 2.5 0 0 1 0-5h2.837A3.5 3.5 0 0 1 6 5.5Z"/>
    </svg>
  );
}
