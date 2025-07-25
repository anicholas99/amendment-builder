import React from 'react';

/**
 * PiNftRemoveContrast icon from the contrast style in web3-&-crypto category.
 */
interface PiNftRemoveContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftRemoveContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-remove icon',
  ...props
}: PiNftRemoveContrastProps): JSX.Element {
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
      <path fill="currentColor" d="m5.113 6.292-1.454 2.6c-.635 1.134-.952 1.702-1.076 2.302-.11.532-.11 1.08 0 1.612.124.6.441 1.168 1.076 2.302l1.454 2.6c.67 1.198 1.005 1.797 1.482 2.234.422.385.921.677 1.466.856a3.8 3.8 0 0 0 .907.167c0-.905 0-1.363.035-1.75.383-4.35 3.857-7.8 8.238-8.18.394-.035.861-.035 1.796-.035h2.322c-.15-.519-.457-1.067-1.005-2.045l-1.49-2.663c-.67-1.198-1.004-1.797-1.481-2.233a4 4 0 0 0-1.466-.857C15.302 3 14.612 3 13.232 3h-2.486c-1.38 0-2.07 0-2.685.202a4 4 0 0 0-1.466.857c-.477.436-.812 1.035-1.482 2.233Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.523 21h-.777c-.773 0-1.33 0-1.778-.035M21.36 11h-2.322c-.935 0-1.402 0-1.796.034-4.381.38-7.855 3.83-8.238 8.182-.034.386-.035.843-.035 1.749M21.36 11c-.15-.519-.458-1.067-1.005-2.045l-1.49-2.663c-.67-1.198-1.004-1.797-1.481-2.233a4 4 0 0 0-1.466-.857C15.302 3 14.612 3 13.232 3h-2.486c-1.38 0-2.07 0-2.685.202a4 4 0 0 0-1.466.857c-.477.436-.812 1.035-1.482 2.233l-1.454 2.6c-.635 1.134-.952 1.702-1.076 2.302-.11.532-.11 1.08 0 1.612.124.6.441 1.168 1.076 2.302l1.454 2.6c.67 1.198 1.005 1.797 1.482 2.234.422.385.921.677 1.466.856a3.8 3.8 0 0 0 .907.167M21.36 11q.032.107.054.213c.111.522.116 1.06.014 1.585-.115.591-.417 1.153-1.02 2.276l-.027.051M15 19h6M8.968 10a1.003 1.003 0 0 1-1.007-1c0-.552.451-1 1.007-1s1.007.448 1.007 1-.45 1-1.007 1Z" fill="none"/>
    </svg>
  );
}
