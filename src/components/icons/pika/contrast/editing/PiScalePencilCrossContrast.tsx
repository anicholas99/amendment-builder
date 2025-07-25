import React from 'react';

/**
 * PiScalePencilCrossContrast icon from the contrast style in editing category.
 */
interface PiScalePencilCrossContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScalePencilCrossContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'scale-pencil-cross icon',
  ...props
}: PiScalePencilCrossContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M3 3.004 5.726 3c.39 0 .585 0 .768.043q.245.06.46.191c.16.1.298.237.574.514l3.148 3.161-3.7 3.7L3.81 7.426c-.266-.267-.399-.4-.495-.555a1.6 1.6 0 0 1-.19-.445c-.045-.177-.05-.365-.06-.742z" fill="none" stroke="currentColor"/><path d="m20.501 16.778-3.425-3.44-3.698 3.7 3.484 3.499a1.57 1.57 0 0 0 1.965.212 6.3 6.3 0 0 0 1.932-1.965 1.6 1.6 0 0 0-.197-1.944z" fill="none" stroke="currentColor"/><path d="M13.64 3.946c.798-.799 1.197-1.198 1.657-1.347a2 2 0 0 1 1.246 0c.46.15.86.548 1.658 1.347l1.853 1.853c.799.798 1.198 1.198 1.347 1.658.132.405.132.84 0 1.246-.15.46-.548.86-1.347 1.658l-2.978 2.977-3.698 3.7-3.017 3.016c-.799.799-1.198 1.198-1.658 1.347a2 2 0 0 1-1.246 0c-.46-.15-.86-.548-1.658-1.347l-1.853-1.853c-.799-.798-1.198-1.198-1.347-1.658a2 2 0 0 1 0-1.246c.15-.46.548-.86 1.347-1.658l3.03-3.03 3.7-3.7z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4.516 13.07 2.851 2.85m2.851-8.553 2.851 2.851m0-5.702 2.138 2.138m-7.84 3.564 2.138 2.138m7.571.982 2.978-2.977c.799-.799 1.198-1.198 1.347-1.658a2 2 0 0 0 0-1.246c-.15-.46-.548-.86-1.347-1.658l-1.853-1.853c-.798-.799-1.198-1.198-1.658-1.347a2 2 0 0 0-1.246 0c-.46.15-.86.548-1.658 1.347l-2.963 2.963m6.4 6.43-3.698 3.698m3.698-3.699 3.425 3.44.061.062a1.6 1.6 0 0 1 .197 1.944 6.3 6.3 0 0 1-1.933 1.965 1.57 1.57 0 0 1-1.964-.212l-3.484-3.5M10.676 6.91l-3.699 3.7m3.699-3.7L7.528 3.748c-.275-.277-.413-.415-.574-.514a1.6 1.6 0 0 0-.46-.19C6.31 2.998 6.116 3 5.726 3L3 3.004l.066 2.68c.01.378.014.566.06.743a1.6 1.6 0 0 0 .19.445c.096.155.228.288.494.555l3.167 3.181m0 0L3.946 13.64c-.799.799-1.198 1.198-1.347 1.658a2 2 0 0 0 0 1.246c.15.46.548.86 1.347 1.658l1.853 1.853c.798.799 1.198 1.198 1.658 1.347.405.132.84.132 1.246 0 .46-.15.86-.548 1.658-1.347l3.017-3.017" fill="none"/>
    </svg>
  );
}
