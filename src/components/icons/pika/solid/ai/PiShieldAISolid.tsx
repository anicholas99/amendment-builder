import React from 'react';

/**
 * PiShieldAISolid icon from the solid style in ai category.
 */
interface PiShieldAISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShieldAISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'shield-ai icon',
  ...props
}: PiShieldAISolidProps): JSX.Element {
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
      <path d="M12.093 11.435a5 5 0 0 0-.496-.435 4.8 4.8 0 0 0 .903-.902 4.8 4.8 0 0 0 .903.902 4.8 4.8 0 0 0-.903.902 5 5 0 0 0-.407-.467Z" fill="currentColor"/><path d="M10.544 1.427a4 4 0 0 1 2.717 0l5.465 1.974a4 4 0 0 1 2.63 3.455l.227 2.951a12 12 0 0 1-6.25 11.472l-1.488.806a4 4 0 0 1-3.886-.042l-1.52-.867A12 12 0 0 1 2.39 10.29l.127-3.309a4 4 0 0 1 2.638-3.608zm2.886 6.206a1 1 0 0 0-1.86 0c-.293.743-.566 1.19-.896 1.523s-.781.614-1.54.914a1 1 0 0 0 0 1.86c.759.3 1.21.582 1.54.914s.603.78.896 1.523a1 1 0 0 0 1.86 0c.293-.743.566-1.19.896-1.523s.781-.614 1.54-.914a1 1 0 0 0 0-1.86c-.759-.3-1.21-.582-1.54-.914s-.603-.78-.896-1.523ZM8.5 14a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z" fill="currentColor"/>
    </svg>
  );
}
