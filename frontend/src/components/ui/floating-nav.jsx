import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

const INTER = "'Inter','Plus Jakarta Sans',sans-serif"

function FloatingNav({ items = [], accentColor = '#3A7BD5' }) {
  const containerRef = useRef(null)
  const btnRefs = useRef([])
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })

  const activeIndex = items.findIndex(item => item.active)

  useEffect(() => {
    const updateIndicator = () => {
      const btn = btnRefs.current[activeIndex]
      const container = containerRef.current
      if (!btn || !container) return
      const btnRect = btn.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      setIndicatorStyle({
        width: btnRect.width,
        left: btnRect.left - containerRect.left,
      })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeIndex])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: '100%',
        maxWidth: 480,
        padding: '0 16px',
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 999,
          padding: '6px 4px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 6px rgba(0,0,0,0.06)',
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = item.active

          return (
            <button
              key={item.id || item.label}
              ref={el => (btnRefs.current[index] = el)}
              data-testid={item.testId}
              onClick={item.onClick}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '8px 4px 6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? accentColor : 'rgba(0,0,0,0.35)',
                transition: 'color 200ms',
                zIndex: 1,
                gap: 3,
              }}
            >
              {/* Icon wrapper */}
              <div style={{ position: 'relative', lineHeight: 0 }}>
                <Icon
                  size={21}
                  color={isActive ? accentColor : 'rgba(0,0,0,0.35)'}
                  fill={isActive ? accentColor : 'none'}
                  stroke={isActive ? accentColor : 'rgba(0,0,0,0.35)'}
                  strokeWidth={isActive ? 2 : 1.6}
                  style={{ transition: 'color 200ms' }}
                />
                {/* Badge */}
                {item.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -3,
                      width: 7,
                      height: 7,
                      background: '#E53935',
                      borderRadius: '50%',
                      border: '1.5px solid rgba(255,255,255,0.96)',
                    }}
                  />
                )}
              </div>

              {/* Label — visible on sm+ screens */}
              <span
                className="hidden sm:block"
                style={{
                  fontFamily: INTER,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: isActive ? accentColor : 'rgba(0,0,0,0.35)',
                  transition: 'color 200ms',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Sliding active indicator */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            borderRadius: 999,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}28`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}

export default FloatingNav
