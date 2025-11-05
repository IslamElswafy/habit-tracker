import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

const SubTaskItem = ({ subtask, habitId, onToggle, onDelete, isCompleted }) => {
  const [isChecked, setIsChecked] = useState(isCompleted);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onToggle(subtask.id, newState);
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg border transition-all",
      isChecked 
        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
        : "bg-muted border-transparent"
    )}>
      <button
        onClick={handleToggle}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
          isChecked
            ? "bg-green-500 border-green-500"
            : "border-gray-300 hover:border-green-400"
        )}
      >
        {isChecked && <Check className="h-3 w-3 text-white" />}
      </button>
      
      <span className={cn(
        "flex-1 text-sm",
        isChecked && "line-through text-muted-foreground"
      )}>
        {subtask.title}
      </span>
      
      <span className={cn(
        "text-xs font-medium px-2 py-0.5 rounded",
        isChecked 
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-secondary text-secondary-foreground"
      )}>
        {subtask.points}
      </span>

      {onDelete && (
        <button
          onClick={() => onDelete(subtask.id)}
          className="flex-shrink-0 p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default SubTaskItem;

