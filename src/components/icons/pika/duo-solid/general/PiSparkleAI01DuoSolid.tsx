import React from 'react';

/**
 * PiSparkleAI01DuoSolid icon from the duo-solid style in general category.
 */
interface PiSparkleAI01DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSparkleAI01DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'sparkle-ai-01 icon',
  ...props
}: PiSparkleAI01DuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M6.687 2.837a1 1 0 0 0-1.974 0c-.1.608-.32 1.015-.598 1.29-.279.277-.686.489-1.278.586a1 1 0 0 0 0 1.974c.608.1 1.015.32 1.29.598.277.279.489.686.586 1.278a1 1 0 0 0 1.974 0c.097-.592.31-1 .586-1.279s.682-.497 1.29-.597a1 1 0 0 0 0-1.974c-.608-.1-1.015-.32-1.29-.598-.277-.279-.489-.686-.586-1.278Z"/><path fill={color || "currentColor"} d="M6 17.65a1 1 0 1 0-2 0V18h-.35a1 1 0 1 0 0 2H4v.35a1 1 0 1 0 2 0V20h.35a1 1 0 1 0 0-2H6z"/></g><path fill={color || "currentColor"} d="M13.892 2.874a1 1 0 0 0-1.984 0c-.322 2.534-1.006 4.36-2.118 5.642-1.098 1.265-2.714 2.115-5.145 2.496a1 1 0 0 0 0 1.976c2.431.381 4.047 1.231 5.145 2.496 1.112 1.281 1.796 3.108 2.118 5.642a1 1 0 0 0 1.984 0c.322-2.534 1.006-4.36 2.118-5.642 1.098-1.265 2.714-2.115 5.145-2.496a1 1 0 0 0 0-1.976c-2.564-.402-4.181-1.306-5.248-2.585-1.086-1.304-1.706-3.12-2.015-5.553Z"/>
    </svg>
  );
}
