export const dynamic = 'force-static';

import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: '문제풀기',
  description: '모의고사와 워크시트로 실전 대비',
};

export default function PracticePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-2">문제풀기</h1>
      <p className="text-sm text-muted-foreground mb-8">모의고사와 워크시트로 실전을 대비하세요.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/kice/exam"
          className="flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">모의고사</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            KICE 기출 동형 모의고사로 실제 시험 환경을 체험하세요.
          </p>
        </Link>

        <Link
          href="/worksheets"
          className="flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">워크시트</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            과목별 개념 확인 문제지로 핵심 내용을 점검하세요.
          </p>
        </Link>
      </div>
    </div>
  );
}
