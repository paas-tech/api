
export interface StandardResponse<T> {
    /** a brief status explaining the result of the query */
    status: "OK"|"created"|"removed"|string;
    /** a message if the API needs to pass text onto the consumer */
    message?: string;
    /** the content of the response, if any is sent back */
    content?: T;
}