// Dynamic category configuration for services
export const categoryConfig = {
  graphic_design: {
    title: "Graphic Design",
    description: "Professional graphic design services for all your visual communication needs",
    bgColor: "bg-gray-50"
  },
  logo_branding: {
    title: "Logo | Branding", 
    description: "Complete brand identity solutions including logo design and brand guidelines",
    bgColor: "bg-white"
  },
  motion_graphic: {
    title: "Motion Graphic",
    description: "Dynamic motion graphics and animated visual content for digital platforms",
    bgColor: "bg-gray-50"
  },
  websites: {
    title: "Websites",
    description: "Professional website design and development services for your online presence",
    bgColor: "bg-white"
  },
  video_creation: {
    title: "Video Creation | Video Editing | Animation",
    description: "Complete video production services from creation to post-production and animation",
    bgColor: "bg-gray-50"
  },
  social_media_plan: {
    title: "Social Media Plan",
    description: "Strategic social media planning and content strategies to boost your online engagement",
    bgColor: "bg-white"
  },
  content_writing: {
    title: "Newsletter | Content Writing",
    description: "Professional content creation including newsletters, blogs, and marketing copy",
    bgColor: "bg-gray-50"
  },
  app_development: {
    title: "App Development | Software",
    description: "Custom mobile app and software development solutions for your business needs",
    bgColor: "bg-white"
  },
  pitch_deck: {
    title: "Pitch Deck | Business Plan Deck",
    description: "Professional presentation decks for investors, business plans, and corporate pitches",
    bgColor: "bg-gray-50"
  },
  sponsorship_deck: {
    title: "Sponsorship Deck",
    description: "Compelling sponsorship proposals and partnership presentation materials",
    bgColor: "bg-white"
  },
  grant_application: {
    title: "Grant Application",
    description: "Professional grant writing and application services to secure funding",
    bgColor: "bg-gray-50"
  },
  virtual_assistant: {
    title: "Virtual Assistant",
    description: "Professional virtual assistance to handle your administrative tasks and boost productivity",
    bgColor: "bg-white"
  }
};

// Helper function to get category display info
export const getCategoryInfo = (categoryKey) => {
  // Try to load saved configuration first
  let config = categoryConfig;
  try {
    const savedConfig = localStorage.getItem('categoryConfig');
    if (savedConfig) {
      config = { ...categoryConfig, ...JSON.parse(savedConfig) };
    }
  } catch (error) {
    console.error('Error loading saved category config:', error);
  }

  return config[categoryKey] || {
    title: categoryKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `Professional ${categoryKey.replace('_', ' ')} services tailored to your needs`,
    bgColor: "bg-gray-50"
  };
};

// Helper function to get all active categories with products
export const getActiveCategoriesWithProducts = (products) => {
  return Object.keys(products)
    .filter(category => products[category] && products[category].length > 0)
    .map(category => ({
      key: category,
      ...getCategoryInfo(category),
      productCount: products[category].length,
      products: products[category]
    }));
};
