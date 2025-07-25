import React from 'react';

/**
 * PiNotebookContrast icon from the contrast style in general category.
 */
interface PiNotebookContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotebookContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'notebook icon',
  ...props
}: PiNotebookContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2 20.566v-15.5c2.995-1.71 6.975-1.1 10 0 3.025-1.1 7.005-1.71 10 0v15.5c-3.197-1.37-7.063-.401-10 .934-2.937-1.335-6.803-2.304-10-.934Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.5V5.066M12 21.5c2.937-1.335 6.803-2.304 10-.934v-15.5c-2.995-1.71-6.975-1.1-10 0M12 21.5c-2.937-1.335-6.803-2.304-10-.934v-15.5c2.995-1.71 6.975-1.1 10 0" fill="none"/>
    </svg>
  );
}
