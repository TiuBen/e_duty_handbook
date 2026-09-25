import { useState } from 'react';
import { Bar, Button, Card, Hint } from '../components/Layout';
import Pager from '../components/Pager';
import SampleRow from '../components/SampleRow';
import SampleTable from '../components/SampleTable';
import { useApp } from '../store';

/** Tab 2：样本标注 —— 全部样本表格（序号 | 原始音频 | 人工校正文本 | 应勾选项 | 操作）+ 分页 */
export default function SamplesPane() {
  const { samples, rev, reloadSamples, toast } = useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const total = samples.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(Math.max(1, page), pageCount); // 越界时收敛（不改 state）
  const start = (cur - 1) * pageSize;
  const pageItems = samples.slice(start, start + pageSize);

  const handleRefresh = async () => {
    await reloadSamples();
    setPage(1);
    toast('已刷新');
  };

  return (
    <Card>
      <Bar
        title="识别样本标注"
        sub="每次录音识别后自动存档：听音频 → 修改第三列文字 → 点选第四列应勾选项 → 保存，即形成可用于微调的标注样本（音频另存于服务端 uploads/ 16k wav）。"
      >
        <Button onClick={handleRefresh}>刷新</Button>
      </Bar>

      <SampleTable
        isEmpty={total === 0}
        emptyText="暂无样本 —— 到「语音识别」页按住 🎤 说一句话即可生成一条"
      >
        {pageItems.map((s, i) => (
          <SampleRow key={`${s.id}#${rev}`} sample={s} seq={start + i + 1} />
        ))}
      </SampleTable>

      <Pager
        total={total}
        page={cur}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageSize={(n) => {
          setPageSize(n);
          setPage(1); // 改变每页条数后回到第一页
        }}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
      />

      <Hint>
        {total
          ? '只保留最近 300 条。修改后点该行"保存"；保存后按钮变灰表示已入库，再次修改才可再保存。'
          : '还没有样本。到「语音识别」页按住 🎤 录一次（或 App 里长按说话），识别结果会自动出现在这里。'}
      </Hint>
    </Card>
  );
}
