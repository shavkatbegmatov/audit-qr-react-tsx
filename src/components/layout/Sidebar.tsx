import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

export default function Sidebar() {
    return (
        <nav className="fixed top-0 left-0 h-full w-52 bg-gray-800 text-white p-4">
            <h2 className="text-2xl font-bold mb-6">AuditQR</h2>
            <ul className="space-y-4">
                <li>
                    <Link to={ROUTES.ROOT} className="hover:underline">Dashboard</Link>
                </li>
                <li>
                    <Link to={ROUTES.AUDIT_OBJECT_TYPES} className="hover:underline">Audit Object Types</Link>
                </li>
                <li>
                    <Link to={ROUTES.AUDIT_LOGS} className="hover:underline">Audit Logs</Link>
                </li>
                <li>
                    <Link to={ROUTES.ROLES} className="hover:underline">Roles</Link>
                </li>
            </ul>
        </nav>
    );
}