// import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function HomePage() {
    // const [error, setError] = useState(null);
    // const [loading, setLoading] = useState(false);
    // const [message, setMessage] = useState('');

    // useEffect(() => {
    //     fetchData();
    // }, [])

    // const fetchData = async () => {
    //     setLoading(true);
    //     try {
    //         const res = await fetch("http://localhost:5000/api/test");
    //         const data = await res.json();
    //         setMessage(data.message);
    //     } catch (err) {
    //         setError(err);
    //         console.error("Error fetching data.. ", err);
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    return (
        <>
            <div
                className="min-h-screen bg-cover bg-center flex items-start pt-8 md:pt-16"
                style={{
                    backgroundImage: "url('/images/Background.jpg')",
                }}
            >
                <div className="container mx-auto max-w-[80%]">
                    <motion.h1
                        className="text-5xl md:text-6xl font-bold text-white text-left leading-tight"
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        Where Hydration Meets Innovation
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-white text-left mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    >
                        End dehydration for good — hydration made smart, simple, and automatic.
                    </motion.p>
                    <motion.button
                        className="bg-blue-600 text-white px-8 py-4 mt-8 rounded-lg
                        transition-all duration-300 ease-in-out
                        hover:opacity-80 hover:translate-x-1 hover:translate-y-1"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    >
                        Get Started
                    </motion.button>
                </div>
            </div>
            <div className="py-20">
                <div className="container mx-auto max-w-[80%]">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        Everything you need
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center px-4 py-6 rounded-xl border-t border-l border-6 border-gray-300">
                            <div className="text-5xl mb-4">💧</div>
                            <h3 className="text-xl font-bold mb-2">Smart Tracking</h3>
                            <p className="text-gray-600">Automatic hydration monitoring throughout your day</p>
                        </div>
                        <div className="text-center px-4 py-6 rounded-xl border-t border-l border-6 border-gray-300">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-xl font-bold mb-2">Personalized Goals</h3>
                            <p className="text-gray-600">Custom hydration targets based on your lifestyle</p>
                        </div>
                        <div className="text-center px-4 py-6 rounded-xl border-t border-l border-6 border-gray-300">
                            <div className="text-5xl mb-4">🔔</div>
                            <h3 className="text-xl font-bold mb-2">Smart Reminders</h3>
                            <p className="text-gray-600">Gentle nudges to keep you hydrated all day</p>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default HomePage;