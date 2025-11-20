import React, { useState } from 'react';
import styles from './CompanyStory.module.css';
import { generateResponsiveImageUrl } from '../../utils/imageUtils';

const CompanyStory = ({ 
  title = "Our Story", 
  mission, 
  story, 
  teamImage, 
  statistics = {} 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <section className={styles.companyStory} aria-labelledby="story-title">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h2 id="story-title" className={styles.title}>
              {title}
            </h2>
            
            {mission && (
              <div className={styles.missionSection}>
                <h3 className={styles.missionTitle}>Our Mission</h3>
                <p className={styles.mission}>
                  {mission}
                </p>
              </div>
            )}
            
            {story && (
              <div className={styles.storySection}>
                <p className={styles.story}>
                  {story}
                </p>
              </div>
            )}
            
            {Object.keys(statistics).length > 0 && (
              <div className={styles.highlightStats} role="region" aria-labelledby="story-title">
                {statistics.studentsHelped && (
                  <div className={styles.highlightStat} role="group" aria-labelledby="students-transformed">
                    <span 
                      id="students-transformed"
                      className={styles.highlightNumber}
                      aria-label={`${statistics.studentsHelped} students transformed`}
                    >
                      {statistics.studentsHelped}
                    </span>
                    <span className={styles.highlightLabel} aria-hidden="true">Students Transformed</span>
                  </div>
                )}
                {statistics.yearsExperience && (
                  <div className={styles.highlightStat} role="group" aria-labelledby="years-excellence">
                    <span 
                      id="years-excellence"
                      className={styles.highlightNumber}
                      aria-label={`${statistics.yearsExperience} years of excellence`}
                    >
                      {statistics.yearsExperience}
                    </span>
                    <span className={styles.highlightLabel} aria-hidden="true">Years of Excellence</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {teamImage && (
            <div className={styles.imageContent}>
              {imageLoading && (
                <div 
                  className={styles.imageSkeleton} 
                  aria-hidden="true"
                  role="presentation"
                />
              )}
              {imageError ? (
                <div 
                  className={styles.imageFallback} 
                  role="img" 
                  aria-label="Team photo unavailable - Our Amazing Team"
                >
                  <div className={styles.fallbackIcon} aria-hidden="true">👥</div>
                  <p className={styles.fallbackText}>Our Amazing Team</p>
                </div>
              ) : (
                <img
                  src={generateResponsiveImageUrl(teamImage, 600)}
                  alt="A1frenchclasses team members collaborating in a modern office environment"
                  className={styles.teamImage}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                  width="500"
                  height="350"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CompanyStory;