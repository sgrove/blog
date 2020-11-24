
/* RemoteFile_GetFileSha.js */
import React, {Suspense} from 'react';
import {ErrorBoundary} from "react-error-boundary";
import {useLazyLoadQuery} from 'react-relay/hooks';
import { auth } from './Config';
import {ErrorFallback, stringifyRelayData, updateFormVariables} from './utils';
import graphql from 'babel-plugin-relay/macro';
import SimpleObject from './SimpleObject'



const REMOTE_FILE__GET_FILE_SHA_QUERY = graphql`
  query RemoteFile_GetFileSha_Query($repoName: String!, $repoOwner: String!, $branchAndFilePath: String!) {
    gitHub {
      repository(name: $repoName, owner: $repoOwner) {
        object_: object(expression: $branchAndFilePath) {
          ...SimpleObject_fragment
        }
      }
    }
  }
`;

export function RemoteFile_GetFileShaQuery(props) {
  const data = useLazyLoadQuery(REMOTE_FILE__GET_FILE_SHA_QUERY, props,
  {
    // Try to render from the store if we have some data available, but also refresh from the network
    fetchPolicy: "store-and-network",
    // Refetch the query if we've logged in/out of any service
    fetchKey: auth.accessToken()?.accessToken,
  });

  const dataEl = data ? (
    <div className="data-box">
      <h3>Data for RemoteFile_GetFileSha</h3>
      <pre>{stringifyRelayData(data)}</pre>
    </div>
  ) : null;

  const simpleObjectUses = <SimpleObject  object={data?.gitHub?.repository?.object_} />;

  return (
    <div>
      {dataEl}
      <h4>SimpleObjectUses</h4>
      {simpleObjectUses}
    </div>
  );
}

export default function RemoteFile_GetFileShaQueryForm(props) {
  const [queryVariables, setQueryVariables] = React.useState({...props});
  const [formVariables, setFormVariables] = React.useState({});
  const [hasError, setHasError] = React.useState(false);

  const formEl = (
  <form onSubmit={event => { event.preventDefault(); setQueryVariables({ ...formVariables }) }}>
    <label htmlFor="repoName">repoName</label><input id="repoName" type="text" onChange={updateFormVariables(setFormVariables, ["repoName"], (value) => value)} />
    <label htmlFor="repoOwner">repoOwner</label><input id="repoOwner" type="text" onChange={updateFormVariables(setFormVariables, ["repoOwner"], (value) => value)} />
    <label htmlFor="branchAndFilePath">branchAndFilePath</label><input id="branchAndFilePath" type="text" onChange={updateFormVariables(setFormVariables, ["branchAndFilePath"], (value) => value)} />
    <input type="submit" />
  </form>
  );

  /** If there's an error in the query component (Missing authentication, missing variable, CORS error, etc.)
      we'll let the ErrorBoundary handle the 'try again' action */
  const actionButtonEl = hasError ? null : (
    <button onClick={() => setQueryVariables({ ...formVariables })}>
      Run query: RemoteFile_GetFileShaQuery
    </button>
  );

  return (
    <div>
      <h3>RemoteFile_GetFileSha</h3>
      {formEl}
      {actionButtonEl}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // reset the state of your app so the error doesn't happen again
          console.log("Reset queryVariables to trigger query run");
          setHasError(false);
          setQueryVariables({ ...props, ...formVariables });
        }}
        onError={(err) => {
          setHasError(true);
          console.log("Error detected:", err);
        }}>
        <Suspense fallback={"Loading RemoteFile_GetFileShaQuery..."}>
          <RemoteFile_GetFileShaQuery {...queryVariables} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
