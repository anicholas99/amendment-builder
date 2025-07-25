import React from 'react';

/**
 * PiArcBrowserContrast icon from the contrast style in apps-&-social category.
 */
interface PiArcBrowserContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArcBrowserContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arc-browser icon',
  ...props
}: PiArcBrowserContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M11.341 3.903c.873-.02 1.68.444 2.07 1.193l2.86 5.483a5.9 5.9 0 0 0 1.267-2.574c.248-1.169 1.437-1.924 2.656-1.687s2.008 1.376 1.76 2.545c-.485 2.298-1.767 4.32-3.558 5.789l1.212 2.321c.556 1.067.105 2.363-1.008 2.897s-2.466.1-3.023-.966l-1.143-2.192a11.3 11.3 0 0 1-3.038.416c-.862 0-1.7-.097-2.502-.28l-.86 1.867c-.501 1.09-1.831 1.585-2.97 1.104-1.138-.481-1.654-1.756-1.152-2.847l.914-1.986a10.6 10.6 0 0 1-2.46-2.549c-.68-.999-.386-2.337.657-2.988 1.042-.651 2.438-.37 3.117.63q.27.397.6.747L9.335 5.19c.353-.766 1.135-1.267 2.007-1.287Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.894 16.848c.803.183 1.64.28 2.502.28a11.2 11.2 0 0 0 3.038-.416m-5.54.136-.86 1.867c-.501 1.09-1.831 1.585-2.97 1.104-1.138-.481-1.654-1.756-1.152-2.847l.914-1.986m4.068 1.862a10.9 10.9 0 0 1-4.068-1.861m0 0a10.6 10.6 0 0 1-2.46-2.55c-.68-.999-.386-2.337.657-2.988 1.042-.651 2.438-.37 3.117.63q.27.397.6.747m0 0L9.335 5.19c.353-.766 1.135-1.267 2.007-1.287s1.68.444 2.07 1.193l2.86 5.483m-9.53.247a6.35 6.35 0 0 0 4.025 1.954m0 0a6.6 6.6 0 0 0 1.595-.04m-1.595.04.758-1.646.837 1.605m3.91-2.16a5.9 5.9 0 0 0 1.267-2.574c.248-1.169 1.437-1.924 2.656-1.687s2.008 1.376 1.76 2.545c-.485 2.298-1.767 4.32-3.558 5.789m-2.125-4.073 2.125 4.073m0 0 1.212 2.321c.556 1.067.105 2.363-1.008 2.897s-2.466.1-3.023-.966l-1.143-2.192m0 0L12.36 12.74" fill="none"/>
    </svg>
  );
}
