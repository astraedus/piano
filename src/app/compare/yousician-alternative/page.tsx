import { ComparePage, buildCompareMetadata } from "@/components/marketing/ComparePage";
import { COMPARE_DATA } from "@/data/compareData";

const data = COMPARE_DATA["yousician-alternative"];

export const metadata = buildCompareMetadata(data);

export default function YousicianAlternativePage() {
  return <ComparePage data={data} />;
}
