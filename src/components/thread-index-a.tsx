"use client";

import { useState } from "react";
import { Thread } from "../API";
import { API } from "aws-amplify";

type ThreadIndexInit = {
  threads: Thread[];

  // TODO: steal typing from `API.ts`?
  // what would we expect customers to do here?
  filter: any;

  // notably, other Amplify graphql args could also be provided here.
};

export default function ThreadIndex({ threads, filter }: ThreadIndexInit) {
  const [_threads, setThreads] = useState(threads);

  // TODO: subscribe using `filter` here.

  const byDate = (a: Thread, b: Thread) => {
    const A = a.createdAt || 0;
    const B = b.createdAt || 0;

    return A > B ? 1 : A < B ? -1 : 0;
  };

  return (
    <ol>
      {_threads.sort(byDate).map((t) => (
        <li key={t.id}>
          <a>{t.topic}</a>
        </li>
      ))}
    </ol>
  );
}
