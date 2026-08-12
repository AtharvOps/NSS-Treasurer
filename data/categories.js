export const defaultCategories = [
  // Income Categories
  {
    id: "sponsorship",
    name: "Sponsorship",
    type: "INCOME",
    color: "#22c55e", // green-500
    icon: "Handshake",
  },
  {
    id: "donations",
    name: "Donations",
    type: "INCOME",
    color: "#10b981", // emerald-500
    icon: "Gift",
  },
  {
    id: "fundraising",
    name: "Fundraising",
    type: "INCOME",
    color: "#06b6d4", // cyan-500
    icon: "TrendingUp",
  },
  {
    id: "university-grants",
    name: "University Grants",
    type: "INCOME",
    color: "#8b5cf6", // violet-500
    icon: "School",
  },
  {
    id: "misc-income",
    name: "Other Income",
    type: "INCOME",
    color: "#64748b", // slate-500
    icon: "Plus",
  },

  // Expense Categories
  {
    id: "food",
    name: "Food",
    type: "EXPENSE",
    color: "#f43f5e", // rose-500
    icon: "UtensilsCrossed",
    subcategories: ["Snacks", "Lunch", "Drinking Water"],
  },
  {
    id: "travel",
    name: "Travel",
    type: "EXPENSE",
    color: "#0ea5e9", // sky-500
    icon: "Bus",
    subcategories: ["Bus", "Train", "Auto", "Fuel"],
  },
  {
    id: "camp-material",
    name: "Camp Materials",
    type: "EXPENSE",
    color: "#f97316", // orange-500
    icon: "TentTree",
    subcategories: ["Tents", "Banners", "First Aid", "Tools"],
  },
  {
    id: "cleaning-material",
    name: "Cleaning Materials",
    type: "EXPENSE",
    color: "#14b8a6", // teal-500
    icon: "Broom",
    subcategories: ["Detergents", "Dustbins", "Gloves"],
  },
  {
    id: "awareness-material",
    name: "Awareness Material",
    type: "EXPENSE",
    color: "#eab308", // yellow-500
    icon: "Megaphone",
    subcategories: ["Posters", "Flyers", "Pamphlets"],
  },
  {
    id: "craft-material",
    name: "Craft Supplies",
    type: "EXPENSE",
    color: "#ec4899", // pink-500
    icon: "Paintbrush",
    subcategories: ["Colors", "Paper", "Charts", "Scissors"],
  },
  {
    id: "donation-bags",
    name: "Food/Item Donation Bags",
    type: "EXPENSE",
    color: "#6366f1", // indigo-500
    icon: "PackageCheck",
    subcategories: ["Grains", "Clothes", "Essential Kits"],
  },
  {
    id: "certificates",
    name: "Certificates & Printing",
    type: "EXPENSE",
    color: "#c084fc", // purple-400
    icon: "FileText",
    subcategories: ["Certificates", "Printing", "Stamps"],
  },
  {
    id: "honorarium",
    name: "Honorarium",
    type: "EXPENSE",
    color: "#f59e0b", // amber-500
    icon: "UserRoundCheck",
    subcategories: ["Speaker Fee", "Guest Gifts"],
  },
  {
    id: "misc-expense",
    name: "Miscellaneous",
    type: "EXPENSE",
    color: "#94a3b8", // slate-400
    icon: "MoreHorizontal",
  },
];


export const categoryColors = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.color;   // e.g. "camp-material": "#f97316"
  acc[category.name] = category.color; // e.g. "Camp Materials": "#f97316"
  return acc;
}, {});