import React from 'react';

function WatermarkOverlay() {

    const user = JSON.parse(localStorage.getItem('user'));

    return (

        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {[...Array(20)].map((_, index) => (
                <div
                    key={index}
                    className="absolute text-white/10 text-2xl font-semibold select-none"
                    style={{
                        top: `${(index % 5) * 20}%`,
                        left: `${(index % 4) * 25}%`,
                        transform: 'rotate(-25deg)',
                    }}
                >
                    {user?.username} • {user?.email}
                </div>

            ))}

        </div>

    );

}

export default WatermarkOverlay;