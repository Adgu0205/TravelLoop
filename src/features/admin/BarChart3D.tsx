import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Bar {
  label: string
  value: number
}

function Bars({ bars }: { bars: Bar[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const maxVal = Math.max(...bars.map((b) => b.value), 1)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => {
        const h = (bar.value / maxVal) * 2.5
        const x = (i - bars.length / 2) * 0.7
        return (
          <mesh key={i} position={[x, h / 2 - 1.25, 0]}>
            <boxGeometry args={[0.4, h, 0.4]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#1D546D' : '#E0DDAA'}
              emissive={i % 2 === 0 ? '#1D546D' : '#E0DDAA'}
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function BarChart3D({ bars }: { bars: Bar[] }) {
  return (
    <div style={{ height: 200 }}>
      <Suspense fallback={<div className="skeleton h-full" />}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#E0DDAA" />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#5F9598" />
          <Bars bars={bars} />
        </Canvas>
      </Suspense>
    </div>
  )
}
