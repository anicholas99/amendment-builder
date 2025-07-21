import React from 'react';

/**
 * PiUserEditContrast icon from the contrast style in users category.
 */
interface PiUserEditContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserEditContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'user-edit icon',
  ...props
}: PiUserEditContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none" stroke="currentColor"/><path d="M8 15a4 4 0 0 0-4 4 2 2 0 0 0 2 2h4v-1.176q0-.05.002-.099l.002-.068c.006-.253.02-.773.157-1.29a4.5 4.5 0 0 1 .536-1.238c.284-.453.655-.819.835-.996l.048-.049.336-.336V15z" fill="none" stroke="currentColor"/><path d="M13.06 19.134c-.043.165-.049.34-.06.69v1.18h1.168c.363-.003.545-.004.716-.046a1.5 1.5 0 0 0 .43-.179c.15-.092.278-.22.535-.478l5.918-5.918a.94.94 0 0 0 .122-1.18l-.02-.03a3.6 3.6 0 0 0-1.074-1.063.9.9 0 0 0-1.12.123l-5.973 5.973c-.248.247-.372.371-.462.515a1.5 1.5 0 0 0-.18.413Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.247 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h3m7-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-3.078 14 1.206-.008c.364-.002.546-.003.717-.045q.228-.056.43-.18c.15-.092.278-.22.535-.478l5.918-5.917a.94.94 0 0 0 .122-1.18l-.02-.03a3.6 3.6 0 0 0-1.074-1.063.9.9 0 0 0-1.12.122l-5.973 5.973c-.248.248-.372.372-.462.516q-.12.193-.18.412c-.043.165-.049.34-.06.69z" fill="none"/>
    </svg>
  );
}
