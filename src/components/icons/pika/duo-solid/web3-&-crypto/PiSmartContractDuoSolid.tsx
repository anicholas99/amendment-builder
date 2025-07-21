import React from 'react';

/**
 * PiSmartContractDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiSmartContractDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSmartContractDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'smart-contract icon',
  ...props
}: PiSmartContractDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.357 2h5.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961C22 7.4 22 8.273 22 9.357v4.976l-.36-.48a12 12 0 0 0-.651-.817c-.265-.295-.764-.796-1.54-1.097a4 4 0 0 0-2.899 0c-.776.301-1.274.802-1.539 1.097a12 12 0 0 0-.651.818l-1.04 1.386-.036.047c-.164.21-.687.878-.902 1.695a4 4 0 0 0 0 2.036c.215.817.738 1.485.902 1.695l.036.047.93 1.24H9.357c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C2 16.6 2 15.727 2 14.643V9.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 4.73 2.544c.592-.302 1.233-.428 1.961-.487C7.4 2 8.273 2 9.357 2Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M7 8a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm10.275 1.803a2 2 0 0 1 1.45 0c.347.135.594.367.777.57.172.192.358.44.555.703l1.023 1.364.055.073c.198.262.447.59.55.978a2 2 0 0 1 0 1.018c-.103.387-.351.716-.55.978l-.055.073-1.023 1.363c-.197.264-.383.512-.555.703-.183.204-.43.436-.777.571a2 2 0 0 1-1.45 0c-.347-.135-.594-.367-.777-.57-.172-.192-.358-.44-.555-.704L14.92 19.56l-.055-.073c-.199-.262-.447-.59-.55-.978a2 2 0 0 1 0-1.018c.103-.387.351-.716.55-.978l.055-.073 1.023-1.364c.197-.263.383-.511.555-.703.183-.203.43-.435.777-.57Z" clipRule="evenodd"/>
    </svg>
  );
}
