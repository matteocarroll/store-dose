'use client'

import { useState } from 'react'
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
    note: '',
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setError('Latitude and longitude must be valid numbers.')
      return
    }

    setLoading(true)
    const { data, error: sbError } = await getSupabase()
      .from('stores')
      .insert([
        {
          name: form.name,
          category: form.category,
          city: form.city,
          neighborhood: form.neighborhood,
          address: form.address,
          lat,
          lng,
          tags: selectedTags,
          note: form.note,
        },
      ])
      .select()
      .single()

    setLoading(false)

    if (sbError) {
      setError(sbError.message)
      return
    }

    onAdded(data as Store)
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1.5px solid #000',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    borderRadius: 0,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '4px',
    fontWeight: 700,
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1.5px solid #000',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '13px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Add Store
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Store Name *</label>
              <input
                style={inputStyle}
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>Category *</label>
              <input
                style={inputStyle}
                required
                placeholder="e.g. Menswear, Denim, Books"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  style={inputStyle}
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Neighborhood</label>
                <input
                  style={inputStyle}
                  value={form.neighborhood}
                  onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Address *</label>
              <input
                style={inputStyle}
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Latitude *</label>
                <input
                  style={inputStyle}
                  required
                  type="number"
                  step="any"
                  placeholder="40.7245"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Longitude *</label>
                <input
                  style={inputStyle}
                  required
                  type="number"
                  step="any"
                  placeholder="-73.9927"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px',
                      border: '1.5px solid #000',
                      background: selectedTags.includes(tag) ? '#000' : '#fff',
                      color: selectedTags.includes(tag) ? '#fff' : '#000',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: 0,
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
                style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                placeholder="Personal note about this store..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            {error && (
              <p style={{ fontSize: '12px', color: '#000', background: '#f5f5f5', padding: '8px', border: '1px solid #000' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: '#000',
                color: '#fff',
                border: '1.5px solid #000',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                borderRadius: 0,
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
