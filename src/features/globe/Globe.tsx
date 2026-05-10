import { useRef, useState, Suspense, useMemo, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, useTexture, Line } from '@react-three/drei'
import * as THREE from 'three'

export interface GlobePin {
  lat: number
  lng: number
  label: string
  tripName?: string
}

export interface GlobeArc {
  from: [number, number]
  to: [number, number]
}

function latLngToVec3(lat: number, lng: number, radius = 1.02): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// ── Error boundary (catches WebGL context failures) ───────────────────────
interface EBState { failed: boolean }
class WebGLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

// ── Earth ─────────────────────────────────────────────────────────────────
function EarthMeshes() {
  const [earthMap, normalMap, cloudsMap] = useTexture([
    '/textures/earth.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_clouds.png',
  ])
  const cloudsRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.03
  })

  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          specular={new THREE.Color(0x333344)}
          shininess={12}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.012, 48, 48]} />
        <meshPhongMaterial map={cloudsMap} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.06, 32, 32]} />
        <meshBasicMaterial color="#88ccee" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
    </>
  )
}

// ── Pin ───────────────────────────────────────────────────────────────────
function Pin({ pin }: { pin: GlobePin }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const pos = latLngToVec3(pin.lat, pin.lng)

  useFrame(() => {
    if (meshRef.current) {
      const t = hovered ? 1.6 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.12)
    }
  })

  return (
    <group position={pos}>
      <mesh ref={meshRef} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? '#f59e0b' : '#C4862A'}
          emissive={hovered ? '#f59e0b' : '#C4862A'}
          emissiveIntensity={hovered ? 1.2 : 0.6}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={4} center>
          <div style={{
            background: 'rgba(6,30,41,0.95)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,134,42,0.5)', borderRadius: 10,
            padding: '6px 12px', fontSize: 12, whiteSpace: 'nowrap',
            pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}>
            <div style={{ color: '#E0DDAA', fontWeight: 700 }}>{pin.label}</div>
            {pin.tripName && <div style={{ color: '#8a9aaa', fontSize: 11 }}>{pin.tripName}</div>}
          </div>
        </Html>
      )}
    </group>
  )
}

function PinNumber({ pin, index }: { pin: GlobePin; index: number }) {
  const pos = latLngToVec3(pin.lat, pin.lng)
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshStandardMaterial color="#C4862A" emissive="#C4862A" emissiveIntensity={0.8} />
      </mesh>
      <Html distanceFactor={3} center>
        <div style={{
          background: '#C4862A', color: '#061E29', borderRadius: '50%',
          width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, pointerEvents: 'none',
          boxShadow: '0 0 10px rgba(196,134,42,0.7)',
        }}>
          {index + 1}
        </div>
      </Html>
    </group>
  )
}

// ── 3D Airplane ───────────────────────────────────────────────────────────
// Nose points in local +Z. No dynamic lights — use emissive for glow instead.
function AirplaneMesh() {
  const gold = '#FFE575'
  const emit = '#C48020'
  return (
    <group>
      {/* Fuselage — tapered cylinder along Z axis */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0045, 0.007, 0.058, 7]} />
        <meshStandardMaterial color={gold} emissive={emit} emissiveIntensity={1.4} metalness={0.5} roughness={0.15} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0.004]}>
        <boxGeometry args={[0.048, 0.0018, 0.013]} />
        <meshStandardMaterial color={gold} emissive={emit} emissiveIntensity={1.1} metalness={0.5} roughness={0.15} />
      </mesh>
      {/* Vertical tail fin */}
      <mesh position={[0, 0.006, -0.024]}>
        <boxGeometry args={[0.0018, 0.011, 0.011]} />
        <meshStandardMaterial color={gold} emissive={emit} emissiveIntensity={1.0} />
      </mesh>
      {/* Horizontal stabilizer */}
      <mesh position={[0, 0, -0.024]}>
        <boxGeometry args={[0.019, 0.0018, 0.009]} />
        <meshStandardMaterial color={gold} emissive={emit} emissiveIntensity={1.0} />
      </mesh>
      {/* Glow halo — purely emissive, no light casting */}
      <mesh>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshBasicMaterial color="#FFD060" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Animated arc + plane ──────────────────────────────────────────────────
function AnimatedArc({ from, to }: GlobeArc) {
  const { points, curve } = useMemo(() => {
    const start = latLngToVec3(from[0], from[1])
    const end   = latLngToVec3(to[0],   to[1])
    const mid   = start.clone().add(end).normalize().multiplyScalar(1.55)
    const c     = new THREE.QuadraticBezierCurve3(start, mid, end)
    return { points: c.getPoints(100), curve: c }
  }, [from, to])

  const planeRef = useRef<THREE.Group>(null)
  const t        = useRef(0)
  const _quat    = useMemo(() => new THREE.Quaternion(), [])
  const _fwd     = useMemo(() => new THREE.Vector3(0, 0, 1), [])

  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.14) % 1
    if (!planeRef.current) return

    const pos     = curve.getPoint(t.current)
    const tangent = curve.getTangent(t.current).normalize()
    planeRef.current.position.copy(pos)
    _quat.setFromUnitVectors(_fwd, tangent)
    planeRef.current.quaternion.copy(_quat)
  })

  return (
    <>
      {/* Wide soft glow underlay */}
      <Line points={points} color="#E8A820" lineWidth={3} transparent opacity={0.18} />
      {/* Main dashed flight-path line */}
      <Line
        points={points}
        color="#FFE070"
        lineWidth={1.8}
        dashed
        dashSize={0.045}
        gapSize={0.035}
        transparent
        opacity={0.92}
      />
      <group ref={planeRef}>
        <AirplaneMesh />
      </group>
    </>
  )
}

// ── Globe scene ───────────────────────────────────────────────────────────
function GlobeScene({ pins = [], arcs = [], showNumbers = false }: {
  pins?: GlobePin[]
  arcs?: GlobeArc[]
  showNumbers?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05
  })

  return (
    <group>
      {/* Two static lights — no dynamic/moving lights in the scene */}
      <ambientLight intensity={0.95} />
      <directionalLight position={[5, 3, 5]} intensity={1.8} color="#FFF8F0" />
      <pointLight position={[-6, -3, 4]} intensity={0.4} color="#B0D8F0" />

      <group ref={groupRef}>
        <EarthMeshes />
        {pins.map((pin, i) =>
          showNumbers
            ? <PinNumber key={i} pin={pin} index={i} />
            : <Pin key={i} pin={pin} />
        )}
        {arcs.map((arc, i) => (
          <AnimatedArc key={i} from={arc.from} to={arc.to} />
        ))}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
      />
    </group>
  )
}

// ── Fallback when WebGL unavailable ──────────────────────────────────────
function GlobeFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <div className="w-20 h-20 rounded-full border-2 border-[var(--accent-teal)] border-t-[var(--accent-gold)] animate-spin opacity-60" />
      <p className="text-xs text-[var(--text-muted)]">Loading globe…</p>
    </div>
  )
}

function GlobeUnavailable() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-4">
      <div className="text-3xl opacity-40">🌍</div>
      <p className="text-sm text-[var(--text-muted)]">3D globe unavailable</p>
      <p className="text-xs text-[var(--text-muted)] opacity-60">WebGL context limit reached — refresh the page</p>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────
interface GlobeProps {
  pins?: GlobePin[]
  arcs?: GlobeArc[]
  showNumbers?: boolean
  className?: string
  height?: string
}

export function Globe({ pins = [], arcs = [], showNumbers = false, className = '', height = '500px' }: GlobeProps) {
  return (
    <div className={className} style={{ height }}>
      <WebGLBoundary fallback={<GlobeUnavailable />}>
        <Suspense fallback={<GlobeFallback />}>
          <Canvas
            camera={{ position: [0, 0, 2.8], fov: 45 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'low-power',
              failIfMajorPerformanceCaveat: false,
            }}
            onCreated={({ gl }) => {
              // Recover automatically when context is lost
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault()
              })
              gl.domElement.addEventListener('webglcontextrestored', () => {
                gl.forceContextRestore?.()
              })
            }}
          >
            <GlobeScene pins={pins} arcs={arcs} showNumbers={showNumbers} />
          </Canvas>
        </Suspense>
      </WebGLBoundary>
    </div>
  )
}
