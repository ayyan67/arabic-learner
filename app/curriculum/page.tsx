import { getCurriculum } from "@/lib/data";
import { CurriculumView } from "@/components/CurriculumView";

export default function CurriculumPage() {
  const { lessons, title, subtitle } = getCurriculum();
  return <CurriculumView lessons={lessons} title={title} subtitle={subtitle} />;
}
