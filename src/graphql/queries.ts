/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getThread = /* GraphQL */ `
  query GetThread($id: ID!) {
    getThread(id: $id) {
      id
      topic
      comments {
        items {
          id
          owner
          body
          createdAt
          updatedAt
          threadCommentsId
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listThreads = /* GraphQL */ `
  query ListThreads(
    $filter: ModelThreadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listThreads(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        topic
        comments {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getComment = /* GraphQL */ `
  query GetComment($id: ID!) {
    getComment(id: $id) {
      id
      owner
      body
      thread {
        id
        topic
        comments {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      threadCommentsId
    }
  }
`;
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        body
        thread {
          id
          topic
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        threadCommentsId
      }
      nextToken
    }
  }
`;
