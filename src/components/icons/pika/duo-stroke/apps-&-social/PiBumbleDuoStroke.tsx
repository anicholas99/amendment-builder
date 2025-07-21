import React from 'react';

/**
 * PiBumbleDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiBumbleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBumbleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bumble icon',
  ...props
}: PiBumbleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.432 3H8.734c-.673 0-1.01 0-1.31.098a2 2 0 0 0-.72.416c-.236.212-.404.503-.741 1.086l-3.349 5.8c-.336.583-.504.874-.57 1.184a2 2 0 0 0 0 .832c.066.31.234.601.57 1.184l3.349 5.8c.337.583.505.874.74 1.086a2 2 0 0 0 .72.416c.302.098.638.098 1.311.098h6.698c.673 0 1.01 0 1.31-.098a2 2 0 0 0 .72-.416c.236-.212.404-.503.74-1.086l3.35-5.8c.336-.583.504-.874.57-1.184a2 2 0 0 0 0-.832c-.066-.31-.234-.601-.57-1.184l-3.35-5.8c-.336-.583-.504-.874-.74-1.086a2 2 0 0 0-.72-.416C16.442 3 16.105 3 15.432 3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.083 12h10m-7 4.045h4M9.083 8h6" fill="none"/>
    </svg>
  );
}
