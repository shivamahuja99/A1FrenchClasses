# Antigravity Rules for A1FrenchClasses

## Project Overview
A1FrenchClasses is a modern course-selling platform specializing in French language education. The platform emphasizes trust-building, professional presentation, and user conversion through a clean, responsive interface with React Router for navigation.

## Core Principles

### 1. Architecture
- **Pattern**: Follow the MVC (Model-View-Controller) pattern strictly
  - **Models**: Data structures and JSON files in `/public/data` directory
  - **Views**: React components in `/src/components` and `/src/views`
  - **Controllers**: Custom hooks and utility functions in `/src/controllers`
- **Separation of Concerns**: No business logic should be performed at the model or view level
- **Data Layer**: Always create dummy data JSON files in `public/data/` directory for now (backend integration planned for future)
- **Routing**: Use React Router (react-router-dom) for client-side navigation

### 2. Technology Stack
- **Frontend Framework**: React 19.2.0 with Vite 7.2.2 build tool
- **Routing**: React Router DOM 7.1.1
- **Styling**: CSS modules with responsive design principles
- **Data Management**: JSON files in `/public/data` directory
- **Component Architecture**: Functional components with hooks
- **Testing**: Vitest 4.0.10 with @testing-library/react 16.3.0
- **Deployment**: Netlify with SPA redirect configuration

### 3. Component Development

#### Component Structure
- Each component must reside in its own directory under `/src/components/`
- Follow the naming convention: `ComponentName/ComponentName.jsx`
- Include corresponding CSS module: `ComponentName/ComponentName.module.css`
- Include tests: `ComponentName/ComponentName.test.jsx`
- Components should be modular, reusable, and focused on a single responsibility

#### Component Guidelines
- Use functional components with hooks
- Props should be clearly defined and validated
- Implement proper error boundaries and fallback states
- Include accessibility features (ARIA labels, alt text, keyboard navigation)
- Export components from `src/components/index.js` for easier imports

### 4. Responsive Design Requirements

#### Breakpoints
- **Small Mobile**: 320px - 480px
- **Mobile**: 481px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1199px
- **Large Desktop**: 1200px+

#### Layout Strategy
- **Mobile-first approach**: Start with mobile layout, then enhance for larger screens
- **Small Mobile**: Single column, minimal padding, compact text
- **Mobile**: Single column layout, stacked components, hamburger navigation
- **Tablet**: Two-column course grid, condensed navigation
- **Desktop**: Multi-column layouts (3-4 columns), full navigation, optimized spacing
- **Large Desktop**: Maximum width containers, enhanced spacing

#### CSS Best Practices
- Use CSS Modules for component-scoped styling
- Define global CSS variables in `src/index.css` for consistent theming
- Utilize Flexbox and CSS Grid for responsive layouts
- Implement progressive loading for images
- **CRITICAL**: Always define `@keyframes` for any animation referenced in CSS
- Include `@media (prefers-reduced-motion: reduce)` for accessibility

### 5. Design Language

#### Visual Aesthetics
- Clean, modern aesthetic inspired by platforms like Coursera and Udemy
- Professional appearance that builds trust
- Consistent typography hierarchy
- Generous white space for improved readability
- Smooth animations and transitions

#### Color Palette
- **Primary**: Professional blue (#1976d2)
- **Secondary**: Warm accent color (#ff9800)
- **Success**: Green for pricing/offers (#4caf50)
- **Error**: Red for errors (#ef4444)
- **Neutral**: Grays for text and backgrounds
- **Background**: Light gray (#f8fafc)

#### Typography
- **Headings**: Bold, clear hierarchy (h1: 2.5rem+, h2: 2rem+, h3: 1.5rem+)
- **Body text**: Readable, accessible font sizes (minimum 16px on desktop, 14px on mobile)
- **Call-to-action**: Prominent, action-oriented styling with gradients

### 6. Data Models

#### Course Model Structure (Updated)
```javascript
{
  id: number,
  title: string,
  description: string,
  image: string,
  rating: number,
  price: number,
  discount: number,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  duration: string,
  language: string,
  instructor: string,
  course_url: string,
  reviews: [
    {
      id: number,
      rating: number,
      comment: string
    }
  ]
}
```

#### Testimonial Model Structure
```javascript
{
  id: string,
  customerName: string,
  feedback: string,
  rating: number,
  customerPhoto: string,
  courseCompleted: string
}
```

#### Homepage Data Structure
```javascript
{
  hero: {
    title: string,
    subtitle: string,
    ctaText: string,
    backgroundImage: string
  },
  companyStory: {
    title: string,
    mission: string,
    story: string,
    teamImage: string,
    statistics: {
      studentsHelped: string,
      coursesOffered: string,
      successRate: string,
      yearsExperience: string
    }
  },
  navigation: {
    logo: string,
    items: [
      {
        label: string,
        href: string
      }
    ]
  }
}
```

### 7. Routing Configuration

#### React Router Setup
- Use `BrowserRouter` as the root router
- Define routes in `App.jsx`
- Use `<Link>` components for internal navigation
- Use regular `<a>` tags for external links and hash anchors

#### Route Structure
```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/courses" element={<CoursesPage />} />
  </Routes>
</BrowserRouter>
```

#### Navigation Best Practices
- **Internal Routes**: Use `<Link to="/path">` for SPA navigation
- **Hash Links**: Use `<a href="#section">` for same-page scrolling
- **External Links**: Use `<a href="https://...">` with `target="_blank"` and `rel="noopener noreferrer"`
- Implement smooth scrolling with `scroll-behavior: smooth` in CSS

#### Deployment Configuration
- **Netlify**: Create `netlify.toml` with SPA redirect rules
- **Redirects**: Create `public/_redirects` file with `/* /index.html 200`
- **Vite**: Ensure `base: '/'` in `vite.config.js`

### 8. Animation Guidelines

#### Required Animations
- **fadeIn**: Fade in from bottom with upward movement
- **slideInLeft**: Slide in from left
- **slideInRight**: Slide in from right
- **scaleIn**: Scale up from 90% to 100%
- **pulse**: Pulsing effect for badges
- **shimmer**: Loading shimmer effect
- **spin**: Spinning loader

#### Animation Best Practices
- **CRITICAL**: Always define `@keyframes` in the same file where animation is used
- Use `opacity` and `transform` for GPU-accelerated animations
- Set appropriate durations (0.3s - 0.8s)
- Use `forwards` fill-mode to maintain final state
- Include accessibility support:
```css
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
    opacity: 1;
  }
}
```

### 9. Error Handling

#### Data Loading
- Implement graceful fallbacks for missing images
- Add loading states with skeleton screens
- Use error boundaries for component failures
- Provide default content when data is unavailable
- Show retry buttons for failed data fetches

#### User Experience
- Display skeleton screens during data fetch
- Show accessible error messages
- Provide fallback navigation options
- Handle edge cases (empty states, no results, etc.)
- Use `LoadingSkeleton` component for consistent loading states

### 10. Performance Optimization

#### Loading Strategy
- Implement lazy loading for images with `LazyImage` component
- Use component code splitting where appropriate
- Preload critical resources with `useImagePreloader` hook
- Minimize initial bundle size
- Use progressive image loading

#### Image Optimization
- Compress images appropriately
- Support WebP format with fallbacks
- Generate responsive image URLs for different screen sizes
- Use proper image dimensions to avoid layout shifts
- Implement `generateResponsiveImageUrl` utility

### 11. Accessibility Standards

#### Requirements
- Provide comprehensive ARIA labels for all interactive elements
- Include alt text for all images (excluding decorative images)
- Ensure keyboard navigation for all interactive components
- Maintain proper color contrast ratios (WCAG AA minimum)
- Use semantic HTML5 elements appropriately
- Implement skip navigation links (`<a href="#main-content">`)
- Add focus indicators for keyboard users
- Use `role` attributes appropriately
- Include `aria-live` regions for dynamic content

### 12. File Organization

#### Directory Structure
```
src/
├── components/
│   ├── Header/
│   ├── HeroSection/
│   ├── TrustIndicators/
│   ├── CompanyStory/
│   ├── FeaturedCourses/
│   ├── CourseCard/
│   ├── CustomerTestimonials/
│   ├── TestimonialCard/
│   ├── Footer/
│   ├── LazyImage/
│   ├── LoadingSkeleton/
│   ├── ErrorBoundary/
│   └── index.js (exports all components)
├── views/
│   ├── HomePage/
│   └── CoursesPage/
├── controllers/
│   ├── useHomepageData.js
│   ├── useCoursesData.js
│   └── useTestimonials.js
├── hooks/
│   └── useImagePreloader.js
├── utils/
│   └── imageUtils.js
└── styles/
    └── animations.css

public/
├── data/
│   ├── courses.json
│   ├── testimonials.json
│   ├── companies.json
│   └── homepage.json
├── images/
│   ├── courses/
│   ├── testimonials/
│   └── companies/
└── _redirects (for Netlify)
```

### 13. Testing Guidelines

#### Unit Testing
- Write tests for component rendering
- Validate props handling
- Test user interactions
- Verify data transformations
- Test loading, error, and empty states

#### Test File Naming
- `ComponentName.test.jsx` for component tests
- Use `describe` blocks for grouping related tests
- Use descriptive test names

#### Common Test Patterns
```javascript
describe('ComponentName', () => {
  it('renders correctly with props', () => {});
  it('handles loading state', () => {});
  it('handles error state', () => {});
  it('handles empty state', () => {});
  it('handles user interactions', () => {});
});
```

### 14. Code Quality Standards

#### General Rules
- Write clean, self-documenting code
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for components)
- Add comments for complex logic only (code should be self-explanatory)
- Keep functions small and focused on single responsibilities
- Avoid code duplication (DRY principle)
- Use meaningful variable and function names

#### React Best Practices
- Use destructuring for props
- Implement proper dependency arrays in useEffect
- Memoize expensive calculations with useMemo
- Use useCallback for function props to prevent unnecessary re-renders
- Keep component files under 300 lines (split if larger)
- Always pass required props to child components

### 15. Conversion Optimization

#### Call-to-Action Strategy
- Display prominent CTAs in hero section
- Provide clear "View All Courses" button in featured courses section
- Include "Learn More" or "Enroll Now" buttons on course cards
- Make contact information easily accessible
- Use action-oriented language in CTAs
- Use gradient buttons with hover effects

#### Trust Building Elements
- Display trusted company logos prominently
- Showcase customer testimonials with photos and ratings
- Present clear company story and mission
- Highlight featured courses
- Show transparent pricing with discounts
- Display statistics (students helped, years of experience)

### 16. Navigation Guidelines
- Implement responsive navigation with hamburger menu for mobile
- Ensure clear navigation hierarchy
- Use hash links (#aboutus, #courses, #testimonials, #footer) for same-page navigation
- Use React Router Links for page-to-page navigation
- Maintain consistent navigation across all pages
- Close mobile menu on navigation

### 17. Content Guidelines

#### Homepage Requirements
- Clear value proposition in hero section with animated entrance
- Company story and mission statement with statistics
- Trust indicators (companies, statistics)
- Featured courses (limit to 3) with "View All Courses" button
- Customer testimonials section with carousel on mobile
- Clear calls-to-action throughout

#### Courses Page Requirements
- Display all available courses
- Show loading skeleton while fetching data
- Handle error states with retry button
- Display empty state if no courses available
- Show course count
- Responsive grid layout (1-4 columns based on screen size)

#### Course Card Information Display
- Course title and description
- Instructor name
- Duration and language
- Rating with visual stars
- Price (both original and discounted)
- Discount badge (if applicable)
- Difficulty level badge
- External link to course URL

### 18. SEO Best Practices
- Include proper meta tags in `index.html`
- Add Open Graph tags for social sharing
- Add Twitter Card tags
- Include canonical URL
- Use descriptive page titles
- Add meta descriptions
- Use semantic HTML structure

### 19. CSS Audit Checklist
Before deploying, verify:
- [ ] All animations have corresponding `@keyframes` defined
- [ ] No CSS syntax errors
- [ ] All colors use defined variables
- [ ] Responsive breakpoints are consistent
- [ ] `prefers-reduced-motion` is implemented
- [ ] No hardcoded colors (use CSS variables)
- [ ] All hover states are defined
- [ ] Focus states are visible

### 20. Common Pitfalls to Avoid

#### CSS Issues
- ❌ **Never** reference an animation without defining its `@keyframes`
- ❌ **Never** use `opacity: 0` without a corresponding animation or state change
- ❌ **Never** forget to add fallback styles for animations
- ✅ **Always** test animations in browsers with reduced motion enabled

#### Component Issues
- ❌ **Never** render a component without passing required props
- ❌ **Never** forget to handle loading, error, and empty states
- ❌ **Never** hardcode data in components (use props or hooks)
- ✅ **Always** validate props and provide defaults

#### Routing Issues
- ❌ **Never** use `<a>` tags for internal React Router navigation
- ❌ **Never** forget to configure SPA redirects for deployment
- ❌ **Never** mix hash routing with browser routing
- ✅ **Always** use `<Link>` for internal routes, `<a>` for external/hash links

## Implementation Priorities

When implementing features, follow this priority order:
1. **Data Layer**: Create JSON data files first
2. **Core Components**: Build reusable UI components
3. **Routing**: Set up React Router and navigation
4. **Trust Building**: Hero section, company story, trust indicators
5. **Core Functionality**: Course showcase with detailed information
6. **Social Proof**: Customer testimonials
7. **Responsive Design**: Mobile, tablet, desktop optimization
8. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
9. **Performance**: Image optimization, lazy loading, code splitting
10. **Polish**: Animations, transitions, micro-interactions
11. **Testing**: Write comprehensive tests
12. **Deployment**: Configure Netlify and verify routing

## Development Workflow

1. Start with data models and JSON files in `public/data/`
2. Create custom hooks in `src/controllers/` for data fetching
3. Build reusable UI components in `src/components/`
4. Compose components into page views in `src/views/`
5. Implement responsive styles using mobile-first approach
6. Add animations with proper `@keyframes` definitions
7. Add accessibility features (ARIA, keyboard navigation)
8. Write tests for all components
9. Optimize performance (lazy loading, code splitting)
10. Configure routing and deployment
11. Test across devices and browsers
12. Refine and polish

## Notes for Antigravity

- Always reference the design documents in `.kiro/specs/homepage-design/` for detailed specifications
- Check `rules/patterns.md` for MVC pattern enforcement
- Refer to `rules/introduction.md` for high-level feature overview
- When in doubt, prioritize trust-building and clear presentation
- Maintain consistency with established color palette and typography
- Test responsive behavior at all defined breakpoints
- Ensure all interactive elements are keyboard accessible
- **CRITICAL**: Always verify CSS animations have `@keyframes` defined
- **CRITICAL**: Always pass required props to components
- **CRITICAL**: Always configure SPA redirects for deployment
- Run `npm run test:run` before committing changes
- Check browser console for errors and warnings
- Verify all sections display content correctly

## Recent Updates (2025-11-21)

### Routing Implementation
- Implemented React Router DOM for client-side navigation
- Created CoursesPage for full course catalog
- Updated Header component with smart Link/anchor detection
- Configured Netlify deployment with SPA redirects

### CSS Fixes
- Fixed missing `@keyframes fadeIn` in CourseCard.module.css
- Fixed missing `@keyframes fadeIn` in TestimonialCard.module.css
- Fixed missing animations in HeroSection.module.css (slideInLeft, slideInRight, scaleIn)
- Added accessibility support for reduced motion in all components

### Component Updates
- Updated CourseCard to use new data schema with ratings and discounts
- Updated FeaturedCourses to show limited courses with "View All Courses" button
- Fixed HomePage to pass companyStoryData props to CompanyStory component
- Added external URL redirection for course cards

### Data Model Changes
- Updated course model to include: title, rating, discount, difficulty, instructor, course_url
- Created useCoursesData hook for mock API calls
- Separated navigation data into homepage.json

### Testing
- Added comprehensive tests for CourseCard
- Added comprehensive tests for CoursesPage
- All tests passing with proper data mocking
