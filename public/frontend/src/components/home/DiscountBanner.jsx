import React from 'react';

const DiscountBanner = () => {
    return (
        <section className="py-20 px-4 bg-[#ccfff5] overflow-hidden relative">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#003d29] mb-6">
                    Claim your 10% discount
                </h2>
                <p className="text-lg md:text-medium text-[#003d29] mb-10 opacity-80 max-w-5xl mx-auto">
                    Sign up and get a sweet deal on your goodies. Extra bonus: you can track your order directly in your account!
                </p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl transition-all hover:scale-105">
                    Sign up
                </button>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </section>
    );
};

export default DiscountBanner;
