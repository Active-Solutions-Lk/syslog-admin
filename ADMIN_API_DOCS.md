# Admin API Documentation

This document describes the API endpoints and server actions for managing admins in the syslog-admin application.

## Server Actions

Server actions are located in `app/actions/admin.js` and can be imported directly into components.

### `getAdmins()`

Fetches all admins from the database.

**Returns:**
```javascript
{
  success: boolean,
  admins: Array<{
    id: string,
    name: string,
    email: string,
    role: string,
    status: 'active' | 'inactive',
    createdAt: Date,
    updatedAt: Date
  }> | null,
  error: string | null
}
```

### `getAdminById(id)`

Fetches a specific admin by ID.

**Parameters:**
- `id` (string): The ID of the admin to fetch

**Returns:**
```javascript
{
  success: boolean,
  admin: {
    id: string,
    name: string,
    email: string,
    role: string,
    status: 'active' | 'inactive',
    createdAt: Date,
    updatedAt: Date
  } | null,
  error: string | null
}
```

### `createAdmin({ name, email, password, role })`

Creates a new admin.

**Parameters:**
- `name` (string): The name of the admin
- `email` (string): The email of the admin
- `password` (string): The password for the admin account
- `role` (string): The role of the admin (optional, defaults to 'Admin')

**Returns:**
```javascript
{
  success: boolean,
  admin: {
    id: string,
    name: string,
    email: string,
    role: string,
    status: 'active' | 'inactive',
    createdAt: Date,
    updatedAt: Date
  } | null,
  message: string | null,
  error: string | null
}
```

### `updateAdmin({ id, name, email, role, status })`

Updates an existing admin.

**Parameters:**
- `id` (string): The ID of the admin to update
- `name` (string): The updated name of the admin
- `email` (string): The updated email of the admin
- `role` (string): The updated role of the admin
- `status` ('active' | 'inactive'): The updated status of the admin

**Returns:**
```javascript
{
  success: boolean,
  admin: {
    id: string,
    name: string,
    email: string,
    role: string,
    status: 'active' | 'inactive',
    createdAt: Date,
    updatedAt: Date
  } | null,
  message: string | null,
  error: string | null
}
```

### `deleteAdmin(id)`

Deletes an admin by ID.

**Parameters:**
- `id` (string): The ID of the admin to delete

**Returns:**
```javascript
{
  success: boolean,
  message: string | null,
  error: string | null
}
```

## API Endpoints

API endpoints are located in `app/api/admin/` and can be accessed via HTTP requests.

### GET `/api/admin`

Fetches all admins from the database.

**Response:**
```json
{
  "success": true,
  "admins": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Super Admin",
      "status": "active",
      "createdAt": "2025-10-03T11:39:58.000Z",
      "updatedAt": "2025-10-03T11:39:58.000Z"
    }
  ]
}
```

### GET `/api/admin/[id]`

Fetches a specific admin by ID.

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Super Admin",
    "status": "active",
    "createdAt": "2025-10-03T11:39:58.000Z",
    "updatedAt": "2025-10-03T11:39:58.000Z"
  }
}
```

### POST `/api/admin/create`

Creates a new admin.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "Admin",
    "status": "active",
    "createdAt": "2025-10-22T04:59:30.899Z",
    "updatedAt": "2025-10-22T04:59:30.899Z"
  },
  "message": "Admin created successfully"
}
```

### PUT `/api/admin/[id]`

Updates an existing admin.

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "role": "Super Admin",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "2",
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com",
    "role": "Super Admin",
    "status": "active",
    "createdAt": "2025-10-22T04:59:30.899Z",
    "updatedAt": "2025-10-22T04:59:32.603Z"
  },
  "message": "Admin updated successfully"
}
```

### DELETE `/api/admin/[id]`

Deletes an admin by ID.

**Response:**
```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```