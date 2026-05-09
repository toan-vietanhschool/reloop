-- =============================================================
-- ReLoop — Demo Data Seed (T1-10)
-- Ticket: TRU-80
-- Purpose: 10 fake users + 30 listings + 50 eco_actions + 5 user-pinned points
--          for Bán kết demo. Apply via Supabase MCP / service role only.
-- IMPORTANT: this seed inserts directly into auth.users. It must NOT run from
--            a browser context — service_role key only.
-- Reset: see docs/DEMO-DATA.md.
-- =============================================================

begin;

-- ===== 10 fake auth.users =====
-- Fixed UUIDs so listings/eco_actions can reference them deterministically.
-- email_confirmed_at is set so the accounts behave as confirmed (you may still
-- need to set passwords via the Supabase dashboard if you want to log in as them).
-- The on_auth_user_created trigger auto-inserts a public.profiles row.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('11111111-1111-4111-8111-000000000001'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo1@reloop.app', crypt('demo-password-1', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Eco Hero 1"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000002'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo2@reloop.app', crypt('demo-password-2', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Bạn Xanh 2"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000003'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo3@reloop.app', crypt('demo-password-3', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Tái Chế Sĩ 3"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000004'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo4@reloop.app', crypt('demo-password-4', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Cô Gái Compost"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000005'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo5@reloop.app', crypt('demo-password-5', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Anh Chàng Đổi Đồ"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000006'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo6@reloop.app', crypt('demo-password-6', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Cây Xanh Tuổi 17"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000007'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo7@reloop.app', crypt('demo-password-7', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Mẹ Kiếp Phế Liệu"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000008'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo8@reloop.app', crypt('demo-password-8', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Lớp Trưởng Eco"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000009'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo9@reloop.app', crypt('demo-password-9', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Tiểu Đội Trồng Cây"}'::jsonb, now(), now()),
  ('11111111-1111-4111-8111-000000000010'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo10@reloop.app', crypt('demo-password-10', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Cô Bé Phân Loại"}'::jsonb, now(), now())
on conflict (id) do nothing;

-- The on_auth_user_created trigger has already created profile rows.
-- Update them with varied eco_points / school context. 5 with school, 5 null.
update public.profiles set
  eco_points = case id::text
    when '11111111-1111-4111-8111-000000000001' then 480
    when '11111111-1111-4111-8111-000000000002' then 320
    when '11111111-1111-4111-8111-000000000003' then 210
    when '11111111-1111-4111-8111-000000000004' then 175
    when '11111111-1111-4111-8111-000000000005' then 150
    when '11111111-1111-4111-8111-000000000006' then 110
    when '11111111-1111-4111-8111-000000000007' then 85
    when '11111111-1111-4111-8111-000000000008' then 50
    when '11111111-1111-4111-8111-000000000009' then 25
    when '11111111-1111-4111-8111-000000000010' then 5
  end,
  level = case id::text
    when '11111111-1111-4111-8111-000000000001' then 5
    when '11111111-1111-4111-8111-000000000002' then 4
    when '11111111-1111-4111-8111-000000000003' then 3
    when '11111111-1111-4111-8111-000000000004' then 2
    when '11111111-1111-4111-8111-000000000005' then 2
    when '11111111-1111-4111-8111-000000000006' then 2
    when '11111111-1111-4111-8111-000000000007' then 1
    when '11111111-1111-4111-8111-000000000008' then 1
    when '11111111-1111-4111-8111-000000000009' then 1
    when '11111111-1111-4111-8111-000000000010' then 1
  end,
  city = case id::text
    when '11111111-1111-4111-8111-000000000001' then 'TP.HCM'
    when '11111111-1111-4111-8111-000000000002' then 'TP.HCM'
    when '11111111-1111-4111-8111-000000000003' then 'TP.HCM'
    when '11111111-1111-4111-8111-000000000004' then 'TP.HCM'
    when '11111111-1111-4111-8111-000000000005' then 'TP.HCM'
    when '11111111-1111-4111-8111-000000000006' then 'Hà Nội'
    when '11111111-1111-4111-8111-000000000007' then 'Hà Nội'
    when '11111111-1111-4111-8111-000000000008' then 'Hà Nội'
    when '11111111-1111-4111-8111-000000000009' then 'Hà Nội'
    when '11111111-1111-4111-8111-000000000010' then 'Hà Nội'
  end,
  bio = case id::text
    when '11111111-1111-4111-8111-000000000001' then 'THPT Lê Quý Đôn — Founder Eco Club'
    when '11111111-1111-4111-8111-000000000002' then 'THPT Trưng Vương — Mê tái chế từ lớp 6'
    when '11111111-1111-4111-8111-000000000003' then 'THPT Bùi Thị Xuân — Lập đội Plastic Hunter'
    when '11111111-1111-4111-8111-000000000004' then 'THPT Marie Curie — Compost tại nhà 2 năm'
    when '11111111-1111-4111-8111-000000000005' then 'THPT Lê Hồng Phong — Lead trao đổi đồ cũ'
    else null
  end,
  display_name = case id::text
    when '11111111-1111-4111-8111-000000000001' then 'Eco Hero 1'
    when '11111111-1111-4111-8111-000000000002' then 'Bạn Xanh 2'
    when '11111111-1111-4111-8111-000000000003' then 'Tái Chế Sĩ 3'
    when '11111111-1111-4111-8111-000000000004' then 'Cô Gái Compost'
    when '11111111-1111-4111-8111-000000000005' then 'Anh Chàng Đổi Đồ'
    when '11111111-1111-4111-8111-000000000006' then 'Cây Xanh Tuổi 17'
    when '11111111-1111-4111-8111-000000000007' then 'Mẹ Kiếp Phế Liệu'
    when '11111111-1111-4111-8111-000000000008' then 'Lớp Trưởng Eco'
    when '11111111-1111-4111-8111-000000000009' then 'Tiểu Đội Trồng Cây'
    when '11111111-1111-4111-8111-000000000010' then 'Cô Bé Phân Loại'
  end
where id::text like '11111111-1111-4111-8111-%';

-- ===== 30 listings =====
-- Owners cycle through the 10 demo profiles. Materials rotate across enum values.
-- All listings are pre-moderated (moderation_passed=true) so they show in public feed.
-- photos kept as empty arrays so we don't ship any external image URL into the seed.
insert into public.listings (
  id, owner_id, title, description, intent, material_code,
  condition, photos, lat, lng, city, status, moderation_passed
) values
  -- HCM listings (1-15)
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000001', 'Chai PET 1.5L sạch, gom 50 chai',                     'Đã rửa sạch, gấp gọn. Cho ai cần nguyên liệu DIY.', 'give',        'PET',          5, '{}', 10.7769, 106.7009, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000001', 'Thùng carton lớn 80x60cm, còn nguyên',                'Vừa chuyển nhà xong, còn 3 thùng to.',              'give',        'CARDBOARD',    5, '{}', 10.7769, 106.7009, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000002', 'Quần áo nữ size M, 1 túi to còn dùng được',           'Áo, quần, váy — đã giặt sạch. Đổi lấy đồ tái chế.', 'exchange',    'TEXTILE',      4, '{}', 10.7851, 106.6890, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000002', 'Hộp nhựa HDPE 5L, 10 cái',                            'Hộp đựng dầu gội cũ, đã rửa.',                      'give',        'HDPE',         4, '{}', 10.7851, 106.6890, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000003', 'Sách giáo khoa lớp 9, full bộ',                       'Cho HS khó khăn. Liên hệ trao tay tại Q.3.',        'give',        'PAPER',        4, '{}', 10.7799, 106.7022, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000003', 'Lon nhôm Coca/Pepsi, 80 lon đã ép',                   'Bán cho vựa hoặc đổi lấy thùng compost.',           'sell_scrap',  'METAL_AL',     5, '{}', 10.7799, 106.7022, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000004', 'Thùng compost 15L, dùng 3 tháng',                     'Còn rất tốt, giao tay. Đổi lấy hạt giống.',         'exchange',    'OTHER_PLASTIC', 4, '{}', 10.8031, 106.6519, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000004', 'Vỏ chai thủy tinh nâu, 30 chai',                      'Sạch, có nắp. Phù hợp DIY.',                        'give',        'GLASS',        5, '{}', 10.8031, 106.6519, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000005', 'Điện thoại cũ Samsung A20, còn dùng được',            'Cho người cần làm máy phụ. Pin còn 70%.',           'give',        'ELECTRONIC',   3, '{}', 10.7728, 106.6645, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000005', 'Pin AA cũ — 1kg để đem điểm thu',                     'Tìm ai có thể đem ra Lotte Mart Gò Vấp.',           'seek',        'BATTERY',      1, '{}', 10.7728, 106.6645, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000005', 'Bao bì xốp EPS lớn — cần mang đi',                    'Sau khi mua máy giặt. Tìm chỗ tái chế EPS.',        'seek',        'PS',           3, '{}', 10.8120, 106.7105, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000003', 'Thùng nhựa PP 20L, 2 cái',                            'Đựng được nước, gas, dầu. Còn rất chắc.',           'exchange',    'PP',           5, '{}', 10.7316, 106.7218, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000002', 'Ống PVC cũ nhiều cỡ',                                 'Sau khi đổi đường ống nhà. Cho thợ làm vườn.',      'give',        'PVC',           4, '{}', 10.6876, 106.6098, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000004', 'Vỏ ốc xà cừ — DIY craft',                             'Em nhặt ngoài biển Cần Giờ. Cho ai làm đồ thủ công.', 'give',      'MIXED',        5, '{}', 10.7769, 106.7009, 'TP.HCM', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000001', 'Khung sắt cửa sổ cũ, 4 khung',                        'Đổi nhà nên không dùng. Bán theo cân.',             'sell_scrap',  'METAL_FE',     3, '{}', 10.8660, 106.7725, 'TP.HCM', 'available', true),

  -- Hà Nội listings (16-30)
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000006', 'Báo cũ 5kg, gấp gọn',                                 'Gấp xếp ngăn nắp, dễ vận chuyển.',                  'give',        'PAPER',        5, '{}', 21.0285, 105.8542, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000006', 'Áo khoác mùa đông cũ size L',                         'Đã giặt sạch, ấm tốt. Cho ai cần.',                 'give',        'TEXTILE',      4, '{}', 21.0285, 105.8542, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000007', 'Chai PET 500ml, 100 chai sạch',                       'Đã rửa, ráo nước. Tìm ai cần làm chậu trồng.',      'give',        'PET',          5, '{}', 21.0245, 105.8412, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000007', 'Hộp nhôm bia, 3kg',                                   'Đã ép gọn. Bán cho vựa Cầu Giấy.',                  'sell_scrap',  'METAL_AL',     5, '{}', 21.0363, 105.7940, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000008', 'Bóng đèn compact cũ — cần xử lý',                     'Tìm điểm thu e-waste để đem.',                      'seek',        'ELECTRONIC',   2, '{}', 21.0278, 105.8478, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000008', 'Thùng giấy A4 chưa dùng — đổi đồ',                    'Lỡ mua dư 5 ream. Đổi cây xanh mini.',              'exchange',    'PAPER',        5, '{}', 21.0215, 105.8390, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000009', 'Lốp xe đạp cũ, 4 cái',                                'Còn dùng được làm chậu hoa.',                       'give',        'OTHER_PLASTIC', 3, '{}', 21.0457, 105.7873, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000009', 'Bao tải vải dứa cũ, 20 cái',                          'Còn chắc, đựng được rác hữu cơ.',                   'give',        'TEXTILE',      4, '{}', 21.0133, 105.8521, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000010', 'Lon sữa bột cũ, 12 lon',                              'Sạch, có nắp. DIY tốt.',                            'give',        'METAL_FE',     5, '{}', 20.9945, 105.8556, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000010', 'Pin laptop cũ — đem điểm thu',                        'Tìm bạn cùng đi điểm e-waste FPT Shop.',            'seek',        'BATTERY',      1, '{}', 20.9945, 105.8556, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000006', 'Ly thủy tinh cũ, 20 cái',                             'Hết bộ vỡ vài cái — còn 20 cái. Cho quán cà phê.',  'give',        'GLASS',        4, '{}', 20.9667, 105.7800, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000007', 'Ống nhựa PP 1m — DIY',                                'Cho ai làm hệ thống tưới cây.',                     'give',        'PP',           5, '{}', 21.0447, 105.8880, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000008', 'Sách cũ 3 thùng — trao đổi',                          'Sách văn học. Đổi sách kỹ năng.',                   'exchange',    'PAPER',        4, '{}', 21.0285, 105.8542, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000009', 'Hộp sữa giấy 100 hộp đã rửa',                         'Đã rửa, gấp gọn. Cho trường tiểu học DIY.',         'give',        'CARDBOARD',    5, '{}', 21.0363, 105.7940, 'Hà Nội', 'available', true),
  (gen_random_uuid(), '11111111-1111-4111-8111-000000000010', 'Vỏ chai dầu ăn HDPE — 10 cái',                        'Sạch, có nắp. Đổi bột compost.',                    'exchange',    'HDPE',         4, '{}', 20.9667, 105.7800, 'Hà Nội', 'available', true);

-- ===== 50 eco_actions =====
-- Synthesize an activity history using a generate_series + random selection.
-- 5 actions per profile = 50 rows. Realistic mix of scan / listing_create / point_pin / vote.
insert into public.eco_actions (user_id, kind, points_delta, created_at)
select
  p.id,
  (array['scan','scan','listing_create','point_pin','vote'])[1 + (gs % 5)] as kind,
  (array[5,5,15,20,3])[1 + (gs % 5)] as points_delta,
  now() - (gs || ' hour')::interval - ((row_number() over (partition by p.id))::text || ' day')::interval as created_at
from public.profiles p
cross join generate_series(0, 4) as gs
where p.id::text like '11111111-1111-4111-8111-%';

-- ===== 5 user-pinned collection_points (verified=false to test admin verify flow) =====
insert into public.collection_points (
  name, type, accepts, lat, lng, address,
  phone, hours, notes, contributed_by, verified
) values
  (
    'Vựa phế liệu Cô Bảy (user pin)', 'scrap_dealer',
    ARRAY['PET','PAPER','METAL_AL']::material_code[],
    10.7600, 106.6822, '12 Trần Hưng Đạo, Quận 5, TP.HCM',
    '0903 111 222', '06:00-19:00', 'Cô Bảy thu mua tại nhà nếu trên 5kg',
    '11111111-1111-4111-8111-000000000001', false
  ),
  (
    'Điểm thu pin trường THPT Lê Quý Đôn', 'recycle_bin',
    ARRAY['BATTERY']::material_code[],
    10.7762, 106.6968, '110 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    null, '07:00-17:00 (T2-T6)', 'Hộp thu pin đặt tại căn-tin trường',
    '11111111-1111-4111-8111-000000000003', false
  ),
  (
    'Compost cộng đồng phố Trần Phú', 'ngo_dropoff',
    ARRAY['ORGANIC']::material_code[],
    21.0234, 105.8350, '45 Trần Phú, Đống Đa, Hà Nội',
    null, '06:30-08:00 hàng ngày', 'Dự án compost tự phát của hàng xóm',
    '11111111-1111-4111-8111-000000000007', false
  ),
  (
    'Điểm thu vải Hội phụ nữ phường', 'ngo_dropoff',
    ARRAY['TEXTILE']::material_code[],
    10.8056, 106.6512, 'UBND Phường 12, Tân Bình, TP.HCM',
    '028 3811 4400', '08:00-16:30 (T2-T6)', 'Thu quần áo cũ giúp người vùng cao',
    '11111111-1111-4111-8111-000000000004', false
  ),
  (
    'Vựa Anh Tuấn — long-time spot', 'scrap_dealer',
    ARRAY['CARDBOARD','PAPER','METAL_FE','METAL_AL']::material_code[],
    21.0089, 105.8200, '88 Láng Hạ, Đống Đa, Hà Nội',
    '0986 222 333', '06:00-18:00', 'Vựa lâu năm, giá rất ổn',
    '11111111-1111-4111-8111-000000000008', false
  );

commit;
