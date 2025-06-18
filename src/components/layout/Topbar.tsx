import styles from './Topbar.module.css';

export default function Topbar() {
    return (
        <header className={styles.topbar}>
            <span className={styles.userInfo}>👤 Shavkat Begmatov</span>
        </header>
    );
}
