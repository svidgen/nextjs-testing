import { revalidatePath } from "next/cache";
import { GraphQLQuery, GraphQLResult } from "@aws-amplify/api";
import Authenticator from "@/components/authenticator";
import ThreadIndex from "@/components/thread-index-3";
import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";
import type * as schema from "../../API";
import description from "./description";

import context from "../../data/server-context";

/**
 * Gets a single page of threads, omitting "empty" items.
 *
 * @param nextToken The pagination token provided by the API.
 * @returns The list of threads.
 */
async function threadPage(nextToken: string | null | undefined) {
  let page = await context.API.graphql<GraphQLQuery<schema.ListThreadsQuery>>({
    query: queries.listThreads,
    variables: {
      nextToken,
    },
  });

  const result = {
    items: (page.data?.listThreads?.items.filter((i) => i) ||
      []) as schema.Thread[],
    nextToken: page.data?.listThreads?.nextToken,
  };

  return result;
}

/**
 * Handling pagination is actually one of the more annoying issues when
 * dealing with cloud services, generally speaking. While most customers
 * will never be bitten by pagination concerns, those who *would* be
 * impacted really just shouldn't have to worry about it.
 */
async function* allThreadPages() {
  let items: schema.Thread[] | undefined;
  let nextToken: string | null | undefined = undefined;

  while (true) {
    ({ items, nextToken } = await threadPage(nextToken));
    yield items;
    if (!nextToken) break;
  }
}

/**
 * Gets ALL threads, omitting "empty" values and handling pagination transparently.
 *
 * @returns The list of ALL threads.
 */
async function getAllThreads() {
  let threads: schema.Thread[] = [];
  for await (const page of allThreadPages()) {
    threads = [...threads, ...page];
  }
  return threads;
}

async function addThread(data: FormData) {
  "use server";

  console.log("key", Array.from(data.entries()));
  await context.API.graphql<GraphQLQuery<schema.CreateThreadMutation>>({
    query: mutations.createThread,
    variables: {
      input: {
        topic: data.get("topic"),
      },
    },
  });

  revalidatePath("/sample-a");
}

export default async function Home() {
  return (
    // @ts-ignore (known nextjs TS bug)
    <Authenticator>
      <main className="flex min-h-screen flex-col justify-between p-24">
        <h1>
          <a href="/">Home</a>
        </h1>
        <h2>Sample B</h2>
        {description}
        <hr style={{ borderColor: "#222" }} />
        <ThreadIndex threads={await getAllThreads()} filter={{}}></ThreadIndex>
        <form action={addThread}>
          <input type="text" name="topic" />
          <button type="submit">Add Thread</button>
        </form>
      </main>
    </Authenticator>
  );
}
