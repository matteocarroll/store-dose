'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Store } from '@/lib/supabase'

const ALL_TAGS = ['Great Service', 'Curation', 'Aesthetic']

type Props = {
  onClose: () => void
  onAdded: (store: Store) => void
}

export default function AddStoreModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    city: '',
    neighborhood: '',
    address: '',
    lat: '',
    lng: '',
    website: '',
    instagram: '',
    note: '',
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    function initAutocomplete() {
      const win = window as any
      if (!win.google?.maps?.places || !searchInputRef.current || autocompleteRef.current) return

      autocompleteRef.current = new win.google.maps.places.Autocomplete(
        searchInputRef.current,
        { types: ['establishment'], fields: ['name', 'formatted_address', 'geometry', 'address_components'] }
      )

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (!place.geometry) return

        const lat = place.geometry.location.lat().toString()
        const lng = place.geometry.location.lng().toString()

        let city = '', neighborhood = '', streetNumber = '', route = ''
        for (const component of (place.address_components || [])) {
          const types = component.types
          if (types.includes('street_number')) streetNumber = component.long_name
          if (types.includes('route')) route = component.long_name
          if (types.includes('neighborhood') || types.includes('sublocality_level_1')) neighborhood = component.long_name
          if (types.includes('locality')) city = component.long_name
        }

        const address = streetNumber && route ? `${streetNumber} ${route}` : place.formatted_address || ''
        setForm((prev) => ({ ...prev, name: place.name || prev.name, address, city, neighborhood, lat, lng }))
      })
    }

    const win = window as any

    // If Google Maps is already loaded, init immediately
    if (win.google?.maps?.places) {
      initAutocomplete()
    } else {
      // Otherwise wait for the script to finish loading
      const interval = setInterval(() => {
        if (win.google?.maps?.places) {
          clearInterval(interval)
          initAutocomplete()
        }
      }, 100)
      return () => clearInterval(interval)
    }

    return () => {
      if (autocompleteRef.current) {
        win.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const lat = parseFloat(form.lat)
    const lng = parseFloat(form.lng)
    if (isNaN(lat) || isNaN(lng)) {
      setError('Please select a place from the search suggestions.')
      return
    }

    setLoading(true)
    const { data, error: sbError } = await getSupabase()
      .from('stores')
      .insert([{ name: form.name, category: form.category, city: form.city, neighborhood: form.neighborhood, address: form.address, lat, lng, tags: selectedTags, note: form.note, website: form.website || null, instagram: form.instagram || null }])
      .select()
      .single()

    setLoading(false)
    if (sbError) { setError(sbError.message); return }
    onAdded(data as Store)
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #ebebeb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#fafafa',
    color: '#1a1a1a',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#888',
    marginBottom: '6px',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Add Store</h2>
          <button onClick={onClose} style={{ background: '#f4f4f4', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Search Place</label>
          <input
            ref={searchInputRef}
            style={{ ...inputStyle, background: '#f4f4f4', border: '1px solid transparent', fontSize: '14px' }}
            placeholder="Type a store name or address..."
            autoComplete="off"
          />
          <p style={{ fontSize: '11px', color: '#ccc', marginTop: '5px' }}>
            {(window as any).google?.maps?.places ? 'Powered by Google Places' : 'Add your Google Maps API key to enable autocomplete'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <label style={labelStyle}>Store Name</label>
              <input style={inputStyle} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} required placeholder="e.g. Menswear, Denim, Books" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Neighborhood</label>
                <input style={inputStyle} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Website</label>
                <input style={inputStyle} placeholder="https://..." value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Instagram</label>
                <input style={inputStyle} placeholder="@handle" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 14px',
                      border: 'none',
                      background: selectedTags.includes(tag) ? '#1a1a1a' : '#f4f4f4',
                      color: selectedTags.includes(tag) ? '#fff' : '#666',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      borderRadius: '20px',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Note</label>
              <textarea
                style={{ ...inputStyle, height: '80px', resize: 'none' }}
                placeholder="Personal note about this store..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            {error && (
              <p style={{ fontSize: '12px', color: '#999', background: '#f9f9f9', padding: '10px 14px', borderRadius: '8px' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                borderRadius: '8px',
                marginTop: '4px',
              }}
            >
              {loading ? 'Saving...' : 'Save Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
