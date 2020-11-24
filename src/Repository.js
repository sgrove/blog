
/* Repository.js */
import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import {useFragment} from 'react-relay/hooks';
import {stringifyRelayData} from './utils';



export default function Repository(props) {
  const data = useFragment(
    graphql`
      fragment Repository_fragment on GitHubRepository {
        id
        nameWithOwner
        sshUrl
        url
      }
    `,
    props.repository,
  );

  

  return (
    <>
      <div className="data-box">
        <h3>Data for Repository</h3>
        <pre>{stringifyRelayData(data)}</pre>
        
      </div>
    </>
  );
}

