export const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      backgroundColor: '#f3f4f6',
      padding: '40px 30px',
      borderRadius: '24px',
      width: '320px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    }}
  >
    {children}
  </div>
);
