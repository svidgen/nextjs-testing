import { revalidatePath } from "next/cache";
import { GraphQLQuery, GraphQLResult } from "@aws-amplify/api";
import Authenticator from "@/components/authenticator";
import ThreadIndex from "@/components/thread-index-3";
import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";
import type * as schema from "../../API";
import description from "./description";
import { getAllThreads, deleteAllThreads } from "../../data/threads";

import getContext from "../../data/server-context";

async function addThread(data: FormData) {
  "use server";

  console.log("key", Array.from(data.entries()));
  await getContext().API.graphql<GraphQLQuery<schema.CreateThreadMutation>>({
    query: mutations.createThread,
    variables: {
      input: {
        topic: data.get("topic"),
      },
    },
  });
}

async function deleteAll() {
  "use server";

  await deleteAllThreads(getContext());
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
        <ThreadIndex
          threads={await getAllThreads(getContext())}
          filter={{}}
        ></ThreadIndex>
        <form action={addThread}>
          <input type="text" name="topic" />
          <button type="submit">Add Thread</button>
        </form>
        <form action={deleteAll}>
          <button type="submit">Delete All</button>
        </form>
      </main>
    </Authenticator>
  );
}
