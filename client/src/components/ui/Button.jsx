export default function Button({ variant = 'primary', className = '', children, ...rest }) {
  const base =
    variant === 'primary' ? 'btn-primary' :
    variant === 'secondary' ? 'btn-secondary' :
    variant === 'dark' ? 'btn-dark' :
    'btn-ghost';
  return <button className={`${base} ${className}`} {...rest}>{children}</button>;
}