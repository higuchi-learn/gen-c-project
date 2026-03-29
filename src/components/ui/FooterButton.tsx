type ButtonVariant = 'default' | 'active';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const FooterButton = ({ variant = 'default', style, ...props }: ButtonProps) => {
  const color = variant === 'default' ? '#888' : '#000'; // 灰 / 黒
  return (
    <button
      {...props}
      style={{
        backgroundColor: '#fff',
        color: color,
        border: 'none',
        borderRadius: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '120px',
        height: '70px',
        fontSize: '16px',
        flexDirection: 'column',
        ...style,
      }}
    />
  );
};
