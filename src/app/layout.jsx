// admin/app/layout.jsx

export const metadata = {
  title: "Admin",
  description: "Área administrativa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background:"#0f1115", color:"#eaeaea" }}>
        <nav style={{ padding: "12px 20px", borderBottom:"1px solid #222", position:"sticky", top:0, background:"#0f1115" }}>
          <strong>Admin</strong>
        </nav>
        <main style={{ padding: 20 }}>{children}</main>
      </body>
    </html>
  );
}
