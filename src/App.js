/* App.js */
import React from "react";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import RelayEnvironment from "./RelayEnvironment";
import Header from "./Header";
import FindMeOnGitHubQuery from "./FindMeOnGitHub";
import RemoteFile_GetFileShaQuery from "./RemoteFile_GetFileSha";

function App() {
  return (
    <>
      <Header />
      <section className="query">
        <FindMeOnGitHubQuery  />
      </section>
      <section className="query">
        <RemoteFile_GetFileShaQuery repoName={null} repoOwner={null} branchAndFilePath={null} />
      </section>
    </>
  );
}

// The above component needs to know how to access the Relay environment, and we
// need to specify a fallback in case it suspends:
// - <RelayEnvironmentProvider> tells child components how to talk to the current
//   Relay Environment instance
// - <Suspense> specifies a fallback in case a child suspends.
function AppRoot(props) {
  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <App />
    </RelayEnvironmentProvider>
  );
}

export default AppRoot;