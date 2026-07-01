// Shared mock data for GrowConsult AI admin portal

export type Status = "Completed" | "In Progress" | "Pending" | "On Hold" | "Cancelled";
export type Priority = "Low" | "Medium" | "High";

export interface User {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  plan: "Plus" | "Growth" | "Basic";
  status: "Active" | "Trial" | "Overdue" | "Pending";
  joinedOn: string;
}

export interface Task {
  id: string;
  name: string;
  assignee: string;
  status: Status;
  progress: number;
}

export interface ServiceGroup {
  name: string;
  color: string; // var token
  progress: number;
  tasks: Task[];
}

export interface Project {
  id: string;
  client: string;
  services: string[];
  manager: string;
  status: Status;
  progress: number;
  deadline: string;
  startDate: string;
  priority: Priority;
  email: string;
  phone: string;
  industry: string;
  website: string;
  joinedOn: string;
  plan: string;
  description: string;
  notes: string;
  serviceGroups: ServiceGroup[];
}

export const users: User[] = [
  { id: "u1", name: "Robert Taylor", business: "Real Estate Pro", email: "robert@example.com", phone: "+1 234 567 8806", plan: "Plus", status: "Active", joinedOn: "May 8, 2024" },
  { id: "u2", name: "Emma Davis", business: "Fashion Hub", email: "emma@example.com", phone: "+1 234 567 8802", plan: "Plus", status: "Active", joinedOn: "May 12, 2024" },
  { id: "u3", name: "James Wilson", business: "Health Plus", email: "james@example.com", phone: "+1 234 567 8805", plan: "Growth", status: "Overdue", joinedOn: "May 9, 2024" },
  { id: "u4", name: "Michael Chen", business: "Tech Solutions", email: "michael@example.com", phone: "+1 234 567 8803", plan: "Basic", status: "Pending", joinedOn: "May 11, 2024" },
  { id: "u5", name: "John Smith", business: "ABC Store", email: "john@example.com", phone: "+1 234 567 8800", plan: "Plus", status: "Active", joinedOn: "May 15, 2024" },
  { id: "u6", name: "Sarah Lee", business: "XYZ Agency", email: "sarah@example.com", phone: "+1 234 567 8801", plan: "Growth", status: "Active", joinedOn: "May 14, 2024" },
  { id: "u7", name: "David Brown", business: "Digital Agency", email: "david@example.com", phone: "+1 234 567 8804", plan: "Growth", status: "Active", joinedOn: "May 10, 2024" },
];

const baseServiceGroups = (): ServiceGroup[] => [
  {
    name: "Website Development",
    color: "var(--color-info)",
    progress: 60,
    tasks: [
      { id: "t1", name: "Homepage Design", assignee: "John Smith", status: "Completed", progress: 100 },
      { id: "t2", name: "About Us Page", assignee: "Jane Doe", status: "In Progress", progress: 70 },
      { id: "t3", name: "Services Page", assignee: "Mike Smith", status: "In Progress", progress: 50 },
      { id: "t4", name: "Contact Page", assignee: "Mike Johnson", status: "In Progress", progress: 50 },
      { id: "t5", name: "Blog Page", assignee: "Jane Doe", status: "Pending", progress: 0 },
      { id: "t6", name: "Hosting & Setup", assignee: "Mike Johnson", status: "Completed", progress: 100 },
    ],
  },
  {
    name: "Marketing Campaign",
    color: "var(--color-success)",
    progress: 80,
    tasks: [
      { id: "t7", name: "Campaign Strategy", assignee: "Sarah Wilson", status: "Completed", progress: 100 },
      { id: "t8", name: "Social Media Setup", assignee: "Alex Brown", status: "Completed", progress: 100 },
      { id: "t9", name: "Content Creation", assignee: "Sarah Wilson", status: "In Progress", progress: 70 },
      { id: "t10", name: "Email Marketing", assignee: "Alex Brown", status: "In Progress", progress: 60 },
      { id: "t11", name: "Performance Analysis", assignee: "Sarah Wilson", status: "Pending", progress: 0 },
    ],
  },
  {
    name: "SEO Optimization",
    color: "var(--color-pending)",
    progress: 40,
    tasks: [
      { id: "t12", name: "SEO Audit", assignee: "Mike Johnson", status: "Completed", progress: 100 },
      { id: "t13", name: "Keyword Research", assignee: "Mike Johnson", status: "In Progress", progress: 50 },
      { id: "t14", name: "On-page SEO", assignee: "Mike Johnson", status: "In Progress", progress: 50 },
      { id: "t15", name: "Link Building", assignee: "Mike Johnson", status: "Pending", progress: 0 },
    ],
  },
];

export const projects: Project[] = [
  {
    id: "PRJ-1001", client: "ABC Store", services: ["Website", "Marketing"], manager: "John Smith",
    status: "In Progress", progress: 75, deadline: "Jun 15, 2024", startDate: "May 15, 2024",
    priority: "High", email: "john@example.com", phone: "+1 234 567 8800", industry: "E-commerce",
    website: "www.abcstore.com", joinedOn: "May 15, 2024", plan: "Plus",
    description: "Complete website redesign with modern UI/UX, responsive design and full marketing campaign including social media and email marketing.",
    notes: "Client wants weekly updates every Monday.",
    serviceGroups: baseServiceGroups(),
  },
  { id: "PRJ-1002", client: "XYZ Agency", services: ["Website"], manager: "Sarah Lee", status: "In Progress", progress: 60, deadline: "Jun 18, 2024", startDate: "May 14, 2024", priority: "Medium", email: "sarah@example.com", phone: "+1 234 567 8801", industry: "Advertising", website: "www.xyzagency.com", joinedOn: "May 14, 2024", plan: "Pro", description: "Brand-new website with portfolio showcase.", notes: "", serviceGroups: baseServiceGroups() },
  { id: "PRJ-1003", client: "Fashion Hub", services: ["Marketing"], manager: "Emma Davis", status: "Pending", progress: 20, deadline: "Jun 22, 2024", startDate: "May 12, 2024", priority: "Medium", email: "emma@example.com", phone: "+1 234 567 8802", industry: "Fashion", website: "www.fashionhub.com", joinedOn: "May 12, 2024", plan: "Plus", description: "Multi-channel marketing campaign for summer collection.", notes: "", serviceGroups: baseServiceGroups() },
  { id: "PRJ-1004", client: "Tech Solutions", services: ["Website", "Marketing"], manager: "Michael Chen", status: "In Progress", progress: 40, deadline: "Jun 25, 2024", startDate: "May 11, 2024", priority: "High", email: "michael@example.com", phone: "+1 234 567 8803", industry: "SaaS", website: "www.techsolutions.com", joinedOn: "May 11, 2024", plan: "Basic", description: "SaaS landing page and B2B campaign.", notes: "", serviceGroups: baseServiceGroups() },
  { id: "PRJ-1005", client: "Digital Agency", services: ["Website"], manager: "David Brown", status: "On Hold", progress: 10, deadline: "Jun 28, 2024", startDate: "May 10, 2024", priority: "Low", email: "david@example.com", phone: "+1 234 567 8804", industry: "Agency", website: "www.digitalagency.com", joinedOn: "May 10, 2024", plan: "Pro", description: "Agency website refresh.", notes: "", serviceGroups: baseServiceGroups() },
  { id: "PRJ-1006", client: "Health Plus", services: ["Marketing"], manager: "James Wilson", status: "Completed", progress: 100, deadline: "May 30, 2024", startDate: "May 9, 2024", priority: "Medium", email: "james@example.com", phone: "+1 234 567 8805", industry: "Healthcare", website: "www.healthplus.com", joinedOn: "May 9, 2024", plan: "Plus", description: "Awareness campaign for healthcare services.", notes: "", serviceGroups: baseServiceGroups() },
  { id: "PRJ-1007", client: "Real Estate Pro", services: ["Website", "SEO"], manager: "Robert Taylor", status: "In Progress", progress: 30, deadline: "Jun 30, 2024", startDate: "May 8, 2024", priority: "High", email: "robert@example.com", phone: "+1 234 567 8806", industry: "Real Estate", website: "www.realestatepro.com", joinedOn: "May 8, 2024", plan: "Plus", description: "Property listings site with SEO.", notes: "", serviceGroups: baseServiceGroups() },
];

export const statusColors: Record<Status, string> = {
  "Completed": "var(--color-success)",
  "In Progress": "var(--color-info)",
  "Pending": "var(--color-pending)",
  "On Hold": "var(--color-danger)",
  "Cancelled": "var(--color-subtle)",
};
