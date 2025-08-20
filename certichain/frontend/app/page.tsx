"use client"

import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

function useThreeCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const initializedRef = useRef(false)

  useMemo(() => {
    if (initializedRef.current) return
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / 280, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, 280)
    container.appendChild(renderer.domElement)

    const geometry = new THREE.BoxGeometry(1.6, 1.1, 0.05)
    const material = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, metalness: 0.3, roughness: 0.4 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(2, 2, 2)
    scene.add(light)
    const ambient = new THREE.AmbientLight(0x404040)
    scene.add(ambient)

    camera.position.z = 3

    const animate = () => {
      cube.rotation.y += 0.01
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    initializedRef.current = true
  }, [])

  return containerRef
}

export default function Home() {
  const threeRef = useThreeCanvas()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<null | { is_valid: boolean; score: number; warnings: string[]; extracted_text_preview: string }>(null)
  const [loading, setLoading] = useState(false)

  async function onUpload() {
    if (!file) return
    setLoading(true)
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`/api/analyze`, { method: 'POST', body: formData })
    const json = await res.json()
    setResult(json)
    setLoading(false)
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">CertiChain</h1>
        <a className="text-teal-300 hover:underline" href="#">الوثائق</a>
      </header>

      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium">تحقق فوري من الشهادات</h2>
          <p className="text-gray-300">ارفع شهادة PDF أو صورة، وسنعرض تحليلًا أوليًا مع نسبة موثوقية.</p>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500"
            />
            <button
              onClick={onUpload}
              disabled={!file || loading}
              className="px-4 py-2 bg-teal-600 rounded disabled:opacity-50"
            >
              {loading ? 'جارٍ التحليل...' : 'ابدأ التحقق'}
            </button>
          </div>
          {result && (
            <div className="mt-3 rounded border border-teal-700/40 p-3">
              <div>الحالة: {result.is_valid ? 'صحيحة' : 'مشكوك فيها'}</div>
              <div>النتيجة: {(result.score * 100).toFixed(1)}%</div>
              {result.warnings?.length > 0 && (
                <ul className="list-disc pr-5 text-yellow-300">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{result.extracted_text_preview}</div>
            </div>
          )}
        </div>
        <div>
          <div ref={threeRef} className="w-full h-[280px] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10" />
          <p className="text-xs text-gray-400 mt-2">عرض ثلاثي الأبعاد توضيحي للشهادة</p>
        </div>
      </section>
    </main>
  )
}

