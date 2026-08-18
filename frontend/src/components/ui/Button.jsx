import { forwardRef } from 'react';
import { cx } from './utils.js';

const Button = forwardRef(function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  className,
  children,
  type,
  ...props
}, ref) {
  const buttonType = Component === 'button' ? type || 'button' : type;

  return (
    <Component
      ref={ref}
      type={buttonType}
      data-variant={variant}
      data-size={size}
      className={cx('pg-button', iconOnly && 'pg-icon-button', className)}
      {...props}
    >
      <span className="pg-button-content">
        {icon}
        {!iconOnly && children}
      </span>
    </Component>
  );
});

export default Button;
