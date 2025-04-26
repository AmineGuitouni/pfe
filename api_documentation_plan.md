## API Documentation Plan

1.  **Analyze `src/middlewares/rules.ts`:** Although the authentication status will not be explicitly documented for each route, I will still analyze this file to understand the overall authentication and authorization logic.
2.  **Examine route handlers:** For each API route handler (identified by `route.ts` files), I will identify the following:
    *   HTTP method (e.g., GET, POST, PUT, DELETE)
    *   Path parameters (e.g., `[user_id]`, `[database_id]`)
    *   Query parameters (searchParams)
    *   Request body type (if applicable)
    *   Response body type
3.  **Document the findings:** I will create a markdown file that documents the API routes, including the information gathered in the previous steps. The documentation will be structured as follows:

```
## API Routes

### /api/route1
*   Method: GET
*   Description: Description of the route
*   Path Parameters:
    *   param1: Description of param1
*   Query Parameters:
    *   param2: Description of param2
*   Request Body:
    *   Type: Type of the request body
    *   Properties:
        *   property1: Description of property1
*   Response Body:
    *   Type: Type of the response body
    *   Properties:
        *   property2: Description of property2

### /api/route2
*   ...