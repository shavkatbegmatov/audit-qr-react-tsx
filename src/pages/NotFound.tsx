import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h1 className="text-6xl font-bold text-red-500 animate-pulse">404</h1>
            <h2 className="text-2xl font-semibold mt-4 mb-2">Sahifa topilmadi</h2>
            <p className="text-gray-600 mb-6 max-w-md">
                Kechirasiz, siz qidirayotgan sahifa mavjud emas, oʻchirilgan yoki uning manzili oʻzgargan boʻlishi mumkin.
            </p>
            <Link
                to="/"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Bosh sahifaga qaytish
            </Link>
        </div>
    );
};

export default NotFound;