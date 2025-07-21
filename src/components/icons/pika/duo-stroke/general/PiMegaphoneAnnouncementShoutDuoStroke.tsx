import React from 'react';

/**
 * PiMegaphoneAnnouncementShoutDuoStroke icon from the duo-stroke style in general category.
 */
interface PiMegaphoneAnnouncementShoutDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMegaphoneAnnouncementShoutDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'megaphone-announcement-shout icon',
  ...props
}: PiMegaphoneAnnouncementShoutDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.162 15.313 13.295 22H8.92l-2.116-6.044" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.321 15.608a27.4 27.4 0 0 0-8.16-.296c-1.457.166-2.906.423-4.357.644l-1.632.248a5.126 5.126 0 0 1-1.699-6.34l4.67-1.824a27.4 27.4 0 0 0 7.882-4.733m3.296 12.301q.236.137.436.086c.876-.235.825-3.263-.114-6.765-.938-3.5-2.408-6.15-3.283-5.915q-.2.056-.335.293m3.296 12.301c-.873-.504-2.052-2.86-2.847-5.83-.796-2.969-.953-5.598-.449-6.471" fill="none"/>
    </svg>
  );
}
