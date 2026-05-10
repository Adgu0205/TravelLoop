import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count = 2000 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities[i * 3] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 2] = 0
    }
    return { positions, velocities }
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame(() => {
    if (!mesh.current) return
    const pos = mesh.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      if (pos[i * 3] > 10) pos[i * 3] = -10
      if (pos[i * 3] < -10) pos[i * 3] = 10
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10
      if (pos[i * 3 + 1] < -10) pos[i * 3 + 1] = 10
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={0.025}
        color="#5F9598"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export function ParticleField({ className = '' }: { className?: string }) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: false, alpha: true }}
    >
      <Particles />
    </Canvas>
  )
}
