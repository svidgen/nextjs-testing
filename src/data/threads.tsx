import { GraphQLQuery, GraphQLResult } from "@aws-amplify/api";
import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import type * as schema from "../API";
import type Context from "./context-type";

/**
 * Gets a single page of threads, omitting "empty" items.
 *
 * @param nextToken The pagination token provided by the API.
 * @returns The list of threads.
 */
export async function threadPage(
  context: Context,
  nextToken: string | null | undefined
) {
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
export async function* allThreadPages(context: Context) {
  let items: schema.Thread[] | undefined;
  let nextToken: string | null | undefined = undefined;

  while (true) {
    ({ items, nextToken } = await threadPage(context, nextToken));
    yield items;
    if (!nextToken) break;
  }
}

/**
 * Gets ALL threads, omitting "empty" values and handling pagination transparently.
 *
 * @returns The list of ALL threads.
 */
export async function getAllThreads(context: Context) {
  let threads: schema.Thread[] = [];
  for await (const page of allThreadPages(context)) {
    threads = [...threads, ...page];
  }
  return threads;
}

export async function deleteAllThreads(context: Context) {
  const deletions = [];
  for (const thread of await getAllThreads(context)) {
    deletions.push(
      context.API.graphql<GraphQLQuery<schema.DeleteThreadMutation>>({
        query: mutations.deleteThread,
        variables: {
          input: {
            id: thread.id,
          },
        },
      })
    );
  }
  await Promise.all(deletions);
}
