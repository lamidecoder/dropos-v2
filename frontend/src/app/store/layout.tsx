export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth:"100vw", overflowX:"hidden" }}>
      {children}
    </div>
  );
}
