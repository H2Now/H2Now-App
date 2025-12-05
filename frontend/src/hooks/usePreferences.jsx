import { useState, useEffect } from 'react'

export const useUnitPreference = () => {
    const [unit, setUnit] = useState(() => {
        return localStorage.getItem('unitPreference') || 'ml'
    })

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'unitPreference') {
                setUnit(e.newValue || 'ml')
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    return unit
}

export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode')
        return saved ? JSON.parse(saved) : false
    })

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'darkMode') {
                setDarkMode(e.newValue ? JSON.parse(e.newValue) : false)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    return darkMode
}

// Conversion utilities
export const mlToOz = (ml) => (ml / 29.5735).toFixed(1)
export const ozToMl = (oz) => Math.round(oz * 29.5735)

export const formatIntake = (ml, unit = 'ml') => {
    if (unit === 'oz') {
        const oz = mlToOz(ml)
        return `${oz} oz`
    }
    // For ml, show in liters if >= 1000ml
    if (ml >= 1000) {
        return `${(ml / 1000).toFixed(1)} L`
    }
    return `${ml} ml`
}