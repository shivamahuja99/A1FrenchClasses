import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourseQuery, useAddToCartMutation } from '../../store/api/apiSlice';
import styles from './CourseDetailsPage.module.css';
import CustomerReviews from '../../components/CustomerReviews/CustomerReviews';
import InstructorInfo from '../../components/InstructorInfo/InstructorInfo';
import CourseHeader from '../../components/CourseHeader/CourseHeader';
import CourseInfo from '../../components/CourseInfo/CourseInfo';
import CoursePurchaseCard from '../../components/CoursePurchaseCard/CoursePurchaseCard';
import MobileStickyBar from '../../components/MobileStickyBar/MobileStickyBar';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { Header, Footer } from '../../components';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';

const CourseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: course, isLoading, error } = useGetCourseQuery(id);
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const [addedToCart, setAddedToCart] = useState(false);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const handleAddToCart = async () => {
        try {
            await addToCart({ course_id: id, quantity: 1 }).unwrap();
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 3000);
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert('Failed to add course to cart. Please try again.');
        }
    };

    const handleBuyNow = async () => {
        try {
            await addToCart({ course_id: id, quantity: 1 }).unwrap();
            navigate('/cart');
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert('Failed to add course to cart. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className={styles.courseDetailsPage}>
                <Header
                    logo={navigationConfig.logo}
                    navigationItems={navigationConfig.items}
                    authComponent={isAuthenticated ? <ProfileDropdown /> : null}
                />
                <div className={styles.container}>
                    <LoadingSkeleton variant="card" count={1} />
                </div>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.courseDetailsPage}>
                <Header
                    logo={navigationConfig.logo}
                    navigationItems={navigationConfig.items}
                    authComponent={isAuthenticated ? <ProfileDropdown /> : null}
                />
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <h2>Error Loading Course</h2>
                        <p>Unable to load course details. Please try again later.</p>
                        <button onClick={() => navigate('/courses')} className={styles.backButton}>
                            Back to Courses
                        </button>
                    </div>
                </div>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    if (!course) {
        return (
            <div className={styles.courseDetailsPage}>
                <Header
                    logo={navigationConfig.logo}
                    navigationItems={navigationConfig.items}
                    authComponent={isAuthenticated ? <ProfileDropdown /> : null}
                />
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <h2>Course Not Found</h2>
                        <p>The course you're looking for doesn't exist.</p>
                        <button onClick={() => navigate('/courses')} className={styles.backButton}>
                            Back to Courses
                        </button>
                    </div>
                </div>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    // Calculate discounted price and check for discount
    const hasDiscount = course.discount && course.discount > 0;
    const discountedPrice = hasDiscount
        ? (course.price * (1 - course.discount / 100)).toFixed(2)
        : course.price;

    return (
        <div className={styles.courseDetailsPage}>
            <Header
                logo={navigationConfig.logo}
                navigationItems={navigationConfig.items}
                authComponent={isAuthenticated ? <ProfileDropdown /> : null}
            />

            <CourseHeader course={course} />

            <div className={styles.container}>
                {/* Main Content Grid */}
                <div className={styles.contentGrid}>
                    {/* Left Column */}
                    <div className={styles.mainContent}>
                        {/* Course Details Section */}
                        <CourseInfo course={course} />

                        {/* Instructor Section */}
                        {course.instructor && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Instructor</h2>
                                <InstructorInfo instructor={course.instructor} />
                            </section>
                        )}

                        {/* Customer Reviews Section */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Student Reviews</h2>
                            <CustomerReviews reviews={course.reviews || []} courseId={course.id} />
                        </section>
                    </div>

                    {/* Right Column - Sticky Purchase Card */}
                    <aside className={styles.sidebar}>
                        <CoursePurchaseCard
                            course={course}
                            discountedPrice={discountedPrice}
                            hasDiscount={hasDiscount}
                            isAddingToCart={isAddingToCart}
                            addedToCart={addedToCart}
                            onBuyNow={handleBuyNow}
                            onAddToCart={handleAddToCart}
                        />
                    </aside>
                </div>
            </div>

            <Footer
                logo={navigationConfig.logo}
                companyInfo={footerConfig.companyInfo}
                navigationLinks={navigationConfig.items}
                socialLinks={footerConfig.socialLinks}
                contactInfo={footerConfig.contactInfo}
            />

            <MobileStickyBar
                discountedPrice={discountedPrice}
                hasDiscount={hasDiscount}
                originalPrice={course.price}
                isAddingToCart={isAddingToCart}
                addedToCart={addedToCart}
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
};

export default CourseDetailsPage;
