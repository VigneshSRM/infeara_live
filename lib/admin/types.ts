export type ActionState = { error?: string; ok?: boolean } | null;

export type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;
