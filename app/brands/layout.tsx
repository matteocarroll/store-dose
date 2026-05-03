export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body {
          overflow: auto !important;
          height: auto !important;
        }
      `}</style>
      {children}
    </>
  )
}
