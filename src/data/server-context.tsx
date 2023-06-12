import { headers } from "next/headers";
import { Amplify, withSSRContext } from "aws-amplify";
import type Context from "./context-type";
import awsExports from "../aws-exports";

let context: Context | undefined = undefined;

export default function getContext() {
  if (!context) {
    Amplify.configure({ ...awsExports, ssr: true });

    const req = {
      headers: {
        cookie: headers().get("cookie"),
      },
    };

    context = withSSRContext({ req }) as Context;
  }

  return context;
}
