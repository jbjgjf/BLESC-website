import { Container, Icon } from "@/components/ui";

export const metadata = {
  title: "決算公告 | Blesc",
  description: "Blescの決算公告",
};

export default function FinancialNoticePage() {
  return (
    <div className="py-32 min-h-[60vh]">
      <Container className="max-w-3xl">
        <div className="mb-12 border-b border-line pb-8">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
            決算公告
          </h1>
          <p className="mt-4 text-[0.95rem] text-muted">
            会社法第440条第3項の規定に基づき、決算公告を当ウェブサイトに掲載しております。
          </p>
        </div>

        <div className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line bg-canvas p-4 text-[0.85rem] font-medium text-mark-1">
              <div>対象期間・期数</div>
              <div className="w-24 text-center">公開書類</div>
            </div>
            
            {/* 掲載データがない場合のプレースホルダー */}
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <Icon name="info" size={32} className="mb-4 text-line" />
              <p className="text-[0.95rem] text-muted">
                現在、掲載すべき決算公告はございません。
              </p>
            </div>

            {/* 将来データが入った場合の表示例（コメントアウト）
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line p-4 transition-colors hover:bg-canvas last:border-b-0">
              <div className="text-[0.95rem] text-ink">
                第1期 決算公告（2025年4月1日〜2026年3月31日）
              </div>
              <div className="w-24 text-center">
                <a href="/notices/kessan-1.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[0.85rem] text-muted transition-colors hover:text-ink">
                  <Icon name="file-text" size={16} />
                  PDF
                </a>
              </div>
            </div>
            */}
          </div>
        </div>
      </Container>
    </div>
  );
}
