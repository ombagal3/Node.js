require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { connectDB, disconnectDB } = require('../config/db');

const categoriesData = [
  {
    name: 'Furniture & Living',
    slug: 'furniture-living',
    description: 'Sculptural seating, minimalist tables, and architectural cabinetry designed for intentional living spaces.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    status: 'active'
  },
  {
    name: 'Architectural Lighting',
    slug: 'architectural-lighting',
    description: 'Warm ambient luminaires, spun brass pendants, and tactile task lamps calibrated for gentle illumination.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    status: 'active'
  },
  {
    name: 'Ceramics & Tableware',
    slug: 'ceramics-tableware',
    description: 'Hand-thrown stoneware, matte glazed carafes, and tactile porcelain crafted in small artisan batches.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=80',
    status: 'active'
  },
  {
    name: 'Audio & Studio',
    slug: 'audio-studio',
    description: 'Precision acoustic hardware, anodized aluminum studio monitors, and timeless analog audio accessories.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
    status: 'active'
  },
  {
    name: 'Apparel & Objects',
    slug: 'apparel-objects',
    description: 'Heavyweight organic cotton, vegetable-tanned leather goods, and refined utilitarian everyday essentials.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    status: 'active'
  }
];

const productsData = [
  // Furniture & Living (4 products)
  {
    name: 'Koto Curved Lounge Chair',
    description: 'An ergonomic statement lounge chair upholstered in tactile bouclé wool over a solid blackened ash frame. Sculptural contours cradle the body during contemplative rest.',
    price: 890,
    compareAtPrice: 1050,
    SKU: 'FUR-KTO-001',
    categorySlug: 'furniture-living',
    brand: 'Verve Studio',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580481077195-c2900778732e?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 8,
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Svalbard Low Coffee Table',
    description: 'Monolithic travertine low table featuring rounded radius edges and dual cylindrical fluted stone pillars. Unsealed natural pores celebrate authentic mineral variations.',
    price: 640,
    compareAtPrice: null,
    SKU: 'FUR-SVL-002',
    categorySlug: 'furniture-living',
    brand: 'Nordic Form',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 3, // Low stock
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Arcadia Modular Credenza',
    description: 'Precision milled white oak side cabinet featuring tambour sliding doors, concealed brass cord grommets, and customizable internal cedar shelving.',
    price: 1250,
    compareAtPrice: 1400,
    SKU: 'FUR-ARC-003',
    categorySlug: 'furniture-living',
    brand: 'Verve Studio',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 0, // Out of stock
    status: 'active',
    isFeatured: false
  },
  {
    name: 'Norden Solid Ash Bench',
    description: 'Slender entryway or dining bench with mortise-and-tenon joinery and hand-rubbed organic matte oil finish. Tested for lifelong endurance.',
    price: 320,
    compareAtPrice: 380,
    SKU: 'FUR-NRD-004',
    categorySlug: 'furniture-living',
    brand: 'Nordic Form',
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 14,
    status: 'active',
    isFeatured: false
  },

  // Architectural Lighting (4 products)
  {
    name: 'Aura Opal Pendant Light',
    description: 'Mouth-blown frosted triplex opal glass orb suspended from brushed unlacquered brass hardware. Emits a warm 2700K diffusion with zero glare.',
    price: 240,
    compareAtPrice: 280,
    SKU: 'LGT-AUR-101',
    categorySlug: 'architectural-lighting',
    brand: 'Lumen Luminaire',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 12,
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Canyon Cast Bronze Table Lamp',
    description: 'Sand-cast bronze base paired with a pleated linen drum shade. Integrated rotary dimmer knob provides seamless candlelight warmth down to 5% output.',
    price: 380,
    compareAtPrice: 420,
    SKU: 'LGT-CYN-102',
    categorySlug: 'architectural-lighting',
    brand: 'Atelier Bronze',
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 4, // Low stock
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Modus Linear Wall Sconce',
    description: 'Architectural aluminum profile sconce projecting indirect dual-directional ambient light. IP44 certified for luxury bath and powder rooms.',
    price: 195,
    compareAtPrice: null,
    SKU: 'LGT-MDS-103',
    categorySlug: 'architectural-lighting',
    brand: 'Lumen Luminaire',
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 18,
    status: 'active',
    isFeatured: false
  },
  {
    name: 'Solstice Spun Brass Desk Light',
    description: 'Articulated task lamp machined from solid billet aluminum and spun brass. Features counter-balanced cantilever arm for micro-adjustments.',
    price: 310,
    compareAtPrice: 350,
    SKU: 'LGT-SLS-104',
    categorySlug: 'architectural-lighting',
    brand: 'Atelier Bronze',
    images: [
      'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 0, // Out of stock
    status: 'inactive', // Inactive product demo
    isFeatured: false
  },

  // Ceramics & Tableware (4 products)
  {
    name: 'Kyoto Matte Stoneware Carafe Set',
    description: 'High-fire ceramic water carafe with two matching tumblers. Finished in raw exposed clay base with speckled ivory slip interior.',
    price: 95,
    compareAtPrice: 120,
    SKU: 'CRM-KYO-201',
    categorySlug: 'ceramics-tableware',
    brand: 'Mino Kilns',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 22,
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Basalt Dinner Plates (Set of 4)',
    description: 'Organically rimmed stoneware dinner plates glazed in matte charcoal volcanic glaze. Dishwasher and microwave safe.',
    price: 110,
    compareAtPrice: null,
    SKU: 'CRM-BST-202',
    categorySlug: 'ceramics-tableware',
    brand: 'Mino Kilns',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 2, // Low stock
    status: 'active',
    isFeatured: false
  },
  {
    name: 'Brutalist Ribbed Ceramic Vase',
    description: 'Sculptural display vase with prominent vertical architectural fluting. Functions as an evocative standalone centerpiece or dried floral vessel.',
    price: 145,
    compareAtPrice: 175,
    SKU: 'CRM-BRT-203',
    categorySlug: 'ceramics-tableware',
    brand: 'Atelier Clay',
    images: [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 9,
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Pour-Over Coffee Dripper & Stand',
    description: 'Precision ribbed ceramic filter dripper nested upon an oiled walnut and brass extraction tower. Calibrated for 60-degree conical brew geometry.',
    price: 85,
    compareAtPrice: null,
    SKU: 'CRM-POV-204',
    categorySlug: 'ceramics-tableware',
    brand: 'Atelier Clay',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 15,
    status: 'active',
    isFeatured: false
  },

  // Audio & Studio (4 products)
  {
    name: 'Acoustic One Wireless Studio Monitor',
    description: 'Custom Kevlar 5.25" woofers and silk dome tweeters encased in an acoustic dampening walnut cabinet with brushed volume dials. Bluetooth 5.3 and balanced optical inputs.',
    price: 490,
    compareAtPrice: 550,
    SKU: 'AUD-MON-301',
    categorySlug: 'audio-studio',
    brand: 'Verve Acoustics',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 7,
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Tangent Precision Turntable',
    description: 'Belt-driven analog turntable featuring an ultra-low resonance acrylic platter, carbon fiber tonearm, and an Ortofon 2M Red cartridge pre-installed.',
    price: 720,
    compareAtPrice: 799,
    SKU: 'AUD-TRN-302',
    categorySlug: 'audio-studio',
    brand: 'Verve Acoustics',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 5, // Low stock boundary
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Studio Master Planar Headphones',
    description: 'Open-back planar magnetic headphones featuring genuine lambskin ear pads, CNC machined aluminum gimbals, and ultra-wide frequency response (8Hz-48kHz).',
    price: 360,
    compareAtPrice: null,
    SKU: 'AUD-HDP-303',
    categorySlug: 'audio-studio',
    brand: 'Sonus Lab',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 11,
    status: 'active',
    isFeatured: false
  },
  {
    name: 'Machined Brass Record Weight',
    description: 'Precision milled 420g brass vinyl stabilizing clamp with laser engraved stroboscopic rim calibration for 33.3 and 45 RPM tracking.',
    price: 68,
    compareAtPrice: 85,
    SKU: 'AUD-WGT-304',
    categorySlug: 'audio-studio',
    brand: 'Sonus Lab',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 0, // Out of stock
    status: 'draft', // Draft status demo
    isFeatured: false
  },

  // Apparel & Objects (4 products)
  {
    name: 'Merino Wool Structured Overshirt',
    description: 'Tailored utility overshirt woven from 380gsm extra-fine boiled merino wool. Horn buttons and dual chest gusset pockets provide practical elegance.',
    price: 185,
    compareAtPrice: 220,
    SKU: 'APP-OVR-401',
    categorySlug: 'apparel-objects',
    brand: 'Atelier Tailors',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 16,
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Full-Grain Vachetta Weekend Duffle',
    description: 'Handcrafted travel duffle cut from Tuscan vegetable-tanned leather that develops a rich, distinctive patina with each voyage. Solid brass Swiss RiRi zippers.',
    price: 520,
    compareAtPrice: 590,
    SKU: 'APP-BAG-402',
    categorySlug: 'apparel-objects',
    brand: 'Atelier Tailors',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 3, // Low stock
    status: 'active',
    isFeatured: true
  },
  {
    name: 'Heavyweight Waffle Knit Lounge Throw',
    description: 'Generously proportioned 140x200cm throw blanket woven from unbleached Portuguese organic cotton with a deep thermal waffle texture.',
    price: 125,
    compareAtPrice: null,
    SKU: 'APP-THR-403',
    categorySlug: 'apparel-objects',
    brand: 'Nordic Weave',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 25,
    status: 'active',
    isFeatured: false
  },
  {
    name: 'Anodized Mechanical Fountain Pen',
    description: 'Precision milled aerospace-grade titanium fountain pen fitted with an extra-fine Schmidt iridium nib. Balanced pocket architecture with magnetic cap.',
    price: 115,
    compareAtPrice: 140,
    SKU: 'APP-PEN-404',
    categorySlug: 'apparel-objects',
    brand: 'Nordic Weave',
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 19,
    status: 'active',
    isFeatured: false
  }
];

async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed or Upsert Admin & Customer Users
  const adminEmail = 'admin@verveatelier.com';
  const customerEmail = 'customer@verveatelier.com';

  await User.deleteMany({ email: { $in: [adminEmail, customerEmail] } });

  const adminPassword = 'Admin@123456';
  const customerPassword = 'Customer@123456';

  const adminUser = await User.create({
    name: 'Verve Administrator',
    email: adminEmail,
    password: adminPassword,
    role: 'admin'
  });
  console.log(`✓ Admin account created: ${adminUser.email} (Password: ${adminPassword})`);

  const customerUser = await User.create({
    name: 'Elena Rostova',
    email: customerEmail,
    password: customerPassword,
    role: 'customer'
  });
  console.log(`✓ Customer account created: ${customerUser.email} (Password: ${customerPassword})`);

  // 2. Seed Categories
  const categoryMap = {};
  for (const catData of categoriesData) {
    let cat = await Category.findOne({ slug: catData.slug });
    if (!cat) {
      cat = await Category.create(catData);
      console.log(`+ Created Category: ${cat.name}`);
    } else {
      cat.description = catData.description;
      cat.image = catData.image;
      await cat.save();
      console.log(`~ Updated Category: ${cat.name}`);
    }
    categoryMap[cat.slug] = cat._id;
  }

  // 3. Seed Products
  for (const prodData of productsData) {
    const categoryId = categoryMap[prodData.categorySlug];
    if (!categoryId) {
      console.warn(`Category slug ${prodData.categorySlug} not found for product ${prodData.name}`);
      continue;
    }

    const cleanData = {
      name: prodData.name,
      description: prodData.description,
      price: prodData.price,
      compareAtPrice: prodData.compareAtPrice,
      SKU: prodData.SKU,
      category: categoryId,
      brand: prodData.brand,
      images: prodData.images,
      stock: prodData.stock,
      status: prodData.status,
      isFeatured: prodData.isFeatured
    };

    let existingProd = await Product.findOne({ SKU: prodData.SKU });
    if (!existingProd) {
      await Product.create(cleanData);
      console.log(`+ Created Product: ${prodData.name} [SKU: ${prodData.SKU}]`);
    } else {
      Object.assign(existingProd, cleanData);
      await existingProd.save();
      console.log(`~ Updated Product: ${prodData.name} [SKU: ${prodData.SKU}]`);
    }
  }

  const finalCounts = {
    categories: await Category.countDocuments(),
    products: await Product.countDocuments(),
    users: await User.countDocuments()
  };

  console.log(`\nSeeding completed successfully!`);
  console.log(`Categories: ${finalCounts.categories}`);
  console.log(`Products:   ${finalCounts.products}`);
  console.log(`Users:      ${finalCounts.users}`);
  console.log('---------------------------------');

  return finalCounts;
}

// If executed directly from command line (e.g. npm run seed)
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed with error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase };
