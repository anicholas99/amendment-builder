import React from 'react';

/**
 * PiCloudArrowDownloadContrast icon from the contrast style in development category.
 */
interface PiCloudArrowDownloadContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudArrowDownloadContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-arrow-download icon',
  ...props
}: PiCloudArrowDownloadContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12.5 2a7.5 7.5 0 0 1 6.627 3.986 44 44 0 0 0 .347.64l-.003-.005.007.01a.4.4 0 0 0 .067.068l.125.09c.116.082.278.193.506.35A6.5 6.5 0 0 1 16.5 19h-10A5.5 5.5 0 0 1 3.609 8.82c.475-.294.824-.51 1.068-.664a11 11 0 0 0 .325-.215.3.3 0 0 0 .046-.055l.004-.005.02-.041c.023-.051.055-.124.099-.228.082-.198.193-.473.344-.848A7.5 7.5 0 0 1 12.5 2Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.51 6.97a6.502 6.502 0 0 1 11.734-.515c.237.446.355.668.42.756.1.136.067.1.191.215.08.073.305.228.755.537A5.5 5.5 0 0 1 22 12.5c0 1.33-.472 2.55-1.257 3.5M6.51 6.97l-.046.11m.046-.11-.045.108v.002m0 0A6.5 6.5 0 0 0 6 9.5m.465-2.42c-.322.803-.483 1.204-.561 1.325-.152.235-.038.1-.244.29-.106.097-.579.39-1.525.976A4.497 4.497 0 0 0 2.758 16M16 17.596a19 19 0 0 1-3.445 3.232.94.94 0 0 1-1.11 0A19 19 0 0 1 8 17.596m4-5.37V21" fill="none"/>
    </svg>
  );
}
