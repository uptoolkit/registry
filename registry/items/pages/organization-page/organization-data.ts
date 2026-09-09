/** The company the page is about, modeled on schema.org/Organization. */
export type Organization = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  url: string;
  email: string;
  telephone: string;
  foundingDate: string;
  industry: string;
  employeeCount: string;
  sameAs: readonly string[];
};

export type OrganizationLocation = {
  id: string;
  name: string;
  streetAddress: string;
  addressLocality: string;
  addressCountry: string;
  isHeadquarters?: boolean;
};

export type OrganizationMember = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  initials: string;
};

export const sampleOrganization: Organization = {
  name: "Northbeam Labs",
  legalName: "Northbeam Laboratories, Inc.",
  tagline: "Materials testing for teams that ship physical products",
  description:
    "We run fatigue, fracture, and environmental testing for aerospace and consumer hardware teams, and turn raw lab data into design guidelines engineers can act on the same week.",
  logoUrl: "https://github.com/shadcn.png",
  url: "https://northbeamlabs.example.com",
  email: "hello@northbeamlabs.example.com",
  telephone: "+1-503-555-0148",
  foundingDate: "2014",
  industry: "Materials testing",
  employeeCount: "86",
  sameAs: [
    "https://linkedin.com/company/northbeam-labs",
    "https://github.com/northbeam-labs",
    "https://x.com/northbeamlabs",
  ],
};

export const sampleOrganizationLocations: readonly OrganizationLocation[] = [
  {
    id: "location-1",
    name: "Portland Lab",
    streetAddress: "412 SE Industrial Way",
    addressLocality: "Portland, OR",
    addressCountry: "US",
    isHeadquarters: true,
  },
  {
    id: "location-2",
    name: "Porto Lab",
    streetAddress: "Rua do Ouro 220",
    addressLocality: "Porto",
    addressCountry: "PT",
  },
  {
    id: "location-3",
    name: "Singapore Lab",
    streetAddress: "8 Tuas South Ave 2",
    addressLocality: "Singapore",
    addressCountry: "SG",
  },
];

export const sampleOrganizationTeam: readonly OrganizationMember[] = [
  {
    id: "member-1",
    name: "Marisol Ferreira",
    role: "Principal Materials Scientist",
    avatarUrl: "https://github.com/shadcn.png",
    initials: "MF",
  },
  {
    id: "member-2",
    name: "Theo Larsen",
    role: "Head of Test Engineering",
    avatarUrl: "https://github.com/torvalds.png",
    initials: "TL",
  },
  {
    id: "member-3",
    name: "Priya Nair",
    role: "Lab Operations Lead",
    avatarUrl: "https://github.com/gaearon.png",
    initials: "PN",
  },
  {
    id: "member-4",
    name: "Daniel Osei",
    role: "Data & Reporting",
    avatarUrl: "https://github.com/yyx990803.png",
    initials: "DO",
  },
];
