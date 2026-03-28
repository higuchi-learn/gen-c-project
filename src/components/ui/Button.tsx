type ButtonVariant = 'primary' | 'secondary';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = ({ variant = 'primary', style, ...props }: ButtonProps) => {
  const bg = variant === 'primary' ? '#4ade80' : '#22d3ee'; // 緑 / シアン
  return (
    <button {...props} style={{
      backgroundColor: bg, color: 'white', border: 'none', padding: '14px',
      borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', width: '100%',
      fontSize: '16px', ...style
    }} />
  );
};
