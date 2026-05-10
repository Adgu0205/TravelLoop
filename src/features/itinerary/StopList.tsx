import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MapPin, Trash2 } from 'lucide-react'
export type StopWithCity = {
  id: string
  trip_id: string
  city_id: string
  position_order: number
  start_date: string | null
  end_date: string | null
  cities?: { name: string; country: string; lat?: number; lng?: number } | null
}

interface StopItemProps {
  stop: StopWithCity
  isActive?: boolean
  label: string
  labelColor: string
  onSelect: () => void
  onDelete: () => void
}

function SortableStop({ stop, isActive, label, labelColor, onSelect, onDelete }: StopItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
      isActive
        ? 'bg-[var(--accent-teal)]/20 border-[var(--accent-gold)]'
        : 'glass border-[var(--glass-border)] hover:border-[var(--accent-teal)]'
    }`} onClick={onSelect}>
      <button {...attributes} {...listeners} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
        <GripVertical size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${labelColor}`}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-[var(--accent-gold)] shrink-0" />
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {stop.cities?.name ?? 'Unknown City'}
          </span>
        </div>
        <span className="text-xs text-[var(--text-muted)] ml-4">{stop.cities?.country}</span>
        {(stop.start_date || stop.end_date) && (
          <p className="text-xs text-[var(--text-muted)] ml-4 mt-0.5">
            {stop.start_date ?? '?'} → {stop.end_date ?? '?'}
          </p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

interface StopListProps {
  stops: StopWithCity[]
  activeStopId?: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (stops: StopWithCity[]) => void
}

export function StopList({ stops, activeStopId, onSelect, onDelete, onReorder }: StopListProps) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = stops.findIndex((s) => s.id === active.id)
    const newIndex = stops.findIndex((s) => s.id === over.id)
    onReorder(arrayMove(stops, oldIndex, newIndex))
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {stops.map((stop, i) => {
            const isFirst = i === 0
            const isLast = i === stops.length - 1
            const label = isFirst ? '🛫 Departure' : isLast ? '🛬 Arrival' : `🔵 Stop ${i}`
            const labelColor = isFirst
              ? 'bg-emerald-500/15 text-emerald-400'
              : isLast
              ? 'bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]'
              : 'bg-[var(--accent-teal)]/20 text-[var(--accent-sage)]'
            return (
              <div key={stop.id}>
                {i > 0 && (
                  <div className="flex items-center gap-1 pl-8 py-1">
                    <div className="flex-1 border-t border-dashed border-[var(--glass-border)]" />
                    <span className="text-[10px] text-[var(--text-muted)]">✈</span>
                    <div className="flex-1 border-t border-dashed border-[var(--glass-border)]" />
                  </div>
                )}
                <SortableStop
                  stop={stop}
                  isActive={stop.id === activeStopId}
                  label={label}
                  labelColor={labelColor}
                  onSelect={() => onSelect(stop.id)}
                  onDelete={() => onDelete(stop.id)}
                />
              </div>
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
