/* App.js */
import React from "react";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import RelayEnvironment from "./RelayEnvironment";
import Header from "./Header";
import CommentNotificationSubscription from "./CommentNotification";
import PostsQuery from "./Posts";
import ReplyMutation from "./Reply";

function App() {
  return (
    <>
      <Header />
      <section className="subscription">
        <CommentNotificationSubscription repoOwner={null} repoName={null} />
      </section>
      <section className="query">
        <PostsQuery name={null} owner={null} labels={null} createdBy={null} />
      </section>
      <section className="mutation">
        <ReplyMutation subjectId={null} body={null} />
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