/**
 * Renders AI text keeping **bold** segments bold (the summaries use markdown bold).
 */
import { Text } from './Text';

export function RichText({
  text,
  color,
  style,
}: {
  text: string;
  color?: string;
  style?: object;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Text variant="body" color={color} style={style}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <Text key={i} weight="bold" color={color}>
            {p.slice(2, -2)}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}
