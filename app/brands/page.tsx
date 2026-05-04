export const revalidate = 3600

const DATA_URL = 'https://brand-monitor-alpha.vercel.app/brands/data.json'

interface StoreData {
  name: string
  location: string
  url: string
  updated: string
  brands: string[]
  newBrands: string[]
  removedBrands: string[]
}

interface Change {
  date_detected: string
  store_name: string
  brand_name: string
  change_type: string
  store_url: string
}

interface BrandData {
  generatedAt: string
  stores: StoreData[]
  recentChanges: Change[]
}

async function getData(): Promise<BrandData | null> {
  try {
    const res = await fetch(DATA_URL, { next: { revalidate } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function BrandsPage() {
  const data = await getData()

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '58px',
    background: '#fff',
    boxShadow: '0 1px 0 #ebebeb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="/" style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>Store Dose</a>
            <span style={{ fontSize: '13px', color: '#ccc' }}>/</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Brands</span>
          </div>
        </header>
        <div style={{ padding: '48px 24px', fontSize: '13px', color: '#aaa' }}>Brand data unavailable — check back soon.</div>
      </div>
    )
  }

  const added = data.recentChanges.filter(c => c.change_type === 'added')
  const removed = data.recentChanges.filter(c => c.change_type === 'removed')
  const totalBrands = data.stores.reduce((n, s) => n + s.brands.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Arial, Helvetica, sans-serif', overflowY: 'auto' }}>

      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href="/" style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em', textDecoration: 'none' }}>
            Store Dose
          </a>
          <span style={{ fontSize: '13px', color: '#ccc' }}>/</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Brands</span>
          <span style={{ fontSize: '11px', color: '#aaa', background: '#f4f4f4', padding: '2px 8px', borderRadius: '20px' }}>
            {totalBrands}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#bbb' }}>Updated {formatDate(data.generatedAt)}</div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Recent changes table */}
        {data.recentChanges.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a1a1a' }}>
                  Recent Changes
                </span>
                <span style={{ fontSize: '11px', color: '#aaa' }}>last 30 days</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {added.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#eaf5ee', color: '#1a6b3c' }}>
                    +{added.length} added
                  </span>
                )}
                {removed.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#faeaea', color: '#8b1a1a' }}>
                    −{removed.length} removed
                  </span>
                )}
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #ebebeb' }}>
                    {['Date', 'Store', 'Brand', 'Change'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#aaa' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentChanges.map((c, i) => (
                    <tr key={i} style={{ borderBottom: i < data.recentChanges.length - 1 ? '1px solid #f2f2f2' : 'none' }}>
                      <td style={{ padding: '10px 16px', borderLeft: `3px solid ${c.change_type === 'added' ? '#1a6b3c' : '#8b1a1a'}` }}>
                        {c.date_detected}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#555' }}>{c.store_name}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 500 }}>{c.brand_name}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                          background: c.change_type === 'added' ? '#eaf5ee' : '#faeaea',
                          color: c.change_type === 'added' ? '#1a6b3c' : '#8b1a1a',
                        }}>
                          {c.change_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Store grid */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a1a1a' }}>
            Stores
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {data.stores.map(store => {
            const newSet = new Set((store.newBrands || []).map((b: string) => b.toLowerCase()))
            const restBrands = store.brands.filter((b: string) => !newSet.has(b.toLowerCase()))
            const totalCount = store.brands.length + (store.removedBrands || []).length

            return (
              <details key={store.name} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: '8px', padding: '20px' }}>

                {/* Clickable summary = store header */}
                <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', listStyle: 'none' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{store.name}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{store.location}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {(store.newBrands || []).length > 0 && (
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1a6b3c', display: 'inline-block' }} title="New brands this month" />
                    )}
                    <span style={{ fontSize: '11px', color: '#aaa' }}>{totalCount} brands</span>
                    <a href={store.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '14px', color: '#ccc', textDecoration: 'none' }}>↗</a>
                  </div>
                </summary>

                {/* Brand list — hidden until expanded */}
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '12px', borderTop: '1px solid #f2f2f2', paddingTop: '4px' }}>

                  {/* New brands — floated to top with green dot */}
                  {(store.newBrands || []).map((brand: string) => (
                    <div key={`new-${brand}`} style={{
                      fontSize: '13px', padding: '5px 0',
                      borderBottom: '1px solid #f2f2f2',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      color: '#1a6b3c', fontWeight: 500,
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1a6b3c', flexShrink: 0 }} title="New this month" />
                      {brand}
                    </div>
                  ))}

                  {/* Regular brands */}
                  {restBrands.map((brand: string, i: number) => (
                    <div key={brand} style={{
                      fontSize: '13px', padding: '5px 0',
                      borderBottom: i < restBrands.length - 1 || (store.removedBrands || []).length > 0 ? '1px solid #f2f2f2' : 'none',
                      color: '#1a1a1a',
                    }}>
                      {brand}
                    </div>
                  ))}

                  {/* Removed brands — struck through with red dot */}
                  {(store.removedBrands || []).map((brand: string, i: number) => (
                    <div key={`removed-${brand}`} style={{
                      fontSize: '13px', padding: '5px 0',
                      borderBottom: i < (store.removedBrands || []).length - 1 ? '1px solid #f2f2f2' : 'none',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      color: '#bbb',
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e08080', flexShrink: 0 }} title="No longer carried" />
                      <s style={{ textDecorationColor: '#ccc' }}>{brand}</s>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '11px', color: '#ccc', marginTop: '12px' }}>
                  Updated {formatDate(store.updated)}
                </div>
              </details>
            )
          })}
        </div>
      </main>
    </div>
  )
}
