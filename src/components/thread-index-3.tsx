"use client";

import { useState, useEffect } from "react";
import { Thread } from "../API";
import * as AmplifyContext from "aws-amplify";
import { liveThreads } from "@/data/threads";
import getContext from "@/data/client-context";

type ThreadIndexInit = {
  threads: Thread[];

  // TODO: steal typing from `API.ts`?
  // what would we expect customers to do here?
  filter: any;

  // notably, other Amplify graphql args could also be provided here.
};

export default function ThreadIndex({ threads, filter }: ThreadIndexInit) {
  // One UI component win would be a `useLiveCollection` hook that works
  // both in client and server components. it could be made to accept a
  // server-side provided seed collection.
  const [_threads, setThreads] = useState(threads);

  useEffect(() => {
    const sub = liveThreads(getContext(), undefined).subscribe({
      next: (threads) => {
        console.log({ threads });
        setThreads([...threads]);
      },
    });
    return () => sub.unsubscribe();
  }, []);

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
