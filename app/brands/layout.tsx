export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body {
          overflow: auto !important;
          height: auto !important;
        }
        details summary::-webkit-details-marker { display: none; }
        details summary { user-select: none; }
        details summary:hover .store-name-text { text-decoration: underline; }
        details[open] { border-color: #d0d0d0 !important; }
      `}</style>
      {children}
    </>
  )
}
