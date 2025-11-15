import * as React from "react";
import { Flame, Edit2, Trash2, ChevronDown, ChevronUp, Plus, Check, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Checkbox } from "./ui/Checkbox";
import SubTaskItem from "./SubTaskItem";

const HabitCard = React.forwardRef(
  (
    {
      id = "habit-1",
      title = "عادة جديدة",
      description = "وصف العادة",
      icon = <Flame className="size-5" />,
      streak = 0,
      points = 10,
      completed = false,
      onCheckedChange,
      onEdit,
      onDelete,
      className,
      category = "عامة",
      showActions = false,
      subtasks = [],
      completedSubtasks = [],
      onSubtaskToggle,
      onSubtaskAdd,
      onSubtaskDelete,
      isBadHabit = false,
      completionCount = 0,
      onAddAnother,
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(completed);
    const [showSubtasks, setShowSubtasks] = React.useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
    const [newSubtaskPoints, setNewSubtaskPoints] = React.useState(5);
    const [showAddSubtask, setShowAddSubtask] = React.useState(false);

    // تحديث حالة isChecked عند تغيير completed
    React.useEffect(() => {
      setIsChecked(completed);
    }, [completed]);

    const handleCheckedChange = (checked) => {
      setIsChecked(checked);
      onCheckedChange?.(checked);
    };

    const handleAddSubtask = () => {
      if (!newSubtaskTitle.trim()) return;
      onSubtaskAdd?.(id, {
        title: newSubtaskTitle,
        points: newSubtaskPoints,
      });
      setNewSubtaskTitle('');
      setNewSubtaskPoints(5);
      setShowAddSubtask(false);
    };

    // حساب النقاط من المهام الفرعية المكتملة
    const completedSubtasksPoints = subtasks
      .filter(st => completedSubtasks.includes(st.id))
      .reduce((sum, st) => sum + (st.points || 0), 0);
    
    const totalSubtasksPoints = subtasks.reduce((sum, st) => sum + (st.points || 0), 0);
    const mainPoints = points - totalSubtasksPoints;

    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex w-full items-start gap-4 rounded-xl border-2 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md",
          isChecked
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-background",
          className
        )}
      >
        {!isBadHabit ? (
          <Checkbox
            id={id}
            checked={isChecked}
            onCheckedChange={handleCheckedChange}
            className="mt-1"
          />
        ) : (
          <div className="mt-1 flex flex-col items-center gap-1">
            <button
              onClick={() => onCheckedChange?.(!isChecked)}
              className={cn(
                "flex size-6 items-center justify-center rounded border-2 transition-colors",
                isChecked
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-border bg-background"
              )}
            >
              {isChecked && <Check className="h-4 w-4" />}
            </button>
            {completionCount > 0 && (
              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                {completionCount}x
              </span>
            )}
          </div>
        )}

        <div className="flex items-start gap-4 flex-1">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors",
              isChecked
                ? isBadHabit
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {icon}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  "text-base font-semibold transition-colors",
                  isChecked && "text-muted-foreground"
                )}
              >
                {title}
              </h3>
              <div className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                streak > 0 
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              )}>
                <Flame className="size-3" />
                {streak}
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {category}
              </span>
            </div>
            <p
              className={cn(
                "text-sm transition-colors",
                isChecked
                  ? "text-muted-foreground line-through"
                  : "text-muted-foreground"
              )}
            >
              {description}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className={cn(
                "font-medium",
                points < 0 && "text-red-600 dark:text-red-400"
              )}>
                💯 {subtasks.length > 0 ? (
                  <>
                    {completedSubtasksPoints}/{points} نقطة
                  </>
                ) : isBadHabit && completionCount > 0 ? (
                  `${completionCount} × ${points} = ${completionCount * points} نقطة`
                ) : (
                  `${points < 0 ? '' : ''}${points} نقطة`
                )}
              </span>
              {streak > 0 && (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  🔥 {streak} {streak === 1 ? 'يوم' : 'يوم متتالي'}
                </span>
              )}
              {subtasks.length > 0 && (
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {showSubtasks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {subtasks.length} {subtasks.length === 1 ? 'مهمة فرعية' : 'مهام فرعية'}
                </button>
              )}
              {isBadHabit && isChecked && onAddAnother && (
                <button
                  onClick={() => onAddAnother()}
                  className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium bg-red-50 dark:bg-red-950 px-2 py-1 rounded"
                  title="إضافة مرة أخرى"
                >
                  <Plus className="h-3 w-3" />
                  إضافة مرة أخرى
                </button>
              )}
            </div>

            {/* Subtasks Section */}
            {showSubtasks && subtasks.length > 0 && (
              <div className="mt-3 space-y-2 pt-3 border-t border-border">
                {subtasks.map(subtask => (
                  <SubTaskItem
                    key={subtask.id}
                    subtask={subtask}
                    habitId={id}
                    isCompleted={completedSubtasks.includes(subtask.id)}
                    onToggle={onSubtaskToggle}
                    onDelete={onSubtaskDelete}
                  />
                ))}
                
                {showAddSubtask ? (
                  <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                    <input
                      type="text"
                      placeholder="اسم المهمة..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-input rounded bg-background"
                      autoFocus
                    />
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newSubtaskPoints}
                      onChange={(e) => setNewSubtaskPoints(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 text-sm border border-input rounded bg-background"
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowAddSubtask(false)}
                      className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddSubtask(true)}
                    className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors w-full justify-center py-2 border border-dashed border-primary/30 rounded-lg hover:bg-primary/5"
                  >
                    <Plus className="h-3 w-3" />
                    إضافة مهمة فرعية
                  </button>
                )}
              </div>
            )}

            {/* Add Subtasks Button (if no subtasks) */}
            {!showSubtasks && subtasks.length === 0 && showActions && (
              <button
                onClick={() => {
                  setShowSubtasks(true);
                  setShowAddSubtask(true);
                }}
                className="mt-2 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus className="h-3 w-3" />
                إضافة مهام فرعية
              </button>
            )}
          </div>
        </div>

        {/* أزرار التعديل والحذف */}
        {showActions && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="تعديل"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

HabitCard.displayName = "HabitCard";

export default HabitCard;

