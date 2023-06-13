import { Observable } from "zen-observable-ts";
import {
  GraphQLQuery,
  GraphQLResult,
  GraphQLSubscription,
} from "@aws-amplify/api";
import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import * as subscriptions from "../graphql/subscriptions";
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

/**
 * Concurrently begin deleting all threads.
 *
 * @param context
 */
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
  return Promise.all(deletions);
}

export enum ObserverMessageType {
  Create,
  Update,
  Delete,
}

type ThreadOp = {
  op: ObserverMessageType;
  value: schema.Thread;
};

export function observeThreads(
  context: Context,
  filter: any
): Observable<ThreadOp> {
  return new Observable((observer) => {
    const onCreateSub = context.API.graphql<
      GraphQLSubscription<schema.OnCreateThreadSubscription>
    >({
      query: subscriptions.onCreateThread,
      variables: {
        filter,
      },
    }).subscribe({
      next: ({ provider, value }: any) => {
        observer.next({
          op: ObserverMessageType.Create,
          value: value?.data?.onCreateThread,
        });
      },
    });

    const onUpdateSub = context.API.graphql<
      GraphQLSubscription<schema.OnUpdateThreadSubscription>
    >({
      query: subscriptions.onUpdateThread,
      variables: {
        filter,
      },
    }).subscribe({
      next: ({ provider, value }: any) => {
        observer.next({
          op: ObserverMessageType.Update,
          value: value?.data?.onUpdateThread,
        });
      },
    });

    const onDeleteSub = context.API.graphql<
      GraphQLSubscription<schema.OnDeleteThreadSubscription>
    >({
      query: subscriptions.onDeleteThread,
      variables: {
        filter,
      },
    }).subscribe({
      next: ({ provider, value }: any) => {
        observer.next({
          op: ObserverMessageType.Delete,
          value: value?.data?.onDeleteThread,
        });
      },
    });

    return () => {
      onCreateSub.unsubscribe();
      onUpdateSub.unsubscribe();
      onDeleteSub.unsubscribe();
    };
  });
}

/**
 * Sample observeQuery type of call. Naive implementation.
 *
 * @param context
 * @param filter
 */
export function liveThreads(
  context: Context,
  filter: any
): Observable<schema.Thread[]> {
  return new Observable((observer) => {
    const updates: ThreadOp[] = [];
    let results: schema.Thread[] = [];
    let initialResultsPopulated = false;

    const ingestOperation = (op: ThreadOp) => {
      switch (op.op) {
        case ObserverMessageType.Create:
          results.push(op.value);
          break;
        case ObserverMessageType.Update:
          results = results.map((existing) =>
            existing.id === op.value.id ? op.value : existing
          );
          break;
        case ObserverMessageType.Delete:
          results = results.filter((existing) =>
            existing.id === op.value.id ? false : true
          );
          break;
      }
    };

    const notifyObserver = () => {
      observer.next(results);
    };

    const sub = observeThreads(context, filter).subscribe({
      next: ({ op, value }) => {
        if (initialResultsPopulated) {
          ingestOperation({ op, value });
          notifyObserver();
        } else {
          updates.push({ op, value });
        }
      },
    });

    getAllThreads(context).then((threads) => {
      results.push(...threads);
      initialResultsPopulated = true;
      for (const update of updates) {
        ingestOperation(update);
      }
      notifyObserver();
    });

    return () => sub.unsubscribe();
  });
}
