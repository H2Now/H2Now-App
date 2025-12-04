import { useEffect, useState } from "react"

export default function SplashScreen({ onFinish }) {
    const [animate, setAnimate] = useState(false)
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        const scaleTimer = setTimeout(() => {
            setAnimate(true)
        }, 250)

        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, 1750)

        const finishTimer = setTimeout(() => {
            if (onFinish) onFinish()
        }, 2250)

        return () => {
            clearTimeout(scaleTimer)
            clearTimeout(fadeTimer)
            clearTimeout(finishTimer)
        }
    }, [onFinish])

    return (
        <div
            className={`
                w-screen h-screen bg-white flex items-center justify-center absolute z-50 sm:hidden transition-opacity duration-500
                ${fadeOut ? "opacity-0" : "opacity-100"}
            `}
        >
            <img
                src="/images/logo.jpg"
                alt="H2Now Logo"
                className={`
                    w-[75%] aspect-square object-contain transition-transform duration-1000 ease-out
                    ${animate ? "scale-100" : "scale-0"}
                `}
            />
        </div>
    )
}
