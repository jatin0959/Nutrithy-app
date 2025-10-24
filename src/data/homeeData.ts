// data/homeData.ts

// ---------- Shared Types ----------
export type GradientKey =
  | 'from-pink-500 to-rose-500'
  | 'from-purple-500 to-indigo-500'
  | 'from-orange-500 to-red-500'
  | 'from-blue-500 to-cyan-500'
  | 'from-yellow-500 to-orange-500';

export const GRADIENTS: Record<GradientKey, [string, string]> = {
  'from-pink-500 to-rose-500': ['#ec4899', '#f43f5e'],
  'from-purple-500 to-indigo-500': ['#8b5cf6', '#6366f1'],
  'from-orange-500 to-red-500': ['#f59e0b', '#ef4444'],
  'from-blue-500 to-cyan-500': ['#3b82f6', '#06b6d4'],
  'from-yellow-500 to-orange-500': ['#eab308', '#f59e0b'],
};

// ---------- Services ----------
export type ServiceCategory = 'nutrition' | 'fitness' | 'wellness' | 'therapy';

export interface ServiceCard {
  id: string;                // for card routing
  title: string;
  subtitle: string;
  image: string;
  color: GradientKey;
}

export interface ServiceItem {
  id: number;                // for list/details
  cardId: string;            // link to a card section, if needed
  name: string;
  category: ServiceCategory;
  provider: string;
  providerImage: string;
  price: number;
  originalPrice?: number;
  duration: string;          // e.g., "45 min"
  rating: number;
  reviews: number;
  image: string;
  tag: string;               // e.g., "Popular", "Premium"
  available: boolean;
  languages?: string[];
  badges?: string[];
  location?: string;
}

export const serviceCategories = [
  { id: 'all', name: 'All' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'wellness', name: 'Wellness' },
  { id: 'therapy', name: 'Therapy' },
] as const;

export const serviceCards: ServiceCard[] = [
  {
    id: 'consultation',
    title: 'Expert Consultation',
    subtitle: '1-on-1 with nutritionists',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'wellness',
    title: 'Corporate Wellness',
    subtitle: 'Team health programs',
    image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=1200',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'fitness',
    title: 'Fitness Plans',
    subtitle: 'Personalized workouts',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=1200',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    subtitle: 'Meditation & breathing',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
    color: 'from-blue-500 to-cyan-500',
  },
];

export const services: ServiceItem[] = [
  {
    id: 1,
    cardId: 'consultation',
    name: 'Personal Nutrition Consultation',
    category: 'nutrition',
    provider: 'Dr. Meera Patel',
    providerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    price: 500,
    originalPrice: 700,
    duration: '45 min',
    rating: 4.9,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1759177670217-72ddf0f95b7d?w=1200',
    tag: 'Popular',
    available: true,
    languages: ['English', 'Hindi', 'Gujarati'],
    badges: ['Verified', 'Top Rated'],
    location: 'Online',
  },
  {
    id: 2,
    cardId: 'fitness',
    name: 'Yoga Class (Group)',
    category: 'fitness',
    provider: 'Anita Wellness Center',
    providerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    price: 300,
    duration: '60 min',
    rating: 4.8,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1619781458519-5c6115c0ee98?w=1200',
    tag: 'Bestseller',
    available: true,
    badges: ['Beginner Friendly'],
    location: 'Studio • Mumbai',
  },
  {
    id: 3,
    cardId: 'fitness',
    name: 'Personal Training Session',
    category: 'fitness',
    provider: 'Rahul Fitness',
    providerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    price: 800,
    originalPrice: 1000,
    duration: '60 min',
    rating: 4.9,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1745329532589-4f33352c4b10?w=1200',
    tag: 'Premium',
    available: true,
    badges: ['Strength', 'Endurance'],
    location: 'Gym • Delhi',
  },
  {
    id: 4,
    cardId: 'mindfulness',
    name: 'Meditation & Mindfulness',
    category: 'wellness',
    provider: 'Zen Wellness Studio',
    providerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    price: 400,
    duration: '45 min',
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1562088287-bde35a1ea917?w=1200',
    tag: 'New',
    available: true,
    badges: ['Stress Relief'],
    location: 'Online',
  },
  {
    id: 5,
    cardId: 'therapy',
    name: 'Therapeutic Massage',
    category: 'therapy',
    provider: 'Healing Touch Spa',
    providerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    price: 1200,
    originalPrice: 1500,
    duration: '90 min',
    rating: 4.9,
    reviews: 278,
    image: 'https://images.unsplash.com/photo-1737352777897-e22953991a32?w=1200',
    tag: 'Premium',
    available: true,
    badges: ['Relaxation', 'Pain Relief'],
    location: 'Spa • Bengaluru',
  },
  {
    id: 6,
    cardId: 'therapy',
    name: 'Mental Health Counseling',
    category: 'therapy',
    provider: 'Dr. Vikram Singh',
    providerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    price: 1500,
    duration: '60 min',
    rating: 5.0,
    reviews: 198,
    image: 'https://images.unsplash.com/photo-1581461356013-c5229dcb670c?w=1200',
    tag: 'Top Rated',
    available: true,
    languages: ['English', 'Hindi'],
    badges: ['Confidential'],
    location: 'Clinic • Pune',
  },
  {
    id: 7,
    cardId: 'consultation',
    name: 'Diet Planning Service',
    category: 'nutrition',
    provider: 'Nutritionist Priya',
    providerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    price: 600,
    originalPrice: 800,
    duration: '30 min',
    rating: 4.8,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1670164747721-d3500ef757a6?w=1200',
    tag: 'Popular',
    available: true,
    badges: ['Weight Loss', 'Custom Plan'],
    location: 'Online',
  },
  {
    id: 8,
    cardId: 'fitness',
    name: 'Zumba Dance Class',
    category: 'fitness',
    provider: 'Dance Fitness Hub',
    providerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    price: 350,
    duration: '60 min',
    rating: 4.7,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=1200',
    tag: 'Fun',
    available: true,
    location: 'Studio • Jaipur',
  },
  {
    id: 9,
    cardId: 'wellness',
    name: 'Stress Management Workshop',
    category: 'wellness',
    provider: 'Wellness Warriors',
    providerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    price: 900,
    duration: '120 min',
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
    tag: 'Workshop',
    available: true,
    location: 'Online',
  },
  {
    id: 10,
    cardId: 'wellness',
    name: 'Prenatal Yoga',
    category: 'wellness',
    provider: 'Mother Care Studio',
    providerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    price: 450,
    duration: '60 min',
    rating: 4.9,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200',
    tag: 'Specialized',
    available: true,
    location: 'Studio • Hyderabad',
  },
  {
    id: 11,
    cardId: 'consultation',
    name: 'Sports Nutrition Consult',
    category: 'nutrition',
    provider: 'Dr. Arjun Kapoor',
    providerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    price: 700,
    duration: '45 min',
    rating: 4.9,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
    tag: 'Specialized',
    available: true,
    location: 'Online',
  },
  {
    id: 12,
    cardId: 'fitness',
    name: 'Pilates Class',
    category: 'fitness',
    provider: 'Core Strength Studio',
    providerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    price: 500,
    duration: '60 min',
    rating: 4.8,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200',
    tag: 'Trending',
    available: true,
    location: 'Studio • Kolkata',
  },
];

// ---------- Products ----------
export type ProductCategory =
  | 'Protein' | 'Vitamins' | 'Health' | 'Supplements' | 'Beauty'
  | 'Beverages' | 'Snacks' | 'Digestive' | 'Immunity' | 'Nutrition';

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: string;              // display price
  originalPrice?: string;
  rating: number;
  reviews: number;
  image: string;
  tag: string;
  inStock: boolean;
  // extra, if you want to expand detail pages:
  sku?: string;
  variants?: Array<{ label: string; value: string }>;
  inventoryQty?: number;
  badges?: string[];          // e.g., "Vegan", "Gluten Free"
  descriptionShort?: string;
}

export const productCategories: Array<{ id: ProductCategory | 'All'; name: string }> = [
  { id: 'All', name: 'All' },
  { id: 'Protein', name: 'Protein' },
  { id: 'Vitamins', name: 'Vitamins' },
  { id: 'Health', name: 'Health' },
  { id: 'Supplements', name: 'Supplements' },
  { id: 'Beauty', name: 'Beauty' },
  { id: 'Snacks', name: 'Snacks' },
  { id: 'Beverages', name: 'Beverages' },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Premium Protein Powder',
    category: 'Protein',
    price: '₹1,299',
    originalPrice: '₹1,599',
    rating: 4.8,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1693996045346-d0a9b9470909?w=1200',
    tag: 'Bestseller',
    inStock: true,
    sku: 'PRO-PR-001',
    variants: [{ label: 'Size', value: '1kg' }, { label: 'Flavor', value: 'Vanilla' }],
    inventoryQty: 58,
    badges: ['Vegetarian'],
    descriptionShort: 'High-quality whey blend with 24g protein/serving.',
  },
  {
    id: 2,
    name: 'Daily Multivitamins',
    category: 'Vitamins',
    price: '₹899',
    originalPrice: '₹1,099',
    rating: 4.6,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1648139347040-857f024f8da4?w=1200',
    tag: 'New',
    inStock: true,
    sku: 'VIT-DA-010',
    variants: [{ label: 'Pack', value: '60 tablets' }],
    inventoryQty: 120,
    badges: ['Vegan'],
    descriptionShort: 'All-in-one daily essentials to fill nutrient gaps.',
  },
  {
    id: 3,
    name: 'Omega-3 Fish Oil',
    category: 'Health',
    price: '₹749',
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1576437293196-fc3080b75964?w=1200',
    tag: 'Top Rated',
    inStock: true,
    sku: 'HEL-OM-003',
    variants: [{ label: 'Pack', value: '90 softgels' }],
    inventoryQty: 96,
    badges: ['Mercury Tested'],
    descriptionShort: 'Heart & brain support from high-purity fish oil.',
  },
  {
    id: 4,
    name: 'Green Superfood Powder',
    category: 'Supplements',
    price: '₹1,499',
    originalPrice: '₹1,799',
    rating: 4.9,
    reviews: 298,
    image: 'https://images.unsplash.com/photo-1708573106044-2bbefb3d9fc3?w=1200',
    tag: 'Organic',
    inStock: true,
    sku: 'SUP-GR-050',
    variants: [{ label: 'Size', value: '500g' }],
    inventoryQty: 42,
    badges: ['Organic', 'Gluten Free'],
    descriptionShort: 'Greens, adaptogens, and probiotics in one scoop.',
  },
  {
    id: 5,
    name: 'Collagen Beauty Blend',
    category: 'Beauty',
    price: '₹1,899',
    originalPrice: '₹2,299',
    rating: 4.8,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1689841175766-a5abc64b9903?w=1200',
    tag: 'Premium',
    inStock: true,
    sku: 'BEA-CO-020',
    variants: [{ label: 'Flavor', value: 'Berry' }],
    inventoryQty: 35,
    badges: ['Skin & Hair'],
    descriptionShort: 'Collagen peptides with Vitamin C & hyaluronic acid.',
  },
  {
    id: 6,
    name: 'Herbal Wellness Tea',
    category: 'Beverages',
    price: '₹599',
    rating: 4.5,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1594137052297-e55c3c6b33f9?w=1200',
    tag: '☕ Popular',
    inStock: true,
    sku: 'BEV-TE-015',
    variants: [{ label: 'Blend', value: 'Calm' }],
    inventoryQty: 88,
    badges: ['Caffeine Free'],
    descriptionShort: 'Calming herbs for daily unwind & sleep support.',
  },
  {
    id: 7,
    name: 'Energy Protein Bars',
    category: 'Snacks',
    price: '₹449',
    rating: 4.6,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1597776776796-092650d7afed?w=1200',
    tag: '⚡ Quick Fuel',
    inStock: true,
    sku: 'SNA-BA-006',
    variants: [{ label: 'Pack', value: '6 bars' }],
    inventoryQty: 210,
    badges: ['High Protein'],
    descriptionShort: 'On-the-go protein bars with clean ingredients.',
  },
  {
    id: 8,
    name: 'Probiotic Complex',
    category: 'Digestive',
    price: '₹1,199',
    rating: 4.7,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1620755848138-dd2cbb2781c5?w=1200',
    tag: '🦠 Health',
    inStock: true,
    sku: 'DIG-PR-030',
    variants: [{ label: 'CFU', value: '50B' }],
    inventoryQty: 64,
    badges: ['Shelf Stable'],
    descriptionShort: 'Balanced strains for gut health & immunity.',
  },
  {
    id: 9,
    name: 'Turmeric Curcumin',
    category: 'Immunity',
    price: '₹849',
    rating: 4.8,
    reviews: 192,
    image: 'https://images.unsplash.com/photo-1621586862188-1b91f76f8c72?w=1200',
    tag: '🛡️ Immunity',
    inStock: true,
    sku: 'IMM-TU-025',
    variants: [{ label: 'Piperine', value: 'Yes' }],
    inventoryQty: 77,
    badges: ['Anti-Inflammatory'],
    descriptionShort: 'High-absorption curcumin with black pepper extract.',
  },
  {
    id: 10,
    name: 'Meal Replacement Shake',
    category: 'Nutrition',
    price: '₹1,399',
    originalPrice: '₹1,699',
    rating: 4.6,
    reviews: 164,
    image: 'https://images.unsplash.com/photo-1584116831289-e53912463c35?w=1200',
    tag: 'Complete',
    inStock: true,
    sku: 'NUT-MR-040',
    variants: [{ label: 'Size', value: '1kg' }],
    inventoryQty: 52,
    badges: ['Balanced Macro'],
    descriptionShort: 'Complete macro profile for busy days.',
  },
  {
    id: 11,
    name: 'Vitamin D3 + K2 Drops',
    category: 'Vitamins',
    price: '₹699',
    rating: 4.7,
    reviews: 121,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    tag: 'Bone Health',
    inStock: true,
    sku: 'VIT-DK-012',
    variants: [{ label: 'Dose', value: '2000 IU' }],
    inventoryQty: 90,
    badges: ['Oil-Based'],
    descriptionShort: 'Synergistic D3 & K2 for bone and heart health.',
  },
  {
    id: 12,
    name: 'Magnesium Glycinate',
    category: 'Health',
    price: '₹799',
    rating: 4.8,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1623065424908-57b37cdb368a?w=1200',
    tag: 'Sleep Support',
    inStock: true,
    sku: 'HEL-MG-021',
    variants: [{ label: 'Capsules', value: '120' }],
    inventoryQty: 73,
    badges: ['Highly Bioavailable'],
    descriptionShort: 'Relaxation and muscle recovery support.',
  },
];

// ---------- Optional: Stories (for Home top carousel) ----------
export const stories = [
  { id: 1, title: 'Your Story', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', hasNew: false, isYou: true },
  { id: 2, title: 'Priya', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', hasNew: true },
  { id: 3, title: 'Rahul', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', hasNew: true },
  { id: 4, title: 'Anita', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', hasNew: false },
  { id: 5, title: 'Vikram', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', hasNew: true },
] as const;
