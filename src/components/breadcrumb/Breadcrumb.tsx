// src/components/breadcrumb/Breadcrumb.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { findBreadcrumbTrail } from '@/utils/routeUtils';

const Breadcrumb: React.FC = () => {
    const location = useLocation();

    // Joriy yo'l uchun ierarxiyani olamiz
    const breadcrumbTrail = findBreadcrumbTrail(location.pathname);

    // Agar yo'l bo'sh bo'lsa yoki asosiy sahifa bo'lsa, breadcrumb ko'rsatilmaydi
    if (location.pathname === '/' || breadcrumbTrail.length === 0) {
        return (
            <nav aria-label="breadcrumb" className="p-4 bg-white shadow-md">
                <ol className="list-reset flex text-gray-700">
                    <li>
                        <span className="text-gray-500">Boshqaruv paneli</span>
                    </li>
                </ol>
            </nav>
        );
    }

    return (
        <nav aria-label="breadcrumb" className="p-4 bg-white shadow-md">
            <ol className="list-reset flex text-gray-700">
                <li>
                    <Link to="/" className="text-blue-600 hover:text-blue-700">Boshqaruv paneli</Link>
                </li>
                {breadcrumbTrail.map((item, index) => {
                    const isLast = index === breadcrumbTrail.length - 1;

                    return (
                        <React.Fragment key={item.route}>
                            <li className="mx-2">/</li>
                            <li>
                                {isLast ? (
                                    <span className="text-gray-500">{item.label}</span>
                                ) : (
                                    <Link to={item.route} className="text-blue-600 hover:text-blue-700">
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;