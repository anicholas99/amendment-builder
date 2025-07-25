import React from 'react';

/**
 * PiPencilScaleCrossContrast icon from the contrast style in editing category.
 */
interface PiPencilScaleCrossContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilScaleCrossContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-scale-cross icon',
  ...props
}: PiPencilScaleCrossContrastProps): JSX.Element {
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
      <path fill="currentColor" d="m20.054 5.799-1.853-1.853c-.798-.799-1.198-1.198-1.658-1.347a2 2 0 0 0-1.246 0c-.46.15-.86.548-1.658 1.347L10.676 6.91 7.528 3.748c-.276-.277-.413-.415-.574-.514a1.6 1.6 0 0 0-.46-.19C6.31 2.998 6.116 3 5.726 3L3 3.004l.066 2.68c.01.378.014.566.06.743a1.6 1.6 0 0 0 .19.445c.095.155.228.288.494.555l3.167 3.181-3.031 3.031c-.799.799-1.198 1.198-1.347 1.658a2 2 0 0 0 0 1.246c.15.46.548.86 1.347 1.658l1.853 1.853c.798.799 1.198 1.198 1.658 1.347.405.132.84.132 1.246 0 .46-.15.86-.548 1.658-1.347l3.017-3.017 3.484 3.5a1.57 1.57 0 0 0 1.965.212 6.3 6.3 0 0 0 1.932-1.965 1.6 1.6 0 0 0-.197-1.944l-.06-.062-3.426-3.44 2.978-2.977c.799-.799 1.198-1.198 1.347-1.658a2 2 0 0 0 0-1.246c-.15-.46-.548-.86-1.347-1.658Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4.516 13.07 2.851 2.85m-2.851-2.85-.57.57c-.799.798-1.198 1.197-1.347 1.657a2 2 0 0 0 0 1.246c.15.46.548.86 1.347 1.658l1.853 1.853c.798.799 1.198 1.198 1.658 1.347.405.132.84.132 1.246 0 .46-.15.86-.548 1.658-1.347l3.017-3.017M4.516 13.07l2.461-2.46m6.092-6.093 2.138 2.138M13.07 4.516l-2.393 2.393m2.393-2.393.57-.57c.799-.799 1.198-1.198 1.658-1.347a2 2 0 0 1 1.246 0c.46.15.86.548 1.658 1.347l1.853 1.853c.799.798 1.198 1.198 1.347 1.658.132.405.132.84 0 1.246-.15.46-.548.86-1.347 1.658l-2.977 2.977m0 0 3.424 3.44.061.062a1.6 1.6 0 0 1 .15 2.017l-.034.052a6.3 6.3 0 0 1-1.852 1.84 1.57 1.57 0 0 1-1.964-.212l-3.484-3.5m3.698-3.699-6.4-6.429m0 0L7.528 3.748c-.275-.277-.413-.415-.574-.514a1.6 1.6 0 0 0-.46-.19C6.31 2.998 6.116 3 5.726 3L3 3.004l.066 2.68c.01.378.014.566.06.743a1.6 1.6 0 0 0 .19.445c.096.155.228.288.494.555l3.167 3.181m0 0 6.4 6.43" fill="none"/>
    </svg>
  );
}
