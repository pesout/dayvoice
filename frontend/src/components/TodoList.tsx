import type { Todo } from "@/lib/api";
import { useLocalStorageTodos } from "@/hooks/useLocalStorageTodos";

interface TodoListProps {
  todos: Todo[];
  storageKey: string;
}

export function TodoList({ todos, storageKey }: TodoListProps) {
  const { isChecked, toggle } = useLocalStorageTodos(storageKey);

  if (todos.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-foreground">Úkoly</h3>
      <ul className="space-y-2">
        {todos.map((todo) => {
          const checked = isChecked(todo.id);
          return (
            <li key={todo.id}>
              <button
                onClick={() => toggle(todo.id)}
                className={`flex items-center gap-3 w-full text-left p-3 rounded-[10px] transition-all duration-200 ease-smooth ${
                  checked ? "bg-muted" : "bg-background shadow-sm"
                }`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    checked
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary-foreground"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm transition-all duration-200 ${
                    checked
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {todo.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
