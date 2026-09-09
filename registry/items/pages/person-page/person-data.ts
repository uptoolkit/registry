/** The individual the page is about, modeled on schema.org/Person. */
export type PersonProfile = {
  name: string;
  jobTitle: string;
  worksFor: string;
  avatarUrl: string;
  initials: string;
  bio: string;
  email: string;
  location: string;
  url: string;
  sameAs: readonly string[];
  skills: readonly string[];
};

export type PersonExperience = {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
};

export type PersonPublication = {
  id: string;
  title: string;
  venue: string;
  year: string;
  url: string;
};

export const samplePerson: PersonProfile = {
  name: "Marisol Ferreira",
  jobTitle: "Principal Materials Scientist",
  worksFor: "Northbeam Labs",
  avatarUrl: "https://github.com/shadcn.png",
  initials: "MF",
  bio: "I research fatigue behavior in additively manufactured alloys and turn the findings into design guidelines engineers actually use. Fifteen years across aerospace and consumer hardware.",
  email: "marisol@example.com",
  location: "Porto, PT",
  url: "https://marisol.example.com",
  sameAs: [
    "https://orcid.org/0000-0002-1825-0097",
    "https://linkedin.com/in/marisol-example",
    "https://github.com/marisol-example",
  ],
  skills: ["Fatigue analysis", "Titanium alloys", "Additive manufacturing", "DOE", "Fractography"],
};

export const samplePersonExperience: readonly PersonExperience[] = [
  {
    id: "experience-1",
    role: "Principal Materials Scientist",
    organization: "Northbeam Labs",
    period: "2021 — Present",
    description:
      "Lead a five-person team characterizing fatigue life for printed titanium brackets used in flight hardware.",
  },
  {
    id: "experience-2",
    role: "Senior Materials Engineer",
    organization: "Halden Aerostructures",
    period: "2016 — 2021",
    description:
      "Built the qualification program for a new powder-bed fusion process, cutting certification time by a third.",
  },
  {
    id: "experience-3",
    role: "Materials Engineer",
    organization: "Voss Precision",
    period: "2011 — 2016",
    description:
      "Ran tensile, fatigue, and fracture toughness testing for automotive suspension components.",
  },
];

export const samplePersonPublications: readonly PersonPublication[] = [
  {
    id: "publication-1",
    title: "Surface roughness effects on high-cycle fatigue in laser powder-bed fusion Ti-6Al-4V",
    venue: "International Journal of Fatigue",
    year: "2024",
    url: "https://doi.org/10.1000/example-1",
  },
  {
    id: "publication-2",
    title: "A practical S-N correction for as-built additive titanium",
    venue: "Additive Manufacturing Letters",
    year: "2022",
    url: "https://doi.org/10.1000/example-2",
  },
];
