import React from 'react';

/**
 * PiLock02CloseDuoSolid icon from the duo-solid style in security category.
 */
interface PiLock02CloseDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLock02CloseDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'lock-02-close icon',
  ...props
}: PiLock02CloseDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.759 9c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C4 13.29 4 13.954 4 14.758v1.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C8.29 22 8.954 22 9.758 22h3.483c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01v-1.483c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C14.71 9 14.046 9 13.242 9z" opacity=".28"/><path fill={color || "currentColor"} d="M11.5 2A5.5 5.5 0 0 0 6 7.5v2.036q.09-.052.184-.1c.485-.247 1.002-.346 1.564-.392L8 9.027V7.5a3.5 3.5 0 1 1 7 0v1.527q.13.007.252.017c.562.046 1.079.145 1.564.392q.093.048.184.1V7.5A5.5 5.5 0 0 0 11.5 2Z"/>
    </svg>
  );
}
