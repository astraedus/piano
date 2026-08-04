import { ComparePage, buildCompareMetadata } from "@/components/marketing/ComparePage";
import { COMPARE_DATA } from "@/data/compareData";

const data = COMPARE_DATA["simply-piano-alternative"];

export const metadata = buildCompareMetadata(data);

export default function SimplyPianoAlternativePage() {
  return <ComparePage data={data} />;
}
