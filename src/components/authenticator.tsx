import * as React from "react";
import { headers } from "next/headers";
import { Auth, withSSRContext } from "aws-amplify";
import ClientAuthWrapper from "./client-auth-wrapper";
import "@aws-amplify/ui-react/styles.css";

// #region this type of util should be exported from UI, probably.
type Context = {
  Auth: typeof Auth;
};

let _context: Context | undefined = undefined;

function APPRouteContext() {
  if (!_context) {
    const req = {
      headers: {
        cookie: headers().get("cookie"),
      },
    };
    _context = withSSRContext({ req }) as Context;
  }

  return _context;
}
// #endregion

export default async function Authenticator(props: React.PropsWithChildren) {
  // How should this look in the "functional" style?
  const creds = await APPRouteContext().Auth.currentCredentials();

  if (creds.authenticated) {
    return <>{props.children}</>;
  }

  return <ClientAuthWrapper></ClientAuthWrapper>;
}
