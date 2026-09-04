-- Initial Data for Southern Organization Platform
-- Run this after executing the main schema.sql

-- ============================================
-- 1. CREATE DEFAULT ADMIN USER
-- ============================================
-- Email: admin@southern.org
-- Password: admin123
-- Note: This uses a simple SHA-256 hash. In production, use bcrypt!

INSERT INTO admins (full_name, email, password_hash, phone_number)
VALUES (
  'System Administrator',
  'admin@southern.org',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  '+256 700 000000'
);

-- ============================================
-- 2. SAMPLE HELLO SLIDES
-- ============================================

INSERT INTO hello_slides (image_url, description, order_index, direction) VALUES
  ('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800', 'Empowering communities through education and development', 1, 'left'),
  ('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 'Building a better future together', 2, 'left'),
  ('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 'Creating lasting positive change', 3, 'left');

-- ============================================
-- 3. ABOUT US CONTENT
-- ============================================

INSERT INTO about_us (description, image_url, order_index) VALUES
  ('Southern Organization is a community-based non-profit dedicated to creating sustainable change through education, empowerment, and collaboration. Founded in 2010, we have been working tirelessly to improve the lives of people in our communities.', 
   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 
   1),
  ('Our approach combines grassroots engagement with evidence-based interventions to address the root causes of poverty and inequality. We believe in the power of communities to transform themselves when given the right support and resources.', 
   'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 
   2);

-- ============================================
-- 4. VISION & MISSION
-- ============================================

INSERT INTO vision (statement, image_url) VALUES
  ('A world where every individual has access to opportunities for growth, development, and prosperity, regardless of their background or circumstances.',
   'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800');

INSERT INTO mission (statement, image_url) VALUES
  ('To empower communities through sustainable programs in education, healthcare, and economic development, fostering self-reliance and creating lasting positive change.',
   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800');

-- ============================================
-- 5. OBJECTIVES
-- ============================================

INSERT INTO objectives (statement, image_url, order_index) VALUES
  ('Provide quality education to underprivileged children in rural communities', 
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600', 1),
  ('Improve healthcare access and awareness in underserved areas', 
   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', 2),
  ('Create sustainable livelihood opportunities through skills training', 
   'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', 3);

-- ============================================
-- 6. PROGRAMS
-- ============================================

INSERT INTO programs (title, description, image_url, is_featured) VALUES
  ('Education Initiative', 
   'Providing scholarships and learning materials to children from low-income families. This program has helped over 500 students continue their education.',
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 
   true),
  ('Healthcare Outreach', 
   'Mobile clinics and health awareness campaigns reaching remote communities. We provide free medical checkups and essential medicines.',
   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', 
   true),
  ('Skills Training Program', 
   'Vocational training in tailoring, carpentry, and agriculture. Graduates receive startup kits to begin their own businesses.',
   'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 
   true);

-- ============================================
-- 7. ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (title, description, achievement_date, image_url, is_featured) VALUES
  ('1000 Students Educated', 
   'Reached our milestone of providing education support to 1000 students since inception.',
   '2024-12-01',
   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 
   true),
  ('5 Community Health Centers', 
   'Successfully established 5 community health centers in rural areas.',
   '2024-10-15',
   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800', 
   true),
  ('200 Entrepreneurs Trained', 
   'Trained and supported 200 individuals to start their own businesses.',
   '2024-08-20',
   'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', 
   true);

-- ============================================
-- 8. CORE VALUES
-- ============================================

INSERT INTO core_values (title, description, image_url, is_featured) VALUES
  ('Integrity', 
   'We conduct ourselves with honesty and transparency in all our dealings, building trust with communities and partners.',
   'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800', 
   true),
  ('Empowerment', 
   'We believe in strengthening communities to take charge of their own development and future.',
   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 
   true),
  ('Sustainability', 
   'We design programs for long-term impact, ensuring communities can maintain progress independently.',
   'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800', 
   true);

-- ============================================
-- 9. GALLERY
-- ============================================

INSERT INTO gallery (image_url, description, category, is_featured) VALUES
  ('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800', 'Students in our education program', 'Education', true),
  ('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 'Community health outreach', 'Healthcare', true),
  ('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 'Skills training workshop', 'Training', true),
  ('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 'Graduation ceremony', 'Education', true),
  ('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 'Vocational training class', 'Training', true),
  ('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 'Community gathering', 'Events', true);

-- ============================================
-- 10. NEWS
-- ============================================

INSERT INTO news (title, description, published_date, image_url, is_featured) VALUES
  ('New Partnership with Local University', 
   'We are excited to announce a partnership with the local university to expand our education programs and provide mentorship to students.',
   '2025-01-01',
   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 
   true),
  ('Annual Community Festival Success', 
   'Our annual community festival brought together over 2000 people for a day of celebration, learning, and networking.',
   '2024-12-15',
   'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', 
   true),
  ('Healthcare Center Expansion', 
   'Construction begins on expanding our healthcare center to serve 500 more families in the region.',
   '2024-12-01',
   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800', 
   true);

-- ============================================
-- 11. LEADERSHIP
-- ============================================

INSERT INTO leadership (full_name, title, achievement, image_url, order_index) VALUES
  ('Dr. Sarah Johnson', 
   'Executive Director', 
   'Led the organization to reach 10,000+ beneficiaries. PhD in Development Studies with 15 years of experience in community development.',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600', 
   1),
  ('Michael Okello', 
   'Program Director', 
   'Oversees all program implementation. Masters in Public Health and 12 years in program management.',
   'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600', 
   2),
  ('Grace Nakato', 
   'Finance Manager', 
   'Ensures financial sustainability and transparency. CPA with 10 years in non-profit financial management.',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600', 
   3);

-- ============================================
-- 12. UPDATE FOOTER INFO
-- ============================================

UPDATE footer_info SET
  organization_name = 'Southern Organization',
  location = 'Plot 123, Development Road, Kampala, Uganda',
  director = 'Dr. Sarah Johnson',
  email = 'info@southern.org',
  phone = '+256 700 123456',
  organization_type = 'Non-Governmental Organization (NGO)',
  primary_focus = 'Community Development, Education, Healthcare, and Economic Empowerment'
WHERE id = (SELECT id FROM footer_info LIMIT 1);

-- ============================================
-- 13. PAYMENT SETTINGS
-- ============================================

INSERT INTO payment_settings (mobile_money_number, mobile_money_name, mobile_money_network)
VALUES ('+256 700 123456', 'Southern Organization', 'MTN Mobile Money');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify data was inserted correctly:

-- SELECT COUNT(*) as admin_count FROM admins;
-- SELECT COUNT(*) as slides_count FROM hello_slides;
-- SELECT COUNT(*) as programs_count FROM programs;
-- SELECT COUNT(*) as news_count FROM news;
-- SELECT COUNT(*) as leaders_count FROM leadership;

-- ============================================
-- NOTES
-- ============================================
/*
1. All image URLs use Unsplash placeholder images
2. Replace these with actual uploaded images after setting up Supabase Storage
3. The admin password hash is for "admin123" - change this in production!
4. Adjust content to match your organization's actual information
5. Add more sample data as needed for testing
*/
