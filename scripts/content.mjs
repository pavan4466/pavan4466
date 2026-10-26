export const profile = {
  name: "Vinjamuri Pavan Mallesh",
  displayName: "Pavan",
  displayName2: "Mallesh Vinjamuri",
  role: "Data Analyst",
  stackLine: "SQL · Power BI · Python · Tableau",
  location: "Hyderabad, India",
  coordinates: "17.3850° N / 78.4867° E",
  email: "pavanvinjamuri17@gmail.com",
  linkedin: "https://www.linkedin.com/in/pavanmallesh4466/",
  github: "https://github.com/pavan4466",
  portfolio: "https://pavan-mallesh-portfolio.vercel.app/",
  tagline: "Raw data in. Clear decisions out.",
  claim: ["I clean, query, and visualize data", "so teams can decide with evidence."],
  stats: [
    { value: "04", label: "analytics projects" },
    { value: "03", label: "roles & internships" },
    { value: "8.2", label: "CGPA / 10" },
  ],
  availability: "Open to Data Analyst + BI Analyst roles",
  summary: [
    "I am an aspiring Data Analyst with hands-on experience in SQL, Python, Power BI, Tableau, and Excel. I enjoy cleaning messy datasets, analyzing patterns, and building dashboards that turn raw data into clear, actionable business insights.",
    "My work spans exploratory data analysis, KPI reporting, dashboard development, and SQL-based analysis across pricing, sales, and energy datasets. I am open to Data Analyst, BI Analyst, Reporting Analyst, MIS Analyst, and Business Analyst opportunities.",
  ],
  focus: "SQL · Power BI · Python · Tableau · Excel · EDA · ETL · KPI reporting",
};

export const aboutFacts = [
  { label: "Education", value: "B.Tech CSE (Data Science)", note: "St. Ann's College of Engineering & Technology" },
  { label: "Graduation", value: "2026" },
  { label: "CGPA", value: "8.2 / 10" },
  { label: "Location", value: "Hyderabad, India" },
  { label: "Status", value: "Open to analyst roles", accent: true },
];

export const experience = [
  {
    period: "Jan 2026 — Present",
    current: true,
    role: "Campus Mantri",
    company: "GeeksforGeeks",
    place: "Andhra Pradesh, India",
    bullets: [
      "Represented GeeksforGeeks on campus and promoted technical initiatives.",
      "Coordinated outreach, events, and peer engagement activities.",
    ],
    proofLabel: "On the record",
    proof: "Letter of Recommendation",
    proofNote: "GeeksforGeeks",
  },
  {
    period: "Dec 2025 — Mar 2026",
    role: "Data Analytics Intern (Virtual)",
    company: "SmartBridge Educational Services",
    place: "Chirala",
    bullets: [
      "Cleaned and transformed structured data with SQL, Excel, and Tableau.",
      "Built 3+ KPI dashboards and analyzed 1,000+ UNESCO records.",
    ],
    proofLabel: "Measured output",
    proof: "3+ KPI dashboards",
    proofNote: "1,000+ records analyzed",
  },
  {
    period: "May 2024 — Jul 2024",
    role: "Intern",
    company: "AIMERS",
    place: "Data preparation",
    bullets: [
      "Preprocessed and validated datasets using Python and OpenCV.",
      "Supported analytical model testing and dataset quality checks.",
    ],
    proofLabel: "Foundation",
    proof: "Python · OpenCV",
    proofNote: "Structured preprocessing",
  },
];

export const projects = [
  {
    key: "smartphone",
    number: "01",
    title: "Smartphone Market Analysis",
    meta: "Python · pandas · BeautifulSoup",
    goal: "Understand what actually drives smartphone prices on Flipkart.",
    bullets: [
      "Scraped and analyzed 400+ smartphone listings.",
      "Explored price, rating, discount, and specification patterns.",
      "Modeled how RAM and storage relate to listed price.",
    ],
    findingType: "bar",
    findingValue: 60,
    findingLabel: "of price variance explained by RAM + storage",
    stack: ["Python", "pandas", "BeautifulSoup4", "NumPy", "Matplotlib", "Seaborn"],
    repo: "https://github.com/pavan4466/smartphone-market-data-analysis",
    repoLabel: "smartphone-market-data-analysis",
  },
  {
    key: "movie",
    number: "02",
    title: "Movie Sales Dashboard",
    meta: "Power BI · Power Query · DAX",
    goal: "Compare genre performance across revenue, ratings, and audience votes.",
    bullets: [
      "Cleaned and modeled the dataset in Power Query.",
      "Built KPI-driven dashboards with DAX measures.",
      "Compared genre leaders across three different outcomes.",
    ],
    findingType: "leaders",
    leaders: [
      { label: "Revenue", value: "Action" },
      { label: "Ratings", value: "Biography" },
      { label: "Votes", value: "Drama" },
    ],
    stack: ["Power BI", "Power Query", "DAX", "Data modeling"],
    repo: "https://github.com/pavan4466/movie-sales-analysis-dashboard",
    repoLabel: "movie-sales-analysis-dashboard",
  },
  {
    key: "energy",
    number: "03",
    title: "World Energy Consumption",
    meta: "SQL · MySQL · Relational modeling",
    goal: "Relate energy use, emissions, GDP, and population across countries.",
    bullets: [
      "Designed a relational MySQL schema for country-level analysis.",
      "Used joins, aggregations, subqueries, and per-capita calculations.",
      "Compared economic scale and fossil-fuel dependence against emissions.",
    ],
    findingType: "schema",
    stack: ["SQL", "MySQL", "Relational modeling"],
    repo: "https://github.com/pavan4466/World-Wide-Energy-Consumption-Analysis-SQL",
    repoLabel: "World-Wide-Energy-Consumption-Analysis-SQL",
  },
  {
    key: "retailpulse",
    number: "04",
    title: "RetailPulse Analytics",
    meta: "SQL · Python · Power BI · In build",
    goal: "Simulate an end-to-end sales and inventory analytics workflow.",
    bullets: [
      "Designed as a multi-region analytics case study.",
      "Covers cleaning, SQL analysis, and Power BI reporting.",
      "Currently in progress as a portfolio-strengthening project.",
    ],
    findingType: "pipeline",
    stack: ["SQL", "Python", "Power BI", "Excel"],
    repo: null,
    repoLabel: "In build",
  },
];

export const toolkit = [
  {
    category: "Query",
    tools: ["SQL", "MySQL"],
    note: "Joins, aggregations, subqueries, and per-capita analysis across multi-table datasets.",
  },
  {
    category: "BI",
    tools: ["Power BI", "Tableau", "Excel"],
    note: "KPI dashboards, DAX, Power Query, visual storytelling, and reporting support.",
  },
  {
    category: "Python",
    tools: ["pandas", "NumPy", "Matplotlib", "Seaborn", "BeautifulSoup"],
    note: "Cleaning, preprocessing, EDA, scraping, and charts for analysis.",
  },
  {
    category: "Workflow",
    tools: ["ETL", "Data modeling", "KPI reporting"],
    note: "Raw data → clean model → validated dashboard, with the metric defined first.",
  },
];

export const certifications = [
  { name: "Intro to Programming Using Python", group: "Programming" },
  { name: "Python Programming", group: "Programming" },
  { name: "Power BI", group: "Analytics & BI" },
  { name: "Data Analytics with Tableau", group: "Analytics & BI" },
  { name: "Data Analytics Job Simulation", group: "Analytics & BI" },
];

export const achievements = [
  {
    label: "Academic record",
    value: "8.2 / 10",
    note: "B.Tech CSE (Data Science) · 2026",
    big: true,
  },
  {
    label: "Letter of Recommendation",
    value: "GeeksforGeeks",
    note: "Campus Mantri contribution",
  },
  {
    label: "Applied practice",
    value: "3 shipped · 1 in build",
    note: "SQL, Python, Power BI, Tableau",
  },
];

export const openTo = [
  "Data Analyst",
  "BI Analyst",
  "Reporting Analyst",
  "MIS Analyst",
  "Business Analyst",
  "Analytics internships",
];

export const milestones = [
  { date: "Feb 2026", label: "UNESCO Tableau analysis", x: 0.06, side: "up" },
  { date: "May 2026", label: "Smartphone + movie dashboards", x: 0.34, side: "down" },
  { date: "Jul 2026", label: "World energy SQL analysis", x: 0.64, side: "up" },
  { date: "Oct 2026", label: "RetailPulse in build", x: 0.93, side: "down" },
];
