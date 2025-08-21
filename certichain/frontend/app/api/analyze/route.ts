import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const formData = await req.formData()
    const forward = await fetch(`${backendUrl}/analyze`, {
      method: 'POST',
      body: formData as any,
    })
    const data = await forward.json()
    return NextResponse.json(data, { status: forward.status })
  } catch (err: any) {
    return NextResponse.json({ error: 'Backend unreachable', detail: String(err?.message || err) }, { status: 502 })
  }
}

