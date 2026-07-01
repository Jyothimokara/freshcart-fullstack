import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from apps.products.models import Category, Product
from apps.cart.models import Coupon

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with categories, products, and a demo coupon.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Create Categories
        categories_data = [
            {
                'id': 'fruits',
                'name': 'Fruits',
                'slug': 'fruits',
                'image': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop&q=60'
            },
            {
                'id': 'vegetables',
                'name': 'Vegetables',
                'slug': 'vegetables',
                'image': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60'
            },
            {
                'id': 'dairy',
                'name': 'Dairy & Eggs',
                'slug': 'dairy',
                'image': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=60'
            },
            {
                'id': 'beverages',
                'name': 'Beverages',
                'slug': 'beverages',
                'image': 'https://images.unsplash.com/photo-1527960656306-ff37c8656284?w=600&auto=format&fit=crop&q=60'
            },
            {
                'id': 'snacks',
                'name': 'Snacks',
                'slug': 'snacks',
                'image': 'https://images.unsplash.com/photo-1599490659273-e3a72a621675?w=600&auto=format&fit=crop&q=60'
            },
            {
                'id': 'spices',
                'name': 'Spices & Herbs',
                'slug': 'spices',
                'image': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=60'
            }
        ]

        category_objs = {}
        for cat_data in categories_data:
            cat, created = Category.objects.update_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name'], 'image': cat_data['image']}
            )
            category_objs[cat.slug] = cat
            if created:
                self.stdout.write(f"Created category: {cat.name}")

        # 2. Create Products
        products_data = [
            # === FRUITS ===
            {
                'id': 'f1',
                'name': 'Fresh Red Apples',
                'category': 'fruits',
                'image': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60',
                'price': 3.99,
                'discount_price': 2.99,
                'rating': 4.8,
                'stock': 50,
                'unit': '1 kg',
                'description': 'Crisp, sweet, and juicy organic red apples sourced directly from local orchards. Perfect for snacking, baking pies, or making fresh apple cider.'
            },
            {
                'id': 'f2',
                'name': 'Organic Bananas',
                'category': 'fruits',
                'image': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60',
                'price': 1.99,
                'discount_price': 1.49,
                'rating': 4.5,
                'stock': 120,
                'unit': '1 Bunch (approx. 5-6 pcs)',
                'description': 'Naturally sweet and rich in potassium, these organic bananas are harvested at the peak of freshness. An excellent energy booster for any time of the day.'
            },
            {
                'id': 'f3',
                'name': 'Fresh Strawberries',
                'category': 'fruits',
                'image': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60',
                'price': 4.99,
                'discount_price': 3.99,
                'rating': 4.7,
                'stock': 35,
                'unit': '450 g pack',
                'description': 'Plump, ripe, and exceptionally sweet strawberries. Great for desserts, smoothies, salads, or simply enjoyed raw with fresh cream.'
            },
            {
                'id': 'f4',
                'name': 'Sunkist Oranges',
                'category': 'fruits',
                'image': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60',
                'price': 2.49,
                'rating': 4.3,
                'stock': 80,
                'unit': '1 kg',
                'description': 'Juicy, sweet Sunkist oranges packed with vitamin C. Ideal for refreshing morning juices, salads, or a healthy midday snack.'
            },
            {
                'id': 'f5',
                'name': 'Seedless Black Grapes',
                'category': 'fruits',
                'image': 'https://images.unsplash.com/photo-1537084642907-629340c7e09e?w=500&auto=format&fit=crop&q=60',
                'price': 5.49,
                'discount_price': 4.49,
                'rating': 4.6,
                'stock': 45,
                'unit': '500 g',
                'description': 'Plump and sweet black grapes with a snap in every bite. Sourced fresh and packed under strict hygiene controls.'
            },
            # === VEGETABLES ===
            {
                'id': 'v1',
                'name': 'Organic Carrots',
                'category': 'vegetables',
                'image': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60',
                'price': 1.89,
                'discount_price': 1.39,
                'rating': 4.6,
                'stock': 95,
                'unit': '1 kg',
                'description': 'Sweet, earthy, and crunchy carrots rich in Beta-Carotene. Perfect for roasting, juicing, soups, or eating raw as a healthy snack.'
            },
            {
                'id': 'v2',
                'name': 'Fresh Broccoli Crown',
                'category': 'vegetables',
                'image': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a05?w=500&auto=format&fit=crop&q=60',
                'price': 2.29,
                'rating': 4.4,
                'stock': 60,
                'unit': '500 g',
                'description': 'Crisp green broccoli crowns loaded with fiber and nutrients. Excellent for steaming, stir-frying, or tossing in pasta and salads.'
            },
            {
                'id': 'v3',
                'name': 'Roma Tomatoes',
                'category': 'vegetables',
                'image': 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60',
                'price': 2.99,
                'discount_price': 2.19,
                'rating': 4.7,
                'stock': 75,
                'unit': '1 kg',
                'description': 'Firm and pulpy vine-ripened Roma tomatoes. Ideal for making rich pasta sauces, fresh salsas, or slicing for burgers and sandwiches.'
            },
            {
                'id': 'v4',
                'name': 'Fresh Baby Spinach',
                'category': 'vegetables',
                'image': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60',
                'price': 3.49,
                'discount_price': 2.79,
                'rating': 4.8,
                'stock': 30,
                'unit': '250 g pack',
                'description': 'Tender and nutritious pre-washed baby spinach leaves. Perfect for nutrient-dense green smoothies, healthy stir-fries, or crisp salads.'
            },
            {
                'id': 'v5',
                'name': 'Russet Potatoes',
                'category': 'vegetables',
                'image': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60',
                'price': 2.79,
                'rating': 4.5,
                'stock': 150,
                'unit': '2 kg bag',
                'description': 'Premium grade Russet potatoes with a high starch content. Sourced from local farms. The ultimate potato for baking, mashing, or frying.'
            },
            # === DAIRY ===
            {
                'id': 'd1',
                'name': 'Organic Whole Milk',
                'category': 'dairy',
                'image': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60',
                'price': 4.29,
                'discount_price': 3.49,
                'rating': 4.9,
                'stock': 40,
                'unit': '1 Gallon',
                'description': 'Pasteurized, homogenized whole milk sourced from grass-fed cows. Creamy, delicious, and an excellent source of calcium and vitamin D.'
            },
            {
                'id': 'd2',
                'name': 'Sharp Cheddar Cheese block',
                'category': 'dairy',
                'image': 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500&auto=format&fit=crop&q=60',
                'price': 5.99,
                'discount_price': 4.99,
                'rating': 4.7,
                'stock': 55,
                'unit': '400 g',
                'description': 'Aged to perfection, this sharp cheddar cheese boasts a rich, bold flavor. Grates and melts beautifully for sandwiches, macaroni, or cheese boards.'
            },
            {
                'id': 'd3',
                'name': 'Salted Creamery Butter',
                'category': 'dairy',
                'image': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60',
                'price': 3.79,
                'rating': 4.6,
                'stock': 85,
                'unit': '450 g',
                'description': 'Pure butter made from fresh cream. Lightly salted to enhance flavor. Perfect for spreading on toast, baking pastries, or sautéing.'
            },
            {
                'id': 'd4',
                'name': 'Greek Yogurt Plain',
                'category': 'dairy',
                'image': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60',
                'price': 4.49,
                'discount_price': 3.89,
                'rating': 4.5,
                'stock': 60,
                'unit': '900 g tub',
                'description': 'Thick, creamy, and packed with protein. This Greek yogurt is unsweetened and perfect for healthy breakfasts, dressing bases, or dips.'
            },
            {
                'id': 'd5',
                'name': 'Free Range Large Brown Eggs',
                'category': 'dairy',
                'image': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60',
                'price': 4.99,
                'rating': 4.8,
                'stock': 70,
                'unit': '12 count',
                'description': 'Farm-fresh, large brown eggs sourced from free-range hens. Rich in protein, healthy fats, and vitamins. Ideal for breakfast scrambles or baking.'
            },
            # === BEVERAGES ===
            {
                'id': 'b1',
                'name': '100% Pure Orange Juice',
                'category': 'beverages',
                'image': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60',
                'price': 4.49,
                'discount_price': 3.79,
                'rating': 4.7,
                'stock': 50,
                'unit': '1.5 L bottle',
                'description': 'Never from concentrate. Enjoy the delicious taste of freshly squeezed Florida oranges in every glass. No added sugar or artificial preservatives.'
            },
            {
                'id': 'b2',
                'name': 'French Roast Coffee Beans',
                'category': 'beverages',
                'image': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&auto=format&fit=crop&q=60',
                'price': 12.99,
                'discount_price': 10.99,
                'rating': 4.9,
                'stock': 35,
                'unit': '1 kg bag',
                'description': 'Dark-roasted Arabica coffee beans. Delivers a bold, smoky flavor with a rich aroma and chocolatey undertones. Perfect for espresso and French press.'
            },
            {
                'id': 'b3',
                'name': 'Organic Jasmine Green Tea',
                'category': 'beverages',
                'image': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&auto=format&fit=crop&q=60',
                'price': 5.99,
                'rating': 4.5,
                'stock': 65,
                'unit': '20 tea bags',
                'description': 'Fragrant Jasmine flowers blended with delicate green tea leaves. A soothing, antioxidant-rich beverage best enjoyed hot or iced.'
            },
            {
                'id': 'b4',
                'name': 'Natural Springs Mineral Water',
                'category': 'beverages',
                'image': 'https://images.unsplash.com/photo-1608885898957-a599fb18efeb?w=500&auto=format&fit=crop&q=60',
                'price': 5.99,
                'discount_price': 4.49,
                'rating': 4.4,
                'stock': 100,
                'unit': '24 x 500ml pack',
                'description': 'Naturally filtered spring water rich in minerals, bottled at the source. Crisp, refreshing hydration for home, office, or workouts.'
            },
            {
                'id': 'b5',
                'name': 'Artisan Ginger Beer Soda',
                'category': 'beverages',
                'image': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
                'price': 6.49,
                'rating': 4.6,
                'stock': 40,
                'unit': '4 x 330ml bottles',
                'description': 'Brewed with real organic ginger root for an authentic, fiery kick. Naturally sweetened and carbonated to perfection. Non-alcoholic.'
            },
            # === SNACKS ===
            {
                'id': 's1',
                'name': 'Hickory Smoked Potato Chips',
                'category': 'snacks',
                'image': 'https://images.unsplash.com/photo-1566478989037-eec170784d20?w=500&auto=format&fit=crop&q=60',
                'price': 3.49,
                'discount_price': 2.79,
                'rating': 4.4,
                'stock': 110,
                'unit': '180 g bag',
                'description': 'Thick, kettle-cooked potato chips dusted with sweet and savory hickory barbecue seasoning. Extremely crunchy and satisfying.'
            },
            {
                'id': 's2',
                'name': 'Dark Chocolate Almond Bar',
                'category': 'snacks',
                'image': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=60',
                'price': 3.99,
                'discount_price': 3.19,
                'rating': 4.8,
                'stock': 90,
                'unit': '100 g bar',
                'description': 'Premium 72% dark chocolate bar loaded with whole roasted almonds. A rich, decadent treat with a delightful crunch in every bite.'
            },
            {
                'id': 's3',
                'name': 'Gourmet Roasted Mixed Nuts',
                'category': 'snacks',
                'image': 'https://images.unsplash.com/photo-1511124672905-55963559f60f?w=500&auto=format&fit=crop&q=60',
                'price': 8.99,
                'rating': 4.7,
                'stock': 50,
                'unit': '400 g pack',
                'description': 'A premium mix of almonds, cashews, pecans, and walnuts, lightly salted and roasted to perfection. A healthy and filling snack option.'
            },
            {
                'id': 's4',
                'name': 'Double Chocolate Chip Cookies',
                'category': 'snacks',
                'image': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=60',
                'price': 4.99,
                'discount_price': 3.99,
                'rating': 4.6,
                'stock': 50,
                'unit': '300 g box',
                'description': 'Freshly baked, soft-baked cookies loaded with rich milk chocolate chips and fudge chunks. The ultimate comfort treat with milk.'
            },
            {
                'id': 's5',
                'name': 'White Cheddar Popcorn',
                'category': 'snacks',
                'image': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop&q=60',
                'price': 2.99,
                'rating': 4.3,
                'stock': 75,
                'unit': '150 g bag',
                'description': 'Air-popped corn kernels coated in premium, savory white cheddar cheese powder. Light, fluffy, and completely gluten-free.'
            },
            # === SPICES ===
            {
                'id': 'sp1',
                'name': 'Whole Black Peppercorns',
                'category': 'spices',
                'image': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=60',
                'price': 4.99,
                'discount_price': 3.99,
                'rating': 4.8,
                'stock': 60,
                'unit': '100 g jar',
                'description': 'Highly aromatic, whole black peppercorns sourced from the Malabar coast. Grind fresh over dishes to release bold, pungent heat.'
            },
            {
                'id': 'sp2',
                'name': 'Organic Turmeric Powder',
                'category': 'spices',
                'image': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60',
                'price': 3.99,
                'rating': 4.7,
                'stock': 80,
                'unit': '150 g pouch',
                'description': 'Pure, organic turmeric root powder with a high Curcumin content. Boasts a warm, earthy flavor and vibrant golden color. Known for health benefits.'
            },
            {
                'id': 'sp3',
                'name': 'Ceylon Cinnamon Sticks',
                'category': 'spices',
                'image': 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop&q=60',
                'price': 5.49,
                'discount_price': 4.49,
                'rating': 4.6,
                'stock': 45,
                'unit': '75 g pack',
                'description': 'Genuine Ceylon "True" cinnamon rolls. Highly fragrant, sweet, and mild compared to Cassia. Ideal for brewing teas, curries, or baking.'
            },
            {
                'id': 'sp4',
                'name': 'Crushed Red Chili Flakes',
                'category': 'spices',
                'image': 'https://images.unsplash.com/photo-1596701062351-df1f8d368185?w=500&auto=format&fit=crop&q=60',
                'price': 3.49,
                'rating': 4.5,
                'stock': 90,
                'unit': '80 g jar',
                'description': 'Fiery dried red chilies, crushed to release maximum heat. Sprinkle over pizzas, pastas, or stir-fries for a quick spicy touch.'
            },
            {
                'id': 'sp5',
                'name': 'Fresh Organic Garlic Cloves',
                'category': 'spices',
                'image': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=60',
                'price': 2.49,
                'discount_price': 1.99,
                'rating': 4.7,
                'stock': 110,
                'unit': '250 g basket',
                'description': 'Farm-fresh, organic garlic bulbs with large cloves. Delivers a pungent, sharp flavor that mellows beautifully into sweet richness when cooked.'
            }
        ]

        for prod_data in products_data:
            cat = category_objs.get(prod_data['category'])
            if not cat:
                self.stdout.write(self.style.ERROR(f"Category {prod_data['category']} not found for {prod_data['name']}"))
                continue
                
            Product.objects.update_or_create(
                id=prod_data['id'],
                defaults={
                    'category': cat,
                    'name': prod_data['name'],
                    'image': prod_data['image'],
                    'price': prod_data['price'],
                    'discount_price': prod_data.get('discount_price'),
                    'rating': prod_data['rating'],
                    'stock': prod_data['stock'],
                    'unit': prod_data['unit'],
                    'description': prod_data['description']
                }
            )
        self.stdout.write(f"Successfully seeded {len(products_data)} products.")

        # 3. Create Coupon code FRESH15
        now = timezone.now()
        coupon, created = Coupon.objects.update_or_create(
            code='FRESH15',
            defaults={
                'discount_percentage': 15.00,
                'max_discount_amount': 50.00,
                'is_active': True,
                'valid_from': now - timedelta(days=30),
                'valid_to': now + timedelta(days=3650)  # Valid for 10 years
            }
        )
        if created:
            self.stdout.write("Created demo coupon FRESH15 (15% off).")

        # 4. Create a default Demo User
        # Username matches demo@freshcart.com, password is password123
        User = get_user_model()
        demo_user_email = 'demo@freshcart.com'
        demo_user, created = User.objects.get_or_create(
            email=demo_user_email,
            defaults={
                'name': 'Jane Doe',
                'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            demo_user.set_password('password123')
            demo_user.save()
            self.stdout.write("Created default demo user: demo@freshcart.com / password123")
        else:
            # Ensure password remains correct
            demo_user.set_password('password123')
            demo_user.save()
            self.stdout.write("Reset demo user password to 'password123'")

        self.stdout.write(self.style.SUCCESS("Database seeding completed!"))
