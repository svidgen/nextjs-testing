"use client";

import { Thread } from "../API";

type ThreadIndexInit = {
  threads: Thread[];
};

export default function ThreadIndex({ threads }: ThreadIndexInit) {
  const byDate = (a: Thread, b: Thread) => {
    const A = a.createdAt || 0;
    const B = b.createdAt || 0;

    return A > B ? 1 : A < B ? -1 : 0;
  };

  return (
    <ol>
      {threads.sort(byDate).map((t) => (
        <li key={t.id}>
          <a>{t.topic}</a>
        </li>
      ))}
    </ol>
  );
}
