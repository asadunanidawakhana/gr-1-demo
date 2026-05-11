'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const seen = sessionStorage.getItem('ag-splash-seen')
    if (seen) { setShow(false); return }
    const timer = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('ag-splash-seen', '1')
    }, 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 24
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              style={{
                height: 2, background: '#C9A66B',
                marginBottom: 20, transformOrigin: 'left'
              }}
            />
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 300,
              color: '#fff',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              lineHeight: 1.1
            }}>
              Aurangzaib
            </h1>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 'clamp(11px, 1.5vw, 14px)',
                fontWeight: 500,
                color: '#C9A66B',
                letterSpacing: '0.5em',
                textTransform: 'uppercase',
                marginTop: 6
              }}
            >
              Garments
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              style={{
                height: 2, background: '#C9A66B',
                marginTop: 20, transformOrigin: 'right'
              }}
            />
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ delay: 1, duration: 1.4, ease: 'easeInOut' }}
              style={{ height: '100%', background: '#C9A66B', borderRadius: 1 }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.2 }}
            style={{ color: '#fff', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}
          >
            Premium Fashion
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
