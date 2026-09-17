// Every word list the extractors match against, kept in one place so adding
// a keyword is a one-line change.

export const SITE_TYPES = [
  {
    id: 'healthcare',
    label: 'Hospital / Healthcare',
    words: [
      'hospital', 'clinic', 'doctor', 'patient', 'medical', 'health', 'physician',
      'surgery', 'appointment', 'treatment', 'diagnosis', 'emergency', 'pharmacy',
      'nurse', 'specialist', 'consultant', 'opd', 'icu', 'radiology', 'pathology',
      'laboratory', 'cardiology', 'oncology', 'paediatric', 'pediatric', 'maternity',
    ],
  },
  {
    id: 'education',
    label: 'Education',
    words: [
      'university', 'college', 'school', 'student', 'admission', 'faculty', 'course',
      'curriculum', 'campus', 'degree', 'enroll', 'scholarship', 'alumni', 'semester',
      'undergraduate', 'postgraduate', 'syllabus',
    ],
  },
  {
    id: 'ecommerce',
    label: 'Online Store',
    words: [
      'cart', 'checkout', 'shop', 'product', 'add to cart', 'buy now', 'shipping',
      'delivery', 'price', 'discount', 'order', 'wishlist', 'payment',
      'add to basket', 'in stock', 'catalogue', 'catalog', 'store', 'browse',
    ],
  },
  {
    id: 'restaurant',
    label: 'Restaurant / Food',
    words: [
      'menu', 'reservation', 'dine', 'cuisine', 'restaurant', 'chef', 'dish',
      'takeaway', 'booking a table', 'food',
    ],
  },
  {
    id: 'realestate',
    label: 'Real Estate',
    words: [
      'property', 'listing', 'bedroom', 'for sale', 'for rent', 'agent', 'apartment',
      'villa', 'plot', 'square feet', 'mortgage',
    ],
  },
  {
    id: 'news',
    label: 'News / Media',
    words: [
      'news', 'headlines', 'breaking', 'journalist', 'reporter', 'article',
      'sport', 'weather', 'podcast', 'politics', 'entertainment', 'newsroom',
      'correspondent', 'editorial', 'live coverage',
    ],
  },
  {
    id: 'corporate',
    label: 'Business / Corporate',
    words: [
      'solutions', 'portfolio', 'case study', 'clients', 'consulting', 'enterprise',
      'our services', 'testimonial', 'partners',
    ],
  },
];

// Links get sorted into these buckets. The first pattern that matches wins,
// so the more specific ones are listed first.
export const PAGE_CATEGORIES = [
  { id: 'portal', label: 'Portal / Login', pattern: /portal|log-?in|sign-?in|my-?account|mychart/i, crawl: false },
  { id: 'appointment', label: 'Book an Appointment', pattern: /appointment|booking|book-now|schedule-a/i, crawl: false },
  { id: 'doctors', label: 'Doctors / Team', pattern: /doctor|physician|consultant|our-team|\bteam\b|staff|faculty|specialist/i, crawl: true },
  { id: 'facilities', label: 'Facilities', pattern: /facilit|infrastructure|amenit|equipment/i, crawl: true },
  { id: 'insurance', label: 'Billing / Insurance', pattern: /insurance|billing|panel|cashless/i, crawl: false },
  { id: 'contact', label: 'Contact Us', pattern: /contact|reach-us|get-in-touch/i, crawl: true },
  { id: 'about', label: 'About Us', pattern: /about|who-we-are|our-story|mission|vision/i, crawl: true },
  { id: 'services', label: 'Services', pattern: /service|specialit|specialt|department|treatment|procedure|clinic/i, crawl: true },
  { id: 'careers', label: 'Careers', pattern: /career|\bjobs?\b|vacanc|join-us/i, crawl: false },
  { id: 'blog', label: 'Blog / News', pattern: /blog|news|article|media|press/i, crawl: false },
  { id: 'faq', label: 'FAQ', pattern: /faq|frequently-asked/i, crawl: false },
  { id: 'privacy', label: 'Privacy Policy', pattern: /privacy|terms/i, crawl: false },
];

// Checks worth running on any site, whatever it does.
export const COMMON_FEATURES = [
  { id: 'payment', label: 'Online payment', hint: 'Money can be paid on the site', pattern: /pay\s*(your\s*)?bill|online\s*payment|make\s*a?\s*payment|pay\s*online|checkout/i },
  { id: 'blog', label: 'Blog / news section', hint: 'Articles or updates for visitors', pattern: /blog|news|article|press\s*release/i },
  { id: 'careers', label: 'Careers section', hint: 'Job listings', pattern: /career|vacanc|\bjobs?\b|join\s*our\s*team/i },
  { id: 'feedback', label: 'Feedback / complaints', hint: 'A way to raise a complaint or comment', pattern: /feedback|complaint|grievance/i },
  { id: 'whatsapp', label: 'WhatsApp contact', hint: 'Reachable on WhatsApp', pattern: /wa\.me|whatsapp/i },
  { id: 'directions', label: 'Map / directions', hint: 'A map or directions to the site', pattern: /google\.com\/maps|maps\.app\.goo|goo\.gl\/maps|directions|how\s*to\s*reach|find\s*us/i },
  { id: 'mobileApp', label: 'Mobile app', hint: 'Links to an iOS or Android app', pattern: /play\.google\.com|apps\.apple\.com|itunes\.apple\.com|download\s*(our\s*)?app/i },
  { id: 'donate', label: 'Donations', hint: 'Accepts donations or charity support', pattern: /donate|donation|zakat|sadaqah|charity|give\s*now/i },
];

// Checks that only apply to one kind of organisation.
export const DOMAIN_FEATURES = {
  healthcare: [
    { id: 'appointment', label: 'Online appointment booking', hint: 'Visitors can request or book a visit', pattern: /book\s*(an?\s*)?appointment|request\s*appointment|appointment|\bbooking\b|schedule\s*(a\s*)?(visit|consultation)/i },
    { id: 'portal', label: 'Patient portal / login', hint: 'A logged-in area for patients', pattern: /patient\s*portal|patient\s*login|my\s*chart|mychart|log\s*-?in|sign\s*-?in|my\s*account/i },
    { id: 'findDoctor', label: 'Find a doctor / search', hint: 'A way to look up a specific doctor', pattern: /find\s*a?\s*doctor|search\s*doctor|doctor\s*search|find\s*a?\s*physician|our\s*doctors/i },
    { id: 'labReports', label: 'Online lab reports', hint: 'Patients can view or download test results', pattern: /lab\s*report|test\s*result|online\s*report|diagnostic\s*report|patient\s*report|download\s*report/i },
    { id: 'telemedicine', label: 'Telemedicine / video consult', hint: 'Remote consultation with a doctor', pattern: /telemedicine|tele-?consult|video\s*consult|online\s*consultation|e-?consult/i },
    { id: 'emergency', label: 'Emergency information', hint: 'Emergency department or contact', pattern: /emergency|casualty|\ber\b|24\/7/i },
    { id: 'ambulance', label: 'Ambulance service', hint: 'A contactable ambulance service', pattern: /ambulance/i },
    { id: 'pharmacy', label: 'Pharmacy', hint: 'On-site or online pharmacy', pattern: /pharmacy|chemist|medicine\s*order/i },
    { id: 'insurance', label: 'Insurance / billing info', hint: 'Details about panels, cover or billing', pattern: /insurance|cashless|panel|billing/i },
    { id: 'packages', label: 'Health packages / check-ups', hint: 'Bundled screening or check-up offers', pattern: /health\s*package|check-?up|screening|executive\s*health/i },
    { id: 'bloodBank', label: 'Blood bank / donation', hint: 'Blood bank or donor information', pattern: /blood\s*bank|blood\s*donation|donate\s*blood/i },
    { id: 'vaccination', label: 'Vaccination', hint: 'Immunisation or vaccination services', pattern: /vaccinat|immunis|immuniz/i },
    { id: 'secondOpinion', label: 'Second opinion', hint: 'A formal second-opinion service', pattern: /second\s*opinion/i },
    { id: 'homeCare', label: 'Home healthcare', hint: 'Care or sample collection at home', pattern: /home\s*(health|care|nursing|sample|collection)|home-?based\s*care/i },
    { id: 'internationalPatients', label: 'International patients', hint: 'A desk for patients from abroad', pattern: /international\s*patient|medical\s*touris|overseas\s*patient/i },
    { id: 'visitingHours', label: 'Visiting hours / timings', hint: 'Published opening or visiting times', pattern: /visiting\s*hour|opening\s*hour|opd\s*(timing|schedule)|timings/i },
  ],

  education: [
    { id: 'admissions', label: 'Admissions information', hint: 'How to apply and when', pattern: /admission|apply\s*now|how\s*to\s*apply|entry\s*requirement/i },
    { id: 'onlineApplication', label: 'Online application', hint: 'Applications can be submitted online', pattern: /apply\s*online|online\s*application|application\s*portal|admission\s*portal/i },
    { id: 'studentPortal', label: 'Student portal / login', hint: 'A logged-in area for students', pattern: /student\s*portal|student\s*login|lms|learning\s*management|my\s*account|log\s*-?in/i },
    { id: 'programmes', label: 'Programmes / courses', hint: 'A list of what can be studied', pattern: /programme|program|course|degree|diploma|curriculum/i },
    { id: 'fees', label: 'Fees / scholarships', hint: 'Costs and financial help', pattern: /fee\s*structure|tuition|scholarship|financial\s*aid|bursary/i },
    { id: 'faculty', label: 'Faculty listing', hint: 'Who teaches there', pattern: /faculty|our\s*teachers|academic\s*staff|professors/i },
    { id: 'results', label: 'Exam results', hint: 'Results published online', pattern: /exam\s*result|result|transcript|gradebook/i },
    { id: 'library', label: 'Library', hint: 'Library or digital resources', pattern: /library|e-?resources|journals/i },
    { id: 'hostel', label: 'Hostel / accommodation', hint: 'Places for students to live', pattern: /hostel|accommodation|dormitor|residence\s*hall/i },
    { id: 'alumni', label: 'Alumni section', hint: 'Something for former students', pattern: /alumni|graduate\s*network/i },
  ],

  ecommerce: [
    { id: 'cart', label: 'Shopping cart', hint: 'Items can be collected before buying', pattern: /cart|basket|bag/i },
    { id: 'checkout', label: 'Checkout', hint: 'An order can be completed online', pattern: /checkout|place\s*order|buy\s*now/i },
    { id: 'account', label: 'Customer account / login', hint: 'A logged-in area for buyers', pattern: /my\s*account|log\s*-?in|sign\s*-?in|register/i },
    { id: 'wishlist', label: 'Wishlist', hint: 'Items can be saved for later', pattern: /wishlist|favourite|favorite|save\s*for\s*later/i },
    { id: 'shipping', label: 'Shipping information', hint: 'Delivery costs and times', pattern: /shipping|delivery\s*(info|charge|time)|free\s*delivery/i },
    { id: 'returns', label: 'Returns / refunds', hint: 'The returns policy', pattern: /return|refund|exchange\s*policy/i },
    { id: 'trackOrder', label: 'Order tracking', hint: 'Buyers can track a shipment', pattern: /track\s*(your\s*)?order|order\s*status|track\s*shipment/i },
    { id: 'offers', label: 'Offers / discounts', hint: 'Sales and promotions', pattern: /sale|offer|discount|deal|coupon|promo/i },
  ],

  restaurant: [
    { id: 'menu', label: 'Menu', hint: 'The food on offer', pattern: /menu|our\s*dishes|food\s*list/i },
    { id: 'reservation', label: 'Table reservation', hint: 'A table can be booked', pattern: /reserv|book\s*a?\s*table|booking/i },
    { id: 'orderOnline', label: 'Order online', hint: 'Food can be ordered from the site', pattern: /order\s*(online|now)|takeaway|take-?away|delivery/i },
    { id: 'openingHours', label: 'Opening hours', hint: 'When it is open', pattern: /opening\s*hour|hours|timings|we\s*are\s*open/i },
  ],
};

// The few questions worth answering with a plain yes or no at the top.
// These keep showing a "no", because an absence is a real answer.
export const DOMAIN_HIGHLIGHTS = {
  healthcare: ['appointment', 'portal', 'findDoctor', 'emergency', 'labReports', 'payment'],
  education: ['admissions', 'onlineApplication', 'studentPortal', 'fees', 'results', 'library'],
  ecommerce: ['cart', 'checkout', 'account', 'shipping', 'returns', 'trackOrder'],
  restaurant: ['menu', 'reservation', 'orderOnline', 'openingHours'],
  general: ['payment', 'blog', 'careers', 'directions'],
};

// What to call the features tab, so a school doesn't get "Patient Features".
export const FEATURE_LABELS = {
  healthcare: 'Patient Features',
  education: 'Student Features',
  ecommerce: 'Shopper Features',
  restaurant: 'Diner Features',
  news: 'Reader Features',
  general: 'Site Features',
};

// Path segments that are never worth a tab of their own.
export const COLLECTION_SKIP = /^(page|pages|en|ar|ur|index|home|assets|static|media|images|img|css|js|wp-content|wp-admin|uploads|tag|tags|author|search|cdn-cgi|feed|amp|print)$/i;

// Live-chat widgets are loaded by a script, so we look at script URLs.
export const CHAT_SCRIPTS = /tawk\.to|intercom|drift\.com|zendesk|crisp\.chat|livechat|freshchat|hubspot|tidio|smartsupp/i;

export const SOCIAL_NETWORKS = [
  ['Facebook', /facebook\.com|fb\.com/i],
  ['Instagram', /instagram\.com/i],
  ['X (Twitter)', /twitter\.com|x\.com/i],
  ['LinkedIn', /linkedin\.com/i],
  ['YouTube', /youtube\.com|youtu\.be/i],
  ['TikTok', /tiktok\.com/i],
  ['WhatsApp', /wa\.me|whatsapp\.com/i],
];

// A service whose name contains one of these is really a facility —
// a place or a piece of equipment rather than a treatment.
// Matched as whole words, so "ot" doesn't hit "physiotherapy".
export const FACILITY_WORDS = [
  'icu', 'ccu', 'nicu', 'ward', 'operation theatre', 'operation theater', 'ot',
  'blood bank', 'laboratory', 'lab', 'pharmacy', 'radiology', 'imaging', 'mri',
  'ct scan', 'x-ray', 'ultrasound', 'cath lab', 'dialysis', 'ambulance',
  'emergency', 'cafeteria', 'parking', 'prayer', 'mosque', 'day care',
  'inpatient', 'outpatient', 'facilities',
];
// Note: physiotherapy and rehabilitation are deliberately absent. They're
// treatments a hospital offers, not places, so they belong in services.

// Words suggesting a person's line of work — used to pick the speciality out
// of the text next to a name.
export const SPECIALITY_WORDS = /ology|ologist|surgery|surgeon|medicine|physician|specialist|consultant|professor|cardio|neuro|ortho|paed|pedia|derma|gynae|gyneco|onco|radiolog|patholog|psych|dental|dentist|\bent\b|urolog|nephro|gastro|pulmon|endocrin|anesth|anaesth|therapist|nurse|\bmbbs\b|\bfcps\b|\bmd\b/i;

// Link text that tells us nothing, so it never becomes an item name.
export const GENERIC_LINK_TEXT = /^(read\s*more|more|click\s*here|view\s*(all|more|our)?|learn\s*more|see\s*(all|more)|here|link|details|home|next|previous|back|menu|search|all)$/i;

// A link is a service if its address looks like one. Real sites vary a lot:
// /services/pharmacy, /specialities, /our-services/, /departments-centers.
export const SERVICE_HREF = /(^|\/)(our-)?(services?|specialit(y|ies)|specialt(y|ies)|departments?|treatments?|clinics?|procedures?|centres?|centers?)([/-]|$)|-services?([/-]|$)/i;

// Facilities usually live under their own path. Checked before services so
// "/facility/247-pharmacy" isn't filed as a service.
export const FACILITY_HREF = /(^|\/)(facilit(y|ies)|infrastructure|amenit(y|ies)|equipment)([/-]|$)/i;

// ...or if its text ends in a service-sounding word.
export const SERVICE_TEXT = /\b(services?|clinic|centre|center|department|unit|surgery|care|therapy|treatment)$/i;

// The section index itself ("Services", "Our Departments") is a page, not an
// item, so it never belongs in the list. Both spellings of speciality.
export const SERVICE_INDEX = /^(our\s+|all\s+)?(services?|specialit(y|ies)|specialt(y|ies)|departments?|facilities|centres?|centers?|clinics?)$/i;

// Nav pages that end in a service-sounding word but aren't a service.
export const SERVICE_SKIP = /^(about|contact|career|news|blog|media|video|home|search|donate|privacy|terms)\b/i;

// Street words used to spot an address. Matched CASE-SENSITIVELY on purpose:
// a real address writes "Stadium Road", prose writes "road trip".
export const STREET_WORDS = /(Road|Street|Avenue|Lane|Sector|Colony|Boulevard|Highway|Chowk)/;

// Where an address stops and the next detail begins.
export const ADDRESS_STOP =
  /\s+(?:email|e-mail|phone|tel|fax|contact|follow|copyright|call\s+us|visit|map|events|people|jobs|directions|opening|hours|search|menu)\b[\s\S]*$|\s+[TEPF]:[\s\S]*$/i;
