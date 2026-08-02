"use server";

import "server-only";

const INQUIRY_TYPES = [
  "brand-proposal",
  "distribution",
  "dealership",
  "partnership",
  "other",
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number];
type InquiryField = "category" | "company" | "name" | "email" | "website" | "message" | "consent";

export type InquiryActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InquiryField, string>>;
};

const TYPE_LABELS: Record<"ko" | "en", Record<InquiryType, string>> = {
  ko: {
    "brand-proposal": "브랜드 제안",
    distribution: "유통·총판 협력",
    dealership: "도매·딜러십",
    partnership: "마케팅·사업 제휴",
    other: "기타 문의",
  },
  en: {
    "brand-proposal": "Brand proposal",
    distribution: "Distribution partnership",
    dealership: "Wholesale & dealership",
    partnership: "Marketing & business partnership",
    other: "Other inquiry",
  },
};

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeWebsite(value: string) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isValidWebsite(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

export async function submitInquiry(
  _previousState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const lang = readText(formData, "lang") === "en" ? "en" : "ko";

  // Quietly accept bot submissions so the honeypot does not reveal itself.
  if (readText(formData, "fax")) {
    return { status: "success" };
  }

  const category = readText(formData, "category");
  const company = readText(formData, "company");
  const name = readText(formData, "name");
  const email = readText(formData, "email");
  const website = normalizeWebsite(readText(formData, "website"));
  const message = readText(formData, "message");
  const consent = readText(formData, "consent");
  const fieldErrors: InquiryActionState["fieldErrors"] = {};

  const copy = lang === "ko"
    ? {
        category: "문의 유형을 선택해 주세요.",
        company: "회사명을 입력해 주세요.",
        name: "담당자명을 입력해 주세요.",
        email: "올바른 이메일 주소를 입력해 주세요.",
        website: "올바른 웹사이트 주소를 입력해 주세요.",
        message: "문의 내용을 10자 이상 입력해 주세요.",
        consent: "개인정보 수집 및 이용에 동의해 주세요.",
        invalid: "입력 내용을 다시 확인해 주세요.",
        unavailable: "현재 문의를 전송할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      }
    : {
        category: "Please select an inquiry type.",
        company: "Please enter your company name.",
        name: "Please enter your name.",
        email: "Please enter a valid email address.",
        website: "Please enter a valid website address.",
        message: "Please enter at least 10 characters.",
        consent: "Please agree to the collection and use of your information.",
        invalid: "Please review the highlighted fields.",
        unavailable: "We could not submit your inquiry right now. Please try again shortly.",
      };

  if (!INQUIRY_TYPES.includes(category as InquiryType)) fieldErrors.category = copy.category;
  if (!company || company.length > 120) fieldErrors.company = copy.company;
  if (!name || name.length > 80) fieldErrors.name = copy.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fieldErrors.email = copy.email;
  if (website.length > 300 || !isValidWebsite(website)) fieldErrors.website = copy.website;
  if (message.length < 10 || message.length > 4000) fieldErrors.message = copy.message;
  if (consent !== "on") fieldErrors.consent = copy.consent;

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: copy.invalid, fieldErrors };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("Contact form email settings are missing.");
    return { status: "error", message: copy.unavailable };
  }

  const inquiryType = category as InquiryType;
  const inquiryLabel = TYPE_LABELS[lang][inquiryType];
  const inquiryId = crypto.randomUUID();
  const subject = `[Travence Website] ${inquiryLabel} · ${company}`.replace(/[\r\n]+/g, " ");
  const body = [
    `Inquiry ID: ${inquiryId}`,
    `Language: ${lang.toUpperCase()}`,
    `Type: ${inquiryLabel}`,
    `Company: ${company}`,
    `Contact: ${name}`,
    `Reply email: ${email}`,
    `Website: ${website || "-"}`,
    "",
    "Message",
    "-------",
    message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `travence-inquiry-${inquiryId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text: body,
        tags: [{ name: "inquiry_type", value: inquiryType }],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Contact form email delivery failed.", response.status, await response.text());
      return { status: "error", message: copy.unavailable };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Contact form email delivery failed.", error instanceof Error ? error.message : "Unknown error");
    return { status: "error", message: copy.unavailable };
  }
}
