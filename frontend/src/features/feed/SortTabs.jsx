import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { POST_SORTS } from './sortOptions';

export function SortTabs({ value, onChange, idPrefix }) {
  return (
    <Card className="p-2">
      <Tabs
        items={POST_SORTS}
        value={value}
        onChange={onChange}
        label="Sort posts"
        idPrefix={idPrefix}
      />
    </Card>
  );
}
