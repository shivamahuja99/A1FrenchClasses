# Patterns to Follow

## Design Pattern

### MVC (Model-View-Controller)
Use strict MVC pattern where models, views, and controllers are in separate folders:

- **Models**: JSON data files in `public/data/` directory
  - `courses.json` - Course catalog data
  - `testimonials.json` - Customer testimonials
  - `companies.json` - Trusted company logos
  - `homepage.json` - Homepage content (hero, navigation, company story)

- **Views**: React components in `src/views/` and `src/components/`
  - Views: `HomePage`, `CoursesPage`
  - Components: `Header`, `Footer`, `CourseCard`, `HeroSection`, etc.
  - **No business logic** should be performed at the view level

- **Controllers**: Custom hooks and utilities in `src/controllers/`
  - `useHomepageData.js` - Fetches homepage data
  - `useCoursesData.js` - Fetches courses data
  - `useTestimonials.js` - Fetches testimonials data
  - All data fetching and business logic happens here

## Data Pattern

### Current Implementation
We will be adding a backend layer later. For now:
- Always create dummy data JSON files in `public/data/` directory
- Add data to these files with proper structure
- Use custom hooks (controllers) to fetch and manage data
- Never hardcode data directly in components

### Data Flow
1. JSON files in `public/data/` (Models)
2. Custom hooks fetch data (Controllers)
3. Components receive data via props (Views)

Example:
```javascript
// Controller (useCoursesData.js)
export const useCoursesData = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch from JSON file
  }, []);
  
  return { courses, loading, error };
};

// View (CoursesPage.jsx)
const CoursesPage = () => {
  const { courses, loading, error } = useCoursesData();
  // Render UI with data
};
```

## Routing Pattern

### React Router
- Use `react-router-dom` for client-side navigation
- Define routes in `App.jsx`
- Use `<Link>` for internal navigation
- Use `<a>` for external links and hash anchors

### Navigation Logic
```javascript
// Internal route (SPA navigation)
<Link to="/courses">View Courses</Link>

// Hash link (same page scroll)
<a href="#aboutus">About Us</a>

// External link
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Site
</a>
```

## Component Pattern

### Component Structure
Each component should have:
1. Component file: `ComponentName.jsx`
2. CSS module: `ComponentName.module.css`
3. Test file: `ComponentName.test.jsx`
4. Export from `src/components/index.js`

### Props Pattern
- Always destructure props
- Provide default values
- Pass all required data via props (no hardcoding)
- Validate props in development

Example:
```javascript
const CourseCard = ({ 
  title = 'Untitled Course',
  price = 0,
  image = '/images/placeholder.jpg',
  onClick = () => {}
}) => {
  // Component logic
};
```

## CSS Pattern

### Module CSS
- Use CSS modules for component-scoped styles
- Define animations in the same file where used
- Always include `@keyframes` for animations
- Use CSS variables for theming

### Animation Pattern
```css
/* ALWAYS define keyframes in same file */
.element {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ALWAYS include accessibility */
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
    opacity: 1;
  }
}
```

## Error Handling Pattern

### Component States
Every data-driven component should handle:
1. **Loading State**: Show skeleton or spinner
2. **Error State**: Show error message with retry
3. **Empty State**: Show "no data" message
4. **Success State**: Show actual content

Example:
```javascript
const Component = () => {
  const { data, loading, error } = useData();
  
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data || data.length === 0) return <EmptyState />;
  
  return <ActualContent data={data} />;
};
```

## Testing Pattern

### Test Structure
```javascript
describe('ComponentName', () => {
  it('renders correctly with props', () => {});
  it('handles loading state', () => {});
  it('handles error state', () => {});
  it('handles empty state', () => {});
  it('handles user interactions', () => {});
  it('is accessible', () => {});
});
```

## Deployment Pattern

### Netlify Configuration
1. Create `netlify.toml` with build settings
2. Create `public/_redirects` for SPA routing
3. Configure `vite.config.js` with correct base path
4. Test routing after deployment

### SPA Redirect
```
/* /index.html 200
```

This ensures all routes work correctly in production.