import { useState, useEffect } from 'react';

const MOCK_COURSES = {
    "courses": [
        {
            "id": 1,
            "title": "Complete French Course: Learn French for Beginners",
            "description": "Master the basics of French grammar, vocabulary, and pronunciation in this comprehensive course designed for absolute beginners.",
            "image": "https://via.placeholder.com/300x200?text=French+Beginner",
            "rating": 4.8,
            "price": 19.99,
            "discount": 10,
            "difficulty": "Beginner",
            "duration": "12 weeks",
            "language": "English",
            "instructor": "Marie Laurent",
            "course_url": "https://example.com/course-1",
            "reviews": [
                {
                    "id": 1,
                    "rating": 5,
                    "comment": "Great course! I learned so much."
                },
                {
                    "id": 2,
                    "rating": 4,
                    "comment": "Good pace and clear explanations."
                }
            ]
        },
        {
            "id": 2,
            "title": "Intermediate French: Mastering Conversation",
            "description": "Take your French to the next level with this intermediate course focused on conversational skills and real-life scenarios.",
            "image": "https://via.placeholder.com/300x200?text=French+Intermediate",
            "rating": 4.6,
            "price": 29.99,
            "discount": 15,
            "difficulty": "Intermediate",
            "duration": "10 weeks",
            "language": "French",
            "instructor": "Jean-Pierre Dubois",
            "course_url": "https://example.com/course-2",
            "reviews": []
        },
        {
            "id": 3,
            "title": "Advanced French Grammar & Composition",
            "description": "Perfect your writing and grammar skills with advanced lessons on complex sentence structures and literary French.",
            "image": "https://via.placeholder.com/300x200?text=French+Advanced",
            "rating": 4.9,
            "price": 39.99,
            "discount": 0,
            "difficulty": "Advanced",
            "duration": "15 weeks",
            "language": "French",
            "instructor": "Sophie Martin",
            "course_url": "https://example.com/course-3",
            "reviews": []
        },
        {
            "id": 4,
            "title": "French for Business Professionals",
            "description": "Learn the specific vocabulary and etiquette needed to conduct business in French-speaking environments.",
            "image": "https://via.placeholder.com/300x200?text=Business+French",
            "rating": 4.7,
            "price": 49.99,
            "discount": 20,
            "difficulty": "Intermediate",
            "duration": "8 weeks",
            "language": "English/French",
            "instructor": "Luc Bernard",
            "course_url": "https://example.com/course-4",
            "reviews": []
        }
    ]
};

export const useCoursesData = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 800));
                setCourses(MOCK_COURSES.courses);
                setError(null);
            } catch (err) {
                setError('Failed to load courses');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return { courses, loading, error };
};
