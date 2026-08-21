import { ComparePage, buildCompareMetadata } from "@/components/marketing/ComparePage";
import { COMPARE_DATA } from "@/data/compareData";

const data = COMPARE_DATA["fender-play-alternative"];

export const metadata = buildCompareMetadata(data);

export default function FenderPlayAlternativePage() {
  return <ComparePage data={data} />;
}
