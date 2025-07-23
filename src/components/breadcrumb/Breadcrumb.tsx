// src/components/breadcrumb/Breadcrumb.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Define a map for human-readable titles based on routes
    const routeTitles: { [key: string]: string } = {
        'audit-object-types': 'Audit obyekt turlari',
        'audit-object-branch-networks': 'Audit obyekt tarmog\'lari',
        'audit-objects': 'Audit obyektlari',
        'audit-logs': 'Audit Loglari',
        'roles': 'Rollar',
        'users': 'Foydalanuvchilar',
        // Add more routes as needed, including sub-routes from Sidebar navItems
        'sub1': 'Sub Item 1', // Example for sub-items
        'sub2': 'Sub Item 2',
        // For nested, you can handle logic accordingly
    };

    return (
        <nav aria-label="breadcrumb" className="p-4 bg-white shadow-md">
            <ol className="list-reset flex text-gray-700">
                <li>
                    <Link to="/" className="text-blue-600 hover:text-blue-700">Boshqaruv paneli</Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const title = routeTitles[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
                    const isLast = index === pathnames.length - 1;

                    return (
                        <React.Fragment key={to}>
                            <li className="mx-2">/</li>
                            <li>
                                {isLast ? (
                                    <span className="text-gray-500">{title}</span>
                                ) : (
                                    <Link to={to} className="text-blue-600 hover:text-blue-700">{title}</Link>
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