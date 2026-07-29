import {
  hospitalitySections,
  type FormField,
  type FormSection,
} from "@/app/lib/hospitality-form";

export type FormTemplate = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  reportPrefix: string;
  subjectLabel?: string;
  defaultTeamSize?: number;
  sections: FormSection[];
};

const yesNo = (id: string, label: string, extra: Partial<FormField> = {}): FormField => ({
  id,
  label,
  type: "radio",
  options: ["Yes", "No"],
  ...extra,
});

const text = (id: string, label: string, extra: Partial<FormField> = {}): FormField => ({
  id,
  label,
  type: "text",
  ...extra,
});

const area = (id: string, label: string, extra: Partial<FormField> = {}): FormField => ({
  id,
  label,
  type: "textarea",
  full: true,
  ...extra,
});

const check = (id: string, label: string, options: string[]): FormField => ({
  id,
  label,
  type: "checkbox",
  options,
  full: true,
});

const attachmentAssessment = (id: string, label: string): FormField[] => [
  {
    id: `${id}_available`,
    label: `${label}: attached / available?`,
    type: "radio",
    options: ["Yes", "No"],
    required: true,
  },
  {
    id: `${id}_quality`,
    label: `${label}: quality assessment`,
    type: "radio",
    options: ["Satisfactory", "Unsatisfactory"],
    visibleWhen: { field: `${id}_available`, equals: "Yes" },
  },
];

const qualityAssuranceSections = (
  applicationType: string,
  attachments: Array<[id: string, label: string]>,
): FormSection[] => [
  {
    id: "application-details",
    shortTitle: "Application",
    title: `${applicationType} details`,
    description: "Identify the proponent, proposal and application location.",
    fields: [
      { id: "inspection_date", label: "Review date", type: "date", required: true },
      { id: "facility_name", label: "Name of proponent", type: "text", required: true },
      { id: "proposal_type", label: "Type of proposal", type: "text", required: true },
      { id: "location", label: "Location", type: "text", required: true },
      { id: "district", label: "District", type: "text" },
      { id: "region", label: "Region", type: "text" },
    ],
  },
  {
    id: "attachments",
    shortTitle: "Attachments",
    title: "Application attachments",
    description: "Confirm whether each item is attached and assess the quality of every available item.",
    fields: attachments.flatMap(([id, label]) => attachmentAssessment(id, label)),
  },
  {
    id: "comments",
    shortTitle: "Comments",
    title: "Quality assurance comments",
    description: "Record observations, missing items, corrections or other review comments.",
    fields: [area("comments", "Comments")],
  },
];

const lpgSections: FormSection[] = [
  {
    id: "company",
    shortTitle: "Company",
    title: "Company profile",
    description: "Identify the station, contact person and applicable permits or certificates.",
    fields: [
      { id: "inspection_date", label: "Date of inspection", type: "date", required: true },
      { id: "facility_name", label: "Name of service station / LPG refilling plant", type: "text", required: true },
      text("establishment_year", "Year of establishment", { placeholder: "YYYY" }),
      text("parent_omc", "Parent oil marketing company"),
      text("location", "Location", { required: true }),
      text("contact_person", "Contact person"),
      text("contact_position", "Position"),
      area("address", "Address"),
      { id: "telephone", label: "Telephone", type: "tel" },
      text("fax", "Fax"),
      { id: "email", label: "Email", type: "email" },
      check("permits", "Permits, licences and certificates available", [
        "EPA Environmental Permit",
        "EPA Environmental Certificate",
        "NPA Construction Permit",
        "NPA Operational Permit",
        "GNFS Fire Permit",
        "GNFS Fire Certificate",
        "Town and Country Planning Development Permit",
        "Building Permit",
        "Ghana Atomic Energy Non-Destructive Test Certificate",
        "Factories Inspectorate Certificate",
        "Ghana Standards Authority Certificate",
        "Valid Insurance Certificate",
      ]),
      area("permit_details", "Permit, licence and certificate numbers, dates or remarks"),
    ],
  },
  {
    id: "site",
    shortTitle: "Site",
    title: "Site description",
    description: "Record surrounding land uses, zoning and proximity to sensitive facilities.",
    fields: [
      area("adjacent_land_uses", "Adjacent land uses"),
      yesNo("adjacent_changes", "Have there been changes in adjacent land uses?"),
      yesNo("changes_compatible", "Are the changes compatible with the facility?", {
        visibleWhen: { field: "adjacent_changes", equals: "Yes" },
      }),
      text("zoning", "Current zoning"),
      text("nearest_facility_distance", "Distance to nearest facility / water body"),
      { id: "coordinates", label: "Geographical coordinates", type: "gps", full: true },
      { id: "latitude", label: "Latitude", type: "number" },
      { id: "longitude", label: "Longitude", type: "number" },
      { id: "altitude", label: "Altitude (m)", type: "number" },
      { id: "accuracy", label: "GPS accuracy (m)", type: "number" },
    ],
  },
  {
    id: "services",
    shortTitle: "Services",
    title: "Services and facilities",
    description: "Describe operations, storage tanks, safety accessories and workforce.",
    fields: [
      check("services", "Services provided", [
        "LPG refilling",
        "Auto-gas dispensing",
        "Sale of filled cylinders",
        "Sale of bottles and accessories",
        "Offices",
        "Other",
      ]),
      text("other_service", "Other service, specify"),
      { id: "storage_tank_count", label: "Number of storage tanks", type: "number" },
      text("storage_tank_capacity", "Storage tank capacity and unit"),
      text("tank_installation_year", "Year storage tank was installed"),
      text("tank_replacement_year", "Year storage tank is due for replacement"),
      check("tank_safety_accessories", "Storage-tank safety accessories available", [
        "Temperature gauge",
        "Pressure gauge",
        "Sight glass / liquid-level indicator",
        "Safety relief valve / emergency shut-off valve",
        "Bottom drain valve",
        "Water sprinklers",
        "Pressure balancer",
        "Stairway and platform",
        "Grounding",
        "Flame / fire arresters",
      ]),
      { id: "worker_count", label: "Number of workers", type: "number" },
    ],
  },
  {
    id: "utilities",
    shortTitle: "Utilities",
    title: "Infrastructure and utilities",
    description: "Assess water, power, drainage, washrooms, access control and emergency information.",
    fields: [
      check("water_sources", "Sources of water", ["Ghana Water Company", "Tanker", "Well / borehole", "Overhead reservoir", "Other"]),
      text("other_water_source", "Other water source, specify"),
      check("power_sources", "Sources of power", ["Electricity Company of Ghana", "Standby generator", "Other"]),
      text("other_power_source", "Other power source, specify"),
      { id: "drainage", label: "Forecourt drainage", type: "radio", options: ["Available", "Not available"] },
      { id: "forecourt_surface", label: "Forecourt surface", type: "radio", options: ["Paved", "Unpaved", "Other"] },
      text("forecourt_other", "Other forecourt surface, specify"),
      { id: "washroom_count", label: "Number of washrooms", type: "number" },
      area("washroom_condition", "Condition of washrooms"),
      yesNo("restricted_areas", "Are public and restricted areas clearly identified?"),
      yesNo("emergency_procedures_displayed", "Are emergency procedures displayed?"),
      yesNo("site_fenced", "Is the facility fenced?"),
      area("infrastructure_comments", "Comments"),
    ],
  },
  {
    id: "impact-management",
    shortTitle: "Safety",
    title: "Management of environmental and safety impacts",
    description: "Record traffic, occupational health, firefighting and emergency preparedness.",
    fields: [
      yesNo("separate_entry_exit", "Are separate traffic entry and exit points provided?"),
      { id: "parking_capacity", label: "Parking capacity", type: "number" },
      { id: "accidents_last_year", label: "Number of accidents in the past year", type: "number" },
      yesNo("ohs_training", "Have workers received occupational health and safety training?"),
      yesNo("first_aid", "Is first-aid equipment available?"),
      yesNo("assembly_point", "Is an emergency assembly point available?"),
      area("protective_clothing", "Protective clothing / PPE provided"),
      check("fire_equipment", "Firefighting and warning equipment available", [
        "Smoke detectors",
        "Fire alarms",
        "Fire hydrants",
        "Hose reels",
        "Warning notices and signs",
      ]),
      yesNo("leak_explosion_procedure", "Is there a procedure for gas leakage or explosion?"),
      yesNo("emergency_plan", "Is an emergency response plan available?"),
      yesNo("firefighting_training", "Have workers received firefighting training?"),
      { id: "fire_drills_per_year", label: "Number of fire drills per year", type: "number" },
      yesNo("gas_leak_training", "Have workers received gas-leak response training?"),
      yesNo("safe_handling_training", "Have workers received safe-product-handling training?"),
    ],
  },
  {
    id: "monitoring",
    shortTitle: "Monitoring",
    title: "Environmental monitoring and records",
    description: "Confirm that operational, incident and inspection records are maintained.",
    fields: [
      yesNo("gas_incident_records", "Are gas leakage / explosion records maintained?"),
      yesNo("solid_waste_records", "Are solid-waste disposal records maintained?"),
      yesNo("accident_records", "Are accident records maintained?"),
      yesNo("accident_investigation_reports", "Are accident-investigation reports available?"),
      yesNo("ndt_report", "Is a current non-destructive testing report available?"),
      area("neighbour_concerns", "Neighbourhood consultation: concerns raised"),
    ],
  },
  {
    id: "conclusion",
    shortTitle: "Conclusion",
    title: "Comments, recommendations and conditions",
    description: "Summarise findings and any conditions for certification.",
    fields: [
      area("general_comments", "General comments and recommendations"),
      area("special_conditions", "Special conditions for certification"),
    ],
  },
];

const healthSections: FormSection[] = [
  {
    id: "institution",
    shortTitle: "Institution",
    title: "Health institution details",
    description: "Identify the institution, contact person, zoning and surrounding land use.",
    fields: [
      { id: "inspection_date", label: "Date of inspection", type: "date", required: true },
      { id: "facility_name", label: "Name of health institution", type: "text", required: true },
      text("contact_person", "Contact person"),
      text("location", "Location", { required: true }),
      text("zoning", "Zoning"),
      yesNo("zoning_confirmed", "Has the zoning status been confirmed by the planning authority?"),
      text("land_area", "Land area"),
      area("adjacent_land_use", "Adjacent land use"),
      text("health_facility_type", "Type of health facility"),
    ],
  },
  {
    id: "facilities",
    shortTitle: "Facilities",
    title: "Facilities and capacity",
    description: "Record the key clinical facilities and available capacity.",
    fields: [
      { id: "bed_count", label: "Number of beds", type: "number" },
      yesNo("theatre", "Is a theatre available?"),
      yesNo("mortuary", "Is a mortuary available?"),
      yesNo("laboratory", "Is a laboratory available?"),
      yesNo("ward", "Is a ward available?"),
      yesNo("xray", "Is an X-ray facility available?"),
      yesNo("mch_fp", "Are maternal/child health and family-planning services available?"),
      area("facility_details", "Additional facility details"),
    ],
  },
  {
    id: "impacts",
    shortTitle: "Impacts",
    title: "Potential environmental impacts",
    description: "Indicate whether each issue has been considered and add supporting observations.",
    fields: [
      { id: "solid_waste", label: "Solid waste", type: "radio", options: ["Considered", "Not considered"] },
      area("solid_waste_comments", "Solid-waste observations"),
      { id: "liquid_waste", label: "Liquid waste", type: "radio", options: ["Considered", "Not considered"] },
      area("liquid_waste_comments", "Liquid-waste observations"),
      { id: "fire_risk", label: "Fire risk", type: "radio", options: ["Considered", "Not considered"] },
      area("fire_risk_comments", "Fire-risk observations"),
      { id: "occupational_safety", label: "Occupational health and safety", type: "radio", options: ["Considered", "Not considered"] },
      area("occupational_safety_comments", "Occupational-health-and-safety observations"),
    ],
  },
  {
    id: "recommendations",
    shortTitle: "Decision",
    title: "Comments and recommendations",
    description: "Record the inspection decision guidance and required actions.",
    fields: [area("general_comments", "Comments and recommendations")],
  },
];

const constructionSections: FormSection[] = [
  {
    id: "company",
    shortTitle: "Company",
    title: "Company profile",
    description: "Identify the facility or company, contact person and permitting history.",
    fields: [
      { id: "inspection_date", label: "Date of inspection", type: "date", required: true },
      { id: "facility_name", label: "Name of facility / company", type: "text", required: true },
      text("establishment_year", "Year of establishment"),
      { id: "first_permit_date", label: "Date of first environmental permit", type: "date" },
      text("contact_person", "Contact person"),
      text("contact_position", "Position"),
      area("address", "Address"),
      { id: "telephone", label: "Telephone", type: "tel" },
      text("fax", "Fax"),
      { id: "email", label: "Email", type: "email" },
    ],
  },
  {
    id: "activity",
    shortTitle: "Activity",
    title: "Information analysis and inspection results",
    description: "Describe the undertaking, its scale, materials and waste streams.",
    fields: [
      area("activity_description", "Type and description of activity"),
      area("activity_size", "Size: workers, output and land take"),
      area("raw_materials", "Raw materials: type and quantity"),
      area("waste_streams", "Wastes: type, quantity and receiving medium"),
    ],
  },
  {
    id: "site",
    shortTitle: "Site",
    title: "Site information",
    description: "Record location, dimensions, surrounding uses, zoning and infrastructure.",
    fields: [
      text("location", "Town / locality", { required: true }),
      text("district", "District"),
      text("region", "Region"),
      { id: "coordinates", label: "GPS coordinates", type: "gps", full: true },
      { id: "latitude", label: "Latitude", type: "number" },
      { id: "longitude", label: "Longitude", type: "number" },
      { id: "altitude", label: "Altitude (m)", type: "number" },
      { id: "accuracy", label: "GPS accuracy (m)", type: "number" },
      text("land_take", "Land take (acres / m²)"),
      text("major_landmark", "Major landmark"),
      text("plot_dimensions", "Plot dimensions"),
      text("site_front", "Site description: front"),
      text("site_back", "Site description: back"),
      text("site_left", "Site description: left"),
      text("site_right", "Site description: right"),
      text("zoning", "Zoning"),
      area("infrastructure", "Infrastructure and facilities"),
      area("site_suitability", "Comments on appropriateness, sensitivity and compatibility"),
    ],
  },
  {
    id: "impacts",
    shortTitle: "Impacts",
    title: "Environmental impacts",
    description: "Identify likely impacts and record inspection observations.",
    fields: [
      area("likely_impacts", "Likely environmental and social impacts"),
      area("impact_comments", "Comments on impacts identified"),
    ],
  },
  {
    id: "management",
    shortTitle: "Management",
    title: "Management of impacts",
    description: "Assess mitigation measures and whether they are adequate.",
    fields: [
      area("management_measures", "Measures for managing identified impacts"),
      area("management_adequacy", "Comments on adequacy of the measures"),
    ],
  },
  {
    id: "conclusion",
    shortTitle: "Conclusion",
    title: "General observations and recommendation",
    description: "Conclude the screening and record the recommended decision.",
    fields: [
      area("general_comments", "General comments and observations"),
      area("recommendation", "Recommendation"),
      yesNo("declaration_confirmed", "Does the lead officer confirm that the information recorded is true and complete?"),
    ],
  },
];

const ea1RenewalSections = qualityAssuranceSections("EA1 renewal application", [
  ["checklist", "Checklist"],
  ["processing_fee_payment", "Processing fee payment"],
  ["permit_fee_payment", "Permit fee payment"],
  ["approval_sheet", "Approval sheet"],
  ["schedule", "Schedule"],
]);

const regionalEiaQualitySections = qualityAssuranceSections("Regional EIA application", [
  ["site_plans", "Site plans"],
  ["block_plan", "Block plan"],
  ["zoning", "Zoning"],
  ["screening_report", "Screening report"],
  ["processing_fee_payment", "Processing fee payment"],
  ["approval_sheet", "Approval sheet"],
  ["schedule", "Schedule"],
]);

const pesticidesQualitySections = qualityAssuranceSections("Pesticides EIA application", [
  ["checklist", "Checklist"],
  ["permit_fee_payment", "Permit fee payment"],
  ["approval_sheet", "Approval sheet"],
  ["schedule", "Schedule"],
]);

const eiaApprovalSections: FormSection[] = [
  {
    id: "proponent",
    shortTitle: "Proponent",
    title: "Proponent and undertaking",
    description: "Record the proponent and the undertaking being considered by the EIA Technical Committee.",
    fields: [
      { id: "facility_name", label: "Name of proponent", type: "text", required: true },
      area("address", "Address", { required: true }),
      area("undertaking", "Undertaking", { required: true }),
    ],
  },
  {
    id: "recommendation",
    shortTitle: "Decision",
    title: "Environmental permit recommendation",
    description: "Record the committee recommendation before assigning the members who will sign.",
    fields: [
      {
        id: "recommended_entity",
        label: "Name/entity recommended to receive the Environmental Permit",
        type: "text",
        required: true,
        full: true,
      },
      { id: "approval_date", label: "Approval date", type: "date", required: true },
      area("recommendation", "Recommendation, conditions or committee comments"),
    ],
  },
];

export const formTemplates: FormTemplate[] = [
  {
    id: "hospitality-site-verification-v1",
    slug: "hospitality",
    title: "Hospitality Industry Site Verification Checklist",
    shortTitle: "Hospitality inspection",
    category: "Hospitality site verification",
    description: "Site conditions, utilities, environmental impacts, safety and certification.",
    reportPrefix: "Hospitality inspection",
    sections: hospitalitySections,
  },
  {
    id: "lpg-site-verification-v1",
    slug: "lpg",
    title: "Petroleum Retail Outlet / LPG Refilling Plant Checklist",
    shortTitle: "LPG inspection",
    category: "Petroleum and LPG site verification",
    description: "Permits, tanks, forecourt infrastructure, emergency preparedness and monitoring.",
    reportPrefix: "LPG inspection",
    sections: lpgSections,
  },
  {
    id: "existing-health-facility-v1",
    slug: "health-facility",
    title: "Existing Health Institution Environmental Permit Checklist",
    shortTitle: "Health-facility screening",
    category: "Environmental permit decision guidance",
    description: "Institution facilities, zoning, waste, fire risk and occupational safety.",
    reportPrefix: "Health-facility screening",
    sections: healthSections,
  },
  {
    id: "general-construction-screening-v1",
    slug: "general-construction",
    title: "General Construction Screening Checklist",
    shortTitle: "Construction screening",
    category: "General construction screening",
    description: "Activity scale, site suitability, impacts, management measures and recommendation.",
    reportPrefix: "Construction screening",
    sections: constructionSections,
  },
  {
    id: "ea1-quality-assurance-renewal-v1",
    slug: "ea1-quality-assurance-renewal",
    title: "Quality Assurance Checklist — EA1 Renewal Applications",
    shortTitle: "EA1 renewal QA",
    category: "Quality assurance review",
    description: "EA1 renewal application attachments, payment checks, approval sheet and schedule.",
    reportPrefix: "EA1 renewal quality assurance",
    subjectLabel: "Proponent",
    defaultTeamSize: 2,
    sections: ea1RenewalSections,
  },
  {
    id: "regional-eia-quality-assurance-v1",
    slug: "regional-eia-quality-assurance",
    title: "Regional Quality Assurance Checklist — EIA Applications",
    shortTitle: "Regional EIA QA",
    category: "Regional quality assurance review",
    description: "Site plans, zoning, screening report, payments, approval sheet and schedule.",
    reportPrefix: "Regional EIA quality assurance",
    subjectLabel: "Proponent",
    defaultTeamSize: 2,
    sections: regionalEiaQualitySections,
  },
  {
    id: "pesticides-quality-assurance-v1",
    slug: "pesticides-quality-assurance",
    title: "Pesticides Quality Assurance Checklist — EIA Applications",
    shortTitle: "Pesticides EIA QA",
    category: "Pesticides quality assurance review",
    description: "Pesticides application checklist, permit payment, approval sheet and schedule.",
    reportPrefix: "Pesticides EIA quality assurance",
    subjectLabel: "Proponent",
    defaultTeamSize: 2,
    sections: pesticidesQualitySections,
  },
  {
    id: "eia-technical-committee-approval-v1",
    slug: "eia-technical-committee-approval",
    title: "EIA Technical Committee Approval Sheet",
    shortTitle: "EIA approval sheet",
    category: "EIA Technical Committee",
    description: "Proponent, undertaking, environmental permit recommendation and committee signatures.",
    reportPrefix: "EIA Technical Committee approval",
    subjectLabel: "Proponent",
    defaultTeamSize: 5,
    sections: eiaApprovalSections,
  },
];

export const defaultTemplate = formTemplates[0];

export function getFormTemplate(value: string | undefined | null) {
  return formTemplates.find((template) => template.id === value || template.slug === value) ?? defaultTemplate;
}

export function getRequiredFieldIds(template: FormTemplate) {
  return template.sections.flatMap((section) =>
    section.fields.filter((field) => field.required).map((field) => field.id),
  );
}
