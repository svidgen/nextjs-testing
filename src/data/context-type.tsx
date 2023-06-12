import { Auth, API } from "aws-amplify";

type Context = {
  Auth: typeof Auth;
  API: typeof API;
};

export default Context;
