import React from "react"
import { motion } from "framer-motion"

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
}

function DockItem({ icon: Icon, label, active, accentColor, badge, onClick, testId }) {
  return (
    <motion.button
      className="relative group"
      data-testid={testId}
      whileHover={{ scale: 1.15, y: -6 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        padding: '10px 14px',
        background: active ? `${accentColor}1A` : 'transparent',
        border: 'none',
        borderRadius: 14,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minWidth: 48,
        transition: 'background 200ms',
        position: 'relative',
      }}
    >
      <Icon
        size={22}
        color={active ? accentColor : 'rgba(255,255,255,0.45)'}
        fill={active ? accentColor : 'none'}
        stroke={active ? 'rgba(12,12,14,0.85)' : 'rgba(255,255,255,0.45)'}
        strokeWidth={active ? 2 : 1.5}
      />

      {/* Active dot */}
      <motion.div
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor, flexShrink: 0 }}
      />

      {/* Tooltip */}
      <span
        className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none"
        style={{
          background: 'rgba(22,22,26,0.96)',
          color: 'white',
          fontSize: 11,
          fontWeight: 600,
          padding: '5px 10px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          letterSpacing: '0.04em',
          zIndex: 100,
          fontFamily: "'Inter','Plus Jakarta Sans',sans-serif",
        }}
      >
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 8, height: 8,
          background: '#E53935',
          borderRadius: '50%',
          border: '2px solid rgba(12,12,14,0.9)',
        }} />
      )}
    </motion.button>
  )
}

export function Dock({ items, accentColor = '#3A7BD5' }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-center items-end z-30 pointer-events-none"
      style={{ paddingBottom: 20 }}
    >
      <motion.div
        initial="initial"
        animate="animate"
        variants={floatingAnimation}
        className="pointer-events-auto flex items-center gap-1 rounded-2xl backdrop-blur-xl"
        style={{
          padding: '8px',
          background: 'rgba(16, 16, 20, 0.88)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {items.map((item) => (
          <DockItem key={item.id || item.label} {...item} accentColor={accentColor} />
        ))}
      </motion.div>
    </div>
  )
}

export default Dock
