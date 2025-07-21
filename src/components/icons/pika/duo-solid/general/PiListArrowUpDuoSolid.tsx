import React from 'react';

/**
 * PiListArrowUpDuoSolid icon from the duo-solid style in general category.
 */
interface PiListArrowUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListArrowUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-arrow-up icon',
  ...props
}: PiListArrowUpDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 11a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 17a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z"/></g><path fill={color || "currentColor"} d="M19 10.5c-.38 0-.76.127-1.073.38a16 16 0 0 0-2.727 2.831 1 1 0 0 0 .9 1.595q.46-.047.884-.098c.35-.04.686-.08 1.016-.11v3.9a1 1 0 1 0 2 0v-3.9c.33.03.666.07 1.015.11q.424.051.885.098a1 1 0 0 0 .9-1.594 16 16 0 0 0-2.727-2.831A1.7 1.7 0 0 0 19 10.5Z"/>
    </svg>
  );
}
