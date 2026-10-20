export type Topic = "Cloud concepts" | "Architecture & services" | "Management & governance";
export const TOPICS: Topic[] = ["Cloud concepts", "Architecture & services", "Management & governance"];

export interface QuizQuestion {
  id: string;
  topic: Topic;
  question: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
}

// Original practice questions written for learning. Not official Microsoft exam items.
export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    topic: "Cloud concepts",
    question: "A startup wants to pay only for the compute it actually uses each month instead of buying servers up front. Which cloud benefit does this describe?",
    options: ["Capital expenditure (CapEx) model", "Consumption-based (pay-as-you-go) model", "Fixed licensing model", "On-premises depreciation"],
    answer: 1,
    explanation: "The consumption-based model means you pay for resources as you use them. This is an operational expense (OpEx), not an up-front capital expense.",
  },
  {
    id: "q2",
    topic: "Cloud concepts",
    question: "Which cloud service model gives you the most control over the operating system?",
    options: ["Software as a Service (SaaS)", "Platform as a Service (PaaS)", "Infrastructure as a Service (IaaS)", "Serverless"],
    answer: 2,
    explanation: "With IaaS, such as Azure Virtual Machines, you manage the OS, runtime and applications. The provider manages the physical hardware.",
  },
  {
    id: "q3",
    topic: "Cloud concepts",
    question: "An online shop automatically adds web servers during a holiday sale and removes them afterwards. What is this called?",
    options: ["High availability", "Elasticity", "Disaster recovery", "Fault tolerance"],
    answer: 1,
    explanation: "Elasticity is the ability to automatically scale resources up or down to match demand.",
  },
  {
    id: "q4",
    topic: "Cloud concepts",
    question: "Under the shared responsibility model, which item is ALWAYS the customer's responsibility, whatever the service model?",
    options: ["Physical datacenter security", "Host operating system patching", "Information and data", "Network hardware"],
    answer: 2,
    explanation: "Customers always remain responsible for their data, devices, accounts and identities, even in SaaS.",
  },
  {
    id: "q5",
    topic: "Architecture & services",
    question: "What is an Azure Availability Zone?",
    options: [
      "A group of Azure regions in the same country",
      "A physically separate datacenter location within an Azure region",
      "A billing boundary for a subscription",
      "A virtual network subnet",
    ],
    answer: 1,
    explanation: "Availability Zones are physically separate locations within a region, each with independent power, cooling and networking.",
  },
  {
    id: "q6",
    topic: "Architecture & services",
    question: "Which Azure construct is a logical container that holds related resources for a solution?",
    options: ["Management group", "Resource group", "Region pair", "Tenant"],
    answer: 1,
    explanation: "A resource group holds related resources so they can be managed, deployed and deleted together.",
  },
  {
    id: "q7",
    topic: "Architecture & services",
    question: "You need to run small pieces of code in response to events without managing servers. Which service fits best?",
    options: ["Azure Virtual Machines", "Azure Functions", "Azure Virtual Desktop", "Azure ExpressRoute"],
    answer: 1,
    explanation: "Azure Functions is a serverless compute service that runs code in response to events and bills per execution.",
  },
  {
    id: "q8",
    topic: "Architecture & services",
    question: "Which service provides a private, dedicated connection from an on-premises network to Azure that does not travel over the public internet?",
    options: ["Azure VPN Gateway", "Azure ExpressRoute", "Azure DNS", "Azure Content Delivery Network"],
    answer: 1,
    explanation: "ExpressRoute uses a private connection through a connectivity provider. VPN Gateway sends encrypted traffic over the public internet.",
  },
  {
    id: "q9",
    topic: "Architecture & services",
    question: "Which Azure Storage access tier is best for data that is rarely accessed and can tolerate hours of retrieval latency?",
    options: ["Hot", "Cool", "Cold", "Archive"],
    answer: 3,
    explanation: "The Archive tier has the lowest storage cost but the highest retrieval time, which can take hours.",
  },
  {
    id: "q10",
    topic: "Management & governance",
    question: "Your company wants to stop anyone from creating resources outside approved regions. Which service enforces this?",
    options: ["Azure Policy", "Azure Advisor", "Azure Monitor", "Microsoft Cost Management"],
    answer: 0,
    explanation: "Azure Policy evaluates and enforces rules on resources, for example by denying deployments to non-approved regions.",
  },
  {
    id: "q11",
    topic: "Management & governance",
    question: "Which feature prevents a critical resource from being accidentally deleted, even by an Owner?",
    options: ["Tags", "Resource locks", "Role-based access control (RBAC)", "Blueprints"],
    answer: 1,
    explanation: "A CanNotDelete or ReadOnly resource lock blocks deletion or changes until the lock is removed.",
  },
  {
    id: "q12",
    topic: "Management & governance",
    question: "Which tool gives personalised recommendations to improve the cost, security, reliability and performance of your Azure resources?",
    options: ["Azure Advisor", "Azure Service Health", "Azure Arc", "Azure Resource Manager templates"],
    answer: 0,
    explanation: "Azure Advisor analyses your configuration and usage and suggests best-practice improvements.",
  },
  {
    id: "q13",
    topic: "Management & governance",
    question: "What is the main purpose of applying tags to Azure resources?",
    options: [
      "To encrypt resources at rest",
      "To organise resources with metadata such as cost centre or environment",
      "To grant users permissions",
      "To replicate resources across regions",
    ],
    answer: 1,
    explanation: "Tags are name/value pairs used to organise resources, for example to group costs by department.",
  },
];
