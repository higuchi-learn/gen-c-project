interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
    <label style={{ fontSize: '14px', color: '#666' }}>{label}</label>
    <input
      {...props}
      style={{
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #ddd',
        fontSize: '16px',
      }}
    />
  </div>
);
