import React from 'react';

/**
 * PiPiggyBankContrast icon from the contrast style in money-&-payments category.
 */
interface PiPiggyBankContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiggyBankContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'piggy-bank icon',
  ...props
}: PiPiggyBankContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M19.003 8.114c.375.365.724.755.848 1.36.144.694 1.085.498 1.624.498.29 0 .525.224.525.501v3.009c0 1.13-4.2 1.184-4.2 2.817 0 .937.576 3.701-1.05 3.701h-1.451c-.918 0-1.22-1.089-1.554-1.728-.3-.571-3.141-.571-3.44 0C9.97 18.912 9.669 20 8.75 20H7.3c-1.544 0-1.05-2.394-1.05-3.302a.52.52 0 0 0-.155-.36C.74 10.961 7.555 3.363 15.14 6.698c.296.13.674.001.872-.245.454-.562 1.316-1.255 2.316-1.445.285-.054.522.174.522.451 0 .626-.351 2.164.153 2.655Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 10c0 1.103.945 2.005 2.1 2.005h1.084M16 11h.01M4.184 12.005c-.03 1.443.544 2.96 1.911 4.333a.52.52 0 0 1 .155.36C6.25 17.606 5.756 20 7.3 20h1.45c.919 0 1.22-1.088 1.555-1.728.299-.571 3.141-.571 3.44 0 .335.639.636 1.728 1.554 1.728h1.451c1.626 0 1.05-2.764 1.05-3.701 0-1.633 4.2-1.687 4.2-2.817v-3.009a.513.513 0 0 0-.525-.501c-.539 0-1.48.196-1.624-.498-.124-.605-.473-.995-.848-1.36-.504-.491-.153-2.029-.153-2.655 0-.277-.237-.505-.522-.451-1 .19-1.862.883-2.316 1.445-.198.246-.576.375-.872.245C9.491 4.214 4.27 7.794 4.184 12.005Z" fill="none"/>
    </svg>
  );
}
