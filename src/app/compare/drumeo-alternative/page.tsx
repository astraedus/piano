import { ComparePage, buildCompareMetadata } from "@/components/marketing/ComparePage";
import { COMPARE_DATA } from "@/data/compareData";

const data = COMPARE_DATA["drumeo-alternative"];

export const metadata = buildCompareMetadata(data);

export default function DrumeoAlternativePage() {
  return <ComparePage data={data} />;
}
