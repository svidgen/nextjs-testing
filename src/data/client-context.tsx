import { Amplify, Auth, API } from "aws-amplify";
import Context from "./context-type";
import awsExports from "../aws-exports";

Amplify.configure({ ...awsExports, ssr: true });

const context: Context = {
  Auth,
  API,
};

export default context;
