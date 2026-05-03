export const revalidate = 3600 // re-fetch data every hour

const DATA_URL = 'https://brand-monitor-alpha.vercel.app/brands/data.json'

interface StoreData {
  name: string
  location: string
  url: string
  updated: string
  brands: string[]
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
    flexShrink: 0,
    background: '#fff',
    boxShadow: '0 1px 0 #ebebeb',
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f9f9', overflow: 'auto' }}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="/" style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em', textDecoration: 'none' }}>
              Store Dose
            </a>
            <span style={{ fontSize: '13px', color: '#aaa' }}>/ Brands</span>
          </div>
        </header>
        <div style={{ padding: '48px 24px', fontSize: '13px', color: '#aaa' }}>
          Brand data unavailable — check back soon.
        </div>
      </div>
    )
  }

  const added = data.recentChanges.filter(c => c.change_type === 'added')
  const removed = data.recentChanges.filter(c => c.change_type === 'removed')
  const totalBrands = data.stores.reduce((n, s) => n + s.brands.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'auto' }}>

      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href="/" style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em', textDecoration: 'none' }}>
            Store Dose
          </a>
          <span style={{ fontSize: '13px', color: '#ccc' }}>/</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Brands</span>
          <span style={{
            fontSize: '11px', color: '#aaa', background: '#f4f4f4',
            padding: '2px 8px', borderRadius: '20px',
          }}>
            {totalBrands}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#bbb' }}>
          Updated {formatDate(data.generatedAt)}
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Recent changes */}
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {data.stores.map(store => (
            <div key={store.name} style={{
              background: '#fff',
              border: '1px solid #ebebeb',
              borderRadius: '8px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{store.name}</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{store.location}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#aaa' }}>{store.brands.length} brands</span>
                  <a href={store.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '14px', color: '#ccc', textDecoration: 'none', lineHeight: 1 }}>
                    ↗
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {store.brands.map((brand, i) => (
                  <div key={brand} style={{
                    fontSize: '13px',
                    padding: '5px 0',
                    borderBottom: i < store.brands.length - 1 ? '1px solid #f2f2f2' : 'none',
                    color: '#1a1a1a',
                  }}>
                    {brand}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '11px', color: '#ccc', marginTop: '12px' }}>
                Updated {formatDate(store.updated)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
