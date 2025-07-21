import React from 'react';

/**
 * PiExchangeDuoSolid icon from the duo-solid style in general category.
 */
interface PiExchangeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiExchangeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'exchange icon',
  ...props
}: PiExchangeDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M18 3a1 1 0 1 0-2 0v4.407c-.332-.03-.668-.07-1.02-.113q-.42-.052-.877-.1a1 1 0 0 0-.903 1.594 16 16 0 0 0 2.727 2.831 1.7 1.7 0 0 0 2.146 0A16 16 0 0 0 20.8 8.788a1 1 0 0 0-.903-1.595q-.457.05-.877.1a33 33 0 0 1-1.02.114zM7 12c-.38 0-.76.127-1.073.38A16 16 0 0 0 3.2 15.21a1 1 0 0 0 .903 1.595q.457-.05.877-.1c.352-.043.688-.083 1.02-.113V21a1 1 0 1 0 2 0v-4.407c.332.03.668.07 1.02.112q.419.052.877.1a1 1 0 0 0 .903-1.594 16 16 0 0 0-2.727-2.831A1.7 1.7 0 0 0 7 12Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M2.85 6a4.15 4.15 0 1 1 8.3 0 4.15 4.15 0 0 1-8.3 0Z"/><path fill={color || "currentColor"} d="M12.85 18a4.15 4.15 0 1 1 8.3 0 4.15 4.15 0 0 1-8.3 0Z"/>
    </svg>
  );
}
