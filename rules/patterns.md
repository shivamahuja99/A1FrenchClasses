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

### Backend Implementation
The project uses a Go backend with PostgreSQL:
- **Models**: GORM structs in `server/internal/models/` defining the schema.
- **Repositories**: Data access logic in `server/internal/repository/` (Postgres repositories).
- **Handlers**: HTTP request handers in `server/cmd/services/`.
- **Controllers (Frontend)**: Custom hooks in `src/controllers/` that fetch data from the Go API.

### Data Flow
1. Database Schema (PostgreSQL)
2. GORM Models (Backend)
3. Repositories communicate with DB (Backend)
4. Handlers expose endpoints (Backend)
5. Custom hooks (Controllers) fetch data via services (Frontend)
6. Components (Views) render the UI (Frontend)

### Repository Pattern
Always use the repository pattern for database interactions:
- Define an interface for the repository.
- Implement the interface for Postgres (using GORM).
- Inject the repository into the handler.

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