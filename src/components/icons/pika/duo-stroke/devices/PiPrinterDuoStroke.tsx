import React from 'react';

/**
 * PiPrinterDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiPrinterDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPrinterDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'printer icon',
  ...props
}: PiPrinterDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m17.903 6.033-.115-1.151c-.102-1.018-.152-1.527-.384-1.912a2 2 0 0 0-.86-.778C16.14 2 15.627 2 14.604 2H9.396c-1.023 0-1.535 0-1.94.192a2 2 0 0 0-.86.778c-.231.385-.282.894-.384 1.912l-.115 1.15m11.806 0C17.293 6 16.546 6 15.6 6H8.4c-.946 0-1.692 0-2.303.033m11.806 0c.836.045 1.419.151 1.913.403a4 4 0 0 1 1.748 1.748C22 9.04 22 10.16 22 12.4v.8c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311c-.552.281-1.25.32-2.505.326M6.097 6.033c-.836.045-1.419.151-1.913.403a4 4 0 0 0-1.748 1.748C2 9.04 2 10.16 2 12.4v.8c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311c.552.281 1.25.32 2.505.326m0 0-.269.942c-.297 1.038-.445 1.558-.328 1.968a1.5 1.5 0 0 0 .653.866c.363.225.903.225 1.983.225h7.636c1.08 0 1.62 0 1.984-.225a1.5 1.5 0 0 0 .652-.866c.117-.41-.031-.93-.328-1.968l-.27-.942M6.144 18l.194-.678c.238-.832.356-1.248.6-1.557a2 2 0 0 1 .815-.615C8.116 15 8.55 15 9.414 15h5.172c.865 0 1.298 0 1.662.149.32.13.602.343.816.615.243.309.361.725.6 1.557l.193.678M14 10h.01M18 10h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h.01M18 10h.01M8.182 22h7.636c1.08 0 1.62 0 1.984-.225a1.5 1.5 0 0 0 .653-.866c.116-.41-.032-.93-.329-1.968l-.463-1.62c-.238-.832-.356-1.248-.599-1.557a2 2 0 0 0-.816-.615C15.884 15 15.452 15 14.586 15H9.414c-.865 0-1.298 0-1.661.149a2 2 0 0 0-.817.615c-.242.309-.361.725-.599 1.557l-.463 1.62c-.297 1.038-.445 1.558-.328 1.968a1.5 1.5 0 0 0 .653.866c.363.225.903.225 1.983.225Z" fill="none"/>
    </svg>
  );
}
