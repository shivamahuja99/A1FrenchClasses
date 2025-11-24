/**
 * Common navigation configuration for the application
 * This data is used across all pages to ensure consistent header navigation
 */

const navigationConfig = {
    logo: "/images/logo.png",
    items: [
        {
            label: "Home",
            href: "/"
        },
        {
            label: "About",
            href: "/#aboutus"
        },
        {
            label: "Courses",
            href: "/courses"
        },
        {
            label: "Testimonials",
            href: "/#testimonials"
        },
        {
            label: "Contact",
            href: "/#footer"
        }
    ]
};

export default navigationConfig;
