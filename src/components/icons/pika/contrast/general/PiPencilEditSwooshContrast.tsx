import React from 'react';

/**
 * PiPencilEditSwooshContrast icon from the contrast style in general category.
 */
interface PiPencilEditSwooshContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilEditSwooshContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-edit-swoosh icon',
  ...props
}: PiPencilEditSwooshContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M3.126 17.573c-.046.177-.05.365-.06.742L3 20.995 5.727 21c.39 0 .584 0 .767-.043q.246-.06.46-.191c.161-.1.299-.237.574-.514l12.973-13.03.061-.062a1.6 1.6 0 0 0 .197-1.944 6.3 6.3 0 0 0-1.932-1.965 1.57 1.57 0 0 0-1.964.212L3.81 16.573c-.266.267-.398.4-.495.555q-.128.208-.19.445Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21c4.018-3.274 4.09 3.357 9-2M3 20.995 5.727 21c.39 0 .584 0 .767-.043q.246-.06.46-.191c.161-.1.299-.237.574-.514l12.973-13.03c.53-.533.662-1.356.258-2.006a6.3 6.3 0 0 0-1.932-1.965 1.57 1.57 0 0 0-1.964.212L3.81 16.573c-.266.267-.398.4-.495.555q-.128.208-.19.445c-.045.177-.05.365-.059.742z" fill="none"/>
    </svg>
  );
}
