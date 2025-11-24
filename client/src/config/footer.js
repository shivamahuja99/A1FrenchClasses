/**
 * Common footer configuration for the application
 * This data is used across all pages to ensure consistent footer information
 */

const footerConfig = {
    contactInfo: {
        email: 'info@a1frenchclasses.com',
        phone: '+1 (555) 123-4567',
        address: '123 French Street, Paris, France',
        hours: 'Mon-Fri: 9AM-6PM'
    },
    socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/a1frenchclasses' },
        { platform: 'Twitter', url: 'https://twitter.com/a1frenchclasses' },
        { platform: 'Instagram', url: 'https://instagram.com/a1frenchclasses' }
    ],
    companyInfo: {
        description: 'Learn French with confidence through our expert-led courses and proven methodology.',
        privacyPolicy: '/privacy',
        termsOfService: '/terms'
    }
};

export default footerConfig;
