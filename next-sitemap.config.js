module.exports = {
  siteUrl: 'https://forgemission.com',
  generateRobotsTxt: true,
  exclude: [
    '/knowledge/AI-Strategy-2025-Policies-Competitive-Analysis',
    '/knowledge/AI-Strategy-2025-Policies-Funding',
    '/knowledge/AI-Strategy-2025-Policies-Key-Challenges',
    '/knowledge/AI-Strategy-2025-Policies-Landscape',
    '/knowledge/AI-Strategy-2025-Policies-Opportunities',
    '/knowledge/AI-Strategy-2025-Policies-Recommendations',
    '/knowledge/AI-Strategy-2025-Policies-References',
    '/knowledge/AI-Strategy-2025-Policies-Sectoral-Impacts',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: [
          '/knowledge/AI-Strategy-2025-Policies-Competitive-Analysis',
          '/knowledge/AI-Strategy-2025-Policies-Funding',
          '/knowledge/AI-Strategy-2025-Policies-Key-Challenges',
          '/knowledge/AI-Strategy-2025-Policies-Landscape',
          '/knowledge/AI-Strategy-2025-Policies-Opportunities',
          '/knowledge/AI-Strategy-2025-Policies-Recommendations',
          '/knowledge/AI-Strategy-2025-Policies-References',
          '/knowledge/AI-Strategy-2025-Policies-Sectoral-Impacts',
        ],
      },
    ],
  },
  transform: async (config, path) => {
    if (path === '/knowledge/AI-Strategy-2025-Policies-Executive-Summary') {
      return {
        loc: `${config.siteUrl}${path}`,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    return {
      loc: `${config.siteUrl}${path}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
