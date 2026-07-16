export interface Question {
  id: string;
  label: string;
  type: "text" | "textarea" | "url";
  placeholder?: string;
  required?: boolean;
}

export const questions: Question[] = [
  {
    id: "businessName",
    label: "Enter the Business Name",
    type: "text",
    placeholder: "e.g. Acme Corporation",
    required: true,
  },
  {
    id: "industry",
    label: "Enter the Industry",
    type: "text",
    placeholder: "e.g. Technology, Retail, Healthcare",
    required: true,
  },
  {
    id: "businessDescription",
    label: "Enter the Business Idea / Description",
    type: "textarea",
    placeholder: "Describe your business idea, products, and services...",
    required: true,
  },
  {
    id: "websiteUrl",
    label: "Enter the Website URL",
    type: "url",
    placeholder: "e.g. https://acme.com",
    required: false,
  },
  {
    id: "primaryGoal",
    label: "Enter the Primary Business Goal",
    type: "text",
    placeholder: "e.g. Generate leads, increase online sales",
    required: true,
  },
  {
    id: "targetAudience",
    label: "Enter the Target Audience",
    type: "text",
    placeholder: "e.g. Young professionals aged 25-34",
    required: true,
  },
  {
    id: "location",
    label: "Enter the Location",
    type: "text",
    placeholder: "e.g. Basheerbhag, Hyderabad Telangana",
    required: true,
  },
];
