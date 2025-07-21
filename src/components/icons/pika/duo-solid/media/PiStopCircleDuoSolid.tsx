import React from 'react';

/**
 * PiStopCircleDuoSolid icon from the duo-solid style in media category.
 */
interface PiStopCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStopCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'stop-circle icon',
  ...props
}: PiStopCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M10.574 8.25h2.852c.258 0 .494 0 .692.016.213.018.446.057.676.175.33.168.598.435.765.765.118.23.158.463.175.676.016.198.016.434.016.692v2.852c0 .258 0 .494-.016.692a1.8 1.8 0 0 1-.175.676 1.75 1.75 0 0 1-.764.765c-.23.118-.464.158-.677.175-.198.016-.434.016-.692.016h-2.852c-.258 0-.494 0-.692-.016a1.8 1.8 0 0 1-.676-.175 1.75 1.75 0 0 1-.765-.764 1.8 1.8 0 0 1-.175-.677 9 9 0 0 1-.016-.692v-2.852c0-.258 0-.494.016-.692a1.8 1.8 0 0 1 .175-.676 1.75 1.75 0 0 1 .765-.765 1.8 1.8 0 0 1 .676-.175c.198-.016.434-.016.692-.016Z" clipRule="evenodd"/>
    </svg>
  );
}
