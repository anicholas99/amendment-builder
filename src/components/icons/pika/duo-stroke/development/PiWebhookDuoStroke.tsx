import React from 'react';

/**
 * PiWebhookDuoStroke icon from the duo-stroke style in development category.
 */
interface PiWebhookDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWebhookDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'webhook icon',
  ...props
}: PiWebhookDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.08 10.006-4.084 7.488m10.095-3.515-4.092-7.484M9.991 17.501l8.53-.008" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.996 6.494a4 4 0 1 0-5.916 3.512m5.767 10.849a4 4 0 1 0 .244-6.876m-12.02.016a4 4 0 1 0 5.92 3.507" fill="none"/>
    </svg>
  );
}
