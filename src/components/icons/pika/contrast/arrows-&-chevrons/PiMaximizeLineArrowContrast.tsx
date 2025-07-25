import React from 'react';

/**
 * PiMaximizeLineArrowContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiMaximizeLineArrowContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMaximizeLineArrowContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'maximize-line-arrow icon',
  ...props
}: PiMaximizeLineArrowContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M19.916 4.647a20.6 20.6 0 0 1-.2 5.296L18.29 8.28a24 24 0 0 0-2.567-2.566L14.06 4.286a20.6 20.6 0 0 1 5.296-.2.62.62 0 0 1 .56.56Z" fill="none" stroke="currentColor"/><path d="M4.086 19.353a20.6 20.6 0 0 1 .2-5.296l1.428 1.663c.79.919 1.647 1.777 2.566 2.566l1.663 1.428a20.6 20.6 0 0 1-5.296.2.62.62 0 0 1-.56-.56Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.949 17.052a24 24 0 0 1-1.235-1.332l-1.428-1.663a20.6 20.6 0 0 0-.2 5.296.62.62 0 0 0 .56.56c1.755.163 3.535.096 5.297-.199L8.28 18.286q-.69-.592-1.331-1.235Zm0 0L17.053 6.947m0 0q.642.643 1.236 1.333l1.428 1.663a20.6 20.6 0 0 0 .2-5.296.62.62 0 0 0-.56-.56 20.6 20.6 0 0 0-5.297.199l1.662 1.428q.69.592 1.33 1.233Z" fill="none"/>
    </svg>
  );
}
