'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { getSupabase } from '@/lib/supabase'
import type { Store } from '@/lib/supabase'
import AddStoreModal from '@/components/AddStoreModal'

const StoreMap = dynamic(() => import('@/components/StoreMap'), { ssr: false })

export default function Home() {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStores() {
      try {
        const { data } = await getSupabase()
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) setStores(data as Store[])
      } catch {
        // Supabase not configured yet
      } finally {
        setLoading(false)
      }
    }
    fetchStores()
  }, [])

  const handleSelectStore = useCallback((store: Store) => {
    setSelectedId(store.id)
  }, [])

  function handleAdded(store: Store) {
    setStores((prev) => [store, ...prev])
    setSelectedId(store.id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f9f9f9' }}>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '58px',
        flexShrink: 0,
        background: '#fff',
        boxShadow: '0 1px 0 #ebebeb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
            Store Dose
          </span>
          <span style={{
            fontSize: '11px',
            color: '#aaa',
            background: '#f4f4f4',
            padding: '2px 8px',
            borderRadius: '20px',
          }}>
            {loading ? '—' : stores.length}
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 18px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: '8px',
          }}
        >
          + Add Store
        </button>
      </header>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '0' }}>

        {/* Map */}
        <div style={{ flex: '0 0 60%', position: 'relative' }}>
          <StoreMap stores={stores} selectedId={selectedId} onSelectStore={handleSelectStore} />
        </div>

        {/* Sidebar */}
        <div style={{ flex: '0 0 40%', overflowY: 'auto', background: '#fff', boxShadow: '-1px 0 0 #ebebeb' }}>
          {loading ? (
            <div style={{ padding: '32px 24px', fontSize: '13px', color: '#aaa' }}>Loading...</div>
          ) : stores.length === 0 ? (
            <div style={{ padding: '32px 24px', fontSize: '13px', color: '#aaa' }}>No stores yet. Add the first one.</div>
          ) : (
            stores.map((store) => {
              const isSelected = store.id === selectedId
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedId(store.id)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: isSelected ? '#f7f7f7' : '#fff',
                    borderRadius: '0',
                    transition: 'background 0.15s',
                    borderBottom: '1px solid #f2f2f2',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '3px', fontWeight: 500 }}>
                    {store.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '3px' }}>
                    {store.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#bbb', marginBottom: store.tags?.length ? '8px' : '0' }}>
                    {store.neighborhood ? `${store.neighborhood} · ` : ''}{store.address}
                  </div>
                  {store.tags && store.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: (store.website || store.instagram) ? '8px' : '0' }}>
                      {store.tags.map((tag) => (
                        <span key={tag} style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          padding: '2px 8px',
                          background: '#f4f4f4',
                          color: '#888',
                          borderRadius: '20px',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {(store.website || store.instagram) && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {store.website && (
                        <a href={store.website} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: '#888', textDecoration: 'none' }}
                          onClick={(e) => e.stopPropagation()}>
                          🌐 Website
                        </a>
                      )}
                      {store.instagram && (
                        <a href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: '#888', textDecoration: 'none' }}
                          onClick={(e) => e.stopPropagation()}>
                          📷 {store.instagram.startsWith('@') ? store.instagram : `@${store.instagram}`}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {showModal && (
        <AddStoreModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
      )}
    </div>
  )
}
