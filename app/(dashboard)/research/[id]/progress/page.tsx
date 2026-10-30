import { ResearchProgressView } from "@/components/research/ResearchProgressView";

interface ResearchProgressPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResearchProgressPage({
  params,
}: ResearchProgressPageProps) {
  const { id } = await params;
  return <ResearchProgressView sessionId={id} />;
}
