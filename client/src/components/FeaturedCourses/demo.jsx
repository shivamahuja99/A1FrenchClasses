// Demo file to test FeaturedCourses component integration
import FeaturedCourses from './FeaturedCourses';

// This is a simple demo component to verify the integration works
const FeaturedCoursesDemo = () => {
  return (
    <div>
      <h1>Featured Courses Demo</h1>
      <FeaturedCourses limit={3} showViewAllLink={true} />
    </div>
  );
};

export default FeaturedCoursesDemo;