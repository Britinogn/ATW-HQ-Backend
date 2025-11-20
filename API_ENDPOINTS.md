# API Endpoints

## Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | Public |
| `POST` | `/login` | Login user | Public |
| `POST` | `/forgot-password` | Request password reset | Public |
| `POST` | `/reset-password/:token` | Reset password | Public |
| `GET` | `/verify/:token` | Verify email | Public |
| `GET` | `/profile` | Get user profile | User, Admin, Agent |
| `GET` | `/users` | Get all users | Admin |
| `DELETE` | `/users/:id` | Delete a user | Admin |

## Property Routes (`/api/properties`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Retrieve all properties | Public |
| `GET` | `/:id` | Retrieve a single property | Public |
| `POST` | `/` | Create a new property | Admin, Agent |
| `PATCH` | `/:id` | Update a property | Admin, Agent |
| `DELETE` | `/:id` | Delete a property | Admin, Agent |

## Car Routes (`/api/cars`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Retrieve all cars | Public |
| `GET` | `/:id` | Retrieve a single car | Public |
| `POST` | `/` | Create a new car | Admin, Agent |
| `PATCH` | `/:id` | Update a car | Admin, Agent |
| `DELETE` | `/:id` | Delete a car | Admin, Agent |

## Agent Routes (`/api/agent`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/apply` | Submit agent application | Agent |
| `GET` | `/my-application` | Get own application status | Agent |
| `GET` | `/applications/pending` | Get pending applications | Admin |
| `PATCH` | `/applications/:id/approve` | Approve application | Admin |
| `PATCH` | `/applications/:id/reject` | Reject application | Admin |

## Payment Routes (`/api/payments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/initialize` | Initialize payment | Public |
| `GET` | `/verify/:reference` | Verify payment | Public |
| `GET` | `/transactions` | List transactions | Admin |

## Chat Routes (`/api/chat`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/room` | Create or get chat room | Authenticated |
| `POST` | `/message` | Send message | Authenticated |
| `GET` | `/room/:roomId/messages` | Get messages for a room | Authenticated |
| `GET` | `/my-chats` | Get all chats for user | Authenticated |
| `GET` | `/admin/chats` | Get all chats | Admin |

## System Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API Running message |
| `GET` | `/api/health` | Health check |
| `GET` | `/api-docs` | Swagger Documentation |
| `GET` | `/api-docs.json` | Swagger JSON Spec |
