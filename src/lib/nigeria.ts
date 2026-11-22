export type Zone = "North Central" | "North East" | "North West" | "South East" | "South South" | "South West";

export interface Hospital {
  name: string;
  city: string;
  kind: string;
}

export interface NigeriaState {
  name: string;
  capital: string;
  zone: Zone;
  hospitals: Hospital[];
}

const T = "Federal/State tertiary hospital";
const FMC = "Federal Medical Centre";
const h = (name: string, city: string, kind = T): Hospital => ({ name, city, kind });

/** The 36 states plus the Federal Capital Territory, with real tertiary hospitals. Always confirm services by phone. */
export const STATES: NigeriaState[] = [
  { name: "Abia", capital: "Umuahia", zone: "South East", hospitals: [h("Federal Medical Centre Umuahia", "Umuahia", FMC), h("Abia State University Teaching Hospital", "Aba")] },
  { name: "Adamawa", capital: "Yola", zone: "North East", hospitals: [h("Federal Medical Centre Yola", "Yola", FMC), h("Modibbo Adama University Teaching Hospital", "Yola")] },
  { name: "Akwa Ibom", capital: "Uyo", zone: "South South", hospitals: [h("University of Uyo Teaching Hospital", "Uyo")] },
  { name: "Anambra", capital: "Awka", zone: "South East", hospitals: [h("Nnamdi Azikiwe University Teaching Hospital", "Nnewi"), h("Chukwuemeka Odumegwu Ojukwu University Teaching Hospital", "Awka")] },
  { name: "Bauchi", capital: "Bauchi", zone: "North East", hospitals: [h("Abubakar Tafawa Balewa University Teaching Hospital", "Bauchi")] },
  { name: "Bayelsa", capital: "Yenagoa", zone: "South South", hospitals: [h("Federal Medical Centre Yenagoa", "Yenagoa", FMC)] },
  { name: "Benue", capital: "Makurdi", zone: "North Central", hospitals: [h("Federal Medical Centre Makurdi", "Makurdi", FMC), h("Benue State University Teaching Hospital", "Makurdi")] },
  { name: "Borno", capital: "Maiduguri", zone: "North East", hospitals: [h("University of Maiduguri Teaching Hospital", "Maiduguri")] },
  { name: "Cross River", capital: "Calabar", zone: "South South", hospitals: [h("University of Calabar Teaching Hospital", "Calabar")] },
  { name: "Delta", capital: "Asaba", zone: "South South", hospitals: [h("Federal Medical Centre Asaba", "Asaba", FMC), h("Delta State University Teaching Hospital", "Oghara")] },
  { name: "Ebonyi", capital: "Abakaliki", zone: "South East", hospitals: [h("Alex Ekwueme Federal University Teaching Hospital", "Abakaliki")] },
  { name: "Edo", capital: "Benin City", zone: "South South", hospitals: [h("University of Benin Teaching Hospital", "Benin City")] },
  { name: "Ekiti", capital: "Ado-Ekiti", zone: "South West", hospitals: [h("Ekiti State University Teaching Hospital", "Ado-Ekiti"), h("Federal Teaching Hospital Ido-Ekiti", "Ido-Ekiti")] },
  { name: "Enugu", capital: "Enugu", zone: "South East", hospitals: [h("University of Nigeria Teaching Hospital", "Ituku-Ozalla")] },
  { name: "Gombe", capital: "Gombe", zone: "North East", hospitals: [h("Federal Teaching Hospital Gombe", "Gombe")] },
  { name: "Imo", capital: "Owerri", zone: "South East", hospitals: [h("Federal Medical Centre Owerri", "Owerri", FMC)] },
  { name: "Jigawa", capital: "Dutse", zone: "North West", hospitals: [h("Rasheed Shekoni Specialist Hospital", "Dutse")] },
  { name: "Kaduna", capital: "Kaduna", zone: "North West", hospitals: [h("Ahmadu Bello University Teaching Hospital", "Zaria")] },
  { name: "Kano", capital: "Kano", zone: "North West", hospitals: [h("Aminu Kano Teaching Hospital", "Kano"), h("Murtala Muhammad Specialist Hospital", "Kano")] },
  { name: "Katsina", capital: "Katsina", zone: "North West", hospitals: [h("Federal Medical Centre Katsina", "Katsina", FMC)] },
  { name: "Kebbi", capital: "Birnin Kebbi", zone: "North West", hospitals: [h("Federal Medical Centre Birnin Kebbi", "Birnin Kebbi", FMC)] },
  { name: "Kogi", capital: "Lokoja", zone: "North Central", hospitals: [h("Federal Medical Centre Lokoja", "Lokoja", FMC)] },
  { name: "Kwara", capital: "Ilorin", zone: "North Central", hospitals: [h("University of Ilorin Teaching Hospital", "Ilorin")] },
  { name: "Lagos", capital: "Ikeja", zone: "South West", hospitals: [h("Lagos University Teaching Hospital", "Idi-Araba"), h("Lagos State University Teaching Hospital", "Ikeja"), h("Federal Medical Centre Ebute-Metta", "Ebute-Metta", FMC)] },
  { name: "Nasarawa", capital: "Lafia", zone: "North Central", hospitals: [h("Dalhatu Araf Specialist Hospital", "Lafia"), h("Federal Medical Centre Keffi", "Keffi", FMC)] },
  { name: "Niger", capital: "Minna", zone: "North Central", hospitals: [h("IBB Specialist Hospital", "Minna"), h("Federal Medical Centre Bida", "Bida", FMC)] },
  { name: "Ogun", capital: "Abeokuta", zone: "South West", hospitals: [h("Olabisi Onabanjo University Teaching Hospital", "Sagamu"), h("Federal Medical Centre Abeokuta", "Abeokuta", FMC)] },
  { name: "Ondo", capital: "Akure", zone: "South West", hospitals: [h("Federal Medical Centre Owo", "Owo", FMC), h("Federal Medical Centre Akure", "Akure", FMC)] },
  { name: "Osun", capital: "Osogbo", zone: "South West", hospitals: [h("Obafemi Awolowo University Teaching Hospitals Complex", "Ile-Ife"), h("Ladoke Akintola University Teaching Hospital", "Osogbo")] },
  { name: "Oyo", capital: "Ibadan", zone: "South West", hospitals: [h("University College Hospital", "Ibadan")] },
  { name: "Plateau", capital: "Jos", zone: "North Central", hospitals: [h("Jos University Teaching Hospital", "Jos")] },
  { name: "Rivers", capital: "Port Harcourt", zone: "South South", hospitals: [h("University of Port Harcourt Teaching Hospital", "Port Harcourt"), h("Rivers State University Teaching Hospital", "Port Harcourt")] },
  { name: "Sokoto", capital: "Sokoto", zone: "North West", hospitals: [h("Usmanu Danfodiyo University Teaching Hospital", "Sokoto")] },
  { name: "Taraba", capital: "Jalingo", zone: "North East", hospitals: [h("Federal Medical Centre Jalingo", "Jalingo", FMC)] },
  { name: "Yobe", capital: "Damaturu", zone: "North East", hospitals: [h("Federal Teaching Hospital Gashua", "Gashua"), h("Yobe State Specialist Hospital", "Damaturu")] },
  { name: "Zamfara", capital: "Gusau", zone: "North West", hospitals: [h("Federal Medical Centre Gusau", "Gusau", FMC)] },
  { name: "FCT", capital: "Abuja", zone: "North Central", hospitals: [h("National Hospital Abuja", "Abuja"), h("University of Abuja Teaching Hospital", "Gwagwalada"), h("Federal Medical Centre Jabi", "Abuja", FMC)] },
];

export const STATE_NAMES = STATES.map((s) => s.name);
/** Capitals (plus a few big cities) used in city pickers. */
export const CITY_OPTIONS = Array.from(new Set(["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", ...STATES.map((s) => s.capital)])).sort((a, b) => a.localeCompare(b));

export const EMERGENCY_NUMBERS = [
  { label: "National emergency", number: "112", note: "Police, fire, ambulance — free from any network" },
  { label: "FRSC road crash", number: "122", note: "Federal Road Safety Corps toll-free line" },
];

export const mapsSearchUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
