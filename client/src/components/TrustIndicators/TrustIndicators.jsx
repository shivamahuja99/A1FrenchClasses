import React, { useState } from 'react';
import styles from './TrustIndicators.module.css';
import LazyImage from '../LazyImage/LazyImage';
import { generateResponsiveImageUrl, generateOptimizedImagePaths } from '../../utils/imageUtils';

const TrustIndicators = ({ companies = [], statistics = {} }) => {
  const handleImageLoad = (companyId) => {
    // Handle image load if needed
  };

  const handleImageError = (companyId) => {
    // Handle image error if needed
  };

  return (
    <section className={styles.trustIndicators} aria-labelledby="trust-title">
      <div className={styles.container}>
        <h2 id="trust-title" className={styles.title}>
          Trusted by Leading Companies
        </h2>
        
        {/* Statistics Section */}
        {Object.keys(statistics).length > 0 && (
          <div className={styles.statistics} role="region" aria-labelledby="trust-title">
            {statistics.studentsHelped && (
              <div className={styles.statItem} role="group" aria-labelledby="students-stat">
                <span 
                  id="students-stat"
                  className={styles.statNumber} 
                  aria-label={`${statistics.studentsHelped} students helped`}
                >
                  {statistics.studentsHelped}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Students Helped</span>
              </div>
            )}
            {statistics.coursesOffered && (
              <div className={styles.statItem} role="group" aria-labelledby="courses-stat">
                <span 
                  id="courses-stat"
                  className={styles.statNumber} 
                  aria-label={`${statistics.coursesOffered} courses offered`}
                >
                  {statistics.coursesOffered}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Courses Offered</span>
              </div>
            )}
            {statistics.successRate && (
              <div className={styles.statItem} role="group" aria-labelledby="success-stat">
                <span 
                  id="success-stat"
                  className={styles.statNumber} 
                  aria-label={`${statistics.successRate} success rate`}
                >
                  {statistics.successRate}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Success Rate</span>
              </div>
            )}
            {statistics.yearsExperience && (
              <div className={styles.statItem} role="group" aria-labelledby="experience-stat">
                <span 
                  id="experience-stat"
                  className={styles.statNumber} 
                  aria-label={`${statistics.yearsExperience} years of experience`}
                >
                  {statistics.yearsExperience}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Years Experience</span>
              </div>
            )}
          </div>
        )}

        {/* Company Logos Section */}
        {companies.length > 0 && (
          <div className={styles.companiesSection}>
            <p className={styles.companiesText}>
              Professionals from these companies trust our French courses
            </p>
            <div 
              className={styles.logoCarousel}
              role="region"
              aria-label={`Trusted company logos - ${companies.length} companies`}
              aria-describedby="companies-description"
            >
              <span id="companies-description" className="sr-only">
                Logos of companies whose employees have taken our French courses
              </span>
              <div className={styles.logoTrack} role="list">
                {companies.map((company) => (
                  <div 
                    key={company.id} 
                    className={styles.logoItem}
                    role="listitem"
                  >
    
                    <LazyImage
                      src={generateResponsiveImageUrl(company.logo, 200)}
                      alt={`${company.name} company logo`}
                      className={styles.logo}
                      width={120}
                      height={60}
                      sizes="120px"
                      {...generateOptimizedImagePaths(company.logo)}
                      onLoad={() => handleImageLoad(company.id)}
                      onError={() => handleImageError(company.id)}
                    />
                  </div>
                ))}
                {/* Duplicate logos for seamless carousel effect */}
                {companies.map((company) => (
                  <div 
                    key={`${company.id}-duplicate`} 
                    className={styles.logoItem}
                    role="presentation"
                    aria-hidden="true"
                  >
                    <LazyImage
                      src={generateResponsiveImageUrl(company.logo, 200)}
                      alt=""
                      className={styles.logo}
                      width={120}
                      height={60}
                      sizes="120px"
                      {...generateOptimizedImagePaths(company.logo)}
                      tabIndex="-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustIndicators;