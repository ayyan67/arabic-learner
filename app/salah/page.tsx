import { getSalah } from "@/lib/data";
import { SalahView } from "@/components/SalahView";

export default function SalahPage() {
  const data = getSalah();
  return <SalahView data={data} />;
}
