import { ExtractedField, ExtractedRound, ExtractionContext, ExtractionProvider, RawExtraction } from "./extraction.types";
import { PpoType } from "@suzume/shared-types";

function preprocessText(text: string): string {
  let cleaned = text.replace(/\[([^\]]+)\]\(https?:\/\/[^\s)]+\)/g, "$1");
  cleaned = cleaned.replace(/https?:\/\/\S+/g, " ");
  cleaned = cleaned.replace(/\bwww\.\S+/gi, " ");
  return cleaned;
}

function matchLabeledField(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const regex = new RegExp(`(?:^|\\n)[\\s*_]*${label}[\\s*_]*:\\s*([^\\n]+)`, "i");
    const match = text.match(regex);
    if (match) {
      const value = match[1].replace(/[*_]+/g, "").trim();
      if (value) return value;
    }
  }
  return null;
}

const KNOWN_CITIES = [
  "Bangalore", "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Chennai", "Delhi",
  "Noida", "Gurgaon", "Gurugram", "Kolkata", "Ahmedabad", "Jaipur", "Kochi",
  "Chandigarh", "Indore", "Nagpur", "Coimbatore", "Trivandrum", "Remote",
];

const FALLBACK_COMPANIES = [
  "InMobi", "Amazon", "Google", "Microsoft", "Flipkart", "Meta", "Apple",
  "Netflix", "Uber", "Adobe", "Oracle", "IBM", "Salesforce", "Atlassian",
  "Goldman Sachs", "Morgan Stanley", "Walmart", "Deloitte", "Accenture",
  "TCS", "Infosys", "Wipro", "Cognizant", "Zomato", "Swiggy", "Paytm",
  "PhonePe", "Razorpay", "CRED", "Freshworks", "Myntra", "Ola", "Zoho",
];

const ROLE_PATTERNS: Array<{ regex: RegExp; confidence: number }> = [
  { regex: /SDE[\s-]?\d\s*(intern(ship)?)?/i, confidence: 0.92 },
  { regex: /SDE\s*intern(ship)?/i, confidence: 0.9 },
  { regex: /SWE\s*intern(ship)?/i, confidence: 0.9 },
  { regex: /software\s+(development\s+)?engineer(ing)?\s*intern(ship)?/i, confidence: 0.88 },
  { regex: /software\s+(development\s+)?engineer/i, confidence: 0.85 },
  { regex: /software\s+developer/i, confidence: 0.82 },
  { regex: /backend\s+developer/i, confidence: 0.85 },
  { regex: /frontend\s+developer/i, confidence: 0.85 },
  { regex: /full[\s-]?stack\s+developer/i, confidence: 0.85 },
  { regex: /data\s+scientist/i, confidence: 0.85 },
  { regex: /data\s+analyst/i, confidence: 0.85 },
  { regex: /product\s+manager/i, confidence: 0.85 },
  { regex: /\bintern(ship)?\b/i, confidence: 0.45 },
];

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8,
  september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

const MONTH_DAY_REGEX = new RegExp(
  `(${Object.keys(MONTHS).join("|")})\\.?\\s+(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?`,
  "i"
);
const DAY_MONTH_REGEX = new RegExp(
  `(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?\\s+(${Object.keys(MONTHS).join("|")})\\.?(?:,?\\s*(\\d{4}))?`,
  "i"
);
const NUMERIC_DATE_REGEX = /\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})\b/;
const TIME_REGEX = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)/;
const TIME_ONLY_REGEX = /\b\d{1,2}:\d{2}\b/;

function extractDateTime(text: string, referenceDate: Date): { iso: string | null; confidence: number } {
  const monthDayMatch = text.match(MONTH_DAY_REGEX);
  const dayMonthMatch = !monthDayMatch ? text.match(DAY_MONTH_REGEX) : null;
  const numericMatch = !monthDayMatch && !dayMonthMatch ? text.match(NUMERIC_DATE_REGEX) : null;

  let month: number | null = null;
  let day: number | null = null;
  let year: number | null = null;

  if (monthDayMatch) {
    month = MONTHS[monthDayMatch[1].toLowerCase()];
    day = parseInt(monthDayMatch[2], 10);
    year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : null;
  } else if (dayMonthMatch) {
    day = parseInt(dayMonthMatch[1], 10);
    month = MONTHS[dayMonthMatch[2].toLowerCase()];
    year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3], 10) : null;
  } else if (numericMatch) {
    // Indian placement notices overwhelmingly use DD-MM-YYYY; treat the
    // first numeric group as the day unless it can only be a month (>12).
    const first = parseInt(numericMatch[1], 10);
    const second = parseInt(numericMatch[2], 10);
    if (first > 12 && second <= 12) {
      day = first;
      month = second - 1;
    } else if (second > 12 && first <= 12) {
      month = first - 1;
      day = second;
    } else {
      day = first;
      month = second - 1;
    }
    year = parseInt(numericMatch[3], 10);
  }

  if (month === null || day === null) {
    return { iso: null, confidence: 0 };
  }

  if (year === null) {
    year = referenceDate.getFullYear();
    const candidate = new Date(year, month, day);
    if (candidate.getTime() < referenceDate.getTime() - 24 * 60 * 60 * 1000) {
      year += 1;
    }
  }

  const timeMatch = text.match(TIME_REGEX);
  let hours = 9;
  let minutes = 0;
  let hasTime = false;

  if (timeMatch) {
    hasTime = true;
    hours = parseInt(timeMatch[1], 10);
    minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridiem = timeMatch[3].toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }

  const date = new Date(year, month, day, hours, minutes, 0);
  return { iso: date.toISOString(), confidence: hasTime ? 0.9 : 0.7 };
}

function detectRound(text: string, referenceDate: Date): ExtractedRound | null {
  const durationMatch = text.match(/(\d{1,3})\s*min(ute)?s?/i);
  const duration = durationMatch ? parseInt(durationMatch[1], 10) : null;

  function detectMode(scope: string) {
    if (/\boffline\b|in[\s-]?person|on[\s-]?campus/i.test(scope)) return "OFFLINE";
    if (/\bonline\b/i.test(scope)) return "ONLINE";
    if (/\bphone\b/i.test(scope)) return "PHONE";
    return null;
  }

  const rules: Array<{ test: RegExp; type: ExtractedRound["type"]; title: string; base: number }> = [
    { test: /online\s+assessment|\boa\b/i, type: "ONLINE_ASSESSMENT", title: "Online Assessment", base: 0.9 },
    { test: /technical\s+interview\s*2|second\s+technical\s+interview/i, type: "TECHNICAL_INTERVIEW", title: "Technical Interview 2", base: 0.85 },
    { test: /technical\s+interview|tech\s+interview/i, type: "TECHNICAL_INTERVIEW", title: "Technical Interview", base: 0.88 },
    { test: /managerial\s+round|manager(ial)?\s+interview/i, type: "MANAGERIAL_ROUND", title: "Managerial Round", base: 0.85 },
    { test: /hr\s+(round|interview)/i, type: "HR_ROUND", title: "HR Round", base: 0.88 },
    { test: /\binterview\b/i, type: "TECHNICAL_INTERVIEW", title: "Interview", base: 0.6 },
    { test: /\bassessment\b/i, type: "ONLINE_ASSESSMENT", title: "Assessment", base: 0.55 },
  ];

  for (const rule of rules) {
    const match = text.match(rule.test);
    if (match && match.index !== undefined) {
      // A message often names several dates (multiple rounds, a deadline).
      // Reading the date from a window around the matched round keyword,
      // rather than the whole text, keeps the date attached to the round
      // it actually belongs to instead of borrowing an unrelated one.
      // Bias the window forward: "Label: <date>" is the dominant structure
      // in placement notices, so the date almost always follows the round
      // keyword rather than precedes it. A small backward allowance still
      // catches "18th August — Online Assessment" style phrasing.
      const windowStart = Math.max(0, match.index - 15);
      const windowEnd = Math.min(text.length, match.index + match[0].length + 100);
      const window = text.slice(windowStart, windowEnd);
      let { iso, confidence: dateConfidence } = extractDateTime(window, referenceDate);
      if (!iso) {
        const fallback = extractDateTime(text, referenceDate);
        iso = fallback.iso;
        dateConfidence = fallback.confidence * 0.7;
      }

      return {
        type: rule.type,
        title: rule.title,
        scheduledAt: iso,
        duration,
        mode: detectMode(window) ?? detectMode(text),
        confidence: iso ? Math.min(rule.base, dateConfidence + 0.1) : rule.base * 0.6,
      };
    }
  }

  const driveLabelValue = matchLabeledField(text, ["Drive Date", "Selection Date", "Interview Date"]);
  if (driveLabelValue) {
    const driveDate = extractDateTime(driveLabelValue, referenceDate);
    if (driveDate.iso) {
      return {
        type: "OTHER",
        title: "Placement Drive",
        scheduledAt: driveDate.iso,
        duration,
        mode: detectMode(text),
        confidence: 0.75,
      };
    }
  }

  return null;
}

const COMPANY_STOPWORDS = new Set([
  "hi", "hello", "dear", "thank", "thanks", "please", "congratulations", "regards",
  "best", "sincerely", "we", "you", "your", "this", "that", "the", "team", "hiring",
  "hr", "subject", "re", "interview", "online", "assessment", "technical", "application",
  "internship", "role", "position", "regarding", "from", "sent", "to", "date", "good",
  "morning", "afternoon", "evening", "sir", "madam", "candidate", "campus", "drive",
  "recruitment", "placement", "cell", "greetings", "hey", "congrats", "wishing",
  "reminder", "update", "notice", "alert", "note", "attention", "important", "fwd",
  "reminders", "final", "urgent", "action", "required", "info", "information",
]);

const COMPANY_CONTEXT_PATTERNS: RegExp[] = [
  /(?:[Yy]ou have been (?:selected|shortlisted|chosen)[^.]*?(?:at|for|by|with)\s+)([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})/,
  /(?:[Aa]pplying|[Aa]pplication)\s+(?:to|at|with)\s+([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})/,
  /(?:[Oo]n behalf of|[Rr]egarding your application (?:to|at|with))\s+([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})/,
  /([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})\s+has\s+(?:selected|shortlisted|invited)\s+you/,
  /([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})\s+(?:campus\s+drive|is\s+(?:now\s+)?hiring|recruitment\s+(?:drive|process))/,
  /(?:[Jj]oin|[Jj]oining)\s+([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})/,
  /\bat\s+([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})(?=\s+(?:has|is|will|for|,|\.|scheduled))/,
  /(?:offer|position|role)\s+(?:at|with|from)\s+([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})/,
  /[Yy]our\s+([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,3})\s+(?:interview|assessment|round|technical|hr|application|offer|drive)/,
];

function cleanCompanyCandidate(raw: string): string | null {
  const trimmed = raw.replace(/[.,'-]+$/, "").trim();
  if (!trimmed) return null;
  let tokens = trimmed.split(/\s+/);
  while (tokens.length > 1 && COMPANY_STOPWORDS.has(tokens[0].toLowerCase())) {
    tokens.shift();
  }
  while (tokens.length > 1 && COMPANY_STOPWORDS.has(tokens[tokens.length - 1].toLowerCase())) {
    tokens.pop();
  }
  if (tokens.every((t) => COMPANY_STOPWORDS.has(t.toLowerCase()))) return null;
  const cleaned = tokens.join(" ");
  return cleaned.length >= 2 ? cleaned : null;
}

function detectCompany(text: string, knownCompanies: string[]): ExtractedField<string> {
  const labeled = matchLabeledField(text, ["Company", "Company Name", "Organi[sz]ation"]);
  if (labeled) {
    const cleaned = cleanCompanyCandidate(labeled.split(/[,(]/)[0].trim());
    if (cleaned) return { value: cleaned, confidence: 0.97 };
  }

  const candidates = [...knownCompanies, ...FALLBACK_COMPANIES];
  for (const company of candidates) {
    const regex = new RegExp(`\\b${company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(text)) {
      return { value: company, confidence: 0.95 };
    }
  }

  for (const pattern of COMPANY_CONTEXT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const cleaned = cleanCompanyCandidate(match[1]);
      if (cleaned) {
        return { value: cleaned, confidence: 0.65 };
      }
    }
  }

  const genericMatches = [...text.matchAll(/\b([A-Z][a-zA-Z]{1,}(?:\s[A-Z][a-zA-Z]{1,}){0,2})\b/g)];
  for (const m of genericMatches) {
    const cleaned = cleanCompanyCandidate(m[1]);
    if (cleaned && !KNOWN_CITIES.some((c) => c.toLowerCase() === cleaned.toLowerCase())) {
      return { value: cleaned, confidence: 0.35 };
    }
  }

  return { value: null, confidence: 0 };
}

function detectRole(text: string): ExtractedField<string> {
  const labeled = matchLabeledField(text, ["Role", "Position", "Designation", "Job Title"]);
  if (labeled) {
    const cleaned = labeled.split(/[,(]/)[0].trim();
    if (cleaned.length >= 2) return { value: cleaned, confidence: 0.95 };
  }

  for (const pattern of ROLE_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      return { value: match[0].trim(), confidence: pattern.confidence };
    }
  }

  const genericPatterns: RegExp[] = [
    /(?:role|position)\s+of\s+([A-Za-z][A-Za-z0-9\-\/ ]{1,40}?)(?=\s+(?:at|in|has|is|role|position)\b|[.,]|$)/i,
    /for\s+the\s+([A-Za-z][A-Za-z0-9\-\/ ]{1,40}?)\s+(?:role|position|profile)\b/i,
    /hiring\s+(?:for\s+)?(?:a\s+|an\s+)?([A-Za-z][A-Za-z0-9\-\/ ]{1,40}?)(?=\s+(?:at|in|position|role)\b|[.,]|$)/i,
  ];
  for (const pattern of genericPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = match[1].trim();
      if (value.length >= 2) {
        return { value, confidence: 0.55 };
      }
    }
  }

  return { value: null, confidence: 0 };
}

function detectLocation(text: string): ExtractedField<string> {
  const labeled = matchLabeledField(text, ["Job Location", "Location", "Work Location", "Place"]);
  if (labeled) {
    const cleaned = labeled.split(/[,(]/)[0].trim();
    if (cleaned.length >= 2) return { value: cleaned, confidence: 0.9 };
  }

  for (const city of KNOWN_CITIES) {
    const regex = new RegExp(`\\b${city}\\b`, "i");
    if (regex.test(text)) {
      return { value: city === "Bengaluru" ? "Bangalore" : city, confidence: 0.85 };
    }
  }
  return { value: null, confidence: 0 };
}

function detectStipend(text: string): ExtractedField<number> {
  const labeled = matchLabeledField(text, ["Internship Stipend", "Stipend"]);
  if (labeled) {
    const num = labeled.match(/₹?\s?([\d][\d,]*)/);
    if (num) {
      const parsed = parseInt(num[1].replace(/,/g, ""), 10);
      if (parsed > 0) return { value: parsed, confidence: 0.92 };
    }
  }

  const match = text.match(/(?:stipend[^₹\d]{0,15})?₹\s?([\d][\d,]{2,10})\s*(?:\/|per)?\s*month/i);
  if (match) {
    return { value: parseInt(match[1].replace(/,/g, ""), 10), confidence: 0.85 };
  }
  return { value: null, confidence: 0 };
}

function detectCtc(text: string): ExtractedField<number> {
  const labeled = matchLabeledField(text, ["Full[\\s-]?Time CTC", "CTC", "Package"]);
  if (labeled) {
    const range = labeled.match(/([\d.]+)\s*[-–—to]{1,4}\s*([\d.]+)\s*LPA/i);
    if (range) {
      const low = parseFloat(range[1]);
      const high = parseFloat(range[2]);
      return { value: Math.round(((low + high) / 2) * 100000), confidence: 0.9 };
    }
    const single = labeled.match(/([\d.]+)\s*LPA/i);
    if (single) {
      return { value: Math.round(parseFloat(single[1]) * 100000), confidence: 0.9 };
    }
  }

  const rangeMatch = text.match(/₹?\s?([\d.]+)\s*[-–—to]{1,4}\s*([\d.]+)\s*LPA/i);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return { value: Math.round(((low + high) / 2) * 100000), confidence: 0.82 };
  }
  const singleMatch = text.match(/₹?\s?([\d.]+)\s*LPA/i);
  if (singleMatch) {
    return { value: Math.round(parseFloat(singleMatch[1]) * 100000), confidence: 0.8 };
  }
  return { value: null, confidence: 0 };
}

function detectPpoType(text: string): ExtractedField<PpoType> {
  if (/performance[\s-]based\s+ppo|ppo\s+based\s+on\s+performance|performance[\s-]linked\s+ppo/i.test(text)) {
    return { value: "PERFORMANCE_BASED_PPO", confidence: 0.85 };
  }
  if (/\bppo\b|pre[\s-]?placement\s+offer/i.test(text)) {
    return { value: "PPO", confidence: 0.8 };
  }

  const conversionMatch = text.match(
    /internship[^.\n]{0,60}?(?:followed by|leading to|converts? to|then)[^.\n]{0,20}?full[\s-]?time[^.\n]{0,40}?(\(([^)]*)\))?/i
  );
  if (conversionMatch) {
    const qualifier = conversionMatch[2] ?? "";
    const isPerformanceBased = /performance/i.test(qualifier) || /performance[\s-]based/i.test(text);
    return { value: isPerformanceBased ? "PERFORMANCE_BASED_PPO" : "PPO", confidence: 0.7 };
  }

  return { value: null, confidence: 0 };
}

function detectStatusSuggestion(text: string): ExtractedField<import("@suzume/shared-types").ApplicationStatus> {
  const lower = text.toLowerCase();
  if (/congratulations[^.]*(selected|offer)|pleased to offer|offer letter/i.test(lower)) {
    return { value: "OFFER", confidence: 0.85 };
  }
  if (/unfortunately|regret to inform|not been selected|will not be moving forward/i.test(lower)) {
    return { value: "REJECTED", confidence: 0.85 };
  }
  if (/shortlisted/i.test(lower)) {
    return { value: "SHORTLISTED", confidence: 0.75 };
  }
  if (/application\s+(is\s+)?(now\s+)?open|apply\s+now|application\s+received/i.test(lower)) {
    return { value: "APPLIED", confidence: 0.6 };
  }
  return { value: null, confidence: 0 };
}

export const mockExtractionProvider: ExtractionProvider = {
  name: "mock-deterministic-v1",
  async extract(text: string, context: ExtractionContext): Promise<RawExtraction> {
    text = preprocessText(text);
    const company = detectCompany(text, context.knownCompanies);
    let role = detectRole(text);
    if (role.value && company.value && role.value.toLowerCase() === company.value.toLowerCase()) {
      role = { value: null, confidence: 0 };
    }
    const location = detectLocation(text);
    const stipend = detectStipend(text);
    const ctc = detectCtc(text);
    const statusSuggestion = detectStatusSuggestion(text);
    const round = detectRound(text, context.referenceDate);

    const internship = /internship|intern\b/i.test(text)
      ? { value: true, confidence: 0.75 }
      : { value: null, confidence: 0 };
    const ppoType = detectPpoType(text);

    const deadlineMatch = text.match(/(?:deadline|last date to apply|apply by)[^.\n]{0,40}/i);
    let deadline: ExtractedField<string> = { value: null, confidence: 0 };
    let deadlineTimeOnlyNote: string | null = null;
    if (deadlineMatch) {
      const { iso, confidence } = extractDateTime(deadlineMatch[0], context.referenceDate);
      if (iso) {
        deadline = { value: iso, confidence };
      } else if (TIME_ONLY_REGEX.test(deadlineMatch[0])) {
        deadlineTimeOnlyNote = `Deadline time mentioned (${deadlineMatch[0].replace(/deadline/i, "").replace(/[:\s*]+/g, " ").trim()}) but no date was specified — please confirm.`;
      }
    }

    let applicationDate: ExtractedField<string> = { value: null, confidence: 0 };
    if (/application\s+(is\s+)?(now\s+)?open|now\s+accepting\s+applications/i.test(text)) {
      applicationDate = { value: context.referenceDate.toISOString(), confidence: 0.4 };
    }

    const durationPhraseMatch = text.match(
      /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\s*[–\-to]{1,4}\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)/i
    );
    const notes = [
      durationPhraseMatch ? `Internship duration mentioned: ${durationPhraseMatch[0]}` : null,
      deadlineTimeOnlyNote,
    ]
      .filter(Boolean)
      .join(" ") || null;

    return {
      company,
      role,
      location,
      applicationDate,
      deadline,
      internship,
      ppoType,
      stipend,
      ctc,
      statusSuggestion,
      round,
      notes,
    };
  },
};
