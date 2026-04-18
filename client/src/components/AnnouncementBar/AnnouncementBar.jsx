import React from 'react';
import styles from './AnnouncementBar.module.css';

const AnnouncementBar = () => {
    return (
        <div className={styles.banner}>
            <span>🇫🇷 → 🇨🇦 New batch starting soon — <strong>Enroll now to claim 50% off a Canada PR consultation</strong></span>
        </div>
    );
};

export default AnnouncementBar;
