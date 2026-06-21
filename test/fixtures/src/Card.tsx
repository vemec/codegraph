import { memo } from 'react';

// Componente envuelto en un HOC (memo) — patrón muy común en React.
// El componente real es la función, exportada a través de memo().
export const Card = memo(function CardInner() {
  return <div>card</div>;
});
