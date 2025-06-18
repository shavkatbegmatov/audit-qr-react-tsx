import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <nav className="fixed top-0 left-0 h-full w-52 bg-gray-800 text-white p-4">
            <h2 className="text-2xl font-bold mb-6">AuditQR</h2>
            <ul className="space-y-4">
                <li>
                    <Link to="/" className="hover:underline">Dashboard</Link>
                </li>
                <li>
                    <Link to="/audit-object-types" className="hover:underline">Audit Types</Link>
                </li>
            </ul>
        </nav>
    );
}
