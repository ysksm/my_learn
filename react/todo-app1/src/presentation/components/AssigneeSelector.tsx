import { Assignee } from '../../domain/models/Assignee';

interface AssigneeSelectorProps {
  currentAssignee: Assignee | null;
  onChange: (assignee: Assignee | null) => void;
}

// モック担当者リスト
const availableAssignees = [
  new Assignee('u1', '田中太郎'),
  new Assignee('u2', '佐藤花子'),
  new Assignee('u3', '鈴木一郎'),
];

export function AssigneeSelector({ currentAssignee, onChange }: AssigneeSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      onChange(null);
    } else {
      const assignee = availableAssignees.find((a) => a.id === value);
      if (assignee) {
        onChange(assignee);
      }
    }
  };

  return (
    <select
      value={currentAssignee?.id || ''}
      onChange={handleChange}
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
      }}
    >
      <option value="">未割当</option>
      {availableAssignees.map((assignee) => (
        <option key={assignee.id} value={assignee.id}>
          {assignee.name}
        </option>
      ))}
    </select>
  );
}
