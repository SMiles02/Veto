declare module "@/data/comps.json" {
  const comps: Array<{
    id: string;
    area: string;
    address: string;
    rent: number;
    beds: number;
    type: string;
    lat: number;
    lng: number;
    source: string;
    sourceUrl?: string;
    listedAs?: string;
    rentBasis?: string;
  }>;
  export default comps;
}
