import React, { useState, useEffect, MouseEvent as ReactMouseEvent } from "react";
import Lottie from "lottie-react";
import HeartAnimation from './heart.json'
import Heart2Animation from './heart2.json'


const Footer = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
        }, 5000);

        return () => clearTimeout(hideTimer);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: globalThis.MouseEvent) => {
            if (window.innerHeight - e.clientY < 100) {
                setIsVisible(true);
            } else if (isVisible && window.innerHeight - e.clientY >= 100) {
                const hideTimer = setTimeout(() => {
                    setIsVisible(false);
                }, 3000);
                
                return () => clearTimeout(hideTimer);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isVisible]);

    return (
        <div 
            className={` pl-0 md:pl-72 flex flex-col items-center justify-center h-10 w-full fixed bottom-0 left-1/2 -translate-x-1/2 backdrop-blur-sm px-4 py-2 rounded-t-lg transition-transform duration-300 ${
                isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
        >
            <p className="font-medium text-foreground/70 flex items-center -space-x-4">Made with <Lottie animationData={HeartAnimation} loop={true} className="w-14 p-0 m-0" /> by DEVS REC</p>
            {/* <Lottie animationData={Heart2Animation} loop={true} className="absolute w-14 -top-20t-1/2 -translate-x-1/2"/>  */}
        </div>
    )
}

export default Footer