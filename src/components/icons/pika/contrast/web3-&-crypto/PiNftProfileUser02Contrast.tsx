import React from 'react';

/**
 * PiNftProfileUser02Contrast icon from the contrast style in web3-&-crypto category.
 */
interface PiNftProfileUser02ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftProfileUser02Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-profile-user-02 icon',
  ...props
}: PiNftProfileUser02ContrastProps): JSX.Element {
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
      <path fill="currentColor" d="m5.113 6.292-1.454 2.6c-.635 1.134-.952 1.702-1.076 2.302-.11.532-.11 1.08 0 1.612.124.6.441 1.168 1.076 2.302l1.454 2.6c.67 1.198 1.005 1.797 1.482 2.234.422.385.921.677 1.466.856.615.202 1.305.202 2.685.202h2.544c1.36 0 2.04 0 2.648-.197a4 4 0 0 0 1.453-.836c.475-.426.813-1.012 1.49-2.183L19.91 16l.496-.926c.603-1.123.905-1.684 1.02-2.276a4 4 0 0 0-.014-1.585c-.125-.59-.436-1.146-1.059-2.258l-1.49-2.663c-.67-1.198-1.004-1.797-1.481-2.233a4 4 0 0 0-1.466-.857C15.302 3 14.612 3 13.232 3h-2.486c-1.38 0-2.07 0-2.685.202a4 4 0 0 0-1.466.857c-.477.436-.812 1.035-1.482 2.233Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.022 19.255A1.5 1.5 0 0 1 6 19a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3q0 .146-.027.284m-11.951-.03c-.253-.374-.526-.862-.909-1.546l-1.454-2.6c-.635-1.134-.952-1.702-1.076-2.302a4 4 0 0 1 0-1.612c.124-.6.441-1.168 1.076-2.302l1.454-2.6c.67-1.198 1.005-1.797 1.482-2.233a4 4 0 0 1 1.466-.857C8.676 3 9.366 3 10.746 3h2.486c1.38 0 2.07 0 2.685.202.545.179 1.044.47 1.466.857.477.436.812 1.035 1.482 2.233l1.49 2.663c.622 1.112.933 1.668 1.058 2.258.111.522.116 1.06.014 1.585-.115.591-.417 1.153-1.02 2.276L19.91 16l-1.03 1.784c-.381.66-.655 1.135-.907 1.5m-11.951-.03c.19.283.368.5.573.688.422.385.921.677 1.466.856.615.202 1.305.202 2.685.202h2.544c1.36 0 2.04 0 2.648-.197a4 4 0 0 0 1.453-.836 3.8 3.8 0 0 0 .582-.683M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/>
    </svg>
  );
}
