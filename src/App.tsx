import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar.tsx';

export default function App() {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: 200, padding: '2rem', width: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
}
