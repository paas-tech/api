// atomic types

/**
 * This type should be used when returning nothing
 */
export type VoidResponse = undefined | null | void;

/**
 * A simple message response featuring only a string of content
 */
export type MessageResponse = string;

/**
 * This type indicates a compliant response with a certain content type.
 * Useful for sending back DTOs with some status or message updates.
 */
export type CompliantContentResponse<T> = T & Partial<StandardResponseOutput<T>>;

export type StandardResponseOutput<T> = {
  /** a brief status explaining the result of the query */
  status: 'OK' | 'created' | 'removed' | string;
  /** a message if the API needs to pass text onto the consumer */
  message?: MessageResponse;
  /** the content of the response, if any is sent back */
  content?: CompliantContentResponse<T>;
};

// composite types
export type StandardResponseCandidate<T> = VoidResponse | MessageResponse | CompliantContentResponse<T>;
