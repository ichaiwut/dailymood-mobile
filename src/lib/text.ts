/** Strip simple **bold** markdown markers the AI summary uses, for plain display. */
export function stripBold(s: string | null | undefined): string {
  return (s ?? '').replace(/\*\*(.*?)\*\*/g, '$1');
}
