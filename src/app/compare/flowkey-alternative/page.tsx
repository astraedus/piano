import { ComparePage, buildCompareMetadata } from "@/components/marketing/ComparePage";
import { COMPARE_DATA } from "@/data/compareData";

const data = COMPARE_DATA["flowkey-alternative"];

export const metadata = buildCompareMetadata(data);

export default function FlowkeyAlternativePage() {
  return <ComparePage data={data} />;
}
