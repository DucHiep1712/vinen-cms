-- Create tag management tables for centralized tag storage

-- Create news_tags table
CREATE TABLE IF NOT EXISTS news_tags (
    tags TEXT DEFAULT '[]' NOT NULL
);

-- Create product_tags table
CREATE TABLE IF NOT EXISTS product_tags (
    tags TEXT DEFAULT '[]' NOT NULL
);

-- Insert initial empty tag arrays
INSERT INTO news_tags (tags) VALUES ('[]') ON CONFLICT DO NOTHING;
INSERT INTO product_tags (tags) VALUES ('[]') ON CONFLICT DO NOTHING;

-- Add some sample tags for testing (optional)
-- UPDATE news_tags SET tags = '["Tin Hiệp hội", "Chính sách", "Sự kiện", "Thông báo"]';
-- UPDATE product_tags SET tags = '["Công nghệ", "Giải pháp", "Dịch vụ", "Phần mềm"]'; 