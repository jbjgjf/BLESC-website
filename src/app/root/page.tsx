import { Container } from "@/components/ui";

export const metadata = {
  title: "決算公告 | Blesc",
  description: "株式会社Blescの決算公告",
};

export default function FinancialNoticePage() {
  return (
    <div className="py-32 min-h-[60vh]">
      <Container>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
          決算公告
        </h1>
        <div className="mt-12">
          {/* TODO: 今後の決算公告のPDFなどをここに追加します */}
          <div className="rounded-2xl border border-line bg-surface p-8">
            <p className="text-[0.95rem] text-muted">
              現在、掲載すべき決算公告はございません。
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
