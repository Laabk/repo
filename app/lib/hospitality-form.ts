export type FieldValue = string | string[];

export type FormField = {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "email"
    | "tel"
    | "select"
    | "radio"
    | "checkbox"
    | "gps";
  options?: string[];
  required?: boolean;
  full?: boolean;
  hint?: string;
  placeholder?: string;
  visibleWhen?: { field: string; equals: string };
};

export type FormSection = {
  id: string;
  shortTitle: string;
  title: string;
  description: string;
  fields: FormField[];
};

const yesNo = (id: string, label: string, extra: Partial<FormField> = {}): FormField => ({
  id,
  label,
  type: "radio",
  options: ["Yes", "No"],
  ...extra,
});

const permit = (id: string, label: string): FormField[] => [
  yesNo(`${id}_available`, `${label} available?`),
  {
    id: `${id}_number`,
    label: `${label} number`,
    type: "text",
    visibleWhen: { field: `${id}_available`, equals: "Yes" },
  },
  {
    id: `${id}_issued`,
    label: `${label} date issued`,
    type: "date",
    visibleWhen: { field: `${id}_available`, equals: "Yes" },
  },
  {
    id: `${id}_expiry`,
    label: `${label} expiry date`,
    type: "date",
    visibleWhen: { field: `${id}_available`, equals: "Yes" },
  },
];

const impact = (id: string, label: string): FormField[] => [
  yesNo(`${id}_potential`, `Is ${label.toLowerCase()} a potential source of impact?`, {
    full: true,
  }),
  {
    id: `${id}_impact`,
    label: `Describe the observed or potential impact from ${label.toLowerCase()}`,
    type: "textarea",
    full: true,
    visibleWhen: { field: `${id}_potential`, equals: "Yes" },
  },
];

const receiving = (id: string, label: string): FormField[] => [
  yesNo(`${id}_affected`, `Is ${label.toLowerCase()} potentially affected?`),
  {
    id: `${id}_remarks`,
    label: `Remarks on ${label.toLowerCase()}`,
    type: "textarea",
    visibleWhen: { field: `${id}_affected`, equals: "Yes" },
  },
];

const assessment = (id: string, label: string): FormField[] => [
  {
    id: `${id}_assessment`,
    label: `${label}: management practice assessment`,
    type: "radio",
    options: ["Adequate", "Inadequate", "Not applicable", "Not observed"],
    full: true,
  },
  {
    id: `${id}_remarks`,
    label: `${label}: remarks`,
    type: "textarea",
    full: true,
  },
];

export const hospitalitySections: FormSection[] = [
  {
    id: "company",
    shortTitle: "Company",
    title: "Company profile",
    description: "Identify the facility, contact person, permits and workforce.",
    fields: [
      { id: "inspection_date", label: "Date of inspection", type: "date", required: true },
      { id: "facility_name", label: "Name of hospitality industry", type: "text", required: true },
      { id: "management_company", label: "Facility management company", type: "text" },
      { id: "establishment_year", label: "Year of establishment", type: "number", placeholder: "YYYY" },
      { id: "location", label: "Location", type: "text", required: true },
      { id: "contact_person", label: "Contact person", type: "text" },
      { id: "contact_position", label: "Contact person position", type: "text" },
      { id: "address", label: "Address", type: "textarea", full: true },
      { id: "telephone", label: "Telephone", type: "tel" },
      { id: "fax", label: "Fax", type: "text" },
      { id: "email", label: "Email", type: "email", full: true },
      ...permit("epa_permit", "EPA Environmental Permit"),
      ...permit("epa_certificate", "EPA Environmental Certificate"),
      ...permit("tourism_licence", "Ghana Tourism Authority/Tourist Board Licence"),
      ...permit("fire_permit", "Ghana National Fire Service Fire Permit"),
      ...permit("fire_certificate", "Ghana National Fire Service Fire Certificate"),
      ...permit("development_permit", "Development Permit"),
      ...permit("building_permit", "Building Permit"),
      { id: "management_staff", label: "Management staff", type: "number" },
      { id: "senior_staff", label: "Senior staff", type: "number" },
      { id: "junior_staff", label: "Junior staff", type: "number" },
      { id: "casual_staff", label: "Casual staff", type: "number" },
      { id: "temporary_staff", label: "Temporary staff", type: "number" },
    ],
  },
  {
    id: "site",
    shortTitle: "Site",
    title: "Site description",
    description: "Record landmarks, coordinates, zoning and nearby land or water uses.",
    fields: [
      {
        id: "landmarks",
        label: "Location: indicate major landmarks",
        type: "textarea",
        full: true,
        hint: "Describe prominent landmarks that can help another officer locate the facility.",
      },
      { id: "coordinates", label: "Geographical coordinates", type: "gps", full: true },
      { id: "latitude", label: "Latitude", type: "number" },
      { id: "longitude", label: "Longitude", type: "number" },
      { id: "altitude", label: "Altitude (m)", type: "number" },
      { id: "accuracy", label: "GPS accuracy (m)", type: "number" },
      { id: "zoning", label: "Current zoning", type: "text" },
      {
        id: "nearest_facility_distance",
        label: "Approximate distance to nearest facility (metres)",
        type: "number",
      },
      { id: "adjacent_land_uses", label: "Adjacent land uses", type: "textarea", full: true },
      ...[yesNo("near_water", "Is the facility near a water body?", { full: true })],
      {
        id: "water_body_name",
        label: "Name or type of water body",
        type: "text",
        visibleWhen: { field: "near_water", equals: "Yes" },
      },
      {
        id: "water_body_distance",
        label: "Approximate distance to water body (metres)",
        type: "number",
        visibleWhen: { field: "near_water", equals: "Yes" },
      },
    ],
  },
  {
    id: "undertaking",
    shortTitle: "Undertaking",
    title: "Nature of undertaking",
    description: "Classify the facility and record the services and capacity available.",
    fields: [
      {
        id: "undertaking_types",
        label: "Title/type of undertaking",
        type: "checkbox",
        full: true,
        options: ["Hotel", "Guest house", "Hostel", "Social centre", "Restaurant", "Night club/pub", "Rest stop", "Other"],
      },
      { id: "undertaking_other", label: "Other undertaking, specify", type: "text", full: true },
      {
        id: "star_rating",
        label: "Star rating",
        type: "select",
        options: ["Five-star", "Four-star", "Three-star", "Two-star", "One-star", "Budget", "Not rated/not applicable"],
      },
      {
        id: "eco_facilities",
        label: "Eco-tourism facilities",
        type: "checkbox",
        full: true,
        options: ["Waterfalls", "Game reserves", "National parks", "Botanical gardens", "Paragliding", "Beaches", "Heritage/archaeological sites", "Other"],
      },
      { id: "eco_other", label: "Other eco-tourism facility, specify", type: "text", full: true },
      { id: "services_summary", label: "Services provided", type: "textarea", full: true },
      yesNo("accommodation", "Is accommodation provided?"),
      { id: "rooms", label: "Number of rooms", type: "number", visibleWhen: { field: "accommodation", equals: "Yes" } },
      yesNo("conference", "Are conference services provided?"),
      { id: "conference_halls", label: "Number of conference halls", type: "number", visibleWhen: { field: "conference", equals: "Yes" } },
      { id: "conference_capacity", label: "Total conference seating capacity", type: "number", visibleWhen: { field: "conference", equals: "Yes" } },
      yesNo("restaurant", "Are restaurant services provided?"),
      { id: "restaurants", label: "Number of restaurants", type: "number", visibleWhen: { field: "restaurant", equals: "Yes" } },
      { id: "restaurant_capacity", label: "Total restaurant seating capacity", type: "number", visibleWhen: { field: "restaurant", equals: "Yes" } },
      {
        id: "other_services",
        label: "Other services",
        type: "checkbox",
        full: true,
        options: ["Swimming pool", "Fitness centre", "Cruising", "Casino", "Shops", "Salon", "Other"],
      },
      { id: "services_other", label: "Other service, specify", type: "text", full: true },
    ],
  },
  {
    id: "infrastructure",
    shortTitle: "Utilities",
    title: "Infrastructure and utilities",
    description: "Assess surrounding structures, water, power, drainage and traffic facilities.",
    fields: [
      { id: "structures_summary", label: "Buildings and other facilities in the area", type: "textarea", full: true },
      { id: "structures_east", label: "Structures/facilities to the east", type: "text" },
      { id: "structures_west", label: "Structures/facilities to the west", type: "text" },
      { id: "structures_north", label: "Structures/facilities to the north", type: "text" },
      { id: "structures_south", label: "Structures/facilities to the south", type: "text" },
      {
        id: "water_sources",
        label: "Water source",
        type: "checkbox",
        full: true,
        options: ["Ghana Water Company Limited", "Tanker services", "Well", "Other"],
      },
      { id: "water_source_other", label: "Other water source, specify", type: "text" },
      { id: "water_availability", label: "Water availability", type: "radio", options: ["Reliable", "Seasonal", "Scarce"] },
      yesNo("water_storage", "Is a water storage tank available?"),
      { id: "water_storage_capacity", label: "Storage tank capacity", type: "number", visibleWhen: { field: "water_storage", equals: "Yes" } },
      { id: "water_storage_unit", label: "Storage tank capacity unit", type: "select", options: ["Litres", "Cubic metres"], visibleWhen: { field: "water_storage", equals: "Yes" } },
      { id: "monthly_water", label: "Approximate quantity of water consumed per month", type: "number" },
      { id: "monthly_water_unit", label: "Monthly water-consumption unit", type: "select", options: ["Litres", "Cubic metres"] },
      { id: "power_sources", label: "Power source", type: "checkbox", full: true, options: ["Electricity Company of Ghana", "Standby generator", "Other"] },
      { id: "power_source_other", label: "Other power source, specify", type: "text" },
      { id: "electricity_consumption", label: "Approximate monthly electricity consumption (kWh)", type: "number" },
      { id: "generator_fuel", label: "Approximate monthly standby-generator fuel consumption (litres)", type: "number" },
      yesNo("drainage_plan", "Does the facility have a site drainage plan?", { full: true }),
      { id: "sewage_treatment", label: "Type of sewage treatment facility", type: "textarea", full: true },
      { id: "traffic_facilities", label: "Traffic management facilities", type: "textarea", full: true },
      { id: "access_road", label: "Access road", type: "radio", options: ["Paved", "Unpaved"] },
      { id: "parking_capacity", label: "Parking-lot capacity", type: "number" },
    ],
  },
  {
    id: "impacts",
    shortTitle: "Impacts",
    title: "Potential environmental impacts",
    description: "Identify impact sources and the parts of the receiving environment at risk.",
    fields: [
      ...impact("solid_waste", "Solid waste"),
      ...impact("liquid_waste", "Liquid waste/effluent"),
      ...impact("gaseous_emissions", "Gaseous emissions"),
      ...impact("odour", "Odour"),
      ...impact("fire", "Fire"),
      ...receiving("vegetation", "Vegetation"),
      ...receiving("soil", "Soil/land"),
      ...receiving("surface_water", "Surface water"),
      ...receiving("air", "Air"),
    ],
  },
  {
    id: "management",
    shortTitle: "Management",
    title: "Management of significant environmental impacts",
    description: "Rate prevention, minimisation, disposal and occupational safety practices.",
    fields: [
      ...assessment("odour_treatment", "Odour from waste-treatment facility"),
      ...assessment("odour_sewerage", "Odour from sewerage systems"),
      ...assessment("pantry", "Pantry services"),
      ...assessment("runoff", "Runoff/rainwater"),
      ...assessment("wastewater", "Wastewater from laundry, washrooms and sewage"),
      ...assessment("kitchen", "Kitchen"),
      ...assessment("dining", "Dining room"),
      ...assessment("washroom", "Washroom"),
      { id: "other_environmental_impact", label: "Other environmental impact, specify", type: "text", full: true },
      ...assessment("other_environmental", "Other environmental impact"),
      ...assessment("fire_hazard", "Fire hazard"),
      ...assessment("accident_hazard", "Accident hazard"),
      { id: "other_occupational_hazard", label: "Other occupational hazard, specify", type: "text", full: true },
      ...assessment("other_occupational", "Other occupational hazard"),
    ],
  },
  {
    id: "emergency",
    shortTitle: "Emergency",
    title: "Emergency response plan",
    description: "Confirm fire preparedness and environment, health and safety training.",
    fields: [
      yesNo("staff_firefighting_training", "Are staff trained in firefighting?", { full: true }),
      yesNo("fire_response_plan", "Is there an emergency response plan for a fire outbreak?", { full: true }),
      yesNo("emergency_exits", "Are emergency exit points available?", { full: true }),
      yesNo("assembly_point", "Is there an assembly point for emergencies?", { full: true }),
      yesNo("ehs_training", "Have staff received training in environment, health and safety?", { full: true }),
      { id: "ehs_training_date", label: "Date of most recent environment, health and safety training", type: "date", visibleWhen: { field: "ehs_training", equals: "Yes" } },
      { id: "training_provider", label: "Training provider", type: "text", visibleWhen: { field: "ehs_training", equals: "Yes" } },
      { id: "staff_trained", label: "Number of staff trained", type: "number", visibleWhen: { field: "ehs_training", equals: "Yes" } },
    ],
  },
  {
    id: "monitoring",
    shortTitle: "Monitoring",
    title: "Environmental monitoring",
    description: "Record compliance with EPA guidelines and operational records kept.",
    fields: [
      yesNo("air_quality_compliance", "Compliance with Ambient Air Quality Guidelines", { full: true }),
      yesNo("effluent_compliance", "Compliance with Effluent Discharge Guidelines", { full: true }),
      yesNo("noise_compliance", "Compliance with Ambient Noise Level Guidelines", { full: true }),
      yesNo("accident_records", "Are accident records maintained?", { full: true }),
      yesNo("waste_volume_records", "Are records of the volume of waste generated maintained?", { full: true }),
      yesNo("guest_records", "Are records of the number of guests per annum maintained?", { full: true }),
    ],
  },
  {
    id: "comments",
    shortTitle: "Comments",
    title: "General comments and recommendations",
    description: "Summarise the inspection findings and recommended actions.",
    fields: [
      {
        id: "general_comments",
        label: "General comments and recommendations",
        type: "textarea",
        full: true,
        placeholder: "Record key findings, corrective actions, responsible persons and timelines…",
      },
    ],
  },
  {
    id: "conditions",
    shortTitle: "Conditions",
    title: "Special conditions for certification",
    description: "Record any conditions that must be met before certification.",
    fields: [
      {
        id: "special_conditions",
        label: "Special conditions for certification",
        type: "textarea",
        full: true,
        placeholder: "Enter conditions or write ‘None’…",
      },
    ],
  },
];

export const requiredFieldIds = hospitalitySections.flatMap((section) =>
  section.fields.filter((field) => field.required).map((field) => field.id),
);

export const fieldLabelById = Object.fromEntries(
  hospitalitySections.flatMap((section) =>
    section.fields.map((field) => [field.id, field.label]),
  ),
);
