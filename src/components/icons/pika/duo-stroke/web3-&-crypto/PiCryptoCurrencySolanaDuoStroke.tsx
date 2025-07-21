import React from 'react';

/**
 * PiCryptoCurrencySolanaDuoStroke icon from the duo-stroke style in web3-&-crypto category.
 */
interface PiCryptoCurrencySolanaDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCryptoCurrencySolanaDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'crypto-currency-solana icon',
  ...props
}: PiCryptoCurrencySolanaDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.19 9.333H3m3.81 5.334H21" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.332 4H8.481c-.446 0-.67 0-.878.055q-.278.073-.52.236c-.179.122-.33.292-.631.631l-2.633 2.97c-.452.508-.677.763-.763 1.051a1.4 1.4 0 0 0 0 .78c.086.289.311.543.762 1.052l2.174 2.45c.45.509.676.763.762 1.052a1.4 1.4 0 0 1 0 .78c-.086.288-.311.543-.762 1.051l-1.338 1.509c-.669.753-1.003 1.13-1.018 1.451a.9.9 0 0 0 .31.726c.238.206.733.206 1.722.206h9.851c.446 0 .67 0 .878-.055.184-.048.36-.128.52-.236.179-.122.33-.292.631-.631l2.634-2.97c.45-.508.676-.763.762-1.051a1.4 1.4 0 0 0 0-.78c-.086-.289-.311-.543-.762-1.052l-2.173-2.45c-.452-.509-.677-.763-.763-1.052a1.4 1.4 0 0 1 0-.78c.086-.288.311-.543.763-1.051l1.337-1.509c.669-.753 1.003-1.13 1.018-1.451a.9.9 0 0 0-.31-.726C19.817 4 19.322 4 18.333 4Z" fill="none"/>
    </svg>
  );
}
