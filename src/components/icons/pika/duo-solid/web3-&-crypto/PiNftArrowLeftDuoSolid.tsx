import React from 'react';

/**
 * PiNftArrowLeftDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiNftArrowLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftArrowLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-arrow-left icon',
  ...props
}: PiNftArrowLeftDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.394 2c1.223 0 2.065 0 2.835.252a5 5 0 0 1 1.83 1.069c.597.547 1.006 1.28 1.6 2.341l1.627 2.91c.492.88.85 1.519 1.034 2.148q.04.143.071.285c.14.654.145 1.328.018 1.984-.145.743-.515 1.43-1.049 2.425l-.4.745a3 3 0 0 0-.96-.157h-.62a3 3 0 0 0-4.77-1.971 16 16 0 0 0-2.806 2.702 3.6 3.6 0 0 0 0 4.537q.303.375.629.73h-1.727c-.739 0-1.329 0-1.817-.039a4.8 4.8 0 0 1-1.14-.213 5 5 0 0 1-1.83-1.069c-.597-.547-1.006-1.28-1.6-2.34l-1.608-2.877c-.562-1.004-.951-1.7-1.108-2.453a5 5 0 0 1 0-2.017c.157-.755.546-1.45 1.108-2.454L4.32 5.662c.593-1.061 1.002-1.794 1.6-2.341a5 5 0 0 1 1.83-1.07C8.518 2 9.36 2 10.583 2z" opacity=".28"/><path fill={color || "currentColor"} d="M6.96 9c0-1.111.906-2 2.008-2s2.007.889 2.007 2-.905 2-2.007 2A2.003 2.003 0 0 1 6.96 9Z"/><path fill={color || "currentColor"} d="M19.79 10h-.817c-.875 0-1.382 0-1.82.038-4.86.422-8.72 4.25-9.147 9.09a9 9 0 0 0-.03.558q.192.095.396.162c.428.14.925.152 2.374.152h.395a3.61 3.61 0 0 1 .663-3.267 16 16 0 0 1 2.805-2.703 3 3 0 0 1 4.563 1.23l.354-.659c.633-1.18.84-1.586.919-1.994a3 3 0 0 0-.01-1.186c-.071-.334-.228-.666-.644-1.421Z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M17.21 15.83a1 1 0 0 1-.2 1.4q-.485.364-.927.771H20a1 1 0 1 1 0 2h-3.917q.443.41.926.772a1 1 0 0 1-1.2 1.6 14 14 0 0 1-2.451-2.362 1.6 1.6 0 0 1 0-2.02 14 14 0 0 1 2.451-2.36 1 1 0 0 1 1.4.2Z" clipRule="evenodd"/>
    </svg>
  );
}
