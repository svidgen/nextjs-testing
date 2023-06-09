"use client";

import * as React from "react";
import { Amplify, Auth, Hub, withSSRContext } from "aws-amplify";
import { Authenticator as AmplifyAuthenticator } from "@aws-amplify/ui-react";
import awsExports from "../aws-exports";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure({ ...awsExports, ssr: true });

export default function ClientAuthWrapper() {
  return (
    <AmplifyAuthenticator>
      <p>Logged in. Loading ...</p>
    </AmplifyAuthenticator>
  );
}
