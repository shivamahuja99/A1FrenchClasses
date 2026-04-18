package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"services/internal/database"
	"services/internal/models"
	"services/internal/telemetry"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: .env file not found\n")
	}

	ctx := context.Background()

	// Initialize Telemetry for migration logs too
	logger, shutdown, err := telemetry.InitLogger(ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize telemetry: %v\n", err)
		os.Exit(1)
	}
	defer shutdown()

	db, err := database.ConnectDatabase(ctx, logger)
	if err != nil {
		logger.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	_ = MigrateDatabase(ctx, db.DB_client, logger)
}

func MigrateDatabase(ctx context.Context, db_client *gorm.DB, logger *slog.Logger) error {
	if db_client == nil {
		return fmt.Errorf("database client is required")
	}

	logger.Info("Starting database migration")

	if err := db_client.AutoMigrate(models.AllModels...); err != nil {
		return fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	// Manual migration: drop legacy columns that AutoMigrate doesn't remove.
	legacyColumns := []string{"course_id", "user_id"}
	for _, col := range legacyColumns {
		sql := fmt.Sprintf(
			`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='%s') THEN ALTER TABLE payments DROP COLUMN %s; END IF; END $$;`,
			col, col,
		)
		if err := db_client.Exec(sql).Error; err != nil {
			logger.Warn("Could not drop legacy column", "column", col, "error", err)
		} else {
			logger.Info("Dropped legacy column", "column", col)
		}
	}

	// Drop quantity from cart_items
	cartItemsSql := `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cart_items' AND column_name='quantity') THEN ALTER TABLE cart_items DROP COLUMN quantity; END IF; END $$;`
	if err := db_client.Exec(cartItemsSql).Error; err != nil {
		logger.Warn("Could not drop quantity column from cart_items", "error", err)
	} else {
		logger.Info("Dropped quantity column from cart_items")
	}

	reviewTestimonialColumnsSQL := `
		ALTER TABLE reviews ADD COLUMN IF NOT EXISTS testimonial_tag VARCHAR(255) NOT NULL DEFAULT '';
		ALTER TABLE reviews ADD COLUMN IF NOT EXISTS testimonial_role VARCHAR(255) NOT NULL DEFAULT '';
		ALTER TABLE reviews ADD COLUMN IF NOT EXISTS testimonial_avatar_bg TEXT NOT NULL DEFAULT '';
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_name='reviews' AND column_name='testimonial_avatar'
			) THEN
				UPDATE reviews
				SET testimonial_avatar_bg = testimonial_avatar
				WHERE testimonial_avatar_bg = '';
			END IF;
		END $$;
	`
	if err := db_client.Exec(reviewTestimonialColumnsSQL).Error; err != nil {
		logger.Warn("Could not ensure review testimonial columns", "error", err)
	} else {
		logger.Info("Ensured review testimonial columns")
	}

	// Ensure new this_includes column exists and backfill from legacy includes when present.
	courseIncludesSQL := `
		ALTER TABLE courses ADD COLUMN IF NOT EXISTS this_includes JSONB NOT NULL DEFAULT '[]'::jsonb;
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_name='courses' AND column_name='includes'
			) THEN
				UPDATE courses
				SET this_includes = COALESCE(includes, '[]'::jsonb)
				WHERE this_includes = '[]'::jsonb;
			END IF;
		END $$;
	`
	if err := db_client.Exec(courseIncludesSQL).Error; err != nil {
		logger.Warn("Could not ensure this_includes column", "error", err)
	} else {
		logger.Info("Ensured this_includes column and backfilled values")
	}

	defaultCourseIncludes, err := buildDefaultCourseIncludesJSON()
	if err != nil {
		return fmt.Errorf("failed to build default course includes: %w", err)
	}
	if err := db_client.Exec(`UPDATE courses SET this_includes = ?::jsonb`, defaultCourseIncludes).Error; err != nil {
		logger.Warn("Could not apply default this_includes values to courses", "error", err)
	} else {
		logger.Info("Applied default this_includes values to all courses")
	}

	// Seed default app settings
	logger.Info("Seeding default app settings")
	faqValue, testimonialsValue, whyUsValue, err := buildHomepageSeedSettings()
	if err != nil {
		return fmt.Errorf("failed to build homepage settings seed: %w", err)
	}

	baseSettings := []models.AppSetting{
		{Key: "contact_recipient_email", Value: "hello@a1frenchclasses.ca", Description: "Email where contact submissions are sent"},
		{Key: "contact_whatsapp_number", Value: "+1234567890", Description: "WhatsApp number for automated notifications"},
		{Key: "google_spreadsheet_id", Value: "", Description: "ID of the Google Sheet for lead storage"},
	}

	homepageSettings := []models.AppSetting{
		{Key: "homepage_faq", Value: faqValue, Description: "Homepage FAQ items as JSON array"},
		{Key: "homepage_testimonials", Value: testimonialsValue, Description: "Homepage testimonials as JSON array"},
		{Key: "homepage_why_us", Value: whyUsValue, Description: "Homepage Why Us items as JSON array"},
	}

	for _, setting := range baseSettings {
		var existing models.AppSetting
		err := db_client.Where("key = ?", setting.Key).First(&existing).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				if createErr := db_client.Create(&setting).Error; createErr != nil {
					logger.Warn("Could not seed app setting", "key", setting.Key, "error", createErr)
				}
				continue
			}
			logger.Warn("Could not read app setting", "key", setting.Key, "error", err)
			continue
		}
	}

	for _, setting := range homepageSettings {
		if err := db_client.Exec(
			`INSERT INTO app_settings (key, value, description)
			 VALUES (?, ?, ?)
			 ON CONFLICT (key) DO UPDATE
			 SET value = EXCLUDED.value, description = EXCLUDED.description`,
			setting.Key, setting.Value, setting.Description,
		).Error; err != nil {
			logger.Warn("Could not upsert homepage setting", "key", setting.Key, "error", err)
		}
	}
	logger.Info("Default app settings seeded")

	if err := seedTestimonialReviews(db_client, logger); err != nil {
		logger.Warn("Could not seed testimonial reviews", "error", err)
	} else {
		logger.Info("Seeded testimonials into reviews table")
	}

	logger.Info("Database migration completed successfully")
	return nil
}

func buildHomepageSeedSettings() (string, string, string, error) {
	faq := []map[string]string{
		{
			"question": "Will I actually score CLB 7+? What's your success rate?",
			"answer":   "500+ students have crossed TEF/TCF with us and our pass rate sits at 98%. The reason isn't magic - it's our exam-first curriculum, 5 live classes per week, weekly mock tests, and small batches (max 10-12) where every student gets personal attention. If you show up, do the homework, and stay consistent through the 9-month program, the results follow. We've seen it happen hundreds of times.",
		},
		{
			"question": "I'm a complete beginner. How long until I can write TEF/TCF?",
			"answer":   "Realistic timelines based on 500+ students: <strong>CLB 5 in 4-5 months</strong> and <strong>CLB 7 (the one that unlocks the +50 CRS bonus for PR) in 9 months</strong>. Beware of anyone promising CLB 7 in 3 months - it isn't possible for true beginners, and students who try end up retaking the exam 2-3 times. Our pace is proven and sustainable, and most students clear TEF/TCF on the first attempt.",
		},
		{
			"question": "Can I really extend my work permit with just CLB 5 in French?",
			"answer":   "Yes - this is one of the best-kept secrets in Canadian immigration. Under the <strong>Francophone Mobility Program</strong> (part of the International Mobility Program, LMIA-exempt, category code C16), French-speaking workers with at least <strong>CLB 5 in oral comprehension and oral expression</strong> can apply for a work permit to work anywhere in Canada outside Quebec. No LMIA required. This is why our CLB 5 Foundation course puts extra weight on speaking and listening - those are the two skills that matter for this pathway. Thousands of temporary residents use French to stay in Canada while they work toward PR.",
		},
		{
			"question": "Should I take TEF or TCF for Canada PR?",
			"answer":   "Both are accepted by IRCC for Express Entry, PNP, and CEC. TEF Canada tends to be slightly easier for the writing section; TCF Canada has clearer grading. During your onboarding call, we'll analyze your profile and recommend the right exam. (Yes, this strategy call is included in every package.)",
		},
		{
			"question": "How many CRS points can French actually give me?",
			"answer":   "Up to 50 additional CRS points for French as a second official language when you hit CLB 7+ in all four skills.",
		},
		{
			"question": "What if I miss a class?",
			"answer":   "Our program is built around live attendance - with 5 classes every week, consistency is what drives results. You'll have a private WhatsApp group with your batch and the teacher, so you can ask doubts, catch up on anything important, and stay in sync between sessions. Because recordings aren't provided, we strongly recommend blocking your calendar for class times before enrolling.",
		},
		{
			"question": "How do I know this isn't just another online course?",
			"answer":   "Three things set us apart: (1) We are laser-focused on Canada PR - not generic French. (2) Our small-batch format (max 10-12) gives you real speaking time, unlike 50-person Zoom lectures or pre-recorded courses. (3) 5 live classes every week creates real momentum - you can't help but improve.",
		},
		{
			"question": "What's the 50% off PR consultation bonus?",
			"answer":   "Every student who enrolls this month gets a 50% discount on a one-on-one Canada PR consultation with our partnered immigration consultant. You'll map your Express Entry profile, model your CRS score jump from the French bonus, and leave with a clear PR roadmap. It's a high-value add-on we include to make sure your French studies translate directly into PR action.",
		},
	}

	testimonialSeeds := buildTestimonialSeeds()
	testimonials := make([]map[string]string, 0, len(testimonialSeeds))
	for _, t := range testimonialSeeds {
		testimonials = append(testimonials, map[string]string{
			"stars":     "★★★★★",
			"tag":       t.Tag,
			"quote":     t.Quote,
			"initials":  t.Initials,
			"name":      t.Name,
			"role":      t.Role,
			"avatar_bg": t.AvatarBG,
		})
	}

	whyUs := []map[string]string{
		{
			"icon":        "🎯",
			"title":       "Exam-first curriculum",
			"description": "Every module maps directly to the 4 TEF/TCF sections with no filler.",
		},
		{
			"icon":        "🗣️",
			"title":       "Small batches",
			"description": "Max 10-12 students per batch so each learner gets real speaking practice and feedback.",
		},
		{
			"icon":        "🏆",
			"title":       "Proven outcomes",
			"description": "500+ students have crossed TEF/TCF with us, backed by weekly progress tracking.",
		},
		{
			"icon":        "📚",
			"title":       "Mock exams",
			"description": "Full-length, evaluator-scored TEF and TCF mocks to build confidence before exam day.",
		},
	}

	faqValue, err := json.Marshal(faq)
	if err != nil {
		return "", "", "", err
	}
	testimonialsValue, err := json.Marshal(testimonials)
	if err != nil {
		return "", "", "", err
	}
	whyUsValue, err := json.Marshal(whyUs)
	if err != nil {
		return "", "", "", err
	}

	return string(faqValue), string(testimonialsValue), string(whyUsValue), nil
}

func buildDefaultCourseIncludesJSON() (string, error) {
	defaultIncludes := []string{
		"Multiple video lectures",
		"Live online classes",
		"Certificate of completion",
		"Lifetime access",
		"Interactive exercises",
	}

	value, err := json.Marshal(defaultIncludes)
	if err != nil {
		return "", err
	}
	return string(value), nil
}

type testimonialSeed struct {
	Name     string
	Email    string
	Initials string
	Tag      string
	Quote    string
	Role     string
	AvatarBG string
	Rating   int
}

func buildTestimonialSeeds() []testimonialSeed {
	return []testimonialSeed{
		{
			Name:     "Arjun P.",
			Email:    "arjun.p.testimonial@a1frenchclasses.ca",
			Initials: "AP",
			Tag:      "TEF · CLB 7",
			Quote:    "Started at pure zero last year. Nine months later I had CLB 7 on TEF - added 50 CRS points to my profile and got my PR invite in the next draw. This course literally changed my life.",
			Role:     "Software Engineer · Bangalore -> Toronto",
			AvatarBG: "linear-gradient(135deg, var(--ds-secondary), var(--ds-accent))",
			Rating:   5,
		},
		{
			Name:     "Sneha M.",
			Email:    "sneha.m.testimonial@a1frenchclasses.ca",
			Initials: "SM",
			Tag:      "TCF · CLB 7",
			Quote:    "I needed CLB 5 for my PNP application. Other places told me 2 years. A1 got me there in 4.5 months - I actually spoke French every single session. Small groups made all the difference.",
			Role:     "Registered Nurse · Mumbai -> Vancouver",
			AvatarBG: "linear-gradient(135deg, #10B981, #047857)",
			Rating:   5,
		},
		{
			Name:     "Rahul K.",
			Email:    "rahul.k.testimonial@a1frenchclasses.ca",
			Initials: "RK",
			Tag:      "TEF · CLB 9",
			Quote:    "The mock exam strategy is gold. By the time I sat the actual TEF, it felt routine. Got CLB 9 - which was higher than I even needed. Worth every single dollar.",
			Role:     "Project Manager · Delhi -> Montreal",
			AvatarBG: "linear-gradient(135deg, #F59E0B, #D97706)",
			Rating:   5,
		},
		{
			Name:     "Priya S.",
			Email:    "priya.s.testimonial@a1frenchclasses.ca",
			Initials: "PS",
			Tag:      "TCF · CLB 7",
			Quote:    "What I loved most - the teacher genuinely cares. She WhatsApped me the night before my exam to calm my nerves. You don't get that anywhere else. Got my 50 CRS bonus.",
			Role:     "Accountant · Hyderabad -> Ottawa",
			AvatarBG: "linear-gradient(135deg, var(--ds-primary), var(--ds-secondary))",
			Rating:   5,
		},
		{
			Name:     "Vikram T.",
			Email:    "vikram.t.testimonial@a1frenchclasses.ca",
			Initials: "VT",
			Tag:      "TEF · CLB 8",
			Quote:    "I work full-time and have two kids. The evening batch made it doable. The WhatsApp support group helped me stay on track between sessions. Cleared TEF first attempt - incredibly grateful.",
			Role:     "IT Consultant · Pune -> Calgary",
			AvatarBG: "linear-gradient(135deg, #EC4899, #BE185D)",
			Rating:   5,
		},
		{
			Name:     "Nisha A.",
			Email:    "nisha.a.testimonial@a1frenchclasses.ca",
			Initials: "NA",
			Tag:      "TCF · CLB 8",
			Quote:    "After two failed TCF attempts on my own, I was desperate. This course fixed every weakness - especially expression orale, which tanked me before. Third time: CLB 8.",
			Role:     "Marketing Lead · Chennai -> Edmonton",
			AvatarBG: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
			Rating:   5,
		},
	}
}

func seedTestimonialReviews(db_client *gorm.DB, logger *slog.Logger) error {
	var course models.Course
	if err := db_client.Order("created_at ASC").First(&course).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn("Skipping testimonial review seed because no course exists")
			return nil
		}
		return fmt.Errorf("failed to load course for testimonial seed: %w", err)
	}

	for _, seed := range buildTestimonialSeeds() {
		var user models.User
		if err := db_client.Where("email = ?", seed.Email).First(&user).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				user = models.User{
					Name:         seed.Name,
					Email:        seed.Email,
					Password:     "",
					Type:         "student",
					MobileNumber: "",
					DateOfBirth:  "",
				}
				if createErr := db_client.Create(&user).Error; createErr != nil {
					logger.Warn("Could not create testimonial user", "email", seed.Email, "error", createErr)
					continue
				}
			} else {
				logger.Warn("Could not fetch testimonial user", "email", seed.Email, "error", err)
				continue
			}
		}

		_ = db_client.Model(&models.User{}).Where("id = ?", user.ID).Update("name", seed.Name).Error

		var review models.Review
		err := db_client.Where("user_id = ? AND course_id = ?", user.ID, course.ID).First(&review).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				review = models.Review{
					Rating:            seed.Rating,
					Comment:           seed.Quote,
					TestimonialTag:    seed.Tag,
					TestimonialRole:   seed.Role,
					TestimonialAvatar: seed.AvatarBG,
					CourseID:          course.ID,
					UserID:            user.ID,
				}
				if createErr := db_client.Create(&review).Error; createErr != nil {
					logger.Warn("Could not create testimonial review", "name", seed.Name, "error", createErr)
				}
				continue
			}
			logger.Warn("Could not fetch testimonial review", "name", seed.Name, "error", err)
			continue
		}

		if updateErr := db_client.Model(&models.Review{}).
			Where("id = ?", review.ID).
			Updates(map[string]any{
				"rating":                seed.Rating,
				"comment":               seed.Quote,
				"testimonial_tag":       seed.Tag,
				"testimonial_role":      seed.Role,
				"testimonial_avatar_bg": seed.AvatarBG,
			}).Error; updateErr != nil {
			logger.Warn("Could not update testimonial review", "name", seed.Name, "error", updateErr)
		}
	}
	return nil
}
