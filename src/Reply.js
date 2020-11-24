
/* Reply.js */
import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import {auth} from './Config';
import {useMutation} from 'react-relay/hooks';
import {stringifyRelayData, suggestCORSSetup, LocationNote, updateFormVariables} from "./utils";
import Comment from './Comment'


const REPLY_MUTATION = graphql`
  mutation ReplyMutation($subjectId: ID!, $body: String!) {
    gitHub {
      addComment(input: {subjectId: $subjectId, body: $body}) {
        commentEdge {
          node {
            ...Comment_fragment
          }
        }
      }
    }
  }`;

export default function ReplyMutation(props) {
  const [mutationResult, setMutationResult] = React.useState(() => null);
  const [formVariables, setFormVariables] = React.useState({...props});

  const [commit, isInFlight] = useMutation(REPLY_MUTATION);

  const runMutation = () =>
    commit({
      variables: formVariables,
      onError: (error) => {
        setMutationResult({errors: [error]});
      },
      onCompleted: (response, errors) => {
        setMutationResult({data: response, errors: errors});
      },
    });

  const formEl = (
    <form onSubmit={event => { event.preventDefault(); runMutation(); }}>
      <label htmlFor="subjectId">subjectId</label><input id="subjectId" type="text" onChange={updateFormVariables(setFormVariables, ["subjectId"], (value) => value)} />
      <label htmlFor="body">body</label><input id="body" type="text" onChange={updateFormVariables(setFormVariables, ["body"], (value) => value)} />
      <input type="submit" />
    </form>
  );

  const commentUses = <Comment  comment={mutationResult?.data?.gitHub?.addComment?.commentEdge?.node} />;

  const dataEl = mutationResult?.data ? (
    <div className="data-box">
      <h3>Data for ReplyMutation <LocationNote location={'Reply.js:<Reply>'} /></h3>
      <pre>{stringifyRelayData(mutationResult.data)}</pre>
      <h4>CommentUses</h4>
      {commentUses}
    </div>
  ) : null;

  const primaryError = mutationResult?.errors?.[0];

  const errorEl = primaryError ? (
    <div className="error-box">
      Error in ReplyMutation. <br />
      {suggestCORSSetup(primaryError)}
      <pre>{JSON.stringify(mutationResult?.errors, null, 2)}</pre>
    </div>
  ) : null;

  const loadingEl = isInFlight ? (<pre className="loading">Loading...</pre>) : null;

  const needsLoginService = auth.findMissingAuthServices(mutationResult)[0];

  const actionButton = (
    <button
      className={!!needsLoginService ? 'login-hint' : null}
      onClick={async () => {
        if (!needsLoginService) {
          runMutation();
        } else {
          await auth.login(needsLoginService);
          const loginSuccess = await auth.isLoggedIn(needsLoginService);
          if (loginSuccess) {
            console.log('Successfully logged into ' + needsLoginService);
            runMutation();
          } else {
            console.log('The user did not grant auth to ' + needsLoginService);
          }
        }
      }}>
      {needsLoginService ? 'Log in to ' + needsLoginService : 'Run ReplyMutation'}
    </button>
  );

  return (
    <div>
      <h3>ReplyMutation</h3>
      {formEl}
      {actionButton}
      {loadingEl}
      {dataEl}
      {errorEl}
    </div>
  );
};
