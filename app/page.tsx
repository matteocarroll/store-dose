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

  const selectedStore = stores.find((s) => s.id === selectedId)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '52px',
          borderBottom: '1.5px solid #000',
          flexShrink: 0,
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Store Dose
          </span>
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#666',
            }}
          >
            {loading ? '—' : `${stores.length} ${stores.length === 1 ? 'Store' : 'Stores'}`}
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '7px 16px',
            background: '#000',
            color: '#fff',
            border: '1.5px solid #000',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 0,
          }}
        >
          + Add Store
        </button>
      </header>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Map */}
        <div
          style={{
            flex: '0 0 60%',
            position: 'relative',
            borderRight: '1.5px solid #000',
          }}
        >
          <StoreMap
            stores={stores}
            selectedId={selectedId}
            onSelectStore={handleSelectStore}
          />
        </div>

        {/* Sidebar */}
        <div
          style={{
            flex: '0 0 40%',
            overflowY: 'auto',
            background: '#fff',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '32px 24px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#999',
              }}
            >
              Loading...
            </div>
          ) : stores.length === 0 ? (
            <div
              style={{
                padding: '32px 24px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#999',
              }}
            >
              No stores yet. Add the first one.
            </div>
          ) : (
            stores.map((store) => {
              const isSelected = store.id === selectedId
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedId(store.id)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    borderLeft: isSelected ? '3px solid #000' : '3px solid transparent',
                    background: isSelected ? '#f5f5f5' : '#fff',
                    transition: 'background 0.1s',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#888',
                      marginBottom: '3px',
                    }}
                  >
                    {store.category}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                    }}
                  >
                    {store.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: store.tags?.length ? '8px' : '0',
                    }}
                  >
                    {store.neighborhood ? `${store.neighborhood} — ` : ''}{store.address}
                  </div>
                  {store.tags && store.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {store.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '9px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '2px 5px',
                            border: '1px solid #000',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {showModal && (
        <AddStoreModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  )
}
