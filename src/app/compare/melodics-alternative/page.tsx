import { ComparePage, buildCompareMetadata } from "@/components/marketing/ComparePage";
import { COMPARE_DATA } from "@/data/compareData";

const data = COMPARE_DATA["melodics-alternative"];

export const metadata = buildCompareMetadata(data);

export default function MelodicsAlternativePage() {
  return <ComparePage data={data} />;
}
