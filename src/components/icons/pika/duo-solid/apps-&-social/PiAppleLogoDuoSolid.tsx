import React from 'react';

/**
 * PiAppleLogoDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiAppleLogoDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAppleLogoDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'apple-logo icon',
  ...props
}: PiAppleLogoDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M19.965 9.605a5.35 5.35 0 0 0-4.174-2.185c-.966-.106-1.848.175-2.486.415-.185.069-.324.124-.448.173-.138.055-.257.103-.404.155a3 3 0 0 1-.268.084c-.056.013-.083.015-.087.016a1.2 1.2 0 0 1-.324-.079 8 8 0 0 1-.417-.155l-.291-.112c-.54-.203-1.289-.457-2.143-.403-2.767.018-5.77 2.213-5.77 6.337 0 2.166.872 4.414 1.978 6.098.557.848 1.2 1.595 1.87 2.135.636.512 1.431.946 2.274.915.82-.005 1.368-.252 1.777-.436l.058-.027c.37-.166.658-.286 1.184-.286.527 0 .815.12 1.207.29l.034.016c.441.192 1.014.443 1.899.443.735 0 1.397-.294 1.945-.67.551-.379 1.048-.881 1.477-1.406a13.5 13.5 0 0 0 1.918-3.23 1 1 0 0 0-.474-1.269c-1.297-.658-1.947-1.711-2.044-2.695-.096-.966.324-1.987 1.436-2.682a1 1 0 0 0 .273-1.442Z" opacity=".28"/><path fill={color || "currentColor"} d="M16.755 1.3c-1.954 0-3.338.566-4.22 1.536-.872.957-1.152 2.198-1.137 3.349a.7.7 0 0 0 .698.69c1.72.006 3.078-.574 4.003-1.505a4.7 4.7 0 0 0 1.356-3.378.7.7 0 0 0-.7-.692Z"/>
    </svg>
  );
}
