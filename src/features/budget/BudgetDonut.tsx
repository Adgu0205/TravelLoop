import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Segment {
  label: string
  value: number
  color: string
}

function DonutSegments({ segments }: { segments: Segment[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const total = segments.reduce((s, x) => s + x.value, 0) || 1

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  let angle = 0
  return (
    <group ref={groupRef}>
      {segments.map((seg, i) => {
        const frac = seg.value / total
        const arcLen = frac * Math.PI * 2
        const start = angle
        angle += arcLen

        const shape = new THREE.Shape()
        const outerR = 1.0
        const innerR = 0.55
        const steps = Math.max(16, Math.floor(frac * 64))

        shape.moveTo(Math.cos(start) * outerR, Math.sin(start) * outerR)
        for (let j = 0; j <= steps; j++) {
          const a = start + (arcLen * j) / steps
          shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR)
        }
        for (let j = steps; j >= 0; j--) {
          const a = start + (arcLen * j) / steps
          shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR)
        }
        shape.closePath()

        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.25,
          bevelEnabled: false,
        })

        return (
          <mesh key={i} geometry={geo} position={[0, 0, -0.125]} rotation={[0, 0, 0]}>
            <meshStandardMaterial
              color={seg.color}
              emissive={seg.color}
              emissiveIntensity={0.3}
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        )
      })}
    </group>
  )
}

const COLORS = ['#E0DDAA', '#1D546D', '#5F9598', '#8a9aaa', '#0f2d40']

export function BudgetDonut({ segments }: { segments: Omit<Segment, 'color'>[] }) {
  const colored = segments.map((s, i) => ({ ...s, color: COLORS[i % COLORS.length] }))

  return (
    <div style={{ height: 220 }}>
      <Suspense fallback={<div className="skeleton h-full rounded-full w-full" />}>
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 3, 3]} intensity={1} color="#E0DDAA" />
          <pointLight position={[-3, -3, 3]} intensity={0.5} color="#5F9598" />
          <DonutSegments segments={colored} />
        </Canvas>
      </Suspense>
    </div>
  )
}
