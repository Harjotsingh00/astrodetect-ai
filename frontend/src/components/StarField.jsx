import { useEffect, useRef } from 'react'

export default function StarField() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let W = canvas.width = window.innerWidth
        let H = canvas.height = window.innerHeight

        const stars = Array.from({ length: 180 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.2 + 0.2,
            o: Math.random() * 0.6 + 0.1,
            speed: Math.random() * 0.3 + 0.05
        }))

        let frame
        function draw() {
            ctx.clearRect(0, 0, W, H)
            stars.forEach(s => {
                s.o += s.speed * 0.01
                if (s.o > 0.8) s.speed = -Math.abs(s.speed)
                if (s.o < 0.05) s.speed = Math.abs(s.speed)
                ctx.beginPath()
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(200,210,255,${s.o})`
                ctx.fill()
            })
            frame = requestAnimationFrame(draw)
        }
        draw()

        const onResize = () => {
            W = canvas.width = window.innerWidth
            H = canvas.height = window.innerHeight
        }
        window.addEventListener('resize', onResize)
        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', onResize) }
    }, [])

    return (
        <canvas ref={canvasRef} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 0, opacity: 0.6
        }} />
    )
}