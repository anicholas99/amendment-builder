import React from 'react';

/**
 * PiFingerprintScanDuoStroke icon from the duo-stroke style in security category.
 */
interface PiFingerprintScanDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFingerprintScanDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'fingerprint-scan icon',
  ...props
}: PiFingerprintScanDuoStrokeProps): JSX.Element {
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
      <path fill="none" d="m5.45 20.519-.454.89h0zM3.48 18.55l.891-.454zm17.038 0 .89.454v0zm-1.968 1.97.454.89zm0-17.038-.454.891zm1.97 1.968.89-.454v0zM5.449 3.48l.455.891h0zM3.482 5.45l.891.454v0zM22 15.623a1 1 0 1 0-2-.038zM15.585 20a1 1 0 0 0 .038 2zM20 8.415a1 1 0 0 0 2-.038zM15.623 2a1 1 0 1 0-.038 2zM8.415 4a1 1 0 0 0-.038-2zM4 15.585a1 1 0 0 0-2 .038zM2 8.377a1 1 0 0 0 2 .038zM8.377 22a1 1 0 1 0 .038-2zM5.45 20.519l.454-.891a3.5 3.5 0 0 1-1.532-1.532l-.89.454-.892.454a5.5 5.5 0 0 0 2.406 2.406zm15.069-1.969-.891-.454a3.5 3.5 0 0 1-1.532 1.532l.454.89.454.892a5.5 5.5 0 0 0 2.406-2.406zM18.55 3.481l-.454.891a3.5 3.5 0 0 1 1.532 1.532l.89-.454.892-.454a5.5 5.5 0 0 0-2.406-2.406zm-13.1 0-.454-.89A5.5 5.5 0 0 0 2.59 4.995l.891.454.891.454a3.5 3.5 0 0 1 1.532-1.532zM21 15.604l-1-.02c-.026 1.392-.13 2.037-.372 2.512l.89.454.892.454c.472-.927.563-1.998.59-3.38zM15.604 21l.02 1c1.382-.027 2.453-.118 3.38-.59l-.454-.891-.454-.891c-.475.242-1.12.346-2.511.372zM21 8.396l1-.02c-.027-1.382-.118-2.453-.59-3.38l-.891.454-.891.454c.242.475.346 1.12.372 2.511zM15.604 3l-.02 1c1.392.026 2.037.13 2.512.372l.454-.89.454-.892c-.927-.472-1.998-.563-3.38-.59zM8.396 3l-.02-1c-1.382.027-2.453.118-3.38.59l.454.891.454.891c.475-.242 1.12-.346 2.511-.372zM3 15.604l-1 .02c.027 1.382.118 2.453.59 3.38l.891-.454.891-.454c-.242-.475-.346-1.12-.372-2.511zm0-7.208 1 .02c.026-1.392.13-2.037.372-2.512l-.89-.454-.892-.454c-.472.927-.563 1.998-.59 3.38zM8.396 21l.02-1c-1.392-.026-2.037-.13-2.512-.372l-.454.89-.454.892c.927.472 1.998.563 3.38.59z" opacity=".28"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16.5V15m0-4v.5m4-.5v3.5m-8 0V13m6-5.465A4 4 0 0 0 8.535 9" fill="none"/>
    </svg>
  );
}
