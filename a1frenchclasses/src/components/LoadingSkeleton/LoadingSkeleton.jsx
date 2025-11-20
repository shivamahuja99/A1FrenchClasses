import styles from './LoadingSkeleton.module.css';

const LoadingSkeleton = ({
  variant = 'card',
  count = 1,
  className = '',
  width = '100%',
  height = 'auto'
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`${styles.skeletonCard} ${className}`}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} style={{ width: '60%' }} />
              <div className={styles.skeletonPrice} />
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className={`${styles.skeletonTestimonial} ${className}`}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonRating} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonText} style={{ width: '80%' }} />
            <div className={styles.skeletonName} />
          </div>
        );

      case 'text':
        return (
          <div className={`${styles.skeletonText} ${className}`} style={{ width, height }} />
        );

      case 'image':
        return (
          <div className={`${styles.skeletonImage} ${className}`} style={{ width, height }} />
        );

      case 'circle':
        return (
          <div className={`${styles.skeletonCircle} ${className}`} style={{ width, height }} />
        );

      default:
        return (
          <div className={`${styles.skeletonBox} ${className}`} style={{ width, height }} />
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.skeletonWrapper}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;