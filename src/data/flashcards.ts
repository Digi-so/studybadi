export interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export const FLASHCARDS: Flashcard[] = [
  { id: "f1", term: "Cloud computing", definition: "Delivering computing services (servers, storage, databases, networking, software) over the internet, paid for as you use them." },
  { id: "f2", term: "IaaS", definition: "Infrastructure as a Service. You rent VMs, storage and networks and manage the OS and apps. Example: Azure Virtual Machines." },
  { id: "f3", term: "PaaS", definition: "Platform as a Service. The provider manages the OS and runtime; you deploy your code. Example: Azure App Service." },
  { id: "f4", term: "SaaS", definition: "Software as a Service. A finished application delivered over the internet. Example: Microsoft 365." },
  { id: "f5", term: "Region", definition: "A geographic area containing one or more datacenters connected by a low-latency network." },
  { id: "f6", term: "Availability Zone", definition: "A physically separate datacenter location within a region, with independent power, cooling and networking." },
  { id: "f7", term: "Resource group", definition: "A logical container for related Azure resources that share a lifecycle." },
  { id: "f8", term: "Subscription", definition: "A billing and access boundary that links an Azure account to the resources it creates." },
  { id: "f9", term: "Management group", definition: "A container above subscriptions used to apply policy and access control across many subscriptions." },
  { id: "f10", term: "Azure Policy", definition: "Creates and enforces rules on resources, such as allowed regions or required tags." },
  { id: "f11", term: "RBAC", definition: "Role-based access control. Grants users only the permissions they need, at a chosen scope." },
  { id: "f12", term: "Resource lock", definition: "Prevents accidental deletion (CanNotDelete) or modification (ReadOnly) of a resource." },
  { id: "f13", term: "Elasticity", definition: "Automatically adding or removing resources to match changing demand." },
  { id: "f14", term: "Microsoft Entra ID", definition: "Azure's cloud identity and access management service (formerly Azure Active Directory)." },
];
