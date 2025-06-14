/*
  # Insert Dummy Data for Sri Vijaya Lakshmi Agency

  1. Sample Products
    - Various rice types with different categories
    - Price slabs for bulk discounts
    
  2. Sample Banners
    - Promotional banners for homepage
    
  3. Sample Coupons
    - Discount coupons for testing
*/

-- Insert sample products
INSERT INTO products (name, description, image, base_price, available_quantity, weight, category) VALUES
('Premium Basmati Rice', 'Long grain aromatic basmati rice, perfect for biryanis and special occasions. Aged for superior taste and texture.', 'https://images.pexels.com/photos/4198538/pexels-photo-4198538.jpeg?auto=compress&cs=tinysrgb&w=800', 120.00, 50, '25kg', 'basmati'),
('Sona Masoori Rice', 'Medium grain rice, ideal for daily meals. Light, aromatic, and easy to digest. Perfect for South Indian cuisine.', 'https://images.pexels.com/photos/6758773/pexels-photo-6758773.jpeg?auto=compress&cs=tinysrgb&w=800', 80.00, 75, '25kg', 'regular'),
('Jasmine Rice', 'Fragrant long grain rice with a subtle floral aroma. Soft texture and delicate flavor profile.', 'https://images.pexels.com/photos/7262775/pexels-photo-7262775.jpeg?auto=compress&cs=tinysrgb&w=800', 95.00, 30, '25kg', 'premium'),
('Brown Basmati Rice', 'Whole grain basmati rice with natural bran layer intact. Rich in fiber and nutrients.', 'https://images.pexels.com/photos/4033325/pexels-photo-4033325.jpeg?auto=compress&cs=tinysrgb&w=800', 140.00, 25, '25kg', 'basmati'),
('Ponni Rice', 'Traditional Tamil Nadu rice variety. Short grain, high yield, and excellent for everyday cooking.', 'https://images.pexels.com/photos/4033338/pexels-photo-4033338.jpeg?auto=compress&cs=tinysrgb&w=800', 70.00, 100, '25kg', 'regular'),
('Jeera Samba Rice', 'Premium short grain rice with natural aroma. Traditional variety known for its unique taste.', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800', 110.00, 40, '25kg', 'premium'),
('IR64 Parboiled Rice', 'Long grain parboiled rice. Non-sticky, separate grains when cooked. Great for export quality dishes.', 'https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=800', 65.00, 80, '25kg', 'regular'),
('Kolam Rice', 'Medium grain rice with good cooking quality. Popular choice for daily meals across South India.', 'https://images.pexels.com/photos/4033349/pexels-photo-4033349.jpeg?auto=compress&cs=tinysrgb&w=800', 75.00, 60, '25kg', 'regular');

-- Insert price slabs for each product
DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN SELECT id, base_price FROM products LOOP
        -- 1-4 bags: base price
        INSERT INTO price_slabs (product_id, min_quantity, max_quantity, price_per_bag, label) 
        VALUES (product_record.id, 1, 4, product_record.base_price, '1-4 bags');
        
        -- 5-9 bags: 5% discount
        INSERT INTO price_slabs (product_id, min_quantity, max_quantity, price_per_bag, label) 
        VALUES (product_record.id, 5, 9, ROUND(product_record.base_price * 0.95, 2), '5-9 bags');
        
        -- 10+ bags: 10% discount
        INSERT INTO price_slabs (product_id, min_quantity, max_quantity, price_per_bag, label) 
        VALUES (product_record.id, 10, NULL, ROUND(product_record.base_price * 0.90, 2), '10+ bags');
    END LOOP;
END $$;

-- Insert sample banners
INSERT INTO banners (title, description, image, link, order_index) VALUES
('Pre-order & Save 15%', 'Order 24hrs in advance for special discounts on all rice varieties', 'https://images.pexels.com/photos/4033325/pexels-photo-4033325.jpeg?auto=compress&cs=tinysrgb&w=1200', '/preorder', 1),
('Premium Basmati Collection', 'Aromatic long grain rice perfect for special occasions and festive meals', 'https://images.pexels.com/photos/4033338/pexels-photo-4033338.jpeg?auto=compress&cs=tinysrgb&w=1200', '/products?category=basmati', 2),
('Fresh Stock Arrival', 'New harvest rice now available. Premium quality guaranteed with fast delivery', 'https://images.pexels.com/photos/6758773/pexels-photo-6758773.jpeg?auto=compress&cs=tinysrgb&w=1200', '/products', 3),
('Bulk Orders Welcome', 'Special pricing for restaurants and bulk buyers. Contact us for custom quotes', 'https://images.pexels.com/photos/7262775/pexels-photo-7262775.jpeg?auto=compress&cs=tinysrgb&w=1200', '/contact', 4);

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, valid_until) VALUES
('WELCOME10', 'percentage', 10.00, 500.00, 100.00, '2024-12-31 23:59:59'),
('BULK15', 'percentage', 15.00, 2000.00, 300.00, '2024-12-31 23:59:59'),
('FIRST50', 'fixed', 50.00, 300.00, NULL, '2024-12-31 23:59:59'),
('PREORDER20', 'percentage', 20.00, 1000.00, 200.00, '2024-12-31 23:59:59'),
('FESTIVAL25', 'percentage', 25.00, 1500.00, 400.00, '2024-12-31 23:59:59');