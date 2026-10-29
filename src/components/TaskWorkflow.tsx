export type TaskStatus = "todo" | "in-progress" | "completed";

export type TaskState = {
  status: TaskStatus;
  message: string;
};

export type TaskAction =
  | { type: "START" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

export const initialState: TaskState = {
  status: "todo",
  message: "Task is ready to start.",
};

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "START":
      if (state.status !== "todo") {
        return state;
      }
      return {
        status: "in-progress",
        message: "Task is currently in progress.",
      };

    case "COMPLETE":
      if (state.status !== "in-progress") {
        return state;
      }
      return {
        status: "completed",
        message: "Task has been completed.",
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
