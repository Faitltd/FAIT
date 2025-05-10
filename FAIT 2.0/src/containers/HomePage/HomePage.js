import React from 'react';
import { FormattedMessage } from 'react-intl';
import css from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={css.root}>
      <div className={css.heroSection}>
        <div className={css.centeredContent}>
          <h1 className={css.heroTitle}>
            <FormattedMessage id="HomePage.title" defaultMessage="Welcome to Our Platform" />
          </h1>
          <p className={css.heroSubtitle}>
            <FormattedMessage 
              id="HomePage.subtitle" 
              defaultMessage="Discover, connect, and engage with our community" 
            />
          </p>
        </div>
      </div>
      
      <div className={css.photoGallery}>
        <div className={css.photoContainer}>
          <img 
            src="/static/images/homepage/photo1.jpg" 
            alt="Community event" 
            className={css.photo}
          />
          <h3 className={css.photoCaption}>Community Events</h3>
        </div>
        <div className={css.photoContainer}>
          <img 
            src="/static/images/homepage/photo2.jpg" 
            alt="Workshop" 
            className={css.photo}
          />
          <h3 className={css.photoCaption}>Workshops</h3>
        </div>
        <div className={css.photoContainer}>
          <img 
            src="/static/images/homepage/photo3.jpg" 
            alt="Success stories" 
            className={css.photo}
          />
          <h3 className={css.photoCaption}>Success Stories</h3>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
