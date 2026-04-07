'use client'

import { useEffect, useRef } from 'react'
import type { Store } from '@/lib/supabase'

type Props = {
  stores: Store[]
  selectedId: number | null
  onSelectStore: (store: Store) => void
}

export default function StoreMap({ stores, selectedId, onSelectStore }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<number, any>>(new Map())

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    // Guard against React strict mode double-invoke
    const container = mapRef.current as any
    if (container._leaflet_id) return

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return

      const map = L.map(mapRef.current!, {
        center: [40.73, -73.99],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }
      ).addTo(map)

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    async function updateMarkers() {
      const L = (await import('leaflet')).default

      // Remove old markers
      markersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker)
      })
      markersRef.current.clear()

      stores.forEach((store) => {
        const isSelected = store.id === selectedId

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width: ${isSelected ? 14 : 10}px;
            height: ${isSelected ? 14 : 10}px;
            background: #1a1a1a;
            border-radius: 50%;
            border: ${isSelected ? '2px solid #fff' : 'none'};
            box-shadow: ${isSelected ? '0 0 0 2.5px #1a1a1a' : '0 1px 4px rgba(0,0,0,0.25)'};
          "></div>`,
          iconSize: [isSelected ? 14 : 10, isSelected ? 14 : 10],
          iconAnchor: [isSelected ? 7 : 5, isSelected ? 7 : 5],
        })

        const marker = L.marker([store.lat, store.lng], { icon })

        const popupContent = document.createElement('div')
        popupContent.style.cssText = 'padding: 16px; min-width: 220px; font-family: Arial, Helvetica, sans-serif;'
        popupContent.innerHTML = `
          <div style="font-size:11px; font-weight:500; color:#aaa; margin-bottom:4px;">${store.category}</div>
          <div style="font-size:15px; font-weight:700; color:#1a1a1a; margin-bottom:3px;">${store.name}</div>
          <div style="font-size:12px; color:#bbb; margin-bottom:10px;">${store.neighborhood ? store.neighborhood + ' · ' : ''}${store.address}</div>
          ${store.tags && store.tags.length > 0 ? `
            <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px;">
              ${store.tags.map(t => `<span style="font-size:10px; font-weight:500; padding:2px 8px; background:#f4f4f4; color:#888; border-radius:20px;">${t}</span>`).join('')}
            </div>` : ''}
          ${store.note ? `<div style="font-size:12px; color:#888; font-style:italic; border-top:1px solid #f2f2f2; padding-top:10px; margin-top:2px;">"${store.note}"</div>` : ''}
          ${(store.website || store.instagram) ? `
            <div style="display:flex; gap:12px; margin-top:10px; padding-top:10px; border-top:1px solid #f2f2f2;">
              ${store.website ? `<a href="${store.website}" target="_blank" style="font-size:11px; color:#888; text-decoration:none;">🌐 Website</a>` : ''}
              ${store.instagram ? `<a href="https://instagram.com/${store.instagram.replace('@','')}" target="_blank" style="font-size:11px; color:#888; text-decoration:none;">📷 ${store.instagram.startsWith('@') ? store.instagram : '@' + store.instagram}</a>` : ''}
            </div>` : ''}
        `

        marker.bindPopup(L.popup({ closeButton: true, maxWidth: 300 }).setContent(popupContent))

        marker.on('click', () => {
          onSelectStore(store)
        })

        marker.addTo(mapInstanceRef.current)
        markersRef.current.set(store.id, marker)
      })
    }

    updateMarkers()
  }, [stores, selectedId, onSelectStore])

  // Fly to selected store
  useEffect(() => {
    if (!mapInstanceRef.current || selectedId === null) return
    const store = stores.find((s) => s.id === selectedId)
    if (!store) return
    mapInstanceRef.current.flyTo([store.lat, store.lng], 15, { duration: 0.8 })
    const marker = markersRef.current.get(selectedId)
    if (marker) {
      setTimeout(() => marker.openPopup(), 900)
    }
  }, [selectedId, stores])

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  )
}
