import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar.tsx';
import styles from './MainLayout.module.css';

export default function MainLayout() {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.mainContent}>
                <Topbar />
                <div className={styles.pageContent}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
