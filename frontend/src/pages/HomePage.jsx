// import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function HomePage() {
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
                    <Link to="/hub">
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
                    </Link>
                </div>
            </div>
            <div className="py-20">
                <div className="container mx-auto max-w-[80%] rounded-2xl overflow-hidden"
                     style={{
                         background: 'linear-gradient(180deg, #0b0e12 0%, #24283a 30%, #2f374f 60%, #2b3a5a 100%)',
                     }}
                >
                    <div className="px-8 py-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
                            Everything you need
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center px-6 py-8 rounded-xl bg-white/6 backdrop-blur-sm">
                                <div className="text-5xl mb-4">💧</div>
                                <h3 className="text-xl font-bold mb-2 text-white">Smart Tracking</h3>
                                <p className="text-gray-300">Automatic hydration monitoring throughout your day</p>
                            </div>
                            <div className="text-center px-6 py-8 rounded-xl bg-white/6 backdrop-blur-sm">
                                <div className="text-5xl mb-4">📊</div>
                                <h3 className="text-xl font-bold mb-2 text-white">Personalized Goals</h3>
                                <p className="text-gray-300">Custom hydration targets based on your lifestyle</p>
                            </div>
                            <div className="text-center px-6 py-8 rounded-xl bg-white/6 backdrop-blur-sm">
                                <div className="text-5xl mb-4">🔔</div>
                                <h3 className="text-xl font-bold mb-2 text-white">Smart Reminders</h3>
                                <p className="text-gray-300">Gentle nudges to keep you hydrated all day</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
           
            <div className="w-full h-screen relative flex items-center">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/way.jpg')" }} />
                <div className="absolute inset-0 bg-black/45" />
                <div className="container mx-auto max-w-[80%] relative z-10 flex items-center gap-12">
                    <div className="w-full md:w-1/2 text-white">
                        <h2 className="text-5xl font-extrabold mb-6">Stay. On. Track.</h2>
                        <p className="text-lg mb-6 leading-relaxed">
                            Our dedicated application allows you to keep track of all your bottles to ensure
                            you achieve your hydration goals.
                        </p>
                        <p className="text-2xl font-bold">Achieve your best.</p>

                        {/* show a smaller version of bottles image on mobile (50% width) */}
                        <div className="mt-20 md:hidden flex justify-center">
                            <img src="/images/bottles.jpg" alt="bottles" className="w-1/2 h-auto object-contain rounded-lg shadow-lg" />
                        </div>
                    </div>

                    <div className="hidden md:flex w-1/2 justify-end">
                        {/* show the bottles image directly on desktop with phone-panel dimensions */}
                        <div className="w-[320px] h-[680px] rounded-2xl overflow-hidden shadow-2xl">
                            <img src="/images/bottles.jpg" alt="bottles" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

        </>

    )
}

export default HomePage;