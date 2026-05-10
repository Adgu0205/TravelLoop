import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

function latLngToVec3(lat: number, lng: number, radius = 1.02): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

interface ArcPathProps {
  from: [number, number]
  to: [number, number]
  color?: string
}

export function ArcPath({ from, to, color = '#E0DDAA' }: ArcPathProps) {
  const points = useMemo(() => {
    const start = latLngToVec3(from[0], from[1])
    const end = latLngToVec3(to[0], to[1])
    const mid = start.clone().add(end).normalize().multiplyScalar(1.3)
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    return curve.getPoints(60)
  }, [from, to])

  return <Line points={points} color={color} lineWidth={1} transparent opacity={0.7} />
}
