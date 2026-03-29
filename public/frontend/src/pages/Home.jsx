import React from 'react';
import Hero from '../components/home/Hero';
import CategoryGrid from '../components/home/CategoryGrid';
import DiscountBanner from '../components/home/DiscountBanner';

const Home = () => {
    return (
        <>
            <Hero />
            <CategoryGrid />
            <DiscountBanner />
        </>
    );
};

export default Home;
