import React from 'react';

/**
 * PiBedDuoSolid icon from the duo-solid style in building category.
 */
interface PiBedDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBedDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'bed icon',
  ...props
}: PiBedDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M17 11c.684 0 1.257-.001 1.724.037.478.04.933.125 1.365.345l.241.135a3.5 3.5 0 0 1 1.288 1.394l.077.163c.164.383.234.784.268 1.202C22 14.743 22 15.316 22 16v4a1 1 0 1 1-2 0v-1H4v1a1 1 0 1 1-2 0v-4c0-.684-.001-1.257.037-1.724.04-.478.125-.933.345-1.365l.135-.241a3.5 3.5 0 0 1 1.394-1.288l.163-.077c.383-.164.784-.234 1.202-.268C5.743 11 6.316 11 7 11z"/><path fill={color || "currentColor"} d="M16 5c.452 0 .841 0 1.162.021.33.023.66.073.986.208l.268.126a3 3 0 0 1 1.355 1.497l.086.245c.072.246.105.493.122.74C20 8.16 20 8.548 20 9a1 1 0 1 1-2 0c0-.48 0-.79-.017-1.026a2 2 0 0 0-.029-.248l-.03-.109a1 1 0 0 0-.452-.499l-.09-.042c-.04-.017-.128-.044-.356-.06A17 17 0 0 0 16 7h-3v2l-.005.103a1 1 0 0 1-1.99 0L11 9V7H8c-.48 0-.79 0-1.026.017a2 2 0 0 0-.248.029l-.109.03a1 1 0 0 0-.499.452l-.042.09c-.017.04-.044.128-.06.356C6 8.21 6 8.52 6 9a1 1 0 1 1-2 0c0-.452 0-.841.021-1.162.023-.33.073-.66.208-.986l.126-.268a3 3 0 0 1 1.497-1.355l.245-.086c.246-.072.493-.105.74-.122C7.16 5 7.548 5 8 5z" opacity=".28"/>
    </svg>
  );
}
