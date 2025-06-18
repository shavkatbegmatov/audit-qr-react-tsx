import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    return (
        <nav className={styles.sidebar}>
            <h2 className={styles.logo}>AuditQR</h2>
            <ul className={styles.menu}>
                <li className={styles.menuItem}>
                    <Link to="/" className={styles.link}>Dashboard</Link>
                </li>
                <li className={styles.menuItem}>
                    <Link to="/audit-object-types" className={styles.link}>Audit Types</Link>
                </li>
            </ul>
        </nav>
    );
}
