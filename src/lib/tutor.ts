export interface TutorAnswer {
  source: "demo" | "ai";
  matched: boolean;
  title: string;
  simple: string;
  analogy: string;
  keyPoints: string[];
  check: string;
}

interface Entry extends Omit<TutorAnswer, "source" | "matched"> {
  keywords: string[];
}

const ENTRIES: Entry[] = [
  {
    keywords: ["iaas", "paas", "saas", "service model"],
    title: "IaaS vs PaaS vs SaaS",
    simple: "These are three ways to use the cloud, depending on how much you want to manage yourself. IaaS gives you raw infrastructure, PaaS gives you a ready platform for your code, and SaaS gives you a finished app.",
    analogy: "Think of pizza. IaaS is renting a kitchen (you cook everything). PaaS is a take-and-bake pizza (you just put it in the oven). SaaS is pizza delivered to your door.",
    keyPoints: [
      "IaaS: you manage OS, runtime and apps (e.g. Azure Virtual Machines).",
      "PaaS: you manage only your app and data (e.g. Azure App Service).",
      "SaaS: you just use the software (e.g. Microsoft 365).",
      "You are always responsible for your data and identities.",
    ],
    check: "Which model would you choose to host a web app without patching the operating system?",
  },
  {
    keywords: ["virtual network", "vnet"],
    title: "Azure Virtual Network (VNet)",
    simple: "An Azure Virtual Network is your own private network inside Azure. It lets your Azure resources, like VMs, talk securely to each other, to the internet, and to your on-premises network.",
    analogy: "It is like a private office building with its own corridors (subnets) and a reception desk deciding who can enter.",
    keyPoints: [
      "VNets are split into subnets to organise resources.",
      "Network security groups (NSGs) filter traffic.",
      "VNet peering connects VNets together.",
      "VPN Gateway or ExpressRoute connect VNets to on-premises networks.",
    ],
    check: "What would you use to connect two separate VNets so they can communicate privately?",
  },
  {
    keywords: ["cloud computing", "what is cloud", "the cloud"],
    title: "Cloud computing",
    simple: "Cloud computing means renting computing power, storage and software over the internet instead of buying and running your own servers. You pay for what you use.",
    analogy: "It is like using electricity from the grid instead of running your own generator at home.",
    keyPoints: [
      "Pay-as-you-go: operational expense (OpEx), not up-front capital (CapEx).",
      "Scale up or down quickly as demand changes.",
      "The provider maintains the physical hardware.",
      "Deployment models: public, private and hybrid.",
    ],
    check: "Is buying your own servers a CapEx or an OpEx cost?",
  },
  {
    keywords: ["availability zone", "region", "zone"],
    title: "Regions and Availability Zones",
    simple: "A region is a geographic area with Azure datacenters. Availability Zones are separate datacenters within a region, so if one has a problem the others keep running.",
    analogy: "A region is a city; Availability Zones are separate fire stations in different neighbourhoods of that city.",
    keyPoints: [
      "Each zone has independent power, cooling and networking.",
      "Spreading resources across zones improves availability.",
      "Many regions are paired with another region for disaster recovery.",
    ],
    check: "Why would you deploy two VMs into different Availability Zones?",
  },
  {
    keywords: ["shared responsibility"],
    title: "Shared responsibility model",
    simple: "Security in the cloud is shared between Microsoft and you. Who is responsible for what depends on the service model you use.",
    analogy: "Renting a flat: the landlord fixes the building, but you lock your own door and look after your belongings.",
    keyPoints: [
      "Microsoft always owns physical datacenter security.",
      "You always own your data, devices, accounts and identities.",
      "The more managed the service (SaaS), the less you handle.",
    ],
    check: "In SaaS, who is responsible for protecting user accounts?",
  },
  {
    keywords: ["policy", "governance", "lock", "tag"],
    title: "Governance: Policy, locks and tags",
    simple: "Azure gives you tools to keep your environment under control. Azure Policy enforces rules, resource locks stop accidental changes, and tags label resources.",
    analogy: "Policy is the house rules, locks are a padlock on the important cupboard, and tags are labels on storage boxes.",
    keyPoints: [
      "Azure Policy can deny non-compliant deployments.",
      "Locks: CanNotDelete or ReadOnly.",
      "Tags help organise and report on costs.",
      "RBAC controls who can do what.",
    ],
    check: "Which tool would block someone from deploying a VM to an unapproved region?",
  },
  {
    keywords: ["function", "serverless"],
    title: "Serverless and Azure Functions",
    simple: "Serverless means you run code without managing servers. Azure Functions runs your code when an event happens, and you pay only while it runs.",
    analogy: "Like a motion-sensor light: it only switches on (and costs money) when someone walks past.",
    keyPoints: [
      "Event-driven: triggered by HTTP requests, timers, queues and more.",
      "Scales automatically.",
      "Billed per execution on the Consumption plan.",
    ],
    check: "Name one event that could trigger an Azure Function.",
  },
];

export const SUGGESTED_PROMPTS = [
  "Explain cloud computing simply",
  "What is Azure Virtual Network?",
  "Explain the difference between IaaS, PaaS and SaaS",
  "What are Availability Zones?",
];

/** Local demo tutor. Replace with a call to a secure server function to use a real AI provider. */
export async function askDemoTutor(question: string): Promise<TutorAnswer> {
  const q = question.trim().toLowerCase();
  if (!q) throw new Error("Please type a question first.");
  await new Promise((r) => setTimeout(r, 600));
  const entry = ENTRIES.find((e) => e.keywords.some((k) => q.includes(k)));
  if (entry) {
    const { keywords: _k, ...rest } = entry;
    return { source: "demo", matched: true, ...rest };
  }
  return {
    source: "demo",
    matched: false,
    title: "I don't have a prepared answer for that yet",
    simple: "The demo tutor only covers a set of core AZ-900 topics. Try rephrasing using a key term, or pick one of the suggested prompts.",
    analogy: "Think of this demo as a pocket guide rather than a full library.",
    keyPoints: [
      "Covered: cloud computing, IaaS/PaaS/SaaS, shared responsibility.",
      "Covered: regions & Availability Zones, Virtual Networks, Azure Functions.",
      "Covered: governance with Policy, locks and tags.",
      "For other topics, check Microsoft Learn's free AZ-900 learning path.",
    ],
    check: "Which of the covered topics would you like to explore first?",
  };
}
