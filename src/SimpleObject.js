
/* SimpleObject.js */
import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import {useFragment} from 'react-relay/hooks';
import {stringifyRelayData} from './utils';



export default function SimpleObject(props) {
  const data = useFragment(
    graphql`
      fragment SimpleObject_fragment on GitHubGitObject {
        __typename
        ... on GitHubBlob {
          sha: oid
          text
          isBinary
          isTruncated
          byteSize
          abbreviatedOid
        }
      }
    `,
    props.object,
  );

  

  return (
    <>
      <div className="data-box">
        <h3>Data for SimpleObject</h3>
        <pre>{stringifyRelayData(data)}</pre>
        
      </div>
    </>
  );
}

