import React from 'react';

/**
 * PiReceipt01DuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiReceipt01DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiReceipt01DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'receipt-01 icon',
  ...props
}: PiReceipt01DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M7.51 2.671c-.272.078-.352.1-.427.115a2 2 0 0 1-1.007-.064c-.17-.056-.334-.135-.499-.206-.312-.134-.63-.272-.923-.317a2.3 2.3 0 0 0-2.582 1.703c-.073.286-.073.633-.072.973v10.567c0 .945 0 1.714.051 2.338.053.646.165 1.224.44 1.763a4.5 4.5 0 0 0 1.966 1.967c.54.274 1.118.386 1.763.44.625.05 1.394.05 2.338.05H19a3 3 0 0 0 3-3v-6.432c0-.252 0-.498-.017-.706a2 2 0 0 0-.2-.77 2 2 0 0 0-.875-.874 2 2 0 0 0-.77-.201 9 9 0 0 0-.706-.017H18V4.875c.001-.34.002-.687-.071-.973a2.3 2.3 0 0 0-2.583-1.703c-.292.045-.61.183-.923.317-.164.071-.328.15-.498.206a2 2 0 0 1-1.007.064 6 6 0 0 1-.428-.115l-.964-.275c-.425-.122-.747-.214-1.081-.251a4 4 0 0 0-.89 0c-.333.037-.655.13-1.08.251zM18 12.001v7a1 1 0 1 0 2 0l-.011-6.99s-1.326-.01-1.989-.01Z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h6m-6 4h6m-6 4h3"/>
    </svg>
  );
}
