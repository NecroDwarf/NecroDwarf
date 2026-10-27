import s from "./DifficultyStars.module.css";
export function DifficultyStars({ value }: { value: number }) {
  return (
    <span
      className={s.stars}
      role="img"
      aria-label={`Сложность: ${value} из 5`}
      title={`${value} из 5`}
      data-difficulty={value}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={i < value ? s.filled : s.empty}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m12 2 3 6.3 7 .9-5.1 5 .9 7-5.8-3.3L6.2 21l.9-6.8L2 9.2l7-1Z" />
        </svg>
      ))}
    </span>
  );
}
