import { cx } from './utils.js';

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  className,
  children,
  type,
  ...props
}) {
  const buttonType = Component === 'button' ? type || 'button' : type;

  return (
    <Component
      type={buttonType}
      data-variant={variant}
      data-size={size}
      className={cx('pg-button', iconOnly && 'pg-icon-button', className)}
      {...props}
    >
      {icon}
      {!iconOnly && children}
    </Component>
  );
}
